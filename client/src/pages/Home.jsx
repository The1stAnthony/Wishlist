import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JsonLd from '../components/JsonLd';
import '../styles/pages/home.css';

const FEATURES = [
  { icon: '🎂', title: 'Tied to any event', desc: 'Wishlists connect directly to birthdays, anniversaries, or any occasion — so your upcoming events dashboard always shows the right lists at the right time.' },
  { icon: '🛍️', title: 'Shop any retailer', desc: 'Add gifts from Amazon, Target, Etsy, or anywhere online. Paste a link and it\'s on your list instantly.' },
  { icon: '👁️', title: 'Spoiler-free shopping', desc: 'Gifters can browse and claim items behind the scenes — the recipient never sees what\'s been purchased until unwrapping day. No spoilers, no duplicates.' },
  { icon: '🎁', title: 'Shop your own list', desc: 'Want to treat yourself before your birthday? Shopper mode lets you buy off your own wishlist without seeing what others have already claimed. "No need to wait!"' },
  { icon: '🔗', title: 'Cross-wishlist coordination', desc: 'When a fan buys you a gift from your creator wishlist, it\'s marked purchased everywhere — so your family never doubles up on the same item from your personal list.' },
  { icon: '🔒', title: 'Private wishlists', desc: 'Create friends-only lists for your significant other or a small group. Keep spicy or sentimental gifts exactly where they belong.' },
];

const STEPS = [
  { n: 1, title: 'Create your wishlist', desc: 'Add the gifts you want — paste any link or search Amazon directly from our site.' },
  { n: 2, title: 'Share the link', desc: 'Send your unique wishlist link to friends and family via text, email, or socials.' },
  { n: 3, title: 'Receive perfect gifts', desc: "People buy exactly what you want. No more gift cards to stores you don't visit." },
];

const FAQS = [
  {
    q: 'Is All I Want free to use?',
    a: 'Yes, completely free. Create wishlists, share them, and track birthdays at no cost.',
  },
  {
    q: 'Do my friends need an account to buy gifts?',
    a: 'Yes — gifters need a free account to mark items as purchased. Signing up takes under a minute and lets them coordinate with other shoppers so nobody buys duplicates.',
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
    a: 'All I Want works across every store, not just Amazon. You also get birthday reminders, privacy controls, and a shareable link that doesn\'t expose your address.',
  },
  {
    q: 'Is my address kept private?',
    a: 'Always. Your address is never visible by default. You choose per-wishlist whether to share it, and even then only gifters you share the link with can see it.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function Home() {
  const { user } = useAuth();

  useEffect(() => { document.title = 'All I Want – Birthday Wishlists & Gift Registry'; }, []);

  return (
    <>
      <JsonLd data={FAQ_SCHEMA} />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <span className="hero-decoration" style={{ top: '10%', left: '8%' }} aria-hidden="true">🎁</span>
        <span className="hero-decoration" style={{ top: '20%', right: '10%' }} aria-hidden="true">🎂</span>
        <span className="hero-decoration" style={{ bottom: '15%', left: '15%' }} aria-hidden="true">🎊</span>
        <span className="hero-decoration" style={{ bottom: '20%', right: '8%' }} aria-hidden="true">🎈</span>

        <span className="hero-eyebrow">✨ Birthday wishlists, reimagined</span>

        <h1 className="hero-title">
          Get the gifts you <span>actually</span> want this birthday
        </h1>

        <p className="hero-subtitle">
          Build a wishlist from any store, tie it to any event, and share one link.
          Track upcoming birthdays, shop for friends without spoilers, and get the gifts
          you actually want — no more guessing, no more returns.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Go to my dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                🚀 Sign Up for Early Access
              </Link>
              <Link to="/search" className="btn-ghost" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                🔍 Find a gift
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
          <h2 className="section-title">Built for everyone who has a birthday</h2>
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
            {user ? (
              <Link to="/profile" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Enable creator mode →
              </Link>
            ) : (
              <Link to="/register" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Get started free →
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
      <section className="cta-section">
        <h2 className="cta-title">
          {user ? 'Ready for your best birthday yet?' : 'Built for everyone who has a birthday. And their fans.'}
        </h2>
        <p className="cta-subtitle">
          {user
            ? 'Head to your dashboard to manage your wishlists and birthday tracker.'
            : 'Free forever. Every store supported. Privacy built in. Currently in early access — join now!'}
        </p>
        {user ? (
          <Link to="/dashboard" className="cta-btn">🎂 Go to my dashboard</Link>
        ) : (
          <Link to="/register" className="cta-btn">🚀 Sign Up for Early Access</Link>
        )}
      </section>
    </>
  );
}
