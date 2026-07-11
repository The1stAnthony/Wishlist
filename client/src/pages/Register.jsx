import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '', display_name: '', email: '', password: '', confirmPassword: '', birthday: '',
  });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [error,        setError]          = useState('');
  const [loading,      setLoading]        = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Show match/mismatch hint only after the user starts typing in confirm field
  const confirmTouched  = form.confirmPassword.length > 0;
  const passwordsMatch  = form.password === form.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.birthday || undefined, form.display_name || undefined);
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
        <div className="auth-logo">All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂</div>

        <h1 className="auth-title">Create your wishlist</h1>
        <p className="auth-subtitle">Free forever — no credit card needed</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Name */}
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

          {/* Display name / pseudo name */}
          <div>
            <label className="form-label" htmlFor="display_name">
              Display name{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                (shown publicly on your wishlists — can be a nickname or @handle)
              </span>
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              className="form-input"
              placeholder="e.g. @QueenSarah, BirthdayGirl, xXGamerXx"
              value={form.display_name}
              onChange={handleChange}
              autoComplete="nickname"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="password">
              Password{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                (min 8 characters)
              </span>
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Real-time match feedback */}
            {confirmTouched && (
              <p className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="form-label" htmlFor="birthday">
              Your birthday{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                (optional — lets friends track it)
              </span>
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
