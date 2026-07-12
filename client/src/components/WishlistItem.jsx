import '../styles/components/wishlist-item.css';

const PRIORITY_LABELS = { 1: '🔴 High', 2: '🟡 Medium', 3: '🟢 Low' };

export default function WishlistItem({ item, onDelete }) {
  const affiliateUrl  = item.affiliate_url || item.url;
  const quantity      = item.quantity       || 1;
  const purchased     = item.purchased_count || 0;
  const remaining     = quantity - purchased;
  const isFullyBought = remaining <= 0;

  return (
    <div className={`wishlist-item ${isFullyBought ? 'is-purchased' : ''}`}>
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

          {/* Quantity status */}
          {quantity > 1 && !isFullyBought && (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              {remaining} of {quantity} remaining
            </span>
          )}
          {quantity > 1 && isFullyBought && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              ✅ All {quantity} purchased
            </span>
          )}
          {quantity === 1 && isFullyBought && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              ✅ Purchased
            </span>
          )}
        </div>
      </div>

      <div className="wishlist-item-actions">
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
