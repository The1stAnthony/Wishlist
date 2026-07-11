import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/home.css';

const FEATURES = [
  { icon: '🎂', title: 'Birthday Wishlists', desc: 'Build a list of gifts you actually want, then share the link with everyone who asks.' },
  { icon: '🛍️', title: 'Shop with Affiliate Links', desc: 'Every gift idea links straight to Amazon. Friends buy it, you keep earning.' },
  { icon: '📅', title: 'Birthday Tracker', desc: 'Add friends and family so you never forget an important birthday again.' },
  { icon: '✅', title: 'No Duplicate Gifts', desc: "Gifters can mark items as purchased so two people don't buy the same thing." },
];

const STEPS = [
  { n: 1, title: 'Create your wishlist', desc: 'Add the gifts you want — paste any link or search Amazon directly from our site.' },
  { n: 2, title: 'Share the link', desc: 'Send your unique wishlist link to friends and family via text, email, or socials.' },
  { n: 3, title: 'Receive perfect gifts', desc: "People buy exactly what you want. No more gift cards to stores you don't visit." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Decorative floating emoji */}
        <span className="hero-decoration" style={{ top: '10%', left: '8%' }}>🎁</span>
        <span className="hero-decoration" style={{ top: '20%', right: '10%' }}>🎂</span>
        <span className="hero-decoration" style={{ bottom: '15%', left: '15%' }}>🎊</span>
        <span className="hero-decoration" style={{ bottom: '20%', right: '8%' }}>🎈</span>

        <span className="hero-eyebrow">✨ Birthday wishlists, reimagined</span>

        <h1 className="hero-title">
          Get the gifts you <span>actually</span> want this birthday
        </h1>

        <p className="hero-subtitle">
          Build a wishlist, share the link, and let the people who love you shop
          with confidence — no more guessing, no more returns.
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
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="how-it-works-inner">
          <p className="section-subtitle" style={{ textAlign: 'center' }}>SIMPLE AS 1-2-3</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            How WishDay works
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

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="cta-section">
          <h2 className="cta-title">Ready for your best birthday yet?</h2>
          <p className="cta-subtitle">
            Join thousands of people who stopped wishing and started WishDay-ing.
          </p>
          <Link to="/register" className="cta-btn">
            🎂 Create my free wishlist
          </Link>
        </section>
      )}
    </>
  );
}
