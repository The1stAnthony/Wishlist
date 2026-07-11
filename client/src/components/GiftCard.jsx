import '../styles/components/gift-card.css';

const PRIORITY_LABELS = { 1: 'High priority', 2: 'Medium', 3: 'Nice to have' };
const PRIORITY_BADGE  = { 1: 'badge-pink', 2: 'badge-amber', 3: '' };

/**
 * Displays a single gift item — used on the public shared wishlist view.
 * The "Buy on Amazon" button opens the affiliate URL in a new tab,
 * which is how we earn commission.
 *
 * Props:
 *   item         — wishlist_item row from the database
 *   onPurchase   — optional callback when gifter clicks "Mark as purchased"
 *   showPurchase — whether to show the purchase button (true on shared view)
 */
export default function GiftCard({ item, onPurchase, showPurchase = false }) {
  const affiliateUrl = item.affiliate_url || item.url;
  const isPurchased  = Boolean(item.is_purchased);

  return (
    <div className={`gift-card ${isPurchased ? 'is-purchased' : ''}`}>
      {/* Product image or emoji placeholder */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="gift-card-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="gift-card-image-placeholder">🎁</div>
      )}

      <div className="gift-card-body">
        <p className="gift-card-name">{item.name}</p>

        {item.price && (
          <p className="gift-card-price">${Number(item.price).toFixed(2)}</p>
        )}

        {/* Priority badge */}
        <span className={`badge ${PRIORITY_BADGE[item.priority] || ''} gift-card-priority`}>
          {PRIORITY_LABELS[item.priority] || 'On my list'}
        </span>

        {item.description && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {item.description}
          </p>
        )}

        <div className="gift-card-footer">
          {/* Affiliate link — opens Amazon in a new tab */}
          {affiliateUrl && !isPurchased && (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gift-card-buy-btn"
              onClick={() => console.log('Affiliate click:', affiliateUrl)}
            >
              🛒 Buy on Amazon
            </a>
          )}

          {isPurchased && (
            <span className="gift-card-buy-btn" style={{ cursor: 'default' }}>
              ✅ Already purchased
            </span>
          )}

          {/* Let the gifter mark the item as bought to prevent duplicate gifts */}
          {showPurchase && !isPurchased && onPurchase && (
            <button
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
              onClick={() => onPurchase(item.id)}
              title="Mark as purchased so no one else buys the same thing"
            >
              Mark bought
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
