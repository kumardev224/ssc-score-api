const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();

app.get("/", (req, res) => {
  res.send("SSC Score API running");
});

app.get("/score", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL missing" });
  }

  try {
    const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: "/usr/bin/chromium-browser"
});

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const result = await page.evaluate(() => {

      const correct = document.querySelectorAll('[bgcolor="green"]').length;
      const wrong = document.querySelectorAll('[bgcolor="red"]').length;
      const notAttempted = document.querySelectorAll('[bgcolor="gray"]').length;

      const session1Correct = Math.min(correct, 40);
      const session2Correct = Math.max(0, correct - 40);

      const session1 = session1Correct * 3;
      const session2 = (session2Correct * 3) - wrong;

      const total = session1 + session2;

      return {
        correct,
        wrong,
        notAttempted,
        session1,
        session2,
        total
      };

    });

    await browser.close();

    res.json(result);

  } catch (err) {
    res.json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
