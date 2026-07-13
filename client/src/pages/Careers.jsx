import { Link } from 'react-router-dom';

export default function Careers() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', display: 'inline-block', marginBottom: '2rem' }}>
        ← Home
      </Link>

      <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</p>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
        Careers at All I Want
      </h1>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
        We're not actively hiring right now — but we are always looking for
        contributors who love building things people actually use.
      </p>

      <div style={{
        padding: '2rem', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, #EDE9FE, #FAF9FF)',
        border: '1.5px solid var(--color-primary-light)',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>
          🛠️ Want to contribute?
        </h2>
        <p style={{ color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.95rem' }}>
          All I Want is a passion project built in the open. If you want to contribute a feature,
          fix a bug, or improve the design — pull requests are welcome!
        </p>
        <a
          href="https://github.com/The1stAnthony"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex' }}
        >
          View on GitHub →
        </a>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Have a bigger idea in mind?{' '}
        <Link to="/contact" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Send us a message
        </Link>.
      </p>
    </div>
  );
}
