import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // Получаем данные пользователя из Telegram InitData
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user') || '{}');
    const total = cart.reduce((s: number, i: any) => s + i.price * i.count, 0);

    // СОХРАНЯЕМ ЗАКАЗ В БД
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      items: cart,
      total_price: total,
      address: address
    }).select().single();

    // ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ АДМИНУ
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const msg = `🌸 ЗАКАЗ №${order?.id}\n👤 Клиент: @${user.username}\n🏠 Адрес: ${address}\n📦 Товары:\n${itemsText}\n💰 Итого: ${total} ₽`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, msg);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



