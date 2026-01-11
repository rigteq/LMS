"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        lead_name: '',
        email: '',
        phone: '',
        status: '',
        location: '',
        note: '',
        assigned_user_id: ''
    });

    useEffect(() => {
        if (user && id) {
            fetchInitialData();
        }
    }, [user, id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Lead
            const { data: lead, error: leadErr } = await supabase
                .from('leads')
                .select('*')
                .eq('id', id)
                .single();
            if (leadErr) throw leadErr;

            setFormData({
                lead_name: lead.lead_name,
                email: lead.email,
                phone: lead.phone,
                status: lead.status,
                location: lead.location || '',
                note: lead.note || '',
                assigned_user_id: lead.assigned_user_id || ''
            });

            // 2. Fetch Users for Assignment
            let userQuery = supabase.from('profiles').select('id, name, role').eq('is_deleted', false);
            if (user?.role !== 'SuperAdmin') {
                userQuery = userQuery.eq('company_id', lead?.company_id);
            }
            const { data: users, error: userErr } = await userQuery;
            if (userErr) throw userErr;
            setAssignableUsers(users || []);

        } catch (err: any) {
            alert(err.message);
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    lead_name: formData.lead_name,
                    email: formData.email,
                    phone: formData.phone,
                    status: formData.status,
                    location: formData.location,
                    assigned_user_id: formData.assigned_user_id,
                    note: formData.note,
                })
                .eq('id', id);

            if (error) throw error;
            alert("Lead updated successfully!");
            router.push(`/dashboard/leads/${id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;

    const statusOptions = ['New', 'In Conversation', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'Rejected', 'PO'];

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Edit Lead</h1>
                <p className={styles.subtitle}>Modify details for {formData.lead_name}</p>
            </header>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Lead Name</label>
                        <input
                            type="text"
                            name="lead_name"
                            required
                            className={styles.formInput}
                            value={formData.lead_name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Assigned To</label>
                        <select
                            name="assigned_user_id"
                            required
                            className={styles.formSelect}
                            value={formData.assigned_user_id}
                            onChange={handleInputChange}
                        >
                            {/* "Select User" option removed per Task 1 */}
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
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Additional Notes</label>
                        <textarea
                            name="note"
                            rows={4}
                            className={styles.formTextarea}
                            value={formData.note}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroupFull} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving Changes...' : 'Update Lead'}
                        </button>
                        <button type="button" className={styles.submitBtn} onClick={() => router.back()} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
