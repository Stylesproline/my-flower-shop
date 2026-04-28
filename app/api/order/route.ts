import { NextResponse } from 'next/server';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';
import crypto from 'crypto';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const { cart, initData } = await req.json();

    // 1. Проверка подлинности данных (безопасность)
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();
    const dataCheckString = Array.from(urlParams.entries()).map(([k, v]) => `${k}=${v}`).join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN!).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 403 });
    }

    // 2. Формируем сообщение
    const user = JSON.parse(urlParams.get('user') || '{}');
    const totalPrice = cart.reduce((sum: number, i: any) => sum + i.price, 0);
    const details = cart.map((i: any) => `• ${i.name}`).join('\n');

    const msg = `🔔 *НОВЫЙ ЗАКАЗ*\n\nКлиент: @${user.username || user.first_name}\n\nТовары:\n${details}\n\n*Итого: ${totalPrice} ₽*`;

    // 3. Отправляем админу и клиенту
    await bot.sendMessage(process.env.ADMIN_ID!, msg, { parse_mode: 'Markdown' });
    await bot.sendMessage(user.id, `✅ Ваш заказ на сумму ${totalPrice} ₽ принят!`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



