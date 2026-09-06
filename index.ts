import * as http from "http";
import * as path from "path";
import { Bot, InputFile } from "grammy";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

// تنظیمات ربات و کانال
const BOT_TOKEN = "8768259725:AAFOGnEkkSoGZ01nEksyECHN_XA";
const ADMIN_IDS: number[] = [775248459, 104901849, 555444333];
const CHANNEL_ID = "@choorigallery";

const bot = new Bot(BOT_TOKEN);

// ثبت فونت فارسی
const fontPath = path.join(__dirname, "Vazir-Bold.ttf");
try {
  GlobalFonts.registerFromPath(fontPath, "Vazir");
  console.log("✅ فونت با موفقیت بارگذاری شد.");
} catch (err) {
  console.error("❌ خطا در فونت:", err);
}

// تابع تبدیل اعداد به فارسی
function toPersianDigits(str: string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
}

// تولید تصویر خروجی
async function generateGoldImage(priceText: string): Promise<Buffer> {
  const templatePath = path.join(__dirname, "template.png");
  const baseImage = await loadImage(templatePath);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

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

  // درج متن قیمت طلا
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 58px "Vazir"';
  ctx.fillText(toPersianDigits(priceText), canvas.width / 2, 750);

  // درج تاریخ و زمان
  ctx.fillStyle = "#e0e0e0";
  ctx.font = '28px "Vazir"';
  ctx.fillText(toPersianDigits(`ساعت: ${timeStr}  |  تاریخ: ${dateStr}`), canvas.width / 2, 840);

  return canvas.toBuffer("image/png");
}

// دریافت پیام از تلگرام
bot.on("message:text", async (ctx) => {
  const senderId = ctx.from?.id;
  const messageText = ctx.message.text.trim();

  console.log(`📩 پیام جدید از شناسه: ${senderId} | متن: ${messageText}`);

  if (!senderId || !ADMIN_IDS.includes(senderId)) {
    console.log(`⛔️ کاربر مجاز نیست: ${senderId}`);
    return;
  }

  const statusMsg = await ctx.reply("⏳ در حال تولید تصویر و ارسال به کانال...");

  try {
    const imageBuffer = await generateGoldImage(messageText);

    await bot.api.sendPhoto(CHANNEL_ID, new InputFile(imageBuffer, "gold-price.png"), {
      caption: `🔔 قیمت جدید طلا\n💰 ${toPersianDigits(messageText)} تومان\n\n📢 ${CHANNEL_ID}`,
    });

    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      "✅ تصویر با موفقیت در کانال منتشر شد."
    );
    console.log("✅ ارسال موفق به کانال انجام شد.");
  } catch (error: any) {
    console.error("❌ خطا در ارسال:", error);
    const detail = error?.description || "خطای نامشخص تلگرام";
    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      `❌ خطا در ارسال به کانال:\n${detail}`
    );
  }
});

// سرور وب جهت فعال ماندن در رندر
const port = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Gold Bot is Live!");
  })
  .listen(port, () => {
    console.log(`🌐 سرور وب روی پورت ${port} اجرا شد.`);
  });

// شروع کار ربات
bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 ربات @${botInfo.username} آماده دریافت قیمت است...`);
  },
});
