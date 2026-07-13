import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/pages/auth.css';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂</div>

        {sent ? (
          <>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              If an account exists for <strong>{email}</strong>, we've sent a reset link. It expires in 1 hour.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Didn't get it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                try again
              </button>.
            </p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Forgot your password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>

            {error && <p className="auth-error">{error}</p>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
