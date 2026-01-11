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

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const { user } = useAuth();

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
        if (user) {
            fetchAdmins();
            if (user.role === 'SuperAdmin') fetchCompanies();
        }
    }, [user]);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('profiles').select('*, companies(name)').eq('role', 'Admin').eq('is_deleted', false);
            if (user?.role !== 'SuperAdmin') {
                query = query.eq('company_id', user?.company_id);
            }
            const { data, error } = await query.order('name');
            if (error) throw error;

            setAdmins((data || []).map(a => ({
                ...a,
                company_name: a.companies?.name || 'N/A'
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
            // Note: In a real app, this would use an edge function to create auth user safely
            // For this project, we insert directly into profiles assuming auth is handled or simulated
            const { data, error } = await supabase.from('profiles').insert({
                ...formData,
                role: 'Admin',
                company_id: user?.role === 'SuperAdmin' ? formData.company_id : user?.company_id
            }).select('*, companies(name)').single();

            if (error) throw error;

            setAdmins(prev => [...prev, { ...data, company_name: data.companies?.name }]);
            setFormData({ name: '', email: '', company_id: companies[0]?.id || '', password: 'password123', gender: 'Male', address: '', phone: '' });
            setShowCreate(false);
            alert("Admin registered successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Delete Admin: ${row.name}?`)) return;
        try {
            await supabase.from('profiles').update({ is_deleted: true }).eq('id', row.id);
            setAdmins(prev => prev.filter(a => a.id !== row.id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const canEdit = (row: any) => user?.role === 'SuperAdmin';
    const canDelete = (row: any) => user?.role === 'SuperAdmin';

    if (isLoading) return <div className="loader" style={{ padding: '4rem' }}><span></span><span></span><span></span></div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Administrative Hub</h1>
                {user?.role === 'SuperAdmin' && (
                    <button className={styles.submitBtn} style={{ marginTop: 0 }} onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? 'Close Form' : 'Add New Admin'}
                    </button>
                )}
            </div>

            {showCreate && (
                <div className={styles.formCard} style={{ marginBottom: '3rem' }}>
                    <h2 className={styles.formTitle}>Register Administrator</h2>
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
                        {user?.role === 'SuperAdmin' && (
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Assign to Company</label>
                                <select className={styles.formSelect} value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Initial Password</label>
                            <input type="password" className={styles.formInput} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>Address</label>
                            <textarea className={styles.formTextarea} rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className={styles.formGroupFull}>
                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Confirm Admin Creation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DataTable
                title="Company Administrators"
                columns={columns}
                data={admins}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                basePath="/dashboard/admins"
            />
        </div>
    );
}
