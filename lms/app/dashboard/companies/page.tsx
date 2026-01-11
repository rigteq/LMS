"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';

const columns = [
    { key: 'name', label: 'Company Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        note: ''
    });

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.from('companies').insert(formData).select().single();
            if (error) throw error;
            setCompanies(prev => [...prev, data]);
            setFormData({ name: '', email: '', phone: '', address: '', note: '' });
            setShowCreate(false);
            alert("Company created successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm(`Warning: Deleting ${row.name} will soft-delete all associated users, leads, and comments. Proceed?`)) return;

        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_deleted: true })
                .eq('id', row.id);

            if (error) throw error;

            setCompanies(prev => prev.filter(c => c.id !== row.id));
        } catch (err: any) {
            alert(`Error deleting company: ${err.message}`);
        }
    };

    if (user?.role !== 'SuperAdmin') return <div style={{ padding: '2rem' }}>Access Denied.</div>;

    if (isLoading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"><span></span><span></span><span></span></div>
        </div>
    );

    return (
        <div className={styles.dashboardFadeIn}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.welcomeTitle}>Organization Management</h1>
                <button
                    className={styles.submitBtn}
                    style={{ marginTop: 0 }}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    {showCreate ? 'Close Form' : 'Add New Company'}
                </button>
            </div>

            {showCreate && (
                <div className={styles.formCard} style={{ marginBottom: '3rem', animation: 'fadeIn 0.3s ease' }}>
                    <h2 className={styles.formTitle}>Register New Company</h2>
                    <form onSubmit={handleCreate} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Company Name</label>
                            <input type="text" className={styles.formInput} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Official Email</label>
                            <input type="email" className={styles.formInput} required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Contact Phone</label>
                            <input type="tel" className={styles.formInput} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Address</label>
                            <input type="text" className={styles.formInput} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>Internal Notes</label>
                            <textarea className={styles.formTextarea} rows={3} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                        </div>
                        <div className={styles.formGroupFull}>
                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Register Company'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DataTable
                title="Active Companies"
                columns={columns}
                data={companies}
                onDelete={handleDelete}
                basePath="/dashboard/companies"
            />
        </div>
    );
}
