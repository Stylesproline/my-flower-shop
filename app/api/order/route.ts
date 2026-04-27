import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import crypto from 'crypto';

const token = process.env.BOT_TOKEN!;
const bot = new TelegramBot(token);
const adminId = process.env.ADMIN_ID!;

export async function POST(req: Request) {
  try {
    const { cart, initData } = await req.json();

    // 1. Проверка безопасности initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();
    
    const dataCheckString = Array.from(urlParams.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();
      
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ error: 'Security check failed' }, { status: 403 });
    }

    // 2. Парсим данные пользователя и формируем заказ
    const user = JSON.parse(urlParams.get('user') || '{}');
    const totalPrice = cart.reduce((sum: number, item: any) => sum + item.price, 0);
    const orderItems = cart.map((i: any) => `• ${i.name} (${i.price}₽)`).join('\n');

    const messageText = `🌸 *Новый заказ!*\n\n${orderItems}\n\n*Итого: ${totalPrice}₽*`;

    // 3. Уведомление пользователю
    await bot.sendMessage(user.id, `✅ Спасибо за заказ!\n\n${orderItems}\n\nСумма: ${totalPrice}₽. Мы скоро свяжемся с вами.`);

    // 4. Уведомление админу
    await bot.sendMessage(adminId, `🔔 *ЗАКАЗ В МАГАЗИНЕ*\nОт: @${user.username || 'Без юзернейма'} (ID: ${user.id})\n\n${orderItems}\n\nСумма: ${totalPrice}₽`, { parse_mode: 'Markdown' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
