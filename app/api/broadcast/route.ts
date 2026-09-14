import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);

// ВАЖНО: Используем SERVICE_ROLE_KEY, чтобы обойти блокировку RLS и достать пользователей
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, image, secret } = await req.json();

    // Защита: проверяем секретный ключ, который ты передаешь в curl (из ADMIN_ID)
    if (!secret || String(secret) !== String(process.env.ADMIN_ID)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Запрос к базе данных теперь сработает, так как мы зашли под правами супер-админа
    const { data: users, error } = await supabase.from('users').select('user_id');
    
    if (error || !users || users.length === 0) {
      return NextResponse.json({ success: true, sent: 0, note: 'База пуста или заблокирована' });
    }

    let successCount = 0;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;

    for (const user of users) {
      try {
        const options = {
          parse_mode: 'Markdown' as const,
          reply_markup: {
            inline_keyboard: [[
              { text: '🌸 Перейти в магазин', web_app: { url: appUrl } }
            ]]
          }
        };

        if (image) {
          // Если передана ссылка на картинку, отправляем фото с подписью
          await bot.sendPhoto(user.user_id, image, { ...options, caption: message });
        } else {
          // Если картинки нет — отправляем только текст
          await bot.sendMessage(user.user_id, message, options);
        }

        successCount++;
        // Небольшая пауза, чтобы Telegram не заблокировал за спам
        await new Promise(r => setTimeout(r, 50)); 
      } catch (e) {
        console.log(`Ошибка отправки пользователю с ID ${user.user_id}`);
      }
    }

    return NextResponse.json({ success: true, sent: successCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

