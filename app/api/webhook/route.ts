import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const chatId = body.message?.chat.id;
  const adminId = Number(process.env.ADMIN_ID);

  if (body.message?.text === '/admin' && chatId === adminId) {
    const { data: products } = await supabase.from('products').select('*');
    const buttons = products?.map(p => ([{ text: `💰 ${p.name}: ${p.price}₽`, callback_data: `price_${p.id}` }]));
    
    await bot.sendMessage(chatId, 'Управление товарами. Выберите товар для изменения цены:', {
      reply_markup: { inline_keyboard: buttons }
    });
  }

  // Логика обработки нажатия на кнопку (изменение цены)
  if (body.callback_query) {
    const [action, id] = body.callback_query.data.split('_');
    if (action === 'price') {
      await bot.sendMessage(body.callback_query.message.chat.id, `Отправьте новую цену для товара (ID: ${id}) ответом на это сообщение.`);
      // В реальном проекте здесь используется стейт-машина, но для MVP достаточно этого
    }
  }

  return NextResponse.json({ ok: true });
}


