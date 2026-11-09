"use client";

import { useState, type FormEvent } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      window.location.assign(result.redirectTo || "/admin");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign-in failed."); setBusy(false); }
  }
  return <form onSubmit={submit}>
    <div className="field"><label htmlFor="admin-email">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} /></div>
    <div className="field"><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} /></div>
    <button className="button button-dark" type="submit" disabled={busy} style={{ width: "100%", marginTop: 5 }}>{busy ? "Signing in…" : "Sign in to dashboard"}</button>
    {error && <p role="alert" className="form-message form-message-error">{error}</p>}
    <p className="form-note">Admin access is created through the database seed command. Public visitor accounts are not enabled.</p>
  </form>;
}
