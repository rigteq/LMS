"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        address: '',
        phone: ''
    });

    useEffect(() => {
        if (currentUser && id) {
            fetchInitialData();
        }
    }, [currentUser, id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;

            setProfile(profileData);
            setFormData({
                name: profileData.name,
                gender: profileData.gender,
                address: profileData.address || '',
                phone: profileData.phone || ''
            });
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
                .from('profiles')
                .update({
                    name: formData.name,
                    gender: formData.gender,
                    address: formData.address,
                    phone: formData.phone
                })
                .eq('id', id);

            if (error) throw error;
            alert("User profile updated successfully!");
            router.push(`/dashboard/users/${id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;

    const canManage = currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'Admin' && profile?.company_id === currentUser.company_id);
    if (!canManage) return <div style={{ padding: '2rem' }}>Access Denied.</div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Edit Staff User</h1>
                <p className={styles.subtitle}>Modify profile for {formData.name}</p>
            </header>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Name</label>
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
                        <label className={styles.formLabel}>Gender</label>
                        <select
                            name="gender"
                            required
                            className={styles.formSelect}
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
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

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Address</label>
                        <textarea
                            name="address"
                            rows={3}
                            className={styles.formTextarea}
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroupFull} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Update User'}
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
