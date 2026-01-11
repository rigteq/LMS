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

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('profiles').select('*').eq('role', 'User').eq('is_deleted', false);

            if (currentUser?.role !== 'SuperAdmin') {
                query = query.eq('company_id', currentUser?.company_id);
            }

            const { data, error } = await query.order('name');
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Are you sure you want to delete User: ${row.name}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== row.id));
            alert("User deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting user: ${err.message}`);
        }
    };

    const handleEdit = (row: any) => {
        alert(`Editing User ${row.name}...`);
    };

    const handleView = (row: any) => {
        alert(`Viewing User ${row.name}...`);
    };

    const canEdit = (row: any) => {
        if (currentUser?.role === 'SuperAdmin') return true;
        if (currentUser?.role === 'Admin') return row.company_id === currentUser.company_id;
        return false;
    };

    const canDelete = (row: any) => {
        if (currentUser?.role === 'SuperAdmin') return true;
        if (currentUser?.role === 'Admin') return row.company_id === currentUser.company_id;
        return false;
    };

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="All Users"
            columns={columns}
            data={users}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}
