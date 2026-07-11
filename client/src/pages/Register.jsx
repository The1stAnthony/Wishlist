import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', birthday: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.birthday || undefined);
      // After registration, go straight to dashboard so they can build their first wishlist
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Wish<span>Day</span> 🎂</div>

        <h1 className="auth-title">Create your wishlist</h1>
        <p className="auth-subtitle">Free forever — no credit card needed</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">
              Password <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(min 8 characters)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="birthday">
              Your birthday <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional — lets friends track it)</span>
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              className="form-input"
              value={form.birthday}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : '🎂 Create my free account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
