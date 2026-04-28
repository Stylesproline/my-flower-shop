import { NextResponse } from 'next/server';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    const adminId = process.env.ADMIN_ID!;

    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user') || '{}');
    const clientName = `@${user.username || user.first_name || 'Инкогнито'}`;

    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count} (${i.price * i.count}₽)`).join('\n');
    const total = cart.reduce((sum: number, i: any) => sum + (i.price * i.count), 0);

    const message = `🌸 *НОВЫЙ ЗАКАЗ*\n\n` +
                    `👤 *Клиент:* ${clientName}\n` +
                    `📞 *Контакты/Адрес:* ${address}\n\n` +
                    `📦 *Товары:*\n${itemsText}\n\n` +
                    `💰 *ИТОГО: ${total} ₽*`;

    // Отправляем админу
    await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });

    // Отправляем подтверждение клиенту
    await bot.sendMessage(user.id, `✅ Спасибо за заказ! Мы получили ваши данные: ${address}. Ожидайте звонка.`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Order error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

