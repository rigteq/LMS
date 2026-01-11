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
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('created_by_user_id', user?.id)
            .eq('is_deleted', false)
            .order('created_time', { ascending: false });

        if (data && !error) {
            setComments(data);
        }
        setIsLoading(false);
    };

    if (isLoading) return <div className="loader"><span></span><span></span><span></span></div>;

    return <DataTable title="My Comments" columns={columns} data={comments} />;
}
