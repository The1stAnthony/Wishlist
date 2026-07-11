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

  const initials = user?.name?.charAt(0).toUpperCase() || '?';

  // Shared nav links so desktop and mobile drawer stay in sync
  const navLinks = user
    ? [
        { to: '/dashboard',  label: 'Dashboard' },
        { to: '/birthdays',  label: '🎂 Birthdays' },
        { to: '/search',     label: 'Find Gifts' },
        { to: '/profile',    label: 'Profile' },
      ]
    : [];

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂
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
            <>
              <Link to="/profile" className="navbar-user" onClick={closeMenu}>
                <div className="navbar-avatar">{initials}</div>
                <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button className="btn-ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}

          {/* Hamburger — mobile only */}
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
          </Link>
          <button className="mobile-close" onClick={closeMenu} aria-label="Close menu">✕</button>
        </div>

        <div className="mobile-nav">
          {user ? (
            <>
              {/* User info at top of drawer */}
              <div className="mobile-user-info">
                <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                </div>
              </div>

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

              <button className="mobile-nav-link mobile-signout" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="mobile-nav-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="btn-primary mobile-nav-cta" onClick={closeMenu}>
                Get started — it's free
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
