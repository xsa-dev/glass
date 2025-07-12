const { BrowserWindow } = require('electron');
const { createStreamingLLM } = require('../common/ai/factory');
const { getCurrentModelInfo, windowPool, captureScreenshot } = require('../../window/windowManager');
const sessionRepository = require('../common/repositories/session');
const askRepository = require('./repositories');
const { getSystemPrompt } = require('../common/prompts/promptBuilder');

/**
 * @class AskService
 * @description 사용자의 질문을 처리하고 AI 모델과 통신하여 응답을 스트리밍하는 모든 로직을 캡슐화합니다.
 */
class AskService {
    /**
     * AskService의 인스턴스를 생성합니다.
     */
    constructor() {
        console.log('[AskService] Service instance created.');
    }

    /**
     * 대화 기록 배열을 프롬프트에 적합한 단일 문자열로 변환합니다.
     * @param {string[]} conversationTexts - 대화 내용 문자열의 배열
     * @returns {string} 프롬프트에 사용될 형식의 대화 기록
     * @private
     */
    _formatConversationForPrompt(conversationTexts) {
        if (!conversationTexts || conversationTexts.length === 0) {
            return 'No conversation history available.';
        }
        // 최근 30개의 대화만 사용
        return conversationTexts.slice(-30).join('\n');
    }

    /**
     * 사용자의 프롬프트를 받아 AI 모델에 전송하고, 응답을 스트리밍으로 처리합니다.
     * @param {string} userPrompt - 사용자가 입력한 질문 또는 메시지
     * @returns {Promise<{success: boolean, response?: string, error?: string}>} 처리 결과 객체
     */
    async sendMessage(userPrompt, conversationHistoryRaw=[]) {
        if (!userPrompt || userPrompt.trim().length === 0) {
            console.warn('[AskService] Cannot process empty message');
            return { success: false, error: 'Empty message' };
        }

        let sessionId;

        try {
            console.log(`[AskService] 🤖 Processing message: ${userPrompt.substring(0, 50)}...`);

            // --- 사용자 메시지 저장 ---
            sessionId = await sessionRepository.getOrCreateActive('ask');
            await askRepository.addAiMessage({ sessionId, role: 'user', content: userPrompt.trim() });
            console.log(`[AskService] DB: Saved user prompt to session ${sessionId}`);
            
            const modelInfo = await getCurrentModelInfo(null, { type: 'llm' });
            if (!modelInfo || !modelInfo.apiKey) {
                throw new Error('AI model or API key not configured.');
            }
            console.log(`[AskService] Using model: ${modelInfo.model} for provider: ${modelInfo.provider}`);

            const screenshotResult = await captureScreenshot({ quality: 'medium' });
            const screenshotBase64 = screenshotResult.success ? screenshotResult.base64 : null;

            // const conversationHistoryRaw = this._getConversationHistory();
            const conversationHistory = this._formatConversationForPrompt(conversationHistoryRaw);

            const systemPrompt = getSystemPrompt('pickle_glass_analysis', conversationHistory, false);

            const messages = [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `User Request: ${userPrompt.trim()}` },
                    ],
                },
            ];

            if (screenshotBase64) {
                messages[1].content.push({
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` },
                });
            }
            
            const streamingLLM = createStreamingLLM(modelInfo.provider, {
                apiKey: modelInfo.apiKey,
                model: modelInfo.model,
                temperature: 0.7,
                maxTokens: 2048,
                usePortkey: modelInfo.provider === 'openai-glass',
                portkeyVirtualKey: modelInfo.provider === 'openai-glass' ? modelInfo.apiKey : undefined,
            });

            const response = await streamingLLM.streamChat(messages);
            const askWin = windowPool.get('ask');

            if (!askWin || askWin.isDestroyed()) {
                console.error("[AskService] Ask window is not available to send stream to.");
                response.body.getReader().cancel();
                return { success: false, error: 'Ask window is not available.' };
            }

            // --- 스트림 처리 ---
            await this._processStream(response.body, askWin, sessionId);

            // _processStream 내부에서 전체 응답이 완료되면 반환됩니다.
            // 하지만 비동기 스트림의 특성상 이 지점에서는 직접 반환 값을 알기 어렵습니다.
            // 성공/실패 여부는 스트림 처리 로직 내에서 결정됩니다.

        } catch (error) {
            console.error('[AskService] Error processing message:', error);
            const askWin = windowPool.get('ask');
            if (askWin && !askWin.isDestroyed()) {
                askWin.webContents.send('ask-response-stream-error', { error: error.message });
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * AI 모델로부터 받은 응답 스트림을 처리합니다.
     * @param {ReadableStream} body - 스트리밍 응답의 body
     * @param {BrowserWindow} askWin - 응답을 보낼 대상 창
     * @param {number} sessionId - 현재 세션 ID
     * @returns {Promise<void>}
     * @private
     */
    async _processStream(body, askWin, sessionId) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let finalResult = { success: false }; // 최종 결과 저장을 위한 변수

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            askWin.webContents.send('ask-response-stream-end');
                            
                            await askRepository.addAiMessage({ sessionId, role: 'assistant', content: fullResponse });
                            console.log(`[AskService] DB: Saved assistant response to session ${sessionId}`);
                            
                            // 스트림이 성공적으로 완료되었으므로, 최종 결과를 성공으로 설정합니다.
                            // 실제 반환은 sendMessage에서 이루어지지만, 로직상의 완료를 의미합니다.
                            return; 
                        }
                        try {
                            const json = JSON.parse(data);
                            const token = json.choices[0]?.delta?.content || '';
                            if (token) {
                                fullResponse += token;
                                askWin.webContents.send('ask-response-chunk', { token });
                            }
                        } catch (error) {
                            // JSON 파싱 오류는 무시하고 계속 진행
                        }
                    }
                }
            }
        } catch (streamError) {
            console.error('[AskService] Error while processing stream:', streamError);
            askWin.webContents.send('ask-response-stream-error', { error: streamError.message });
            // 스트림 처리 중 에러가 발생했음을 기록
        } finally {
            // 스트림이 정상적으로 [DONE]을 받지 못하고 종료된 경우에도
            // 현재까지의 응답이라도 저장 시도
            if (fullResponse) {
                 try {
                    await askRepository.addAiMessage({ sessionId, role: 'assistant', content: fullResponse });
                    console.log(`[AskService] DB: Saved partial assistant response to session ${sessionId} after stream interruption.`);
                } catch(dbError) {
                    console.error("[AskService] DB: Failed to save assistant response after stream interruption:", dbError);
                }
            }
        }
    }
}

// AskService 클래스의 단일 인스턴스를 생성하여 내보냅니다.
// 이렇게 하면 애플리케이션 전체에서 동일한 서비스 인스턴스를 공유하게 됩니다.
const askService = new AskService();

module.exports = askService;