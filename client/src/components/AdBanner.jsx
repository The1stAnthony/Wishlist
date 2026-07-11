import '../styles/components/ad-banner.css';

/**
 * Renders an ad slot.
 *
 * In development (or before AdSense is approved), it shows a styled placeholder
 * so the layout looks correct. Once you have an AdSense publisher ID, swap the
 * placeholder for a real <ins class="adsbygoogle"> element.
 *
 * Props:
 *   slot     — AdSense ad slot ID (optional, from your AdSense dashboard)
 *   format   — 'sidebar' (300×250 or 300×600) | 'horizontal' (728×90)
 */
export default function AdBanner({ slot, format = 'sidebar' }) {
  const isDev = import.meta.env.DEV;

  if (format === 'horizontal') {
    return (
      <div className="ad-banner-horizontal">
        {isDev ? (
          <div className="ad-content">
            <div className="ad-placeholder">
              <div className="ad-placeholder-icon">📣</div>
              <p className="ad-placeholder-text">
                Advertisement<br />728 × 90
              </p>
            </div>
          </div>
        ) : (
          /*
            Replace this with your actual AdSense tag once approved.
            Example:
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot={slot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          */
          <div className="ad-content" />
        )}
      </div>
    );
  }

  // Default: sidebar format
  return (
    <div className="ad-slot">
      <div className="ad-label">Advertisement</div>
      <div className="ad-content">
        {isDev ? (
          <div className="ad-placeholder">
            <div className="ad-placeholder-icon">📣</div>
            <p className="ad-placeholder-text">
              Ad space<br />300 × 250<br /><br />
              Configure AdSense in<br /><code>.env</code>
            </p>
          </div>
        ) : (
          /*
            Replace with your real AdSense unit tag.
            <ins className="adsbygoogle"
              style={{ display: 'block', width: '300px', height: '250px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot={slot}
            />
          */
          <div />
        )}
      </div>
    </div>
  );
}
