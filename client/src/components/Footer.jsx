import { Link } from 'react-router-dom';
import '../styles/components/footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand + affiliate disclosure */}
        <div>
          <div className="footer-brand">Wish<span>Day</span> 🎂</div>
          <p className="footer-tagline">
            Share your wishlist. Get gifts you actually love.
          </p>
          <p className="footer-affiliate-notice">
            WishDay participates in the Amazon Services LLC Associates Program,
            an affiliate advertising program designed to provide a means for
            sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="footer-heading">Product</p>
          <div className="footer-links">
            <Link to="/"          className="footer-link">Home</Link>
            <Link to="/register"  className="footer-link">Create a Wishlist</Link>
            <Link to="/search"    className="footer-link">Find Gifts</Link>
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
          </div>
        </div>

        {/* Legal / support */}
        <div>
          <p className="footer-heading">Legal</p>
          <div className="footer-links">
            {/* These pages can be added later */}
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} WishDay. All rights reserved.</span>
        <span>Made with 🎂 for birthday lovers</span>
      </div>
    </footer>
  );
}
