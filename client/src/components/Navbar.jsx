import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  // The first letter of the user's name becomes their avatar initials
  const initials = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="navbar">
      {/* Brand logo */}
      <Link to="/" className="navbar-brand">
        Wish<span>Day</span> 🎂
      </Link>

      {/* Main navigation links — only show when logged in */}
      {user && (
        <div className="navbar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Find Gifts
          </NavLink>
        </div>
      )}

      {/* Right side: user avatar + actions */}
      <div className="navbar-actions">
        {user ? (
          <>
            <div className="navbar-user">
              <div className="navbar-avatar">{initials}</div>
              <span>{user.name}</span>
            </div>
            <button className="btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
