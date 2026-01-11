"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
];

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('profiles').select('*').eq('role', 'Admin').eq('is_deleted', false);

            if (user?.role !== 'SuperAdmin') {
                query = query.eq('company_id', user?.company_id);
            }

            const { data, error } = await query.order('name');
            if (error) throw error;
            setAdmins(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Are you sure you want to delete Admin: ${row.name}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;

            setAdmins(prev => prev.filter(a => a.id !== row.id));
            alert("Admin deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting admin: ${err.message}`);
        }
    };

    const handleEdit = (row: any) => {
        alert(`Editing Admin ${row.name}...`);
    };

    const handleView = (row: any) => {
        alert(`Viewing Admin ${row.name}...`);
    };

    // Rules: Admins cant edit/delete admins. SuperAdmin can.
    const canEdit = (row: any) => user?.role === 'SuperAdmin';
    const canDelete = (row: any) => user?.role === 'SuperAdmin';

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="All Admins"
            columns={columns}
            data={admins}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}
