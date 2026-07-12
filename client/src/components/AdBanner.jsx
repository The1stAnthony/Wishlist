import { useEffect } from 'react';
import '../styles/components/ad-banner.css';

const PUBLISHER_ID = 'ca-pub-5976607298154940';

/**
 * Renders a Google AdSense ad unit.
 * - Dev: shows a styled placeholder so the layout is visible during development.
 * - Prod: renders a real <ins> tag and pushes it to AdSense.
 *
 * Props:
 *   slot   — AdSense ad unit slot ID (from AdSense dashboard → Ad units)
 *   format — 'sidebar' (300×250) | 'horizontal' (728×90)
 */
export default function AdBanner({ slot, format = 'sidebar' }) {
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev && slot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
  }, [isDev, slot]);

  if (format === 'horizontal') {
    return (
      <div className="ad-banner-horizontal">
        <div className="ad-content">
          {isDev || !slot ? (
            <div className="ad-placeholder">
              <div className="ad-placeholder-icon">📣</div>
              <p className="ad-placeholder-text">Advertisement · 728×90</p>
            </div>
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={PUBLISHER_ID}
              data-ad-slot={slot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>
      </div>
    );
  }

  // Default: sidebar format
  return (
    <div className="ad-slot">
      <div className="ad-label">Advertisement</div>
      <div className="ad-content">
        {isDev || !slot ? (
          <div className="ad-placeholder">
            <div className="ad-placeholder-icon">📣</div>
            <p className="ad-placeholder-text">Ad space · 300×250</p>
          </div>
        ) : (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '300px', height: '250px' }}
            data-ad-client={PUBLISHER_ID}
            data-ad-slot={slot}
          />
        )}
      </div>
    </div>
  );
}
