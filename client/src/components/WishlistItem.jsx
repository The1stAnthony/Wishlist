import { useState } from 'react';
import axios from 'axios';
import '../styles/components/wishlist-item.css';

const PRIORITY_LABELS = { 1: '🔴 High', 2: '🟡 Medium', 3: '🟢 Low' };

export default function WishlistItem({
  item,
  onDelete,
  onEdit,
  spoilerFree = false,
  onSelfPurchase,
  myWishlists = [],
}) {
  const affiliateUrl  = item.affiliate_url || item.url;
  const quantity      = item.quantity       || 1;
  const purchased     = item.purchased_count || 0;
  const remaining     = quantity - purchased;
  const isFullyBought = !spoilerFree && remaining <= 0;

  const [buyQty,        setBuyQty]        = useState(1);
  const [isEditing,     setIsEditing]     = useState(false);
  const [editSaving,    setEditSaving]    = useState(false);
  const [editLoading,   setEditLoading]   = useState(false);
  const [linkedLists,   setLinkedLists]   = useState(new Set());
  const [prevLinkedIds, setPrevLinkedIds] = useState(new Set());
  const [editForm,      setEditForm]      = useState({
    name:        item.name                                 || '',
    description: item.description                          || '',
    price:       item.price       ? String(item.price)    : '',
    url:         item.url         || item.affiliate_url    || '',
    image_url:   item.image_url                            || '',
    priority:    String(item.priority || 2),
    quantity:    String(item.quantity || 1),
  });

  async function openEdit() {
    setEditForm({
      name:        item.name                              || '',
      description: item.description                        || '',
      price:       item.price ? String(item.price)        : '',
      url:         item.url   || item.affiliate_url        || '',
      image_url:   item.image_url                          || '',
      priority:    String(item.priority || 2),
      quantity:    String(item.quantity || 1),
    });
    setLinkedLists(new Set());
    setPrevLinkedIds(new Set());
    setIsEditing(true);
    setEditLoading(true);
    try {
      const res = await axios.get(`/api/wishlists/items/${item.id}/linked-lists`);
      const ids = new Set((res.data.wishlistIds || []).map(String));
      setLinkedLists(ids);
      setPrevLinkedIds(ids);
    } catch { /* treat as not linked */ } finally {
      setEditLoading(false);
    }
  }

  function handleEditChange(e) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleLinked(wishlistId) {
    const key = String(wishlistId);
    setLinkedLists((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleEditSave() {
    if (!editForm.name.trim()) return;
    setEditSaving(true);
    try {
      const toAdd    = [...linkedLists].filter((id) => !prevLinkedIds.has(id)).map(Number);
      const toRemove = [...prevLinkedIds].filter((id) => !linkedLists.has(id)).map(Number);
      await onEdit(item.id, {
        ...editForm,
        price:    editForm.price    ? parseFloat(editForm.price)    : null,
        priority: parseInt(editForm.priority, 10),
        quantity: parseInt(editForm.quantity,  10) || 1,
      }, { toAdd, toRemove });
      setIsEditing(false);
    } finally {
      setEditSaving(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = document.createElement('canvas');
    const img    = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setEditForm((prev) => ({ ...prev, image_url: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className={`wishlist-item-wrapper ${isFullyBought ? 'is-purchased' : ''}`}>
      {/* ── Card row ──────────────────────────────────────────────────────── */}
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

            {/* Surprise mode: no purchase indicators */}
            {spoilerFree && quantity > 1 && (
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                Qty wanted: {quantity}
              </span>
            )}

            {/* Shopping / normal mode */}
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

          {/* "I bought this" — only in shopping mode */}
          {!spoilerFree && onSelfPurchase && !isFullyBought && (
            <div className="wishlist-item-self-purchase">
              {remaining > 1 && (
                <div className="wishlist-item-qty-row">
                  <button className="wishlist-item-qty-btn" onClick={() => setBuyQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                  <span className="wishlist-item-qty-val">{buyQty}</span>
                  <button className="wishlist-item-qty-btn" onClick={() => setBuyQty((q) => Math.min(remaining, q + 1))} aria-label="Increase">+</button>
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
            <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="wishlist-item-link">
              View
            </a>
          )}

          {onEdit && (
            <button
              className={`wishlist-item-edit-btn${isEditing ? ' is-active' : ''}`}
              onClick={() => isEditing ? setIsEditing(false) : openEdit()}
              title={isEditing ? 'Close editor' : 'Edit item'}
              aria-label={isEditing ? 'Close editor' : 'Edit item'}
            >
              ✏️
            </button>
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

      {/* ── Edit panel ────────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="wishlist-item-edit-panel">
          <div className="add-item-grid">
            {/* Name */}
            <div className="full-width">
              <label className="form-label">Item name *</label>
              <input
                name="name"
                className="form-input"
                value={editForm.name}
                onChange={handleEditChange}
                required
                autoFocus
              />
            </div>

            {/* Price + Priority */}
            <div>
              <label className="form-label">Price</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="49.99"
                value={editForm.price}
                onChange={handleEditChange}
              />
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select name="priority" className="form-input" value={editForm.priority} onChange={handleEditChange}>
                <option value="1">🔴 High — really want this</option>
                <option value="2">🟡 Medium — would love it</option>
                <option value="3">🟢 Low — nice to have</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="form-label">Quantity wanted</label>
              <input
                name="quantity"
                type="number"
                min="1"
                max="99"
                className="form-input"
                value={editForm.quantity}
                onChange={handleEditChange}
              />
            </div>

            {/* Product link */}
            <div className="full-width">
              <label className="form-label">Product link</label>
              <input
                name="url"
                type="url"
                className="form-input"
                placeholder="https://..."
                value={editForm.url}
                onChange={handleEditChange}
              />
            </div>

            {/* Description */}
            <div className="full-width">
              <label className="form-label">Description</label>
              <input
                name="description"
                className="form-input"
                placeholder='e.g. "Size M, color blue"'
                value={editForm.description}
                onChange={handleEditChange}
              />
            </div>

            {/* Image */}
            <div className="full-width">
              <label className="form-label">Item photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {editForm.image_url && (
                  <img
                    src={editForm.image_url}
                    alt="Preview"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.625rem' }}>
                    {editForm.image_url ? '📷 Replace' : '📷 Upload'}
                  </span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
                {editForm.image_url && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '0.72rem', color: '#EF4444', padding: '0.3rem 0.5rem' }}
                    onClick={() => setEditForm((prev) => ({ ...prev, image_url: '' }))}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Cross-list linking */}
            {myWishlists.length > 0 && (
              <div className="full-width">
                <label className="form-label">Sync with your other wishlists</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  Checked = linked (edits + buys sync). Uncheck to remove from that list.
                </p>
                {editLoading ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Loading…</p>
                ) : (
                  <div className="wishlist-item-link-list">
                    {myWishlists.map((w) => (
                      <label key={w.id}>
                        <input
                          type="checkbox"
                          checked={linkedLists.has(String(w.id))}
                          onChange={() => toggleLinked(w.id)}
                          style={{ accentColor: 'var(--color-primary)', width: 14, height: 14 }}
                        />
                        {w.title}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? 'Saving…' : 'Save changes'}
            </button>
            <button className="btn-ghost" style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
