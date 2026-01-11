import React from 'react';
import styles from '@/app/dashboard.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            &copy; {new Date().getFullYear()} Leads Management System. All rights reserved. Designed for excellence.
        </footer>
    );
}
