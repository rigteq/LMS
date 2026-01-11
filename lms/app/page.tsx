"use client";
import styles from "./login.module.css";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [email, setEmail] = useState("superadmin@lms.com");
  const [password, setPassword] = useState("password123");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, error } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <div className={styles.logoWrapper} style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '-2px',
            margin: 0
          }}>LMS</h1>
        </div>

        <form className={styles.form} onSubmit={handleSignIn}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={styles.input}
              placeholder="e.g. admin@lms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className={styles.button} disabled={isLoggingIn}>
            {isLoggingIn ? (
              <div className="loader" style={{ gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: 'white' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'white' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'white' }}></span>
              </div>
            ) : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <a href="#" className={styles.link}>Trouble signing in?</a>
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>Powered by <span style={{ color: 'rgba(255,255,255,0.8)' }}>Rigteq</span></p>
        </div>
      </main>
    </div>
  );
}
