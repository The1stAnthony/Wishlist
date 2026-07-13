import { useEffect } from 'react';
import '../styles/components/ad-banner.css';

const PUBLISHER_ID = 'ca-pub-5976607298154940';

// Slot IDs from AdSense dashboard
export const AD_SLOTS = {
  horizontal: '3990401804',
  vertical:   '5303483471',
  square:     '4295960467',
};

/**
 * Renders a Google AdSense ad unit.
 * Dev: styled placeholder so layout is visible during development.
 * Prod: renders a real <ins> tag pushed to AdSense.
 *
 * Props:
 *   slot   — AdSense slot ID (use AD_SLOTS.horizontal / .vertical / .square)
 *   format — 'horizontal' | 'sidebar'  (controls the CSS container)
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

  const placeholder = (
    <a
      href="/contact"
      style={{
        textDecoration: 'none', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '0.25rem', width: '100%', height: '100%',
        color: 'var(--color-text-muted)',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>📣</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
        Talk to us about<br />putting your ad here
      </span>
    </a>
  );

  const adIns = (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );

  if (format === 'horizontal') {
    return (
      <div className="ad-banner-horizontal">
        <div className="ad-content">
          {isDev || !slot ? placeholder : adIns}
        </div>
      </div>
    );
  }

  return (
    <div className="ad-slot">
      <div className="ad-label">Advertisement</div>
      <div className="ad-content">
        {isDev || !slot ? placeholder : adIns}
      </div>
    </div>
  );
}
