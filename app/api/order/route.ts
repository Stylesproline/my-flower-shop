import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import TelegramBot from 'node-telegram-bot-api';
import crypto from 'crypto';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const pool = new Pool({
  connectionString: process.env.MY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(req: Request) {
  try {
    const { cart, initData } = await req.json();
    // ... тут логика проверки initData (оставляем как была) ...
    // Везде, где было sql, заменяем на pool.query
    await bot.sendMessage(process.env.ADMIN_ID!, 'Новый заказ!');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

