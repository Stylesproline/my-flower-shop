import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { message, secret } = await req.json();

    // ЗАЩИТА: Чтобы рассылку не запустил кто-то чужой
    // Мы проверяем, что в поле secret пришел твой ADMIN_ID
    if (!secret || String(secret) !== String(process.env.ADMIN_ID)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // 1. Получаем список всех ID из базы данных
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id');

    if (error || !users) {
      return NextResponse.json({ error: 'Ошибка получения базы пользователей' }, { status: 500 });
    }

    // 2. Цикл рассылки
    let successCount = 0;
    for (const user of users) {
      try {
        await bot.sendMessage(user.user_id, message, { parse_mode: 'Markdown' });
        successCount++;
        // Небольшая пауза, чтобы Telegram не забанил за спам (30 сообщений в секунду - лимит)
        await new Promise(resolve => setTimeout(resolve, 50)); 
      } catch (e) {
        console.log(`Не удалось отправить пользователю ${user.user_id}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      total: users.length 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
