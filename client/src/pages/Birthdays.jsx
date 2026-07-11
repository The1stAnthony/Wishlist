import { useState, useEffect } from 'react';
import axios from 'axios';
import AdBanner from '../components/AdBanner';
import '../styles/pages/birthdays.css';

const EMPTY_FORM = {
  contact_name: '', birthday: '', contact_email: '', notes: '', wishlist_url: '',
};

// Format "1990-07-15" → "July 15" (ignores year so we don't show age)
function formatBirthday(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  return new Date(0, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function daysLabel(daysUntil) {
  if (daysUntil === 0) return { text: '🎉 Today!', cls: 'today' };
  if (daysUntil === 1) return { text: 'Tomorrow', cls: 'soon' };
  if (daysUntil <= 7)  return { text: `${daysUntil}d`,  cls: 'soon' };
  return { text: `${daysUntil}d`, cls: '' };
}

export default function Birthdays() {
  const [contacts, setContacts]   = useState([]);
  const [upcoming, setUpcoming]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // contact being edited, or null for new
  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([
      axios.get('/api/birthdays'),
      axios.get('/api/birthdays/upcoming'),
    ])
      .then(([allRes, upRes]) => {
        setContacts(allRes.data.contacts);
        setUpcoming(upRes.data.upcoming);
      })
      .catch(() => setError('Failed to load contacts.'))
      .finally(() => setLoading(false));
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowModal(true);
  }

  function openEdit(contact) {
    setForm({
      contact_name:  contact.contact_name,
      birthday:      contact.birthday,
      contact_email: contact.contact_email || '',
      notes:         contact.notes         || '',
      wishlist_url:  contact.wishlist_url  || '',
    });
    setEditTarget(contact);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setError('');
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.birthday) {
      setError('Name and birthday are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      if (editTarget) {
        const res = await axios.patch(`/api/birthdays/${editTarget.id}`, form);
        setContacts((prev) => prev.map((c) => c.id === editTarget.id ? res.data.contact : c));
      } else {
        const res = await axios.post('/api/birthdays', form);
        setContacts((prev) => [...prev, res.data.contact]);
      }
      // Refresh the upcoming strip after any change
      const upRes = await axios.get('/api/birthdays/upcoming');
      setUpcoming(upRes.data.upcoming);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save contact.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this birthday contact?')) return;
    try {
      await axios.delete(`/api/birthdays/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setUpcoming((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Could not delete contact.');
    }
  }

  if (loading) return <div className="page-loading">Loading birthdays…</div>;

  return (
    <div className="page-with-sidebar">
      <div>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="birthdays-header">
          <div>
            <h1 className="birthdays-title">🎂 Birthday Tracker</h1>
            <p className="birthdays-subtitle">
              {contacts.length} {contacts.length === 1 ? 'person' : 'people'} tracked
            </p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            + Add birthday
          </button>
        </div>

        {error && !showModal && (
          <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>
        )}

        {/* ── Upcoming birthdays ───────────────────────────────────────────── */}
        {upcoming.length > 0 && (
          <div className="upcoming-banner">
            <p className="upcoming-banner-title">
              🔔 Coming up in the next 60 days
            </p>
            <div className="upcoming-chips">
              {upcoming.map((c) => {
                const { text, cls } = daysLabel(c.days_until);
                return (
                  <div key={c.id} className="upcoming-chip">
                    <div className="upcoming-chip-avatar">
                      {c.contact_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="upcoming-chip-name">{c.contact_name}</p>
                      <p className="upcoming-chip-date">{formatBirthday(c.birthday)}</p>
                    </div>
                    <span className={`upcoming-chip-days ${cls}`}>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── All contacts ──────────────────────────────────────────────────── */}
        {contacts.length === 0 ? (
          <div className="contacts-empty">
            <div className="contacts-empty-icon">🎈</div>
            <p className="contacts-empty-title">No birthdays tracked yet</p>
            <p className="contacts-empty-desc">
              Add friends and family so you never miss a birthday again.
            </p>
            <button className="btn-primary" onClick={openAdd}>
              Add your first birthday
            </button>
          </div>
        ) : (
          <div className="contacts-list">
            {contacts
              .slice()
              .sort((a, b) => a.contact_name.localeCompare(b.contact_name))
              .map((contact) => {
                const upcomingMatch = upcoming.find((u) => u.id === contact.id);
                return (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-avatar">
                      {contact.contact_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="contact-info">
                      <p className="contact-name">
                        {contact.contact_name}
                        {upcomingMatch && (
                          <span
                            className="badge badge-purple"
                            style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}
                          >
                            {daysLabel(upcomingMatch.days_until).text}
                          </span>
                        )}
                      </p>
                      <p className="contact-birthday">
                        🎂 {formatBirthday(contact.birthday)}
                      </p>
                      {contact.notes && (
                        <p className="contact-notes">📝 {contact.notes}</p>
                      )}
                      {contact.wishlist_url && (
                        <a
                          href={contact.wishlist_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-notes"
                          style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                        >
                          View their wishlist →
                        </a>
                      )}
                    </div>

                    <div className="contact-actions">
                      <button
                        className="contact-action-btn"
                        onClick={() => openEdit(contact)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="contact-action-btn delete"
                        onClick={() => handleDelete(contact.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Sidebar ads ───────────────────────────────────────────────────── */}
      <aside className="sidebar-ads ad-sidebar">
        <AdBanner format="sidebar" />
        <AdBanner format="sidebar" />
      </aside>

      {/* ── Add / Edit modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-card">
            <h2 className="modal-title">
              {editTarget ? 'Edit birthday' : '🎂 Add a birthday'}
            </h2>

            {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

            <form className="modal-form" onSubmit={handleSave}>
              <div>
                <label className="form-label">Name *</label>
                <input
                  name="contact_name"
                  className="form-input"
                  placeholder="Mom, John, Sarah…"
                  value={form.contact_name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Birthday *</label>
                <input
                  name="birthday"
                  type="date"
                  className="form-input"
                  value={form.birthday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email (optional — for future notifications)</label>
                <input
                  name="contact_email"
                  type="email"
                  className="form-input"
                  placeholder="their@email.com"
                  value={form.contact_email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Their AllIWant wishlist URL (optional)</label>
                <input
                  name="wishlist_url"
                  type="url"
                  className="form-input"
                  placeholder="https://alliwant.xyz/list/abc123"
                  value={form.wishlist_url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Notes (optional)</label>
                <input
                  name="notes"
                  className="form-input"
                  placeholder="Size M, loves coffee, allergic to nuts…"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Add birthday'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
