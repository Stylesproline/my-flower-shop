import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';
import { Parser } from 'json2csv';

export const dynamic = 'force-dynamic';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

// ВАЖНО: Используем SERVICE_ROLE_KEY для обхода RLS в админ-командах
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body) return NextResponse.json({ ok: true });

    const chatId = body.message?.chat.id || body.callback_query?.message?.chat.id;
    const adminId = Number(process.env.ADMIN_ID);
    const text = body.message?.text;

    // 1. СОХРАНЯЕМ ПОЛЬЗОВАТЕЛЯ (работает через service_role)
    if (body.message?.from) {
      const { id: user_id, username, first_name } = body.message.from;
      await supabase.from('users').upsert({ 
        user_id, 
        username: username || '', 
        first_name: first_name || '' 
      });
    }

    // 2. Команда /start
    if (text === '/start') {
      const url = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
      await bot.sendMessage(chatId, 'Привет! 🌸 Рады видеть тебя в нашем магазине. Нажми кнопку ниже:', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url } }]]
        }
      });
    }

    // 3. АДМИН-КОМАНДЫ (Доступны только для ADMIN_ID)
    if (chatId === adminId) {
      
      // --- Управление товарами ---
      if (text === '/admin') {
        const { data: products } = await supabase.from('products').select('*');
        const buttons = products?.map(p => ([{ 
          text: `💰 ${p.name}: ${p.price} BYN`, 
          callback_data: `price_${p.id}` 
        }])) || [];

        await bot.sendMessage(chatId, '📦 Управление товарами:', {
          reply_markup: { 
            inline_keyboard: buttons.length > 0 ? buttons : [[{ text: 'Товары не найдены', callback_data: 'empty' }]]
          }
        });
      }

      // --- Выгрузка клиентов (/export) ---
      if (text === '/export') {
        const { data: users, error } = await supabase.from('users').select('*');
        if (users && users.length > 0) {
          const csv = new Parser().parse(users);
          await bot.sendDocument(chatId, Buffer.from(csv), {}, {
            filename: 'clients_base.csv',
            contentType: 'text/csv'
          });
        } else {
          await bot.sendMessage(chatId, 'База клиентов пуста или заблокирована.');
        }
      }

      // --- Отчет по продажам (/report) ---
      if (text === '/report') {
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        
        if (orders && orders.length > 0) {
          const reportData = orders.map(o => ({
            ID: o.id,
            Дата: new Date(o.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' }),
            Сумма_BYN: o.total_price,
            Адрес: o.address,
            Товары: o.items.map((i: any) => `${i.name}(x${i.count})`).join(', ')
          }));

          const csv = new Parser().parse(reportData);
          const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);

          await bot.sendMessage(chatId, `📊 *Отчет по продажам*\nВсего заказов: ${orders.length}\nОбщая выручка: *${totalRevenue} BYN*`, { parse_mode: 'Markdown' });
          await bot.sendDocument(chatId, Buffer.from(csv), {}, {
            filename: 'sales_report.csv',
            contentType: 'text/csv'
          });
        } else {
          await bot.sendMessage(chatId, 'Заказов пока не обнаружено.');
        }
      }
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

