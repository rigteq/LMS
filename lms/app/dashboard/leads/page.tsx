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
    { key: 'location', label: 'Location' },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchLeads();
        }
    }, [user]);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('leads').select('*').eq('is_deleted', false);

            if (user?.role !== 'SuperAdmin') {
                query = query.eq('company_id', user?.company_id);
            }

            const { data, error } = await query.order('created_time', { ascending: false });
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

            // Update local state
            setLeads(prev => prev.filter(l => l.id !== row.id));
            alert("Lead deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting lead: ${err.message}`);
        }
    };

    const handleEdit = (row: any) => {
        alert(`Edit functionality for ${row.lead_name} is coming soon!`);
    };

    const handleView = (row: any) => {
        alert(`Viewing details for ${row.lead_name}...`);
    };

    // Permissions based on lmstext.txt and user prompt
    const canEdit = (row: any) => {
        if (user?.role === 'SuperAdmin') return true;
        if (user?.role === 'Admin') return row.company_id === user.company_id;
        if (user?.role === 'User') return row.company_id === user.company_id;
        return false;
    };

    const canDelete = (row: any) => {
        if (user?.role === 'SuperAdmin') return true;
        if (user?.role === 'Admin') return row.company_id === user.company_id;
        if (user?.role === 'User') return row.owner_user_id === user.id; // User can only delete own leads
        return false;
    };

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="All Leads"
            columns={columns}
            data={leads}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}
