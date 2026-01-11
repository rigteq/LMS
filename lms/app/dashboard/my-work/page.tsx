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

export default function MyWorkPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMyWork();
        }
    }, [user]);

    const fetchMyWork = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('assigned_user_id', user?.id)
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
            const { error } = await supabase
                .from('leads')
                .update({ is_deleted: true })
                .eq('id', row.id);
            if (error) throw error;
            setLeads(prev => prev.filter(l => l.id !== row.id));
            alert("Lead deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting lead: ${err.message}`);
        }
    };

    const canDelete = (row: any) => {
        if (user?.role === 'SuperAdmin' || user?.role === 'Admin') return true;
        return row.owner_user_id === user?.id; // User can only delete if they created it
    };

    const handleEdit = (row: any) => {
        alert("Edit lead coming soon!");
    };

    const handleView = (row: any) => {
        alert("Viewing lead details...");
    };

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="My Assigned Work"
            columns={columns}
            data={leads}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canDelete={canDelete}
        />
    );
}
