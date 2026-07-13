# 🎂 AllIWant — Birthday Wishlists & Gift Registry

> Share your wishlist. Get gifts you love. Never waste a birthday wish again.

**AllIWant** is a birthday registry platform built to solve a problem everyone has: the people who love you don't know what to get you, and you end up with stuff you don't want. AllIWant lets you build a wishlist, share a single link, and let your people shop with confidence — no more guessing, no more duplicate gifts.

🌐 **Live at [alliwant.xyz](https://alliwant.xyz)** · Currently in **Alpha**

---

## ✨ What Makes AllIWant Different

Most wishlist apps are clunky, require gifters to sign up, or are buried inside retailer ecosystems. AllIWant is:

- **Retailer-agnostic** — add gifts from Amazon, Etsy, Target, anywhere
- **Zero friction for gifters** — they click a link, no account required
- **Duplicate-gift proof** — gifters mark items purchased so no one buys the same thing twice
- **Privacy by visibility tier** — Public (creator alias), Friends (real name), Specific People (hand-picked)
- **Creator-first discovery** — creator accounts get one-way follows; friends use mutual acceptance
- **Regional Amazon links** — automatically routes gifters to their local Amazon store (12 countries)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Styling | Separated CSS files using `@apply` |
| Backend | Node.js + Express (Vercel serverless, single function) |
| Database | PostgreSQL via Supabase (`pg` / node-postgres) |
| Auth | JWT (7-day tokens, localStorage) |
| Deployment | Vercel (Hobby — all routes via `api/index.js`) |
| Analytics | Google Analytics 4 (`G-RH39HL6QV9`) |
| Affiliate | Amazon Associates (US tag; regional routing for 12 countries) |
| Ads | Google AdSense (`ca-pub-5976607298154940`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- A PostgreSQL database (Supabase free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/The1stAnthony/alliwant.git
cd alliwant
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL=postgresql://...        # Supabase connection string
JWT_SECRET=your_long_random_secret
AMAZON_AFFILIATE_TAG=alliwant0a-20
CONTACT_EMAIL=your@email.com
PLATFORM_CREATOR_HANDLE=The_1st_Anthony
```

### 4. Run in development
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 📁 Project Structure

```
alliwant/
├── api/
│   └── index.js              # Vercel serverless entry (thin wrapper → server/)
├── lib/
│   └── db.js                 # PostgreSQL pool (query / queryOne helpers)
├── server/
│   ├── index.js              # Express app setup
│   ├── middleware/
│   │   └── auth.js           # JWT requireAuth middleware
│   └── routes/
│       ├── auth.js           # Register, login, profile update
│       ├── wishlists.js      # Wishlist + item CRUD, share tokens, permissions
│       ├── follows.js        # Creator follows, creator feed, toggle-creator
│       ├── friendships.js    # Friend requests, friend feed, upcoming events
│       ├── birthdays.js      # Birthday contact tracker
│       ├── scrape.js         # OG tag / product URL auto-fill
│       └── search.js         # Curated gift catalog, affiliate URL builder
│
└── client/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx    # Global auth state + JWT decode
        │   └── ToastContext.jsx   # App-wide toast notification system
        ├── components/
        │   ├── Navbar.jsx         # Responsive nav with mobile drawer
        │   ├── Footer.jsx
        │   ├── GiftCard.jsx       # Public gift display with shop/purchase buttons
        │   ├── WishlistItem.jsx   # Owner's editable item row
        │   ├── AdBanner.jsx       # AdSense slot wrapper
        │   └── JsonLd.jsx         # Structured data (schema.org) injector
        └── pages/
            ├── Home.jsx           # Landing page
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx      # My lists + friends feed + creator feed + events
            ├── Wishlist.jsx       # Owner's edit view (theme, visibility, items)
            ├── SharedList.jsx     # Gifter view — respects visibility tier
            ├── Search.jsx         # Gift search with category browse + Amazon fallback
            ├── Friends.jsx        # Friend requests, following, invite links
            ├── Birthdays.jsx      # Birthday contact tracker
            ├── Profile.jsx        # Account info + address + creator mode
            ├── Terms.jsx          # Terms of Service (18+ prohibition, affiliate compliance)
            ├── Privacy.jsx        # Privacy Policy
            └── Contact.jsx        # Contact form
```

---

## 🔒 Visibility & Privacy System

| Tier | Who can see | Name shown | Appears in |
|---|---|---|---|
| **Public** | Anyone with link; followers in feed | Creator @alias | Creators' Wishlists, Upcoming Events (followers only) |
| **Friends** | Accepted friends only | Real name | Friends' Wishlists, Upcoming Events (friends only) |
| **Specific People** | Hand-picked friends (permission table) | Real name | Friends' Wishlists, Upcoming Events (if permitted) |

Additional rules:
- Public wishlists are **only createable by creator_mode accounts**
- Empty wishlists (0 items) are **never surfaced** in any feed or events section
- Followers cannot see Friends or Specific tier wishlists from creators they follow

---

## 💰 Monetization

**Amazon Affiliate Commission** — every gift link is tagged with the Associates ID. Gifters who click and buy within 24 hours generate commission at no extra cost to them.

**Google AdSense** — sidebar and horizontal slots on every page.

| Monthly Visitors | Estimated Revenue |
|---|---|
| 100–500 | $5–$25 |
| 500–2,000 | $25–$150 |
| 2,000–10,000 | $150–$800 |
| 10,000+ | $800–$3,000+ |

---

## ✅ Shipped in Alpha

Feature history for reference — all of the below is live on `alliwant.xyz`:

**Core platform**
- [x] JWT authentication — register, login, profile update
- [x] Multiple wishlists per user
- [x] Wishlist items with priority, quantity, URL scraping (auto-fill name/price/image)
- [x] No Spoilers mode (owner) / Shopping mode (owner sees what's been purchased)
- [x] Duplicate-gift prevention — gifters mark items purchased; quantity-aware
- [x] Cross-wishlist item linking — same item on multiple lists stays in sync on purchase

**Social graph**
- [x] Friends & Family — mutual friend requests via email or invite link
- [x] Creator Mode — one-way follows; auto mutual-follow with platform account on enable
- [x] Visibility tiers: Public / Friends / Specific People
- [x] Specific People permission picker — friend checkboxes, saved to `wishlist_permissions`
- [x] Public restricted to creator_mode accounts only

**Dashboard & Feeds**
- [x] Creators' Wishlists feed (follows-based, public only, creator_mode=TRUE)
- [x] Friends' Wishlists feed (friendship-based, friends/specific only)
- [x] Upcoming Birthdays / Events row — deduped, sorted by date, 7-day lookback
- [x] Empty wishlists suppressed from all feeds and events
- [x] Visibility-correct deduplication (friends version wins over creator version)
- [x] Birthday reminder banner (< 90 days away, < 10 items)

**Wishlist UI**
- [x] Wishlist theme image — URL paste or file upload (client-side compressed)
- [x] Theme shown as cover in event cards, dashboard cards, shared list header
- [x] "Write in a gift" collapsible form — items visible first
- [x] Item photo upload (client-side compressed to 600×600)
- [x] Address sharing toggle per-list
- [x] Share link with toast copy confirmation

**Discovery & Search**
- [x] Gift search with category browse (8 categories)
- [x] Regional Amazon links — 12 Western countries; routes owners and gifters to local store
- [x] Amazon affiliate tag injection (US only; stripped for non-US per Associates policy)
- [x] "Search all of Amazon" fallback CTA (region-aware)

**Infrastructure**
- [x] Migrated from SQLite to PostgreSQL (Supabase)
- [x] Vercel serverless — single function to stay under Hobby 12-function limit
- [x] Google Analytics 4
- [x] Google AdSense slots
- [x] OG meta tags + JSON-LD structured data on shared lists
- [x] Toast notification system

**Legal & Compliance**
- [x] Terms of Service — explicit 18+ content prohibition, Amazon Associates compliance clause
- [x] Privacy Policy
- [x] Contact page (CONTACT_EMAIL env var — never hardcoded)

---

## 🚧 Beta Roadmap — v0.1.0

The following must be completed before AllIWant exits Alpha and enters Beta.

### 1. 🐛 Full Debug Sweep
A structured QA pass across all pages and user flows:
- All auth states (logged out, logged in, creator, friend)
- Mobile responsiveness on all pages
- Edge cases: zero friends, zero wishlists, expired links, invalid tokens
- Verify 403/404/500 error states surface cleanly to users

### 2. 🔐 Security Audit
- Rate limiting on auth endpoints (login, register, invite claim)
- Input sanitization — confirm no XSS vectors in user-supplied content (names, descriptions, URLs)
- JWT expiry enforcement — confirm 401 on expired tokens
- Verify no PII leaks in API responses (e.g., email never returned to non-owner)
- Confirm Supabase RLS is either enabled or intentionally bypassed with full awareness
- Review env var exposure — no secrets in client bundle

### 3. ⚡ Performance Optimization
- Add DB indexes on hot query paths (`follows.follower_id`, `friendships` status+requester, `wishlist_items.wishlist_id`)
- Review N+1 subqueries in feed endpoints — consider materializing item counts
- Lazy-load images (theme images, item photos stored as base64 — evaluate size impact)
- Audit Vite bundle size — ensure no large unused dependencies

### 4. ♿ Accessibility & Compliance
- WCAG 2.1 AA audit — keyboard navigation, focus states, color contrast
- Add `aria-label` to all icon-only buttons
- Ensure all form fields have associated `<label>` elements
- Add `alt` text discipline to all images
- GDPR/CCPA: confirm Privacy Policy accurately describes data collected and stored
- Cookie consent — currently no cookies beyond JWT in localStorage; document this clearly

### 5. 🛒 Amazon Products — **Critical Blocker**
The current Search page uses a curated static catalog with placeholder images and no direct product links. This is not suitable for Beta.

**The problem:** The Amazon Product Advertising API (PA API) requires **3 qualifying sales** through your Associates account before access is granted. EU storefronts each require separate enrollment, and some (DE, FR, etc.) require additional qualifying purchase thresholds — effectively ~150 qualifying purchases across all 12 countries for full regional coverage.

**Options being evaluated:**

| Option | Effort | Cost | Trade-off |
|---|---|---|---|
| Wait for PA API qualification | Low | Free | Requires organic sales first; US-only initially |
| Rainforest API (third-party Amazon scraper) | Medium | ~$50/mo | Paid but immediate; ToS gray area |
| Narrow to US-only search for Beta | Low | Free | Drops multi-country search; regional links still work on user-added items |
| Reframe Search as "ideas board" (no Amazon links) | Low | Free | Removes dependency entirely; users paste their own links |
| Browser extension "Add to AllIWant" | High | Free | Best long-term; bypasses API entirely |

**Decision pending.** Likely path for Beta v0.1.0: narrow to US-only search using the static catalog (better curated), plus prompt US users to make purchases to earn PA API access. EU regional routing stays intact for user-added items regardless.

### 6. ✅ Final Pre-Beta Review
- Replace Elfster for internal family use — full functional test with real users
- Ensure all accounts can: add friends, create wishlists, share links, have gifts purchased
- Verify email flows (if added before Beta)
- Tag `v0.1.0` release on GitHub

---

## 📋 Deferred Backlog (Post-Beta)

- [ ] **Email notifications** — birthday reminders, friend request alerts, purchase confirmations
- [ ] **Password reset** — forgot password via email link
- [ ] **Groups / gift pools** — multiple contributors toward one item
- [ ] **Birthday calendar view** — month grid of all upcoming birthdays
- [ ] **eCards** — send a digital birthday card through the app
- [ ] **Gift card contributions** — chip in toward a list item monetarily
- [ ] **Push notifications** (PWA) — opt-in birthday reminders on mobile
- [ ] **Browser extension** — "Add to AllIWant" button on any product page
- [ ] **AI gift suggestions** — describe the person, get curated ideas
- [ ] **Docker Compose** — one-command local dev setup
- [ ] **Test suite** — API route unit tests + key UI component tests
- [ ] **CI/CD** — GitHub Actions lint + test on PRs

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: description"
git push origin feature/your-feature-name
# Open a pull request
```

---

## 📄 License

MIT — free to use, modify, and build on.

---

## ⚠️ Affiliate Disclosure

AllIWant participates in the Amazon Services LLC Associates Program. Product links on this site may be affiliate links — AllIWant earns a small commission if you purchase, at no extra cost to you.

---

*Built with 🎂 by [@The1stAnthony](https://github.com/The1stAnthony) — because getting scented candles you didn't ask for is a tragedy.*
