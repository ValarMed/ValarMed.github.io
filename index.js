const express = require("express");
const fetch = require("node-fetch");
const phrases = require("./phrases.json");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is not set");
  process.exit(1);
}

const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const app = express();
app.use(express.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    if (!update || !update.message) {
      return res.sendStatus(200);
    }

    const chatId = update.message.chat.id;
    const text = update.message.text || "";

    if (text.startsWith("/start")) {
      await sendMessage(chatId, "Привет! Пиши /random чтобы получить свою карту.");
    } else if (text.startsWith("/random") || /карта|расклад/i.test(text)) {
      const random = phrases[Math.floor(Math.random() * phrases.length)];
      await sendMessage(chatId, random);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in webhook handler:", err);
    res.sendStatus(500);
  }
});

async function sendMessage(chatId, text) {
  try {
    await fetch(`${TELEGRAM_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      })
    });
  } catch (error) {
    console.error("sendMessage error:", error);
  }
}

// Health check
app.get("/", (req, res) => res.send("Bot is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on port", PORT));
