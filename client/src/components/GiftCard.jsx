import { useState } from 'react';
import '../styles/components/gift-card.css';

const PRIORITY_LABELS = { 1: 'High priority', 2: 'Medium', 3: 'Nice to have' };
const PRIORITY_BADGE  = { 1: 'badge-pink', 2: 'badge-amber', 3: '' };

export default function GiftCard({ item, onPurchase, showPurchase = false }) {
  const affiliateUrl  = item.affiliate_url || item.url;
  const quantity      = item.quantity       || 1;
  const purchased     = item.purchased_count || 0;
  const remaining     = quantity - purchased;
  const isFullyBought = remaining <= 0;

  const [buyQty, setBuyQty] = useState(1);

  return (
    <div className={`gift-card ${isFullyBought ? 'is-purchased' : ''}`}>
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

        <span className={`badge ${PRIORITY_BADGE[item.priority] || ''} gift-card-priority`}>
          {PRIORITY_LABELS[item.priority] || 'On my list'}
        </span>

        {/* Quantity status */}
        {quantity > 1 && (
          <p style={{ fontSize: '0.72rem', color: isFullyBought ? '#059669' : 'var(--color-text-muted)', marginTop: '0.35rem', fontWeight: 600 }}>
            {isFullyBought
              ? `✅ All ${quantity} purchased`
              : `${purchased} of ${quantity} purchased · ${remaining} still needed`}
          </p>
        )}

        {item.description && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {item.description}
          </p>
        )}

        <div className="gift-card-footer">
          {affiliateUrl && !isFullyBought && (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gift-card-buy-btn"
            >
              🛒 Shop Now
            </a>
          )}

          {isFullyBought && (
            <span className="gift-card-buy-btn" style={{ cursor: 'default' }}>
              ✅ Already purchased
            </span>
          )}

          {showPurchase && !isFullyBought && onPurchase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              {remaining > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    style={{ width: 22, height: 22, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setBuyQty((q) => Math.max(1, q - 1))}
                  >−</button>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{buyQty}</span>
                  <button
                    type="button"
                    style={{ width: 22, height: 22, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setBuyQty((q) => Math.min(remaining, q + 1))}
                  >+</button>
                </div>
              )}
              <button
                className="btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                onClick={() => onPurchase(item.id, buyQty)}
                title="Mark as purchased so no one else buys the same thing"
              >
                Mark bought{remaining > 1 ? ` (${buyQty})` : ''}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
