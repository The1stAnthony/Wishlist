import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '', display_name: '', email: '', password: '', confirmPassword: '', birthday: '',
    street_address: '', city: '', state: '', zip_code: '', country: 'US',
  });
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [showAddress,   setShowAddress]   = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  function handleChange(e) {
    let value = e.target.value;
    if (e.target.name === 'display_name') {
      value = value.replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '');
    }
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
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

    if (!form.birthday) {
      setError('Please enter your birthday so friends can track it.');
      return;
    }

    setLoading(true);

    try {
      const address = {
        street_address: showAddress ? (form.street_address || null) : null,
        city:           showAddress ? (form.city           || null) : null,
        state:          showAddress ? (form.state          || null) : null,
        zip_code:       showAddress ? (form.zip_code       || null) : null,
        country:        form.country || 'US',
      };
      await register(form.name, form.email, form.password, form.birthday || undefined, form.display_name || undefined, address);
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
              Handle / Display name{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                (optional — letters, numbers, underscores only)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontWeight: 600, pointerEvents: 'none',
              }}>@</span>
              <input
                id="display_name"
                name="display_name"
                type="text"
                className="form-input"
                placeholder="BirthdayGirl"
                value={form.display_name}
                onChange={handleChange}
                autoComplete="nickname"
                style={{ paddingLeft: '1.75rem' }}
              />
            </div>
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
            <label className="form-label" htmlFor="birthday">Your birthday</label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              className="form-input"
              value={form.birthday}
              onChange={handleChange}
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className="form-label" htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              className="form-input"
              value={form.country}
              onChange={handleChange}
              required
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="SE">Sweden</option>
              <option value="PL">Poland</option>
              <option value="JP">Japan</option>
              <option value="IN">India</option>
              <option value="MX">Mexico</option>
              <option value="BR">Brazil</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Optional shipping address */}
          <div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              onClick={() => setShowAddress((v) => !v)}
            >
              {showAddress ? '▾' : '▸'} Add a shipping address <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional — lets gifters ship to you)</span>
            </button>

            {showAddress && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Street address</label>
                  <input name="street_address" className="form-input" placeholder="123 Main St" value={form.street_address} onChange={handleChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" placeholder="New York" value={form.city} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input name="state" className="form-input" placeholder="NY" value={form.state} onChange={handleChange} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">ZIP code</label>
                    <input name="zip_code" className="form-input" placeholder="10001" value={form.zip_code} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">Country</label>
                    <select name="country" className="form-input" value={form.country} onChange={handleChange}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
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
