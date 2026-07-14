import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const initials  = user?.name?.charAt(0).toUpperCase() || '?';
  const avatarUrl = user?.avatar_url;

  // Shared nav links so desktop and mobile drawer stay in sync
  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/friends',   label: 'Friends' },
        { to: '/search',    label: 'Find Gifts' },
      ]
    : [];

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂
          <span className="alpha-badge">BETA</span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="navbar-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Desktop right side */}
        <div className="navbar-actions">
          {user ? (
            <Link to="/profile" className="navbar-user" onClick={closeMenu}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="navbar-avatar"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className="navbar-avatar" style={avatarUrl ? { display: 'none' } : {}}>{initials}</div>
              <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <div className="navbar-nav" style={{ display: 'flex' }}>
              <Link to="/login"    className="navbar-link">Sign in</Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>Sign up free</Link>
            </div>
          )}

          {/* Hamburger — mobile only, only needed when logged in */}
          {user && (
            <button
              className={`hamburger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂
            <span className="alpha-badge">BETA</span>
          </Link>
          <button className="mobile-close" onClick={closeMenu} aria-label="Close menu">✕</button>
        </div>

        <div className="mobile-nav">
          {!user && (
            <>
              <Link to="/login"    className="mobile-nav-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="btn-primary mobile-nav-cta" onClick={closeMenu}>🚀 Sign up free</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/profile" className="mobile-user-info" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="navbar-avatar" style={{ width: 40, height: 40 }} />
                ) : (
                  <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>{initials}</div>
                )}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                </div>
              </Link>

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Profile link in mobile drawer only — desktop uses avatar click */}
              <NavLink
                to="/profile"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                👤 Profile &amp; Settings
              </NavLink>

              <button className="mobile-nav-link mobile-signout" onClick={handleLogout}>
                🚪 Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
