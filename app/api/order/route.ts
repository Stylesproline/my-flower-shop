import { NextResponse } from 'next/server';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // Формируем текст из корзины
    const items = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const total = cart.reduce((s: number, i: any) => s + i.price * i.count, 0);

    const message = `🌸 *НОВЫЙ ЗАКАЗ*\n\n🏠 Адрес: ${address}\n\n📦 Товары:\n${items}\n\n💰 Сумма: ${total} ₽`;

    await bot.sendMessage(process.env.ADMIN_ID!, message, { parse_mode: 'Markdown' });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

