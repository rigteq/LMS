"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function EditCommentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comment, setComment] = useState<any>(null);
    const [formData, setFormData] = useState({
        comment_text: '',
        status: ''
    });

    useEffect(() => {
        if (user && id) {
            fetchInitialData();
        }
    }, [user, id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;

            setComment(data);
            setFormData({
                comment_text: data.comment_text,
                status: data.status
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
                .from('comments')
                .update({
                    comment_text: formData.comment_text,
                    status: formData.status,
                })
                .eq('id', id);

            if (error) throw error;
            alert("Comment updated successfully!");
            router.push(`/dashboard/comments/${id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;

    const canManage = user?.role === 'SuperAdmin' || user?.role === 'Admin' || comment?.created_by_user_id === user?.id;
    if (!canManage) return <div style={{ padding: '2rem' }}>Access Denied.</div>;

    const statusOptions = ['New', 'In Conversation', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'Rejected', 'PO'];

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Edit Comment</h1>
                <p className={styles.subtitle}>Update your timeline entry</p>
            </header>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status at time of comment</label>
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
                        <label className={styles.formLabel}>Comment Content</label>
                        <textarea
                            name="comment_text"
                            rows={5}
                            required
                            className={styles.formTextarea}
                            value={formData.comment_text}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroupFull} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Save Changes'}
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
