import { NextResponse } from 'next/server';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

// Используем глобальную переменную, чтобы не инициализировать бота каждый раз
const token = process.env.BOT_TOKEN || '';
const bot = new TelegramBot(token);

export async function POST(req: Request) {
  try {
    const { cart, address } = await req.json();
    
    if (!cart || !address) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const items = cart.map((i: any) => `${i.name} x${i.count}`).join('\n');
    const total = cart.reduce((s: number, i: any) => s + (i.price * i.count), 0);
    const adminId = process.env.ADMIN_ID;

    const message = `🌸 *НОВЫЙ ЗАКАЗ*\n\n🏠 *Адрес:* ${address}\n\n📦 *Товары:*\n${items}\n\n💰 *Сумма:* ${total} ₽`;

    if (adminId) {
      await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Order error:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


