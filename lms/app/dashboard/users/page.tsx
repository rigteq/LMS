"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company_name', label: 'Company' },
];

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const { user: currentUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company_id: '',
        password: 'password123',
        gender: 'Male',
        address: '',
        phone: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
            if (currentUser.role === 'SuperAdmin') fetchCompanies();
            else setFormData(prev => ({ ...prev, company_id: currentUser.company_id }));
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('profiles').select('*, companies(name)').eq('role', 'User').eq('is_deleted', false);
            if (currentUser?.role !== 'SuperAdmin') {
                query = query.eq('company_id', currentUser?.company_id);
            }
            const { data, error } = await query.order('name');
            if (error) throw error;

            setUsers((data || []).map(u => ({
                ...u,
                company_name: u.companies?.name || 'N/A'
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompanies = async () => {
        const { data } = await supabase.from('companies').select('id, name').eq('is_deleted', false);
        if (data && data.length > 0) {
            setCompanies(data);
            setFormData(prev => ({ ...prev, company_id: data[0].id }));
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.from('profiles').insert({
                ...formData,
                role: 'User',
                company_id: currentUser?.role === 'SuperAdmin' ? formData.company_id : currentUser?.company_id
            }).select('*, companies(name)').single();

            if (error) throw error;

            setUsers(prev => [...prev, { ...data, company_name: data.companies?.name }]);
            setFormData({
                name: '', email: '', company_id: currentUser?.role === 'SuperAdmin' ? (companies[0]?.id || '') : currentUser?.company_id || '',
                password: 'password123', gender: 'Male', address: '', phone: ''
            });
            setShowCreate(false);
            alert("Staff user registered successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Delete user: ${row.name}?`)) return;
        try {
            await supabase.from('profiles').update({ is_deleted: true }).eq('id', row.id);
            setUsers(prev => prev.filter(u => u.id !== row.id));
        } catch (err: any) {
            alert(err.message);
        }
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

    if (isLoading) return <div className="loader" style={{ padding: '4rem' }}><span></span><span></span><span></span></div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Staff Management</h1>
                {(currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin') && (
                    <button className={styles.submitBtn} style={{ marginTop: 0 }} onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? 'Close Form' : 'Add New User'}
                    </button>
                )}
            </div>

            {showCreate && (
                <div className={styles.formCard} style={{ marginBottom: '3rem' }}>
                    <h2 className={styles.formTitle}>Register New Staff Member</h2>
                    <form onSubmit={handleCreate} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Name</label>
                            <input type="text" className={styles.formInput} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Gender</label>
                            <select className={styles.formSelect} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email</label>
                            <input type="email" className={styles.formInput} required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Phone</label>
                            <input type="tel" className={styles.formInput} required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        {currentUser?.role === 'SuperAdmin' && (
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Organization</label>
                                <select className={styles.formSelect} value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Access Password</label>
                            <input type="password" className={styles.formInput} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>Personal Address</label>
                            <textarea className={styles.formTextarea} rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className={styles.formGroupFull}>
                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Register User'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DataTable
                title="Staff Directory"
                columns={columns}
                data={users}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                basePath="/dashboard/users"
            />
        </div>
    );
}
