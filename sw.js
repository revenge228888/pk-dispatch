/* PK Dispatch — service worker (22 ส.ค. 2026)
 * หน้าที่: ทำให้ติดตั้งเป็นแอปได้ + เปิดได้ตอนสัญญาณไม่ดี
 *
 * ⛔ นโยบายที่ผู้ใช้เลือก: "เช็กของใหม่ก่อนเสมอ" (network-first)
 *    → ทุกครั้งที่เปิด จะไปเอาโค้ดล่าสุดจากเซิร์ฟเวอร์ก่อน
 *    → เก็บสำเนาไว้เผื่อกรณีเน็ตล่ม/ช้าเกิน NET_TIMEOUT_MS เท่านั้น
 *    เหตุผล: ระบบนี้แก้บั๊กแล้ว deploy บ่อยมาก ห้ามให้ทีมค้างอยู่เวอร์ชันเก่า
 *
 * ⛔ ห้ามแตะการเรียกข้อมูล: worker API / Google Apps Script / Google Fonts / CDN
 *    เป็นคนละโดเมน (cross-origin) และเป็น POST → ปล่อยผ่านหมด ไม่ cache ไม่ยุ่ง
 *    (ถ้าเผลอ cache ข้อมูลพวกนี้ = ทีมเห็นยอดเงิน/คิวงานเก่า อันตรายมาก)
 */
// ⚠ ต้องเปลี่ยนเลขทุกครั้งที่ไฟล์ใน SHELL เปลี่ยน (เช่นเปลี่ยนไอคอน)
//   ไม่งั้นเครื่องที่ติดตั้งไปแล้วจะใช้สำเนาเก่าต่อ — v2 = ใส่โลโก้ร้านจริง (2 ก.ย. 2026)
const VERSION = 'pk-shell-v2';
const NET_TIMEOUT_MS = 4000;          // เน็ตอืดเกินนี้ → ใช้สำเนาที่เก็บไว้ เพื่อให้เปิดแอปได้
const SCOPE_PATH = '/pk-dispatch/';

// ไฟล์หน้าเว็บของเราเอง (เก็บไว้ให้เปิดได้ตอนออฟไลน์)
const SHELL = [
  SCOPE_PATH + 'app.html',
  SCOPE_PATH + 'map.html',
  SCOPE_PATH + 'map-day.html',
  SCOPE_PATH + 'manifest.webmanifest',
  SCOPE_PATH + 'icon-192.png',
  SCOPE_PATH + 'icon-512.png',
  SCOPE_PATH + 'icon-maskable-192.png',
  SCOPE_PATH + 'icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  // โหลดเปลือกแอปเก็บไว้ล่วงหน้า — ล้มบางไฟล์ไม่เป็นไร (fail-soft) ขอแค่ติดตั้งผ่าน
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())          // เวอร์ชันใหม่มาแทนที่ทันที ไม่ต้องรอปิดแท็บ
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ให้หน้าเว็บสั่งข้ามคิวได้ (เผื่ออนาคตอยากทำปุ่ม "อัปเดตเดี๋ยวนี้")
self.addEventListener('message', (e) => {
  if (e.data === 'pk-skip-waiting') self.skipWaiting();
});

function timeout(ms) {
  return new Promise((_, rej) => setTimeout(() => rej(new Error('ช้าเกิน ' + ms + 'ms')), ms));
}

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const fresh = await Promise.race([fetch(req), timeout(NET_TIMEOUT_MS)]);
    if (fresh && fresh.ok && fresh.type === 'basic') cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;                                   // เน็ตล่ม/ช้า → ใช้สำเนา
    if (req.mode === 'navigate') {
      const shell = await cache.match(SCOPE_PATH + 'app.html');
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                        // ทางบันทึกข้อมูลทั้งหมดเป็น POST → ไม่แตะ
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;         // คนละโดเมน (worker/GAS/ฟอนต์/CDN) → ปล่อยผ่าน
  if (!url.pathname.startsWith(SCOPE_PATH)) return;
  e.respondWith(networkFirst(req));
});
