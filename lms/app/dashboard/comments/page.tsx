"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'comment_text', label: 'Comment' },
    { key: 'status', label: 'Lead Status' },
    { key: 'author_name', label: 'Author' },
    { key: 'lead_name', label: 'On Lead' },
];

export default function AllCommentsPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchComments();
        }
    }, [user]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('comments').select(`
                *,
                profiles!created_by_user_id(name),
                leads!lead_id(lead_name)
            `).eq('is_deleted', false);

            if (user?.role !== 'SuperAdmin') {
                query = query.eq('company_id', user?.company_id);
            }

            const { data, error } = await query.order('created_time', { ascending: false });
            if (error) throw error;

            const transformed = (data || []).map(c => ({
                ...c,
                author_name: c.profiles?.name || 'Unknown',
                lead_name: c.leads?.lead_name || 'Deleted Lead'
            }));

            setComments(transformed);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Delete this comment?`)) return;

        try {
            const { error } = await supabase
                .from('comments')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;
            setComments(prev => prev.filter(c => c.id !== row.id));
        } catch (err: any) {
            alert(`Error deleting comment: ${err.message}`);
        }
    };

    const canEdit = (row: any) => {
        if (user?.role === 'SuperAdmin' || user?.role === 'Admin') return true;
        return row.created_by_user_id === user?.id;
    };

    const canDelete = (row: any) => {
        if (user?.role === 'SuperAdmin' || user?.role === 'Admin') return true;
        return row.created_by_user_id === user?.id;
    };

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="All Comments"
            columns={columns}
            data={comments}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
            basePath="/dashboard/comments"
        />
    );
}
