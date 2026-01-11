"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function ViewCommentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [comment, setComment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            fetchCommentDetails();
        }
    }, [user, id]);

    const fetchCommentDetails = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles!created_by_user_id(name), leads!lead_id(lead_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setComment(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;
    if (!comment) return <div className={styles.content}>Comment not found.</div>;

    const canManage = user?.role === 'SuperAdmin' || user?.role === 'Admin' || comment.created_by_user_id === user?.id;

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={styles.welcomeTitle}>Timeline Detail</h1>
                    <p className={styles.subtitle}>Viewing comment from {comment.profiles?.name}</p>
                </div>
                <div className={styles.actionGroup}>
                    {canManage && (
                        <>
                            <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => router.push(`/dashboard/comments/${id}/edit`)}>Edit Comment</button>
                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={async () => {
                                if (confirm("Delete this comment?")) {
                                    await supabase.from('comments').update({ is_deleted: true }).eq('id', id);
                                    router.back();
                                }
                            }}>Delete</button>
                        </>
                    )}
                </div>
            </header>

            <div className={styles.formCard}>
                <div style={{ marginBottom: '2rem' }}>
                    <label className={styles.formLabel}>Regarding Lead</label>
                    <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#2563eb' }}>{comment.leads?.lead_name}</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2rem' }}>
                    <div>
                        <label className={styles.formLabel}>Interaction Status</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{comment.status}</p>
                    </div>
                    <div>
                        <label className={styles.formLabel}>Posted On</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{new Date(comment.created_time).toLocaleString()}</p>
                    </div>
                </div>

                <div>
                    <label className={styles.formLabel}>Comment Content</label>
                    <div style={{
                        marginTop: '0.75rem',
                        padding: '1.25rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        lineHeight: 1.6,
                        color: '#334155'
                    }}>
                        {comment.comment_text}
                    </div>
                </div>
            </div>
        </div>
    );
}
