import { Link } from 'react-router-dom';

const LAST_UPDATED = 'July 12, 2026';

export default function Privacy() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Home
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Last updated: {LAST_UPDATED}
      </p>

      <div style={{ lineHeight: 1.8, color: 'var(--color-text)', fontSize: '0.95rem' }}>

        <Section title="1. Who we are">
          All I Want ("we", "us", "our") is a birthday wishlist and gift registry platform operated by
          @The1stAnthony. Our website is located at <strong>alliwant.xyz</strong>.
          You can contact us at <Link to="/contact" style={{ color: 'var(--color-primary)' }}>our contact page</Link>.
        </Section>

        <Section title="2. What data we collect">
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Account information:</strong> name, email address, optional birthday, and optional shipping address.</li>
            <li><strong>Display name / handle:</strong> a public alias shown on wishlists and creator profiles.</li>
            <li><strong>Wishlist content:</strong> gift items, product links, event dates, and visibility settings.</li>
            <li><strong>Usage data:</strong> pages visited, features used, and approximate location via Google Analytics (see §5).</li>
            <li><strong>Communications:</strong> any messages you send us via the contact form.</li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>To operate and improve the platform.</li>
            <li>To send transactional emails (e.g. password resets). We do not send marketing emails without consent.</li>
            <li>To display wishlists to the people you choose to share them with.</li>
            <li>To understand how the site is used via anonymized analytics.</li>
          </ul>
        </Section>

        <Section title="4. Legal basis (EU / GDPR)">
          If you are located in the European Economic Area (EEA), we process your personal data under the
          following legal bases:
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Contract performance</strong> — to provide the service you signed up for.</li>
            <li><strong>Legitimate interests</strong> — to maintain platform security and prevent abuse.</li>
            <li><strong>Consent</strong> — for analytics and any optional communications.</li>
          </ul>
          You have the right to access, correct, or delete your personal data at any time. To exercise these
          rights, use the account deletion option in your Profile settings or contact us.
        </Section>

        <Section title="5. Third-party services">
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Google Analytics (G-RH39HL6QV9):</strong> collects anonymized usage statistics. You can opt out via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Analytics opt-out browser add-on</a>.</li>
            <li><strong>Amazon Associates:</strong> we earn a small commission when you purchase through Amazon links. Amazon may set cookies; see <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Amazon's privacy notice</a>.</li>
            <li><strong>Supabase:</strong> our database provider. Data is stored in the US. Supabase is GDPR-compliant.</li>
            <li><strong>Vercel:</strong> our hosting provider, located in the US. Vercel may log request metadata.</li>
          </ul>
        </Section>

        <Section title="6. Data retention">
          We retain your account data for as long as your account is active. You may delete your account at any
          time from your Profile page, which permanently removes all associated data. Analytics data is retained
          by Google per their own policy (up to 26 months by default).
        </Section>

        <Section title="7. Cookies">
          We use a session token stored in your browser's <code>localStorage</code> to keep you logged in.
          We do not use advertising cookies or tracking pixels on our own. Third-party services (Google Analytics,
          Amazon) may set their own cookies subject to their respective privacy policies.
        </Section>

        <Section title="8. Children's privacy">
          All I Want is not directed at children under 13. We do not knowingly collect personal data from
          children under 13. If you believe a child has provided us personal data, please contact us and we will
          delete it promptly.
        </Section>

        <Section title="9. Changes to this policy">
          We may update this policy from time to time. The "Last updated" date at the top will reflect any
          changes. Continued use of the platform after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="10. Contact us">
          Questions about this policy? <Link to="/contact" style={{ color: 'var(--color-primary)' }}>Send us a message</Link>.
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
