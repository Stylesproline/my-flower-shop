import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // 1. Парсим данные пользователя
    let userData: any = {};
    try {
      const urlParams = new URLSearchParams(initData);
      const userString = urlParams.get('user');
      if (userString) {
        userData = JSON.parse(decodeURIComponent(userString));
      }
    } catch (e) {
      console.error('Ошибка парсинга:', e);
    }

    const userId = userData.id;
    // Формируем имя: Никнейм или Имя + Фамилия
    const clientName = userData.username 
      ? `@${userData.username}` 
      : `${userData.first_name || 'Клиент'} ${userData.last_name || ''}`.trim();

    const total = cart.reduce((s: number, i: any) => s + (i.price * i.count), 0);

    // 2. Сохраняем в базу (для истории и рассылок)
    if (userId) {
      await supabase.from('orders').insert({
        user_id: userId,
        items: cart,
        total_price: total,
        address: address
      });
    }

    // 3. Формируем сообщение для админа с КЛИКАБЕЛЬНЫМ ID
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    
    // Ссылка вида [текст](tg://user?id=123) позволяет открыть профиль любого юзера
    const userLink = `[${userId}](tg://user?id=${userId})`;

    const adminMsg = `🌸 *НОВЫЙ ЗАКАЗ*\n\n` +
                     `👤 *Клиент:* ${clientName}\n` +
                     `🆔 *ID:* ${userLink}\n` +
                     `🏠 *Адрес:* ${address}\n\n` +
                     `📦 *Товары:*\n${itemsText}\n\n` +
                     `💰 *ИТОГО: ${total} BYN*`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, adminMsg, { parse_mode: 'Markdown' });

    // 4. Подтверждение клиенту
    if (userId) {
      await bot.sendMessage(userId, `✅ *${userData.first_name}*, ваш заказ принят! \nСумма: ${total} BYN. \nОжидайте звонка.`, { parse_mode: 'Markdown' });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

