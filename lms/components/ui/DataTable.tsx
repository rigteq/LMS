"use client";
import React, { useState } from 'react';
import styles from '@/app/dashboard.module.css';

interface DataTableProps {
    title: string;
    columns: { key: string; label: string }[];
    data: any[];
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    canEdit?: (row: any) => boolean;
    canDelete?: (row: any) => boolean;
}

export default function DataTable({
    title,
    columns,
    data = [],
    onView,
    onEdit,
    onDelete,
    canEdit = () => true,
    canDelete = () => true
}: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Safe filtering logic
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = safeData.filter(item =>
        Object.values(item || {}).some(val =>
            String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            const date = new Date(val);
            return isNaN(date.getTime()) ? val : date.toLocaleDateString();
        }
        return String(val);
    };

    const handleAction = (type: 'call' | 'whatsapp', phone: string) => {
        try {
            if (!phone) throw new Error("Phone number not available");
            const cleanPhone = phone.replace(/\D/g, '');
            if (type === 'call') {
                window.location.href = `tel:${cleanPhone}`;
            } else {
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
            }
        } catch (err: any) {
            alert(err.message || "Could not perform action.");
        }
    };

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h1 className={styles.welcomeTitle}>{title}</h1>
            </header>

            <div className={styles.tableWrapper}>
                <div className={styles.tableToolbar}>
                    <input
                        type="text"
                        placeholder="Search records..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <tr key={row.id || `row-${idx}`}>
                                {columns.map(col => (
                                    <td key={col.key}>{formatValue(row[col.key])}</td>
                                ))}
                                <td>
                                    <div className={styles.actionGroup} style={{ justifyContent: 'flex-end' }}>
                                        {row.phone && (
                                            <>
                                                <button
                                                    onClick={() => handleAction('call', row.phone)}
                                                    className={`${styles.actionBtn} ${styles.callBtn}`}
                                                    title="Call"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleAction('whatsapp', row.phone)}
                                                    className={`${styles.actionBtn} ${styles.whatsappBtn}`}
                                                    title="WhatsApp"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.2h.1A8.38 8.38 0 0 1 21 11.5z"></path><path d="M16 8l-4 4 4 4"></path></svg>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => onView?.(row)}
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            title="View"
                                        >
                                            View
                                        </button>
                                        {onEdit && canEdit(row) && (
                                            <button
                                                onClick={() => onEdit?.(row)}
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                title="Edit"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && canDelete(row) && (
                                            <button
                                                onClick={() => onDelete?.(row)}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                    No records found in this view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
