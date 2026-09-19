"use client";

import { useState } from "react";
import styles from "./login.module.css";

export function LoginForm({ invalid }: { invalid: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <form action="/api/admin/login" method="post" className={styles.form}>
      {invalid && <p className={styles.error} role="alert">The email or password is incorrect. Please try again.</p>}
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" placeholder="you@company.com" required />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <div className={styles.passwordField}>
          <input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required />
          <button type="button" className={styles.visibility} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls="password" onClick={() => setVisible(!visible)}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
              {visible && <path d="m3 3 18 18" />}
            </svg>
          </button>
        </div>
      </div>
      <button type="submit" className={styles.submit}>Log in <span aria-hidden="true">↗</span></button>
    </form>
  );
}
