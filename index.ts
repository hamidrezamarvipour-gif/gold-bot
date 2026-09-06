import { Bot, InputFile } from "grammy";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import * as path from "path";

// ======================= اطلاعات شما =======================
const BOT_TOKEN = "8768259725:AAF0GnEkKsoGZ0lnEksyECHN_XA"; 
const ADMIN_IDS = [775248459, 104901849, 555444333]; // آیدی عددی ادمین‌های مجاز
const CHANNEL_ID = "@choorigallery"; 
// ==========================================================

const bot = new Bot(BOT_TOKEN);

const fontPath = path.join(__dirname, "Vazir-Bold.ttf");
GlobalFonts.registerFromPath(fontPath, "Vazir");

function toPersianDigits(str: string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

async function generateGoldImage(priceText: string): Promise<Buffer> {
  const templatePath = path.join(__dirname, "template.png");
  const baseImage = await loadImage(templatePath);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
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
