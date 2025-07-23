import axios from "axios";

export async function sendTelegramErrorNotification(message: string) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (!telegramToken || !telegramChatId) {
      console.error('Telegram credentials missing. Cannot send Telegram notification.');
      return;
    }
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: 'Markdown'
    }, { timeout: 10000 });
    console.log('✅ Telegram error notification sent');
  } catch (err) {
    console.error('❌ Failed to send Telegram notification:', err);
  }
}