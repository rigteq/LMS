"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'comment_text', label: 'Comment' },
    { key: 'status', label: 'Lead Status' },
    { key: 'lead_name', label: 'On Lead' },
    { key: 'created_time', label: 'Date' },
];

export default function MyCommentsPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMyComments();
        }
    }, [user]);

    const fetchMyComments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, leads!lead_id(lead_name)')
                .eq('created_by_user_id', user?.id)
                .is('is_deleted', false)
                .order('created_time', { ascending: false });

            if (error) throw error;

            const trans = (data || []).map(c => ({
                ...c,
                lead_name: c.leads?.lead_name || 'Deleted Lead'
            }));

            setComments(trans);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Delete this comment?`)) return;
        try {
            await supabase.from('comments').update({ is_deleted: true }).eq('id', row.id);
            setComments(prev => prev.filter(c => c.id !== row.id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '4rem' }}><span></span><span></span><span></span></div>;

    return (
        <DataTable
            title="My Communication History"
            columns={columns}
            data={comments}
            onDelete={handleDelete}
            basePath="/dashboard/comments"
        />
    );
}
