import { Link } from 'react-router-dom';

const LAST_UPDATED = 'July 13, 2026';

export default function Terms() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Home
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Last updated: {LAST_UPDATED}
      </p>

      <div style={{ lineHeight: 1.8, color: 'var(--color-text)', fontSize: '0.95rem' }}>

        <Section title="1. Acceptance">
          By creating an account or using All I Want ("the Service"), you agree to these Terms of Service.
          If you do not agree, do not use the Service. These terms apply to all visitors, users, and others who access the Service.
        </Section>

        <Section title="2. Eligibility">
          You must be at least 13 years old to use the Service. By using the Service, you represent that you
          meet this requirement.
        </Section>

        <Section title="3. Your account">
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate information when creating your account.</li>
            <li>You may not impersonate other people or use handles that are misleading.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable use">
          You agree not to:
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Post content that is abusive, harassing, obscene, or otherwise objectionable.</li>
            <li>
              <strong>Post, upload, or link to any sexually explicit, pornographic, or adult-only ("18+") content
              of any kind</strong> — including but not limited to images, videos, product links, descriptions, or
              wishlist items. This prohibition is absolute and applies to profile pictures, wishlist themes, item
              descriptions, and any other user-generated content on the Service. Violations will result in
              immediate account termination.
            </li>
            <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
            <li>Use automated tools (bots, scrapers) to access or collect data from the Service without permission.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          </ul>
        </Section>

        <Section title="5. Wishlist content">
          You retain ownership of the content you create on the Service (wishlist items, descriptions, etc.).
          By posting content, you grant us a non-exclusive, worldwide license to display it as part of operating the Service.
          We do not claim ownership of your data and will not sell it to third parties.
          <br /><br />
          <strong>Amazon Associates compliance:</strong> The Service participates in the Amazon Associates Program.
          As a condition of that program, all user-generated content — including wishlist items, images, and
          descriptions — must comply with Amazon's{' '}
          <a
            href="https://affiliate-program.amazon.com/help/operating/policies"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)' }}
          >
            Operating Agreement
          </a>. You must not use the Service to promote, link to, or describe products or content that are
          prohibited under Amazon's policies, including but not limited to adult-only products, illegal items,
          or content that violates Amazon's community standards. We reserve the right to remove any content
          that jeopardizes our participation in the Amazon Associates Program.
        </Section>

        <Section title="6. Affiliate links">
          The Service participates in the Amazon Associates program and may contain affiliate links. If you
          purchase a product through an affiliate link, we may earn a small commission at no additional cost
          to you. This does not influence the gifts displayed or recommended.
        </Section>

        <Section title="7. Creator mode">
          Users who enable Creator Mode agree that their display name and public wishlist will be discoverable
          by other users. Creator accounts may be followed by other users. You can disable Creator Mode at any
          time from your Profile settings.
        </Section>

        <Section title="8. Termination">
          We reserve the right to suspend or terminate your account if you violate these Terms. You may also
          delete your account at any time from your Profile settings. Upon termination, your data will be
          permanently deleted.
        </Section>

        <Section title="9. Disclaimer of warranties">
          The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service
          will be available at all times, error-free, or suitable for any particular purpose.
        </Section>

        <Section title="10. Limitation of liability">
          To the maximum extent permitted by law, All I Want shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising from your use of the Service.
        </Section>

        <Section title="11. Governing law">
          These Terms are governed by the laws of the United States. Any disputes shall be resolved in the
          courts of the applicable jurisdiction.
        </Section>

        <Section title="12. Changes">
          We may update these Terms from time to time. Continued use of the Service after changes are posted
          constitutes acceptance. We will update the "Last updated" date at the top.
        </Section>

        <Section title="13. Contact">
          Questions? <Link to="/contact" style={{ color: 'var(--color-primary)' }}>Contact us</Link>.
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
