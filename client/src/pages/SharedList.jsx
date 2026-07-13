import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GiftCard from '../components/GiftCard';
import AdBanner from '../components/AdBanner';
import JsonLd from '../components/JsonLd';
import { useAuth } from '../context/AuthContext';

const AMAZON_DOMAINS = {
  US: 'amazon.com',   CA: 'amazon.ca',    GB: 'amazon.co.uk',
  DE: 'amazon.de',    FR: 'amazon.fr',    IT: 'amazon.it',
  ES: 'amazon.es',    NL: 'amazon.nl',    SE: 'amazon.se',
  PL: 'amazon.pl',    AU: 'amazon.com.au',MX: 'amazon.com.mx',
};

function regionalizeAmazonUrl(url, country) {
  if (!url || !country) return url;
  const domain = AMAZON_DOMAINS[country];
  if (!domain || domain === 'amazon.com') return url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon.')) return url;
    parsed.hostname = domain;
    // Strip the US affiliate tag — it doesn't earn on non-US stores.
    // TODO: add per-country tags here once enrolled in each country's Associates program.
    parsed.searchParams.delete('tag');
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * The public-facing view of a wishlist — shown when someone opens a share link.
 * Anyone can view this page without being logged in.
 * Gifters must have an account to mark items purchased (prevents abuse).
 */
export default function SharedList() {
  const { token } = useParams();
  const { user }  = useAuth();

  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    axios.get(`/api/wishlists/share/${token}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setRequiresAuth(!!err.response.data?.requiresAuth);
          setError(err.response.data?.requiresAuth
            ? 'Sign in to view this wishlist.'
            : 'You don\'t have access to this wishlist.');
        } else {
          setError('This wishlist is private or no longer exists.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handlePurchase(itemId, qty = 1) {
    try {
      const res = await axios.post(`/api/wishlists/items/${itemId}/purchase`, { qty });
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => i.id === itemId ? { ...i, ...res.data.item } : i),
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not mark item as purchased.');
    }
  }

  if (loading) return <div className="page-loading">Loading wishlist…</div>;

  if (error) {
    return (
      <div className="page-loading">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</p>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          {requiresAuth && !user && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`} className="btn-primary">
                Sign in
              </Link>
              <Link to="/register" className="btn-ghost">
                Create account
              </Link>
            </div>
          )}
          {!requiresAuth && (
            <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Go to All I Want
            </Link>
          )}
        </div>
      </div>
    );
  }

  const { wishlist, owner, items } = data;

  const ownerCountry = owner?.country || 'US';

  function regionalize(item) {
    if (ownerCountry === 'US') return item;
    const regional = regionalizeAmazonUrl(item.affiliate_url || item.url, ownerCountry);
    return regional !== (item.affiliate_url || item.url)
      ? { ...item, affiliate_url: regional }
      : item;
  }

  const unpurchased = items.filter((i) => (i.purchased_count || 0) < (i.quantity || 1)).map(regionalize);
  const purchased   = items.filter((i) => (i.purchased_count || 0) >= (i.quantity || 1)).map(regionalize);

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: wishlist.title,
    description: wishlist.description || `${owner?.shown_name}'s birthday wishlist on All I Want`,
    url: `https://alliwant.xyz/list/${token}`,
    numberOfItems: items.length,
    ...(wishlist.event_date && {
      'schema:startDate': wishlist.event_date,
    }),
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        ...(item.description && { description: item.description }),
        ...(item.image_url && { image: item.image_url }),
        ...(item.price && {
          offers: {
            '@type': 'Offer',
            price: String(item.price),
            priceCurrency: 'USD',
            availability: (item.purchased_count || 0) >= (item.quantity || 1)
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
            ...(item.affiliate_url || item.url
              ? { url: item.affiliate_url || item.url }
              : {}),
          },
        }),
      },
    })),
  };

  return (
    <div className="page-with-sidebar">
      <JsonLd data={listSchema} />
      <div>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
          {/* Theme image or owner pfp */}
          {(wishlist.theme_image_url || owner?.avatar_url) ? (
            <img
              src={wishlist.theme_image_url || owner?.avatar_url}
              alt={wishlist.title}
              style={{
                width: wishlist.theme_image_url ? '100%' : 72,
                maxHeight: wishlist.theme_image_url ? 220 : 72,
                objectFit: 'cover',
                borderRadius: wishlist.theme_image_url ? 'var(--radius-xl)' : '50%',
                marginBottom: '1rem',
                display: 'block',
                margin: '0 auto 1rem',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎂</p>
          )}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            {wishlist.title}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {owner?.shown_name}'s wishlist
            {wishlist.event_date && ` · ${new Date(wishlist.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>

          {wishlist.description && (
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', maxWidth: 480, margin: '0.75rem auto 0' }}>
              {wishlist.description}
            </p>
          )}
        </div>

        {/* ── Ship-to address (only shown if owner opted in) ───────────────── */}
        {wishlist.share_address && owner?.street_address && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
            background: '#F0FDF4', border: '1px solid #86EFAC', marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏠</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065F46', marginBottom: '0.25rem' }}>
                Ship a gift directly to {owner.shown_name}
              </p>
              <p style={{ fontSize: '0.825rem', color: '#047857', lineHeight: 1.6 }}>
                {owner.street_address}<br />
                {owner.city}{owner.city && owner.state ? ', ' : ''}{owner.state} {owner.zip_code}<br />
                {owner.country && owner.country !== 'US' ? owner.country : ''}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Use this address at checkout and select "this is a gift" to ship directly.
              </p>
            </div>
          </div>
        )}

        {/* ── Gifter tip ───────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #EDE9FE, #FAF9FF)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--color-primary-dark)',
        }}>
          {user ? (
            <>💡 <strong>Tip:</strong> After you purchase a gift, click "Mark bought" so no one else buys the same thing!</>
          ) : (
            <>💡 <strong>Tip:</strong> <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link> or <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>create a free account</Link> to mark gifts as bought — so no one else duplicates your gift!</>
          )}
        </div>

        {/* ── Gift items grid ───────────────────────────────────────────────── */}
        {unpurchased.length === 0 && purchased.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
            This wishlist doesn't have any items yet.
          </p>
        )}

        {unpurchased.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {unpurchased.map((item) => (
              <GiftCard key={item.id} item={item} onPurchase={handlePurchase} showPurchase />
            ))}
          </div>
        )}

        {/* Ad between sections */}
        {unpurchased.length > 0 && <AdBanner format="horizontal" style={{ marginBottom: '2rem' }} />}

        {/* Already purchased section */}
        {purchased.length > 0 && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              ✅ Already purchased
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {purchased.map((item) => (
                <GiftCard key={item.id} item={item} showPurchase={false} />
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA — viral growth hook */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          color: 'white',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🎂 Want your own birthday wishlist?
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem', fontSize: '0.9rem' }}>
            Create yours on All I Want — free forever.
          </p>
          <Link to="/register" style={{
            display: 'inline-block',
            background: 'var(--color-accent)',
            color: '#1F2937',
            fontWeight: 700,
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
          }}>
            Create my wishlist
          </Link>
        </div>
      </div>

      {/* ── Sidebar ads ───────────────────────────────────────────────────── */}
      <aside className="sidebar-ads ad-sidebar">
        <AdBanner format="sidebar" />
        <AdBanner format="sidebar" />
      </aside>
    </div>
  );
}
