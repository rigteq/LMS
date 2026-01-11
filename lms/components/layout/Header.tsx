"use client";
import React from 'react';
import styles from '@/app/dashboard.module.css';

export default function Header({ userName, role }: { userName: string, role: string }) {
    return (
        <header className={styles.header}>
            <div className={styles.breadcrumb}>
                <span>Dashboard / Overview</span>
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
