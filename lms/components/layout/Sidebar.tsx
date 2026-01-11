"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';

interface NavItem {
    label: string;
    href: string;
    roles: string[];
}

const navItems: NavItem[] = [
    // SuperAdmin Tabs
    { label: 'All Companies', href: '/dashboard/companies', roles: ['SuperAdmin'] },
    { label: 'All Leads', href: '/dashboard/leads', roles: ['SuperAdmin', 'Admin', 'User'] },
    { label: 'All Comments', href: '/dashboard/comments', roles: ['SuperAdmin', 'Admin', 'User'] },
    { label: 'My Comments', href: '/dashboard/my-comments', roles: ['Admin', 'User'] },
    { label: 'All Admins', href: '/dashboard/admins', roles: ['SuperAdmin', 'Admin'] },
    { label: 'All Users', href: '/dashboard/users', roles: ['SuperAdmin', 'Admin'] },
    { label: 'My Leads', href: '/dashboard/my-leads', roles: ['Admin', 'User'] },
    { label: 'My Work', href: '/dashboard/my-work', roles: ['Admin', 'User'] },
];

export default function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const filteredItems = navItems.filter(item => item.roles.includes(role));

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <Link href="/dashboard" className={styles.brandLink}>
                    LMS
                </Link>
            </div>
            <nav className={styles.nav}>
                {filteredItems.map((item, index) => (
                    <Link
                        key={`${item.href}-${index}`}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                <button className={styles.logoutBtn} onClick={logout}>
                    <svg style={{ marginRight: '8px' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
                <div className={styles.poweredBy}>
                    Powered by <strong>Rigteq</strong>
                </div>
            </div>
        </aside>
    );
}
