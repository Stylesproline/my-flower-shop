import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, address, initData } = body;

    // 1. ДИАГНОСТИКА (появится в логах Vercel под этим запросом)
    console.log('--- DEBUG START ---');
    console.log('Raw initData:', initData);

    let userData: any = null;

    if (initData) {
      // 2. РАЗБОР СТРОКИ (Telegram передает данные как query-string)
      const params = new URLSearchParams(initData);
      const userString = params.get('user');
      
      if (userString) {
        try {
          // Декодируем дважды на случай сложной кодировки
          userData = JSON.parse(decodeURIComponent(userString));
          console.log('Parsed UserData:', userData);
        } catch (e) {
          console.error('JSON Parse Error:', e);
        }
      }
    }

    // 3. ФОРМИРУЕМ ИМЯ
    const userId = userData?.id || 'ID Не найден';
    const firstName = userData?.first_name || 'Инкогнито';
    const username = userData?.username ? `@${userData.username}` : 'нет юзернейма';
    const clientDisplay = `${firstName} (${username})`;

    const total = cart.reduce((s: number, i: any) => s + (i.price * i.count), 0);

    // 4. ЗАПИСЬ В БАЗУ
    if (userData?.id) {
      await supabase.from('orders').insert({
        user_id: userData.id,
        items: cart,
        total_price: total,
        address: address
      });
    }

    // 5. ТЕКСТ ДЛЯ ТЕЛЕГРАМ
    const itemsText = cart.map((i: any) => `• ${i.name} x${i.count}`).join('\n');
    const msg = `🌸 *НОВЫЙ ЗАКАЗ*\n\n` +
                `👤 *Клиент:* ${clientDisplay}\n` +
                `🆔 *ID:* \`${userId}\`\n` +
                `🏠 *Адрес:* ${address}\n\n` +
                `📦 *Товары:*\n${itemsText}\n\n` +
                `💰 *ИТОГО: ${total} ₽*`;
    
    await bot.sendMessage(process.env.ADMIN_ID!, msg, { parse_mode: 'Markdown' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('GLOBAL ERROR:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

