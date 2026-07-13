import { Link } from 'react-router-dom';
import '../styles/components/footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand + affiliate disclosure */}
        <div>
          <div className="footer-brand">All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂</div>
          <p className="footer-tagline">
            Share your wishlist. Get gifts you actually love.
          </p>
          <p className="footer-affiliate-notice">
            All I Want participates in the Amazon Services LLC Associates Program,
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
            <Link to="/careers"   className="footer-link">Careers</Link>
          </div>
        </div>

        {/* Legal / support */}
        <div>
          <p className="footer-heading">Legal</p>
          <div className="footer-links">
            <Link to="/privacy"  className="footer-link">Privacy Policy</Link>
            <Link to="/terms"    className="footer-link">Terms of Service</Link>
            <Link to="/contact"  className="footer-link">Contact Us</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} All I Want — Built by{' '}
          <a
            href="https://github.com/The1stAnthony"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-credits-link"
          >
            @The1stAnthony
          </a>
        </span>
        <a
          href="https://www.buymeacoffee.com/seanaprothu"
          target="_blank"
          rel="noopener noreferrer"
          className="bmc-btn"
        >
          ☕ Buy me a coffee
        </a>
      </div>
    </footer>
  );
}
