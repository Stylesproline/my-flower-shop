import { NextResponse } from 'next/server';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user') || '{}');
    
    const items = cart.map((i: any) => `${i.name} x${i.count}`).join('\n');
    const total = cart.reduce((s: number, i: any) => s + i.price * i.count, 0);

    const text = `🔔 ЗАКАЗ!\nКлиент: @${user.username || 'user'}\nАдрес: ${address}\n\nТовары:\n${items}\n\nСумма: ${total}₽`;

    await bot.sendMessage(process.env.ADMIN_ID!, text);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

