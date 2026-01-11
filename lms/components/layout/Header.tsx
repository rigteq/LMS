"use client";
import React from 'react';
import Link from 'next/link';
import styles from '@/app/dashboard.module.css';

interface HeaderProps {
    userName: string;
    role: string;
    onMenuToggle: () => void;
}

export default function Header({ userName, role, onMenuToggle }: HeaderProps) {
    return (
        <header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className={styles.menuToggle} onClick={onMenuToggle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <Link href="/dashboard" className={styles.mobileBrand}>
                    LMS
                </Link>
                <div className={styles.breadcrumb}>
                    <span>Dashboard / Overview</span>
                </div>
            </div>

            <div className={styles.userInfo}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{userName}</span>
                <span style={{
                    marginLeft: '0.75rem',
                    backgroundColor: '#f1f5f9',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase'
                }}>
                    {role}
                </span>
            </div>
        </header>
    );
}
