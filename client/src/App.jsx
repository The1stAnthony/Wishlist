import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import Wishlist        from './pages/Wishlist';
import SharedList      from './pages/SharedList';
import Search          from './pages/Search';
import Birthdays       from './pages/Birthdays';
import Profile         from './pages/Profile';
import Friends         from './pages/Friends';
import PublicProfile   from './pages/PublicProfile';
import FriendAccept    from './pages/FriendAccept';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import Privacy         from './pages/Privacy';
import Terms           from './pages/Terms';
import Careers         from './pages/Careers';
import Contact         from './pages/Contact';

/**
 * Redirects unauthenticated users to /login.
 * Used to protect routes that require a logged-in user.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { loading } = useAuth();

  // Don't flash the UI while we're checking localStorage for a saved token
  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/"                     element={<Home />} />
          <Route path="/login"                element={<Login />} />
          <Route path="/register"             element={<Register />} />
          <Route path="/forgot-password"      element={<ForgotPassword />} />
          <Route path="/reset-password"       element={<ResetPassword />} />
          <Route path="/list/:token"          element={<SharedList />} />
          <Route path="/u/:handle"            element={<PublicProfile />} />
          <Route path="/friends/join/:token"  element={<FriendAccept />} />
          <Route path="/search"               element={<Search />} />
          <Route path="/privacy"              element={<Privacy />} />
          <Route path="/terms"                element={<Terms />} />
          <Route path="/careers"              element={<Careers />} />
          <Route path="/contact"              element={<Contact />} />

          {/* Protected routes */}
          <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/wishlist/:id"  element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/birthdays"     element={<PrivateRoute><Birthdays /></PrivateRoute>} />
          <Route path="/friends"       element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
