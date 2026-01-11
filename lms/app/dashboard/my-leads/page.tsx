"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'lead_name', label: 'Lead Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
];

export default function MyLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMyLeads();
        }
    }, [user]);

    const fetchMyLeads = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('owner_user_id', user?.id)
                .eq('is_deleted', false)
                .order('created_time', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Are you sure you want to delete lead: ${row.lead_name}?`)) return;
        try {
            await supabase.from('leads').update({ is_deleted: true }).eq('id', row.id);
            setLeads(prev => prev.filter(l => l.id !== row.id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isLoading) return <div className="loader" style={{ padding: '4rem' }}><span></span><span></span><span></span></div>;

    return (
        <DataTable
            title="My Registered Leads"
            columns={columns}
            data={leads}
            onDelete={handleDelete}
            basePath="/dashboard/leads"
        />
    );
}
