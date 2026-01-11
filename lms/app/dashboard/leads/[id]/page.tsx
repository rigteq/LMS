"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function ViewLeadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [lead, setLead] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        if (user && id) {
            fetchLeadDetails();
        }
    }, [user, id]);

    const fetchLeadDetails = async () => {
        setIsLoading(true);
        try {
            const { data: leadData, error: leadError } = await supabase
                .from('leads')
                .select('*, profiles!owner_user_id(name)')
                .eq('id', id)
                .single();

            if (leadError) throw leadError;
            setLead(leadData);
            setNewStatus(leadData.status);

            const { data: commentData, error: commentError } = await supabase
                .from('comments')
                .select('*, profiles!created_by_user_id(name)')
                .eq('lead_id', id)
                .is('is_deleted', false)
                .order('created_time', { ascending: false });

            if (commentError) throw commentError;
            setComments(commentData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        try {
            // 1. Add comment
            const { error: commentErr } = await supabase.from('comments').insert({
                lead_id: lead.id,
                company_id: lead.company_id,
                comment_text: newComment,
                created_by_user_id: user?.id,
                status: newStatus
            });
            if (commentErr) throw commentErr;

            // 2. Update lead status if changed
            if (newStatus !== lead.status) {
                const { error: leadErr } = await supabase.from('leads').update({
                    status: newStatus
                }).eq('id', lead.id);
                if (leadErr) throw leadErr;
            }

            setNewComment('');
            fetchLeadDetails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLead = async () => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        try {
            const { error } = await supabase.from('leads').update({ is_deleted: true }).eq('id', id);
            if (error) throw error;
            router.push('/dashboard/leads');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;
    if (!lead) return <div className={styles.content}>Lead not found.</div>;

    const statusOptions = ['New', 'In Conversation', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'Rejected', 'PO'];

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={styles.welcomeTitle}>{lead.lead_name}</h1>
                    <p className={styles.subtitle}>Lead Details & History</p>
                </div>
                <div className={styles.actionGroup}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => router.push(`/dashboard/leads/${id}/edit`)}>Edit Lead</button>
                    {(user?.role === 'SuperAdmin' || user?.role === 'Admin' || lead.owner_user_id === user?.id) && (
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleDeleteLead}>Delete Lead</button>
                    )}
                </div>
            </header>

            <div className={styles.formGrid}>
                <div className={styles.formCard}>
                    <h3 className={styles.formTitle}>General Information</h3>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div>
                            <label className={styles.formLabel}>Email</label>
                            <p style={{ margin: '0.5rem 0 1rem 0', fontWeight: 500 }}>{lead.email}</p>
                        </div>
                        <div>
                            <label className={styles.formLabel}>Phone</label>
                            <p style={{ margin: '0.5rem 0 1rem 0', fontWeight: 500 }}>{lead.phone}</p>
                        </div>
                        <div>
                            <label className={styles.formLabel}>Status</label>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                background: '#eff6ff',
                                color: '#2563eb',
                                fontSize: '0.8rem',
                                fontWeight: 700
                            }}>{lead.status}</span>
                        </div>
                        <div>
                            <label className={styles.formLabel}>Location</label>
                            <p style={{ margin: '0.5rem 0 1rem 0', fontWeight: 500 }}>{lead.location || '-'}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label className={styles.formLabel}>Notes</label>
                        <p style={{ margin: '0.5rem 0', color: '#64748b' }}>{lead.note || 'No notes available.'}</p>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <h3 className={styles.formTitle}>Add Timeline Entry</h3>
                    <form onSubmit={handleAddComment}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Update Status</label>
                            <select
                                className={styles.formSelect}
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                            <label className={styles.formLabel}>Comment Text</label>
                            <textarea
                                className={styles.formTextarea}
                                rows={3}
                                placeholder="What happened with this lead?"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
                            {isSubmitting ? 'Posting...' : 'Post Update'}
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3 className={styles.formTitle} style={{ marginBottom: '1.5rem' }}>Communication History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.length > 0 ? comments.map((c, i) => (
                        <div key={c.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            animation: `fadeIn 0.3s ease forwards ${i * 0.05}s`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.profiles?.name || 'System'}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(c.created_time).toLocaleString()}</span>
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.1rem 0.5rem',
                                    background: '#f1f5f9',
                                    borderRadius: '4px',
                                    color: '#475569',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>Status: {c.status}</span>
                            </div>
                            <p style={{ color: '#334155', fontSize: '0.9375rem', lineHeight: 1.6 }}>{c.comment_text}</p>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No history entries yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
