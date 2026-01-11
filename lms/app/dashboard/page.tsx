"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from '@/app/dashboard.module.css';

export default function DashboardPage() {
    const { user } = useAuth();
    const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        leadName: '',
        phone: '',
        email: '',
        location: '',
        note: '',
        status: 'New',
        assignedUserId: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, assignedUserId: user.id }));
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        if (!user) return;

        let query = supabase.from('profiles').select('id, name, role, company_id');

        if (user.role !== 'SuperAdmin') {
            query = query.eq('company_id', user.company_id);
        }

        const { data, error } = await query;
        if (data && !error) {
            setAssignableUsers(data);
        }
    };

    if (!user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.from('leads').insert({
            lead_name: formData.leadName,
            phone: formData.phone,
            email: formData.email,
            location: formData.location,
            note: formData.note,
            status: formData.status,
            assigned_user_id: formData.assignedUserId,
            owner_user_id: user.id,
            company_id: user.company_id
        });

        if (error) {
            alert(`Error creating lead: ${error.message}`);
        } else {
            alert('Lead successfully created!');
            setFormData({
                leadName: '',
                phone: '',
                email: '',
                location: '',
                note: '',
                status: 'New',
                assignedUserId: user.id,
            });
        }
        setIsSubmitting(false);
    };

    const statusOptions = [
        'New', 'In Conversation', 'DNP', 'DND', 'Not Interested',
        'Out of reach', 'Wrong details', 'Rejected', 'PO'
    ];

    return (
        <section className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 className={styles.welcomeTitle}>Welcome back, {user.name}</h1>
                <p className={styles.subtitle}>Create a new lead to get started with your daily tasks.</p>
            </header>

            <div className={styles.formCard}>
                <h2 className={styles.formTitle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Create New Lead
                </h2>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Lead Name</label>
                        <input
                            type="text"
                            name="leadName"
                            required
                            className={styles.formInput}
                            placeholder="e.g. John Doe"
                            value={formData.leadName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Assigned To</label>
                        <select
                            name="assignedUserId"
                            className={styles.formSelect}
                            value={formData.assignedUserId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select User</option>
                            {assignableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            maxLength={10}
                            className={styles.formInput}
                            placeholder="10 digit number"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className={styles.formInput}
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Location</label>
                        <input
                            type="text"
                            name="location"
                            className={styles.formInput}
                            placeholder="e.g. New York, USA"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status</label>
                        <select
                            name="status"
                            className={styles.formSelect}
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Additional Notes</label>
                        <textarea
                            name="note"
                            rows={4}
                            className={styles.formTextarea}
                            placeholder="Add any specific details..."
                            value={formData.note}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className={styles.formGroupFull}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
