"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        note: ''
    });

    useEffect(() => {
        if (user?.role === 'SuperAdmin' && id) {
            fetchInitialData();
        }
    }, [user, id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const { data: company, error } = await supabase
                .from('companies')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;

            setFormData({
                name: company.name,
                email: company.email,
                phone: company.phone || '',
                address: company.address || '',
                note: company.note || ''
            });
        } catch (err: any) {
            alert(err.message);
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    note: formData.note,
                })
                .eq('id', id);

            if (error) throw error;
            alert("Company updated successfully!");
            router.push(`/dashboard/companies/${id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user?.role !== 'SuperAdmin') return <div style={{ padding: '2rem' }}>Access Denied.</div>;
    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Edit Company</h1>
                <p className={styles.subtitle}>Update profile for {formData.name}</p>
            </header>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Company Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className={styles.formInput}
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Official Email</label>
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
                        <label className={styles.formLabel}>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className={styles.formInput}
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Address</label>
                        <input
                            type="text"
                            name="address"
                            className={styles.formInput}
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Internal Notes</label>
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
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
