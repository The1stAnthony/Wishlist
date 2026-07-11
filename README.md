# 🎂 AllIWant — Birthday Wishlists & Gift Registry

> Share your wishlist. Get gifts you love. Never waste a birthday wish again.

**AllIWant** is an open-source birthday registry platform built to solve a problem everyone has: people who love you don't know what to get you, and you end up with stuff you don't want. AllIWant lets you build a wishlist, share a single link, and let your people shop with confidence — no more guessing, no more gift cards to stores you don't use.

🌐 **Live at [alliwant.xyz](https://alliwant.xyz)**

---

## ✨ What Makes AllIWant Different

Most wishlist apps are clunky, require your gifters to sign up, or are buried inside retailer ecosystems. AllIWant is:

- **Retailer-agnostic** — add gifts from Amazon, Etsy, Target, anywhere
- **Zero friction for gifters** — they click a link, no account required
- **Duplicate-gift proof** — gifters mark items as purchased so two people don't buy the same thing
- **Privacy-first** — use your real name for family, a display name/alias for social sharing
- **Optional anonymous gifting** — save your address privately, enable shipping per-list when you want
- **Built for birthdays year-round** — track everyone you care about in one place

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Styling | Separated CSS files using Tailwind `@apply` |
| Backend | Node.js + Express |
| Database | SQLite (via `node:sqlite` — built into Node 22.12+, no compilation needed) |
| Auth | JWT (JSON Web Tokens) |
| Analytics | Google Analytics 4 |
| Affiliate | Amazon Associates link injection |
| Ads | Google AdSense slots (sidebar + horizontal) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22.12+ (uses built-in `node:sqlite`)
- npm

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

Open `.env` and fill in:

```env
JWT_SECRET=your_long_random_secret_here
AMAZON_AFFILIATE_TAG=alliwant-20
ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXXX
```

> **Amazon affiliate tag:** Sign up free at [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
> **AdSense:** Apply at [adsense.google.com](https://adsense.google.com) — uncomment the script in `index.html` once approved

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
├── server/
│   ├── index.js              # Express app entry point
│   ├── database.js           # SQLite schema & initialization
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   └── routes/
│       ├── auth.js           # Register, login, profile (incl. address)
│       ├── wishlists.js      # Wishlist + item CRUD, share tokens, privacy toggles
│       ├── birthdays.js      # Birthday contact tracking
│       └── search.js         # Affiliate URL builder & gift categories
│
└── client/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Global auth state + hooks
        ├── components/
        │   ├── Navbar.jsx        # Responsive nav with mobile drawer
        │   ├── Footer.jsx
        │   ├── GiftCard.jsx      # Public gift display with shop link
        │   ├── WishlistItem.jsx  # Owner's editable item row
        │   └── AdBanner.jsx      # AdSense slot wrapper
        ├── pages/
        │   ├── Home.jsx          # Landing page
        │   ├── Login.jsx
        │   ├── Register.jsx      # Includes display name / alias field
        │   ├── Dashboard.jsx     # Wishlists + upcoming birthdays
        │   ├── Wishlist.jsx      # Owner's edit view + privacy toggles
        │   ├── SharedList.jsx    # Public gifter view (respects privacy settings)
        │   ├── Search.jsx        # Gift search with category browse
        │   ├── Birthdays.jsx     # Birthday contact tracker
        │   └── Profile.jsx       # Account info + private shipping address
        └── styles/
            ├── globals.css       # Tailwind directives + design tokens
            ├── components/       # One CSS file per component
            └── pages/            # One CSS file per page
```

---

## 🔒 Privacy Features

AllIWant competes with platforms like Throne.com by giving users control over their identity:

| Feature | Details |
|---|---|
| **Real name vs display name** | Per-list toggle — show your real name for family, use an alias for social sharing |
| **Private shipping address** | Stored securely, never exposed by default |
| **Per-list address sharing** | One checkbox to let gifters ship directly to you |
| **Server-enforced privacy** | Address fields are only queried when the owner has opted in for that specific list |

---

## 💰 Monetization

**1. Amazon Affiliate Commission**
Every gift link is automatically tagged with your Amazon Associates ID. When a gifter clicks and buys anything within 24 hours, you earn 1–4% commission.

**2. Google AdSense**
Sidebar and horizontal ad slots are built into every page. Enable them by uncommenting the AdSense script in `index.html` once your account is approved.

**Realistic income targets:**

| Monthly Visitors | Estimated Revenue |
|---|---|
| 100–500 | $5–$25 |
| 500–2,000 | $25–$150 |
| 2,000–10,000 | $150–$800 |
| 10,000+ | $800–$3,000+ |

---

## 🗺️ Roadmap & Community Todo List

### 🔥 High Priority
- [ ] **Email notifications** — remind users when a friend's birthday is approaching
- [ ] **Password reset flow** — forgot password via email link
- [ ] **Mobile responsive polish** — full audit of all pages on small screens
- [ ] **Image URL auto-fetch** — when user pastes a product URL, auto-pull the product image
- [ ] **Social sharing cards** — dynamic Open Graph per shared list (requires SSR or edge functions)

### 🎯 Core Feature Expansion
- [ ] **Groups / birthday pools** — multiple people contribute to one gift together
- [ ] **Birthday reminders calendar view** — month-view of all upcoming birthdays
- [ ] **Multiple wishlists per user** — birthday + holiday + wedding registry
- [ ] **Gifter profiles** — optional accounts to track what they've bought

### 💌 Future: Events & eCards
- [ ] **Birthday event pages** — invite friends, RSVP, share the wishlist
- [ ] **eCards** — send a digital birthday card through the app
- [ ] **Digital gift cards** — let people gift a contribution toward something on the list
- [ ] **Push notifications** (PWA) — opt-in birthday reminders on mobile

### 🛠️ Developer Experience
- [ ] **Docker Compose setup** — one command to spin up the full stack
- [ ] **Test suite** — unit tests for API routes, component tests for key UI flows
- [ ] **CI/CD pipeline** — GitHub Actions for lint + test on pull requests
- [ ] **Production deployment guide** — Railway, Fly.io, or VPS instructions

### 💡 Ideas We're Exploring
- [ ] **Browser extension** — "Add to AllIWant" button on any product page
- [ ] **AI gift suggestions** — describe the person, get curated gift ideas
- [ ] **Public gift registries** — discoverable wishlists for wedding / baby shower
- [ ] **Referral program** — share AllIWant, earn a cut of affiliate revenue

---

## 🤝 Contributing

This project is early-stage and community contributions are very welcome.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
# Open a pull request
```

---

## 📄 License

MIT — free to use, modify, and build on.

---

## ⚠️ Affiliate Disclosure

AllIWant participates in the Amazon Services LLC Associates Program. Links to Amazon products are affiliate links, meaning AllIWant earns a small commission if you make a purchase — at no extra cost to you.

---

*Built with 🎂 by [@The1stAnthony](https://github.com/The1stAnthony) — because getting scented candles you didn't ask for is a tragedy.*
