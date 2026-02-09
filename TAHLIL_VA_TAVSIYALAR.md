# dark_chat — Loyiha tahlili va yaxshilanish tavsiyalari

Tahlil sanasi: 2025  
Texnik stack: Next.js 14, TypeScript, Tailwind, Framer Motion, Supabase Realtime, Web Crypto API.

---

## 1. Xatolar va kamchiliklar

### 1.1 Kritik / xavfsizlik

| # | Muammo | Qayerda | Tavsif |
|---|--------|---------|--------|
| 1 | **decrypt — noto‘g‘ri base64** | `lib/crypto.ts` | Agar `ciphertextB64` noto‘g‘ri base64 bo‘lsa, `atob()` throw qiladi. Room sahifasida bu catch qilinadi va "[Shifrdan ochib bo‘lmadi]" ko‘rsatiladi — lekin barcha keyingi xabarlar uchun ham `setDecryptError` yangilanadi. Bir xabar noto‘g‘ri bo‘lsa, banner doimiy qolishi mumkin. |
| 2 | **Xabar hajmi cheklovi yo‘q** | `app/room/[id]/page.tsx` | Juda katta xabar yuborilsa Supabase Realtime payload limiti (≈1MB) oshishi yoki tarmoq sekinlashi mumkin. Clientda max length (masalan 4096 belgi) yo‘q. |
| 3 | **Room secret = roomId** | Umumiy | Xona ID URLda ochiq. Kimdir URLni ko‘rsa, shifrni ocha oladi. Bu MVP uchun qabul qilingan, lekin hujjatlarda aniq yozilishi kerak. |

### 1.2 Mantiqiy / UX

| # | Muammo | Qayerda | Tavsif |
|---|--------|---------|--------|
| 4 | **Ulashish bekor qilinsa** | `app/room/[id]/page.tsx` | `navigator.share()` foydalanuvchi "Bekor" bosasa `AbortError` throw qiladi. Hozir catch da clipboard fallback bor va "Yuborildi" ko‘rsatiladi — noto‘g‘ri. AbortError da hech narsa qilmaslik yoki "Bekor qilindi" ko‘rsatish kerak. |
| 5 | **isCreatingRoom qaytmaydi** | `app/page.tsx` | "Xona yaratish" bosilganda `isCreatingRoom = true` qilinadi, lekin navigate dan keyin komponent unmount bo‘ladi. Agar navigate juda sekin bo‘lsa yoki xato bo‘lsa, foydalanuvchi "Yuklanmoqda…" da qoladi. Oddiy hollarda muammo yo‘q, lekin `router.push` dan keyin `setIsCreatingRoom(false)` yoki timeout orqali reset qilish yaxshiroq. |
| 6 | **Supabase env yo‘q** | `lib/supabase.ts` | Agar `NEXT_PUBLIC_SUPABASE_*` bo‘lmasa, xonaga kirishda `getSupabase()` throw qiladi. Soddə error boundary yo‘q — butun sahifa o‘chib, Next.js error screen chiqadi. Foydalanuvchiga "Sozlama xatosi. Loyihachi bilan bog‘laning" kabi xabar ko‘rsatish yaxshiroq. |
| 7 | **Kanal ulanishi xatosi** | `app/room/[id]/page.tsx` | Realtime channel subscribe muvaffaqiyatsiz bo‘lsa (tarmoq, Supabase down) hech qanday UI feedback yo‘q. "Ulanishda xatolik" va "Qayta urinish" tugmasi qo‘shish mumkin. |

### 1.3 Kod sifati

| # | Muammo | Qayerda | Tavsif |
|---|--------|---------|--------|
| 8 | **Room import tartibi** | `app/room/[id]/page.tsx` | `logoImage` import boshqa lib importlaridan oldin — odatda tashqi (assets) oxirida yoki alfabet bo‘yicha bo‘ladi. Kichik stil masalasi. |
| 9 | **decrypt ivB64 ishlatilmaydi** | `lib/crypto.ts` | `decrypt(ciphertextB64, ivB64, roomSecret)` — `ivB64` parametri ishlatilmaydi, chunki iv combined ichida. API ni soddalashtirish yoki parametrni olib tashlash mumkin. |
| 10 | **Magic numbers** | `lib/crypto.ts`, `lib/room.ts` | SALT_LENGTH, ITERATIONS, SCROLL_THRESHOLD va b. konstanta sifatida bor — yaxshi. ID_LENGTH (10) va isValidRoomId(6,20) — 6 dan 10 gacha ID join qilishda ishlatiladi, generateRoomId 10 beradi. Izoh qo‘shish foydali. |

### 1.4 Accessibility va SEO

