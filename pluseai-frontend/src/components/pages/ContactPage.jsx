import React from 'react';

export default function ContactPage({
  contactError, contactSuccess,
  contactForm, setContactForm,
  submitContact, contactLoading
}) {
  return (
    <div className="contact-wrap">
      <h2 className="section-title">Contact Support</h2>
      <div className="auth-card" style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
        {contactError && <p className="auth-error">{contactError}</p>}
        {contactSuccess && <p className="auth-success">{contactSuccess}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input className="form-input" placeholder="Name *" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} />
          <input className="form-input" type="email" placeholder="Email *" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input className="form-input" type="tel" placeholder="Phone Number *" value={contactForm.phone_no} onChange={e => setContactForm({ ...contactForm, phone_no: e.target.value })} />
          <input className="form-input" placeholder="Subject *" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} />
        </div>
        <textarea className="text-area" placeholder="Message *" rows={5} value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} />
        <button className="btn-primary" onClick={submitContact} disabled={contactLoading}>
          {contactLoading ? "Sending..." : contactSuccess ? "Message Sent!" : "Send Message"}
        </button>
      </div>
    </div>
  );
}
