import * as http from "http";
import * as path from "path";
import { Bot, InputFile } from "grammy";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

// ==================== تنظیمات اختصاصی ====================
// توکن ربات دریافتی از BotFather
const BOT_TOKEN = "8768259725:AAFOGnEkkSoGZ01nEksyECHN_XA";

// لیست آیدی‌های عددی تلگرام ادمین‌های مجاز (بدون منفی و علامت)
const ADMIN_IDS: number[] = [775248459, 104901849, 555444333];

// آیدی عمومی کانال با @ یا آیدی عددی کانال خصوصی (شروع با 100-)
const CHANNEL_ID = "@choorigallery";
// ========================================================

// راه‌اندازی ربات
const bot = new Bot(BOT_TOKEN);

// ثبت فونت فارسی
const fontPath = path.join(__dirname, "Vazir-Bold.ttf");
try {
  GlobalFonts.registerFromPath(fontPath, "Vazir");
  console.log("✅ فونت با موفقیت لود شد.");
} catch (err) {
  console.error("❌ خطا در بارگذاری فونت:", err);
}

// تابع تبدیل اعداد انگلیسی به فارسی
function toPersianDigits(str: string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
}

// تابع تولید تصویر قیمت طلا
async function generateGoldImage(priceText: string): Promise<Buffer> {
  const templatePath = path.join(__dirname, "template.png");
  const baseImage = await loadImage(templatePath);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  // رسم پس‌زمینه
  ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

  // دریافت تاریخ و ساعت به وقت تهران
  const now = new Date();
  const timeStr = now.toLocaleTimeString("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateStr = now.toLocaleDateString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // درج متن قیمت
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 58px "Vazir"';
  // مختصات قرارگیری قیمت (تنظیم بر اساس قالب)
  ctx.fillText(toPersianDigits(priceText), canvas.width / 2, 750);

  // درج زمان و تاریخ
  ctx.fillStyle = "#e0e0e0";
  ctx.font = '28px "Vazir"';
  ctx.fillText(toPersianDigits(`ساعت: ${timeStr}  |  تاریخ: ${dateStr}`), canvas.width / 2, 840);

  return canvas.toBuffer("image/png");
}

// دریافت پیام از کاربر
bot.on("message:text", async (ctx) => {
  const senderId = ctx.from?.id;
  const messageText = ctx.message.text.trim();

  console.log(`📩 پیام جدید دریافت شد از شناسه: ${senderId} | متن: ${messageText}`);

  // بررسی دسترسی ادمین
  if (!senderId || !ADMIN_IDS.includes(senderId)) {
    console.log(`⛔️ شناسه ${senderId} در لیست ادمین‌های مجاز نیست.`);
    return;
  }

  // پاسخ اولیه جهت اعلام وضعیت
  const statusMsg = await ctx.reply("⏳ در حال پردازش تصویر و ارسال به کانال...");

  try {
    console.log("🎨 در حال ساخت تصویر...");
    const imageBuffer = await generateGoldImage(messageText);

    console.log("📤 در حال ارسال به کانال...");
    await bot.api.sendPhoto(CHANNEL_ID, new InputFile(imageBuffer, "gold-price.png"), {
      caption: `🔔 قیمت جدید طلا\n💰 ${toPersianDigits(messageText)} تومان\n\n📢 ${CHANNEL_ID}`,
    });

    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      "✅ تصویر با موفقیت در کانال منتشر شد."
    );
    console.log("✅ ارسال به کانال با موفقیت انجام شد.");
  } catch (error: any) {
    console.error("❌ خطا در اجرای عملیات:", error);
    
    let errorDetail = "خطای نامشخص";
    if (error?.description) {
      errorDetail = error.description;
    }

    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      `❌ خطا در ارسال به کانال:\n${errorDetail}`
    );
  }
});

// سرور وب سبک برای فعال ماندن روی پلن رایگان رندر
const port = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Gold Bot is running 24/7!");
  })
  .listen(port, () => {
    console.log(`🌐 سرور وب روی پورت ${port} فعال شد.`);
  });

// شروع کار ربات
bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 ربات @${botInfo.username} با موفقیت فعال شد و آماده کار است...`);
  },
});  const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = toPersianDigits(timeFormatter.format(now));
  const currentDate = toPersianDigits(dateFormatter.format(now));
  const formattedPrice = toPersianDigits(priceText);

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  // درج قیمت طلا
  ctx.font = "bold 52px Vazir";
  ctx.fillStyle = "#FFD700";
  ctx.fillText(formattedPrice, baseImage.width / 2, 480);

  // درج تاریخ
  ctx.font = "30px Vazir";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`تاریخ: ${currentDate}`, baseImage.width / 2, 570);

  // درج ساعت
  ctx.font = "26px Vazir";
  ctx.fillStyle = "#E0E0E0";
  ctx.fillText(`ساعت به‌روزرسانی: ${currentTime}`, baseImage.width / 2, 630);

  return canvas.toBuffer("image/png");
}

bot.on("message:text", async (ctx) => {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id)) return;

  const rawPrice = ctx.message.text.trim();
  const statusMsg = await ctx.reply("⏳ در حال تولید تصویر و ارسال به کانال...");

  try {
    const imageBuffer = await generateGoldImage(rawPrice);

    await bot.api.sendPhoto(CHANNEL_ID, new InputFile(imageBuffer, "gold-price.png"), {
      caption: `🔔 قیمت جدید طلا\n💰 ${toPersianDigits(rawPrice)} تومان\n\n📢 ${CHANNEL_ID}`,
    });

    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      "✅ پست با موفقیت در کانال منتشر شد."
    );
  } catch (error) {
    console.error(error);
    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      "❌ خطا در پردازش تصویر یا ارسال به کانال."
    );
  }
});

// اجرای دائمی و گوش‌به‌زنگِ پیام‌ها
bot.start({
  onStart: () => {
    console.log("ربات با موفقیت فعال شد و آماده دریافت قیمت است...");
  }
});
import * as http from "http";

// باز نگه داشتن یک سرور وب ساده جهت تایید سلامت در رندر
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running 24/7!");
}).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
