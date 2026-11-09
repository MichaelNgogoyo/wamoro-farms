"use client";

import { useState, type FormEvent } from "react";

export function RegistrationForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError(false);
    const formElement = event.currentTarget;
    const values = Object.fromEntries(new FormData(formElement).entries());
    try {
      const response = await fetch("/api/public/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, eventId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not complete the registration.");
      setMessage(`Thank you. Your interest in ${eventTitle} has been recorded. The training team will contact you to confirm your place.`);
      formElement.reset();
    } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : "Please try again or contact the training team."); }
    finally { setBusy(false); }
  }
  return <form className="form-card" onSubmit={submit}>
    <h2>Register your interest.</h2><p>Share your contact details and the training team will follow up with the next steps.</p>
    <div className="field"><label htmlFor={`reg-name-${eventId}`}>Your name *</label><input id={`reg-name-${eventId}`} name="name" required minLength={2} maxLength={100} autoComplete="name" /></div>
    <div className="field"><label htmlFor={`reg-email-${eventId}`}>Email address *</label><input id={`reg-email-${eventId}`} name="email" type="email" required maxLength={254} autoComplete="email" /></div>
    <div className="field"><label htmlFor={`reg-phone-${eventId}`}>Phone number *</label><input id={`reg-phone-${eventId}`} name="phone" required maxLength={32} autoComplete="tel" /></div>
    <div className="field"><label htmlFor={`reg-notes-${eventId}`}>Questions or notes</label><textarea id={`reg-notes-${eventId}`} name="notes" maxLength={1000} /></div>
    <div className="honeypot" aria-hidden="true"><label htmlFor={`reg-website-${eventId}`}>Leave this field empty</label><input id={`reg-website-${eventId}`} name="website" tabIndex={-1} autoComplete="off" /></div>
    <button className="button button-dark" disabled={busy}>{busy ? "Sending…" : "Register interest"}</button>
    {message && <p role="status" className={`form-message ${error ? "form-message-error" : ""}`}>{message}</p>}
    <p className="form-note">Registration is subject to availability and confirmation. Online payment is not enabled.</p>
  </form>;
}
