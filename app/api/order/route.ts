import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, address, initData } = await req.json();
    
    // Пытаемся достать юзера, но если не выйдет — не падаем
    let clientName = "Неизвестный клиент";
    let userId: any = null;

    try {
      const urlParams = new URLSearchParams(initData);
      const userRaw = urlParams.get('user');
      if (userRaw) {
        const user = JSON.parse(decodeURIComponent(userRaw));
        userId = user.id;
        clientName = user.username ? `@${user.username}` : `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
    } catch (e) {
      console.log("Ошибка парсинга юзера, продолжаем...");
    }

    const total = cart.reduce((s: number, i: any) => s + (i.price * i.count), 0);

    // СОХРАНЯЕМ В БАЗУ (если юзер нашелся)
    if (userId) {
      await supabase.from('orders').insert({
        user_id: userId,
        items: cart,
        total_price: total,
        address: address
      });
    }

    // ТЕКСТ ДЛЯ АДМИНА
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const adminMsg = `🌸 *НОВЫЙ ЗАКАЗ*\n\n👤 *Клиент:* ${clientName}\n🏠 *Адрес:* ${address}\n\n📦 *Товары:*\n${itemsText}\n\n💰 *Итого: ${total} ₽*`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, adminMsg, { parse_mode: 'Markdown' });

    // ПОДТВЕРЖДЕНИЕ КЛИЕНТУ (если есть ID)
    if (userId) {
      await bot.sendMessage(userId, `✅ ${clientName}, ваш заказ на ${total} ₽ принят!`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Критическая ошибка:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

