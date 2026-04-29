import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.message) return NextResponse.json({ ok: true });

    const { id: user_id, username, first_name } = body.message.from;

    // СОХРАНЯЕМ ПОЛЬЗОВАТЕЛЯ
    await supabase.from('users').upsert({ user_id, username, first_name });

    if (body.message.text === '/start') {
      await bot.sendMessage(user_id, `Привет, ${first_name}! 🌸 Рады видеть тебя в нашем магазине.`, {
        reply_markup: {
          inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url: process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}` } }]]
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}


    // 2. Команда /admin
    if (body.message?.text === '/admin' && chatId === adminId) {
      const { data: products, error } = await supabase.from('products').select('*');
      
      if (error || !products) {
        await bot.sendMessage(chatId, 'Ошибка при получении товаров из базы.');
      } else {
        // Формируем кнопки и гарантируем, что это массив массивов
        const buttons = products.map(p => ([{ 
          text: `💰 ${p.name}: ${p.price}₽`, 
          callback_data: `price_${p.id}` 
        }]));

        await bot.sendMessage(chatId, 'Управление товарами. Выберите товар:', {
          reply_markup: { 
            inline_keyboard: buttons.length > 0 ? buttons : [[{ text: 'Товары не найдены', callback_data: 'empty' }]]
          }
        });
      }
    }

    // 3. Обработка нажатий кнопок в админке
    if (body.callback_query) {
      const callbackData = body.callback_query.data;
      if (callbackData.startsWith('price_')) {
        const productId = callbackData.split('_')[1];
        await bot.sendMessage(chatId, `Вы выбрали товар ID: ${productId}. Введите новую цену ответным сообщением (функция в разработке).`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: true }); // Telegram требует 200 OK даже при ошибке
  }
}


