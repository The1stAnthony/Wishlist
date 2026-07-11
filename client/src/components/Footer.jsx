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
            AllIWant participates in the Amazon Services LLC Associates Program,
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
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Buy Me a Coffee + credits */}
      <div className="footer-support">
        <a
          href="https://www.buymeacoffee.com/seanaprothu"
          target="_blank"
          rel="noopener noreferrer"
          className="bmc-btn"
        >
          ☕ Buy me a coffee
        </a>
        <p className="footer-credits">
          Built &amp; maintained by{' '}
          <a
            href="https://github.com/The1stAnthony"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-credits-link"
          >
            @The1stAnthony
          </a>{' '}
          on GitHub
        </p>
      </div>

      <div className="footer-bottom">
        <span>© {year} AllIWant. All rights reserved.</span>
        <span>Made with 🎂 for birthday lovers</span>
      </div>
    </footer>
  );
}