| # | Muammo | Qayerda | Tavsif |
|---|--------|---------|--------|
| 11 | **Til atributi** | `app/layout.tsx` | `lang="uz"` — ba’zi brauzerlar `uz-Cyrl` (kirill) yoki `uz-Latn` (lotin) ni afzal ko‘radi. Hozirgi lotin matnlar uchun `uz-Latn` aniqroq. |
| 12 | **Skip link yo‘q** | Umumiy | Klaviatura foydalanuvchilari uchun "Skip to main content" linki yo‘q. Bosh sahifa qisqa bo‘lgani uchun shart emas, lekin qo‘shish yaxshi amaliyot. |

---

## 2. Yaxshilanish bo‘yicha tavsiyalar

### 2.1 Qisqa muddatda qilish mumkin bo‘lganlar

1. **Xabar uzunligini cheklash**  
   Inputda `maxLength={4096}` (yoki 2048) va UI da "4096 belgigacha" kabi ko‘rsatish.

2. **Ulashish bekor qilinsa**  
   `handleShare` da `err.name === 'AbortError'` tekshirish — bu holda `setShareStatus` o‘zgartirmaslik yoki "Bekor qilindi" ko‘rsatish.

3. **Supabase xato**  
   `createRoomChannel` atrofida try/catch yoki channel’ning `SUBSCRIBED` / `CHANNEL_ERROR` holatlarini kuzatib, "Ulanishda xatolik" + "Qayta urinish" ko‘rsatish.

4. **Metadata**  
   `layout.tsx` da `openGraph`, `twitter:card` va `icons` (favicon allaqachon `app/icon.png` orqali) — ijtimoiy tarmoqlarda link ulashganda yaxshiroq ko‘rinishi uchun.

5. **decrypt API**  
   `ivB64` parametrini olib tashlash yoki hujjatda "reserved" deb belgilash.

### 2.2 O‘rta muddatda

6. **Error boundary**  
   `app/error.tsx` (va kerak bo‘lsa `app/global-error.tsx`) qo‘shish — kutilmagan xatolarda foydalanuvchiga tushunarli xabar va "Qayta urinish".

7. **Loading UI**  
   `app/room/[id]/loading.tsx` — xona sahifasi yuklanayotganda skeleton yoki spinner.

8. **Xabar yuborilayotganda**  
   Optimistic UI: xabar darhol ro‘yxatga qo‘shiladi (pending holatda), keyin tasdiqlanadi yoki xato ko‘rsatiladi.

9. **Rate limit (client)**  
   Juda tez-tez yuborishni cheklash (masalan 1 soniyada 1 xabar yoki debounce) — Realtime va Supabase limitlarini himoya qilish.

### 2.3 Uzoq muddatda

10. **PWA**  
    `manifest.json`, service worker — "Add to Home Screen" va offline ko‘rinishi (chat offline ishlamaydi, lekin bosh sahifa cache qilinsa yaxshi).

11. **Analytics / monitoring**  
    Xato va ishlamay qolishlarni yig‘ish (masalan Vercel Analytics, Sentry) — production’da muammolarni tez aniqlash.

12. **E2EE**  
    Kelajakda xona uchun alohida parol (roomId dan ajratilgan) yoki per-user key exchange — hozirgi "roomId = secret" modelidan qat’iyroq maxfiylik.

---

## 3. Qisqacha baho

| Yo‘nalish | Baho | Izoh |
|-----------|------|------|
| Kod tuzilishi | Yaxshi | App Router, lib ajratilgan, tipizatsiya bor. |
| Xavfsizlik (MVP) | Qoniqarli | Shifrlash bor, roomId ochiq, xabar cheklovi yo‘q. |
| UX | Yaxshi | Dark UI, ikonlar, empty state, aqlli scroll, reduced motion. |
| Xato boshqaruvi | Zaif | Supabase/network xatolari va error boundary yetishmaydi. |
| Accessibility | Yaxshi | Focus-visible, aria, sr-only, min touch target. |
| SEO | O‘rta | Metadata bor, OG/twitter yetishmaydi. |

---

## 4. Amalga oshirish tartibi (tavsiya)

1. Xabar `maxLength` + Ulashish `AbortError` + (ixtiyoriy) decrypt/decryptError banner mantiqi.
2. `app/error.tsx` va xona sahifasida Supabase/ulanish xatolari uchun try/catch yoki channel state.
3. `app/room/[id]/loading.tsx` va metadata (OG/twitter).
4. Keyingi qadamlar: optimistic send, rate limit, PWA, monitoring.

Fayl: `TAHLIL_VA_TAVSIYALAR.md` — loyiha ildizida saqlanadi. Kerak bo‘lsa ushbu tavsiyalar asosida aniq commit’lar uchun vazifalarni bo‘lish mumkin.
