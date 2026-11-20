import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const title = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
const box = await page.locator("h1").boundingBox();
const tag = await page.locator("p").boundingBox();
console.log(JSON.stringify({ title, box, tag }));
await page.screenshot({
  path: "/workspace/.grok/og-raw.png",
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await page.setViewportSize({ width: 64, height: 64 });
await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#fff">
<img src="file:///workspace/public/favicon.svg" width="64" height="64" />
</body></html>`, { waitUntil: "load" });
await page.screenshot({ path: "/workspace/.grok/favicon-64.png", type: "png" });
await browser.close();
