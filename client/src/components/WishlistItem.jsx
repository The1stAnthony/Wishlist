import '../styles/components/wishlist-item.css';

const PRIORITY_LABELS = { 1: '🔴 High', 2: '🟡 Medium', 3: '🟢 Low' };

/**
 * Row-style item display used on the owner's private wishlist editing view.
 * Different from GiftCard (which is used on the public-facing shared view).
 *
 * Props:
 *   item      — wishlist_item row
 *   onDelete  — called with item.id when the delete button is clicked
 */
export default function WishlistItem({ item, onDelete }) {
  const affiliateUrl = item.affiliate_url || item.url;
  const isPurchased  = Boolean(item.is_purchased);

  return (
    <div className={`wishlist-item ${isPurchased ? 'is-purchased' : ''}`}>
      {/* Thumbnail or emoji placeholder */}
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="wishlist-item-thumb" />
      ) : (
        <div className="wishlist-item-thumb-placeholder">🎁</div>
      )}

      <div className="wishlist-item-info">
        <p className="wishlist-item-name">{item.name}</p>

        {item.description && (
          <p className="wishlist-item-desc">{item.description}</p>
        )}

        <div className="wishlist-item-meta">
          {item.price && (
            <span className="wishlist-item-price">${Number(item.price).toFixed(2)}</span>
          )}
          <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
            {PRIORITY_LABELS[item.priority] || '🟡 Medium'}
          </span>
          {isPurchased && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              ✅ Purchased
            </span>
          )}
        </div>
      </div>

      <div className="wishlist-item-actions">
        {/* Open the product link in a new tab */}
        {affiliateUrl && (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wishlist-item-link"
          >
            View
          </a>
        )}

        {/* Delete — only the owner sees this */}
        {onDelete && (
          <button
            className="wishlist-item-delete"
            onClick={() => onDelete(item.id)}
            title="Remove from wishlist"
            aria-label={`Remove ${item.name}`}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
