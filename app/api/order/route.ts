import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // 1. Извлекаем данные пользователя из initData
    const urlParams = new URLSearchParams(initData);
    const userRaw = urlParams.get('user');
    const user = userRaw ? JSON.parse(userRaw) : {};
    
    // Формируем имя для уведомления: приоритет username, если нет — имя и фамилия
    const clientName = user.username 
      ? `@${user.username}` 
      : `${user.first_name || 'Неизвестный'} ${user.last_name || ''}`.trim();

    const total = cart.reduce((s: number, i: any) => s + i.price * i.count, 0);

    // 2. СОХРАНЯЕМ ЗАКАЗ В БД
    await supabase.from('orders').insert({
      user_id: user.id,
      items: cart,
      total_price: total,
      address: address
    });

    // 3. УВЕДОМЛЕНИЕ АДМИНУ
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const msg = `🌸 *НОВЫЙ ЗАКАЗ*\n\n` +
                `👤 *Клиент:* ${clientName} (ID: ${user.id})\n` +
                `🏠 *Адрес:* ${address}\n\n` +
                `📦 *Товары:*\n${itemsText}\n\n` +
                `💰 *Итого: ${total} ₽*`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, msg, { parse_mode: 'Markdown' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Order Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

