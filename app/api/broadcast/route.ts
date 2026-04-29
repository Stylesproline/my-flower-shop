import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { message, image, secret } = await req.json();

    if (!secret || String(secret) !== String(process.env.ADMIN_ID)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { data: users } = await supabase.from('users').select('user_id');
    if (!users) return NextResponse.json({ error: 'База пуста' });

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
          // Если есть картинка, шлем фото с подписью
          await bot.sendPhoto(user.user_id, image, { ...options, caption: message });
        } else {
          // Если нет — просто текст
          await bot.sendMessage(user.user_id, message, options);
        }

        successCount++;
        await new Promise(r => setTimeout(r, 50)); 
      } catch (e) {
        console.log(`Ошибка на ID ${user.user_id}`);
      }
    }

    return NextResponse.json({ success: true, sent: successCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

