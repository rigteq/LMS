"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar role={user.role} />
            <main className={styles.main}>
                <Header userName={user.name} role={user.role} />
                <div className={styles.content}>
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}
