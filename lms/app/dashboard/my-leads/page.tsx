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
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('owner_user_id', user?.id)
            .eq('is_deleted', false)
            .order('created_time', { ascending: false });

        if (data && !error) {
            setLeads(data);
        }
        setIsLoading(false);
    };

    if (isLoading) return <div className="loader"><span></span><span></span><span></span></div>;

    return <DataTable title="My Created Leads" columns={columns} data={leads} />;
}
