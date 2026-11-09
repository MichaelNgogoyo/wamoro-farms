"use client";

import { useState, type FormEvent } from "react";

const serviceOptions = ["Avocado consultancy", "Capsicum project", "Soil diagnostics & crop nutrition", "Farm setup & management", "Greenhouse advisory", "Training & masterclasses", "Market linkage advisory", "General enquiry"];

export function InquiryForm({ mode = "contact" }: { mode?: "contact" | "consultation" }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(mode === "consultation" ? "/api/public/bookings" : "/api/public/contact", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send your message just now.");
      setMessage(mode === "consultation" ? "Thanks — your consultation request has been received. Our team will be in touch." : "Thanks for reaching out. Your message has been sent to the Wamoro team.");
      formElement.reset();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Something went wrong. Please try WhatsApp or call our team.");
    } finally { setBusy(false); }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <h2>{mode === "consultation" ? "Plan a farm conversation." : "Send us a message."}</h2>
      <p>{mode === "consultation" ? "Tell us a little about your farm and the support you need." : "Our team will get back to you as soon as we can."}</p>
      <div className="form-grid">
        <div className="field"><label htmlFor="name">Your name *</label><input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" /></div>
        <div className="field"><label htmlFor="phone">Phone number *</label><input id="phone" name="phone" required maxLength={32} autoComplete="tel" /></div>
        <div className="field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" required maxLength={254} autoComplete="email" /></div>
        {mode === "consultation" ? <>
          <div className="field"><label htmlFor="service">What would you like help with? *</label><select id="service" name="service" required defaultValue=""><option value="" disabled>Select a service</option>{serviceOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="field"><label htmlFor="preferredDate">Preferred consultation date</label><input id="preferredDate" name="preferredDate" type="date" /></div>
          <div className="field field-full"><label htmlFor="message">Tell us about your project *</label><textarea id="message" name="message" required minLength={10} maxLength={3000} placeholder="Crop, location, farm stage, and the question you would like us to help with…" /></div>
        </> : <>
          <div className="field field-full"><label htmlFor="subject">Subject</label><input id="subject" name="subject" maxLength={120} /></div>
          <div className="field field-full"><label htmlFor="message">Message *</label><textarea id="message" name="message" required minLength={10} maxLength={3000} /></div>
        </>}
        <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      </div>
      <button className="button button-dark form-submit" type="submit" disabled={busy}>{busy ? "Sending…" : mode === "consultation" ? "Request a consultation" : "Send message"}</button>
      {message && <p role="status" className={`form-message ${error ? "form-message-error" : ""}`}>{message}</p>}
      <p className="form-note">Your details are used only to respond to this enquiry.</p>
    </form>
  );
}
