import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

export const dynamic = 'force-dynamic';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Защита от пустых запросов
    if (!body) return NextResponse.json({ ok: true });

    // Определяем chatId для разных типов обновлений (сообщение или нажатие кнопки)
    const chatId = body.message?.chat.id || body.callback_query?.message?.chat.id;
    const adminId = Number(process.env.ADMIN_ID);
    const text = body.message?.text;

    // 1. СОХРАНЯЕМ ПОЛЬЗОВАТЕЛЯ (если это обычное сообщение)
    if (body.message?.from) {
      const { id: user_id, username, first_name } = body.message.from;
      await supabase.from('users').upsert({ 
        user_id, 
        username: username || '', 
        first_name: first_name || '' 
      });
    }

    // 2. Обработка команды /start
    if (text === '/start') {
      const url = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
      await bot.sendMessage(chatId, 'Привет! 🌸 Рады видеть тебя в нашем магазине. Нажми кнопку ниже:', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url } }]]
        }
      });
    }

    // 3. Обработка команды /admin
    if (text === '/admin' && chatId === adminId) {
      const { data: products } = await supabase.from('products').select('*');
      const buttons = products?.map(p => ([{ 
        text: `💰 ${p.name}: ${p.price}BYN`, 
        callback_data: `price_${p.id}` 
      }])) || [];

      await bot.sendMessage(chatId, 'Управление товарами:', {
        reply_markup: { 
          inline_keyboard: buttons.length > 0 ? buttons : [[{ text: 'Товары не найдены', callback_data: 'empty' }]]
        }
      });
    }

    // 4. Обработка нажатий в админке
    if (body.callback_query) {
      const callbackData = body.callback_query.data;
      if (callbackData.startsWith('price_')) {
        const productId = callbackData.split('_')[1];
        await bot.sendMessage(chatId, `Вы выбрали товар ID: ${productId}. Введите новую цену (в разработке).`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ ok: true }); 
  }
}

