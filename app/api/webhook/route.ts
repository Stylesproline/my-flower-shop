import { NextResponse } from 'next/server';
import { Pool } from 'pg';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const pool = new Pool({
  connectionString: process.env.MY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(req: Request) {
  const body = await req.json();
  const chatId = body.message?.chat.id;

  if (body.message?.text === '/admin' && chatId === Number(process.env.ADMIN_ID)) {
    const { rows } = await pool.query('SELECT * FROM products');
    const buttons = rows.map((p: any) => ([{ text: `${p.name}: ${p.price}₽`, callback_data: `edit_${p.id}` }]));
    await bot.sendMessage(chatId, 'Админ-панель:', { reply_markup: { inline_keyboard: buttons } });
  }
  return NextResponse.json({ ok: true });
}


