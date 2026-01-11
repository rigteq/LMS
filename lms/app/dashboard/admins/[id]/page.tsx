"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';

export default function ViewAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            fetchProfileDetails();
        }
    }, [user, id]);

    const fetchProfileDetails = async () => {
        setIsLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*, companies(name)')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            const { data: commentData } = await supabase
                .from('comments')
                .select('*')
                .eq('created_by_user_id', id)
                .is('is_deleted', false)
                .order('created_time', { ascending: false });

            setComments(commentData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;
    if (!profile) return <div className={styles.content}>Profile not found.</div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={styles.welcomeTitle}>{profile.name}</h1>
                    <p className={styles.subtitle}>Administrator Profile & History</p>
                </div>
                <div className={styles.actionGroup}>
                    {user?.role === 'SuperAdmin' && (
                        <>
                            <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => router.push(`/dashboard/admins/${id}/edit`)}>Edit Admin</button>
                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={async () => {
                                if (confirm("Delete this admin?")) {
                                    await supabase.from('profiles').update({ is_deleted: true }).eq('id', id);
                                    router.push('/dashboard/admins');
                                }
                            }}>Delete</button>
                        </>
                    )}
                </div>
            </header>

            <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Contact Details</h3>
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                        <label className={styles.formLabel}>Email</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{profile.email}</p>
                    </div>
                    <div>
                        <label className={styles.formLabel}>Phone</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{profile.phone}</p>
                    </div>
                    <div>
                        <label className={styles.formLabel}>Gender</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{profile.gender}</p>
                    </div>
                    <div>
                        <label className={styles.formLabel}>Company</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{profile.companies?.name || 'N/A'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className={styles.formLabel}>Address</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{profile.address || '-'}</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <DataTable
                    title="Comments by this Admin"
                    columns={[{ key: 'comment_text', label: 'Comment' }, { key: 'status', label: 'Status' }, { key: 'created_time', label: 'Date' }]}
                    data={comments}
                    basePath="/dashboard/comments"
                />
            </div>
        </div>
    );
}
