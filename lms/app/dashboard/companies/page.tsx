"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const columns = [
    { key: 'name', label: 'Company Name' },
    { key: 'email', label: 'Admin Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role === 'SuperAdmin') {
            fetchCompanies();
        }
    }, [user]);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('is_deleted', false)
                .order('name');

            if (error) throw error;
            setCompanies(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Are you sure you want to delete Company: ${row.name}? This will mark all associated users and leads as deleted as well.`)) return;

        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;

            setCompanies(prev => prev.filter(c => c.id !== row.id));
            alert("Company deleted successfully.");
        } catch (err: any) {
            alert(`Error deleting company: ${err.message}`);
        }
    };

    const handleEdit = (row: any) => {
        alert(`Editing Company ${row.name}...`);
    };

    const handleView = (row: any) => {
        alert(`Viewing Company ${row.name}...`);
    };

    if (user?.role !== 'SuperAdmin') {
        return (
            <div style={{ padding: '2rem', color: '#64748b' }}>
                Access Restricted: Only SuperAdmins can view companies.
            </div>
        );
    }

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <DataTable
            title="All Companies"
            columns={columns}
            data={companies}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
