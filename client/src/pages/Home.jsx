import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/home.css';

const FEATURES = [
  { icon: '🎂', title: 'Birthday-first design', desc: 'Built specifically for birthdays — not generic occasions. Set your date, share your link, get exactly what you want.' },
  { icon: '🛍️', title: 'Shop any retailer', desc: 'Add gifts from Amazon, Target, Etsy, or anywhere online. Paste a link and it\'s on your list instantly.' },
  { icon: '📅', title: 'Birthday tracker', desc: 'Never forget a friend\'s birthday again. Get reminded ahead of time so you can actually find a thoughtful gift.' },
  { icon: '✅', title: 'No duplicate gifts', desc: 'Gifters mark items as purchased so two people never buy the same thing — without spoiling the surprise.' },
];

const STEPS = [
  { n: 1, title: 'Create your wishlist', desc: 'Add the gifts you want — paste any link or search Amazon directly from our site.' },
  { n: 2, title: 'Share the link', desc: 'Send your unique wishlist link to friends and family via text, email, or socials.' },
  { n: 3, title: 'Receive perfect gifts', desc: "People buy exactly what you want. No more gift cards to stores you don't visit." },
];

const FAQS = [
  {
    q: 'Is AllIWant free to use?',
    a: 'Yes, completely free. Create wishlists, share them, and track birthdays at no cost.',
  },
  {
    q: 'Do my friends need an account to buy gifts?',
    a: 'No. Anyone with your share link can view your list and mark items as purchased — no sign-up required.',
  },
  {
    q: 'Can I add items from any website?',
    a: 'Yes. Paste any product URL and it gets added to your list. Amazon, Target, Etsy, ASOS — any store works.',
  },
  {
    q: 'What is Creator Mode?',
    a: 'Content creators can set an alias name and link a PO box so fans can send gifts without ever seeing your real address or legal name.',
  },
  {
    q: 'How is this different from an Amazon wishlist?',
    a: 'AllIWant works across every store, not just Amazon. You also get birthday reminders, privacy controls, and a shareable link that doesn\'t expose your address.',
  },
  {
    q: 'Is my address kept private?',
    a: 'Always. Your address is never visible by default. You choose per-wishlist whether to share it, and even then only gifters you share the link with can see it.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <span className="hero-decoration" style={{ top: '10%', left: '8%' }}>🎁</span>
        <span className="hero-decoration" style={{ top: '20%', right: '10%' }}>🎂</span>
        <span className="hero-decoration" style={{ bottom: '15%', left: '15%' }}>🎊</span>
        <span className="hero-decoration" style={{ bottom: '20%', right: '8%' }}>🎈</span>

        <span className="hero-eyebrow">✨ Birthday wishlists, reimagined</span>

        <h1 className="hero-title">
          Get the gifts you <span>actually</span> want this birthday
        </h1>

        <p className="hero-subtitle">
          Build a wishlist from any store, share one link, and let the people
          who love you shop with confidence — no more guessing, no more returns.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Go to my dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                Create my wishlist — it's free
              </Link>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Trust bar */}
        <div className="hero-trust">
          <span>🔒 No card required</span>
          <span>·</span>
          <span>🛍️ Every store supported</span>
          <span>·</span>
          <span>👁️ Full privacy control</span>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="how-it-works-inner">
          <p className="section-subtitle" style={{ textAlign: 'center' }}>SIMPLE AS 1-2-3</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            How <span style={{ color: 'var(--color-primary)' }}>All</span><span style={{ color: '#111827' }}> I </span><span style={{ color: 'var(--color-accent)' }}>Want</span> works
          </h2>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.n} className="step-card">
                <div className="step-number">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="features">
        <div className="features-inner">
          <p className="section-subtitle">EVERYTHING YOU NEED</p>
          <h2 className="section-title">Built for birthday people</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Creator Mode ──────────────────────────────────────────────────── */}
      <section className="creator-section">
        <div className="creator-inner">
          <div className="creator-text">
            <span className="hero-eyebrow" style={{ marginBottom: '1rem', display: 'inline-block' }}>🎙️ For content creators</span>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Your wishlist.<br />Your privacy.</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Stream on Twitch? Post on TikTok? Your fans want to send you things —
              but you don't want to share your home address or your real name.
            </p>
            <ul className="creator-list">
              <li>🏠 <strong>Link a PO box</strong> — fans ship to your box, not your home</li>
              <li>🎭 <strong>Use an alias</strong> — display your handle, not your legal name</li>
              <li>🔗 <strong>One link</strong> — share it in your bio, stream, or posts</li>
              <li>✅ <strong>No duplicates</strong> — viewers coordinate automatically</li>
            </ul>
            {!user && (
              <Link to="/register" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Set up creator wishlist →
              </Link>
            )}
          </div>
          <div className="creator-visual">
            <div className="creator-card-preview">
              <div className="creator-preview-header">
                <div className="creator-preview-avatar">🎙️</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>@YourHandle</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PO Box enabled · Alias shown</p>
                </div>
                <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Public</span>
              </div>
              <div className="creator-preview-items">
                {[
                  { name: 'Blue Yeti Microphone', price: '$129', done: true },
                  { name: 'Stream Deck MK.2', price: '$149', done: false },
                  { name: 'Ring Light Kit', price: '$45', done: false },
                ].map((item) => (
                  <div key={item.name} className="creator-preview-item">
                    <span className={`creator-preview-dot ${item.done ? 'done' : ''}`} />
                    <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--color-text-muted)' : 'var(--color-text)', fontSize: '0.85rem' }}>{item.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="faq-inner">
          <p className="section-subtitle" style={{ textAlign: 'center' }}>GOT QUESTIONS?</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Frequently asked</h2>
          <div className="faq-grid">
            {FAQS.map((faq) => (
              <div key={faq.q} className="faq-card">
                <h3 className="faq-q">{faq.q}</h3>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="cta-section">
          <h2 className="cta-title">Ready for your best birthday yet?</h2>
          <p className="cta-subtitle">
            Free to use. Works with every store. Takes two minutes to set up.
          </p>
          <Link to="/register" className="cta-btn">
            🎂 Create my free wishlist
          </Link>
        </section>
      )}
    </>
  );
}
