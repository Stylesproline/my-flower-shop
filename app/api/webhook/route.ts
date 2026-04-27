import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { sql } from '@vercel/postgres';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export async function POST(req: Request) {
  const body = await req.json();
  const chatId = body.message?.chat.id;

  if (body.message?.text === '/admin' && chatId === Number(process.env.ADMIN_ID)) {
    const { rows } = await sql`SELECT * FROM products`;
    const buttons = rows.map(p => ([{ text: `${p.name}: ${p.price}₽`, callback_data: `edit_${p.id}` }]));
    await bot.sendMessage(chatId, 'Админ-панель:', { reply_markup: { inline_keyboard: buttons } });
  }
  
  // Дополнительная логика обработки CallbackQuery и редактирования цены пишется здесь
  return NextResponse.json({ ok: true });
}
