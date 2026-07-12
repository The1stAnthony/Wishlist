import { useState } from 'react';
import '../styles/components/wishlist-item.css';

const PRIORITY_LABELS = { 1: '🔴 High', 2: '🟡 Medium', 3: '🟢 Low' };

export default function WishlistItem({ item, onDelete, spoilerFree = false, onSelfPurchase }) {
  const affiliateUrl  = item.affiliate_url || item.url;
  const quantity      = item.quantity       || 1;
  const purchased     = item.purchased_count || 0;
  const remaining     = quantity - purchased;
  const isFullyBought = !spoilerFree && remaining <= 0;

  // Qty the owner wants to self-purchase (only shown in shopping mode)
  const [buyQty, setBuyQty] = useState(1);

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

          {/* ── Surprise mode: no purchase indicators at all ── */}
          {spoilerFree && quantity > 1 && (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              Qty wanted: {quantity}
            </span>
          )}

          {/* ── Shopping / normal mode: show remaining count ── */}
          {!spoilerFree && quantity > 1 && !isFullyBought && purchased > 0 && (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              {remaining} of {quantity} still needed
            </span>
          )}
          {!spoilerFree && quantity > 1 && !isFullyBought && purchased === 0 && (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              Need {quantity}
            </span>
          )}
          {!spoilerFree && quantity > 1 && isFullyBought && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              ✅ All {quantity} purchased
            </span>
          )}
          {!spoilerFree && quantity === 1 && isFullyBought && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              ✅ Purchased
            </span>
          )}
        </div>

        {/* ── "I bought this" section — only in shopping mode ── */}
        {!spoilerFree && onSelfPurchase && !isFullyBought && (
          <div className="wishlist-item-self-purchase">
            {remaining > 1 && (
              <div className="wishlist-item-qty-row">
                <button
                  className="wishlist-item-qty-btn"
                  onClick={() => setBuyQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="wishlist-item-qty-val">{buyQty}</span>
                <button
                  className="wishlist-item-qty-btn"
                  onClick={() => setBuyQty((q) => Math.min(remaining, q + 1))}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            )}
            <button
              className="wishlist-item-self-buy"
              onClick={() => { onSelfPurchase(item.id, buyQty); setBuyQty(1); }}
            >
              ✅ I bought {remaining > 1 ? `${buyQty}` : 'this'}
            </button>
          </div>
        )}
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
