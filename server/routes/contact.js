const express = require('express');

const router = express.Router();

// Optional nodemailer — same pattern as auth.js
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.MAIL_HOST) {
    transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST,
      port:   Number(process.env.MAIL_PORT)   || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }
} catch { /* nodemailer not installed yet */ }

// ── POST /api/contact ───────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const { name, subject, message, user_id, email } = req.body;

  if (!name?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, subject, and message are required.' });
  }

  const refId   = Date.now().toString(36).toUpperCase();
  const mailTo  = process.env.CONTACT_EMAIL;
  if (!mailTo) {
    console.warn('[CONTACT] CONTACT_EMAIL env var not set — logging to console instead');
  }
  const mailSubject = `All I Want: ${name.trim()} — ${subject} [#${refId}]`;

  const body = [
    `From:    ${name.trim()}${email ? ` <${email}>` : ''}`,
    `User ID: ${user_id || 'guest'}`,
    `Ref:     #${refId}`,
    `Subject: ${subject}`,
    '',
    message.trim(),
  ].join('\n');

  if (transporter && mailTo) {
    try {
      await transporter.sendMail({
        from:     `"All I Want" <${process.env.MAIL_USER}>`,
        replyTo:  email || undefined,
        to:       mailTo,
        subject:  mailSubject,
        text:     body,
        priority: 'high',
        headers:  { 'X-Priority': '1', 'Importance': 'High' },
      });
    } catch (err) {
      console.error('Contact email error:', err);
      return res.status(500).json({ error: 'Could not send message. Please try again.' });
    }
  } else {
    // Dev fallback — log to console
    console.log(`\n[CONTACT FORM] ${mailSubject}\n${body}\n`);
  }

  res.json({ ok: true });
});

module.exports = router;
