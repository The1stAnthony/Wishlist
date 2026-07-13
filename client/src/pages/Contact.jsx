import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth();

  const [form,    setForm]    = useState({ name: user?.name || '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/contact', {
        name:    form.name,
        subject: form.subject,
        message: form.message,
        user_id: user?.id || null,
        email:   user?.email || null,
      });
      setSent(true);
    } catch {
      setError('Could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Home
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
        Contact Us
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Got feedback, a bug report, or just want to say hi? We'd love to hear from you.
      </p>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</p>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Message sent!
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Thanks for reaching out. We'll get back to you as soon as possible.
          </p>
          <Link to="/" className="btn-primary">Back to home</Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {error && (
            <p style={{ fontSize: '0.85rem', color: '#DC2626', background: '#FEE2E2', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
              {error}
            </p>
          )}

          <div>
            <label className="form-label" htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              className="form-input"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              className="form-input"
              value={form.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a topic…</option>
              <option value="Bug report">Bug report</option>
              <option value="Feature request">Feature request</option>
              <option value="Account issue">Account issue</option>
              <option value="General feedback">General feedback</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="form-input"
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={handleChange}
              rows={6}
              required
              style={{ resize: 'vertical', minHeight: 120 }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
