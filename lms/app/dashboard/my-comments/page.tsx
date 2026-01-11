"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'comment_text', label: 'Comment' },
    { key: 'status', label: 'Status' },
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
                .select('*')
                .eq('created_by_user_id', user?.id)
                .eq('is_deleted', false)
                .order('created_time', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Are you sure you want to delete this comment?`)) return;

        try {
            const { error } = await supabase
                .from('comments')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;
            setComments(prev => prev.filter(c => c.id !== row.id));
            alert("Comment deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting comment: ${err.message}`);
        }
    };

    const handleEdit = (row: any) => {
        alert("Edit functionality coming soon!");
    };

    const handleView = (row: any) => {
        alert("Viewing comment details...");
    };

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="My Comments"
            columns={columns}
            data={comments}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
