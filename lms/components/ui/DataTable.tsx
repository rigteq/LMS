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
        // Check if it's a date string (ISO format check)
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            const date = new Date(val);
            return isNaN(date.getTime()) ? val : date.toLocaleDateString();
        }
        return String(val);
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
                                        <button
                                            onClick={() => onView?.(row)}
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}>
                                            View
                                        </button>
                                        {onEdit && canEdit(row) && (
                                            <button
                                                onClick={() => onEdit?.(row)}
                                                className={`${styles.actionBtn} ${styles.editBtn}`}>
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && canDelete(row) && (
                                            <button
                                                onClick={() => onDelete?.(row)}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}>
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
