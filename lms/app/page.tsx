"use client";

import Image from "next/image";
import styles from "./login.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <div className={styles.logoWrapper}>
          <Image src="/next.svg" alt="Next.js logo" width={80} height={80} priority />
        </div>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input type="email" id="email" name="email" required className={styles.input} placeholder="you@example.com" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input type="password" id="password" name="password" required className={styles.input} placeholder="••••••••" />
          </div>
          <button type="submit" className={styles.button}>Sign In</button>
        </form>
        <a href="#" className={styles.link}>Forgot password?</a>
      </main>
    </div>
  );
}
