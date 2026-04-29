import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // НАДЕЖНЫЙ ПАРСИНГ ПОЛЬЗОВАТЕЛЯ
    let userData: any = {};
    try {
      const urlParams = new URLSearchParams(initData);
      const userString = urlParams.get('user');
      if (userString) {
        userData = JSON.parse(decodeURIComponent(userString));
      }
    } catch (e) {
      console.error('Ошибка парсинга юзера:', e);
    }

    const userId = userData.id || 'Неизвестен';
    const clientName = userData.username 
      ? `@${userData.username}` 
      : `${userData.first_name || 'Инкогнито'} ${userData.last_name || ''}`.trim();

    const total = cart.reduce((s: number, i: any) => s + (i.price * i.count), 0);

    // СОХРАНЯЕМ В БД (используем Optional Chaining для защиты)
    if (userData.id) {
      await supabase.from('orders').insert({
        user_id: userData.id,
        items: cart,
        total_price: total,
        address: address
      });
    }

    // УВЕДОМЛЕНИЕ
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const msg = `🌸 *НОВЫЙ ЗАКАЗ*\n\n` +
                `👤 *Клиент:* ${clientName}\n` +
                `🆔 *ID:* \`${userId}\`\n` +
                `🏠 *Адрес:* ${address}\n\n` +
                `📦 *Товары:*\n${itemsText}\n\n` +
                `💰 *ИТОГО: ${total} ₽*`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, msg, { parse_mode: 'Markdown' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

