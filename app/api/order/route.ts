import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const { cart } = await req.json();
    const orderItems = cart.map((i: any) => `• ${i.name}`).join('\n');
    
    // Отправляем только админу для теста
    await bot.sendMessage(process.env.ADMIN_ID!, `🔔 Новый заказ:\n${orderItems}`);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


