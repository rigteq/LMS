"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard.module.css';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';

export default function ViewCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [company, setCompany] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'SuperAdmin' && id) {
            fetchCompanyDetails();
        }
    }, [user, id]);

    const fetchCompanyDetails = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Company
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('*')
                .eq('id', id)
                .single();
            if (companyError) throw companyError;
            setCompany(companyData);

            // 2. Fetch Admins
            const { data: adminData } = await supabase.from('profiles').select('*').eq('company_id', id).eq('role', 'Admin').eq('is_deleted', false);
            setAdmins(adminData || []);

            // 3. Fetch Users
            const { data: userData } = await supabase.from('profiles').select('*').eq('company_id', id).eq('role', 'User').eq('is_deleted', false);
            setUsers(userData || []);

            // 4. Fetch Leads
            const { data: leadData } = await supabase.from('leads').select('*').eq('company_id', id).eq('is_deleted', false);
            setLeads(leadData || []);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== 'SuperAdmin') return <div style={{ padding: '2rem' }}>Access Denied.</div>;
    if (isLoading) return <div className="loader" style={{ padding: '5rem' }}><span></span><span></span><span></span></div>;
    if (!company) return <div className={styles.content}>Company not found.</div>;

    return (
        <div className={styles.dashboardFadeIn}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={styles.welcomeTitle}>{company.name}</h1>
                    <p className={styles.subtitle}>Company Overview & Analytics</p>
                </div>
                <div className={styles.actionGroup}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => router.push(`/dashboard/companies/${id}/edit`)}>Edit Company</button>
                </div>
            </header>

            <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Profile Information</h3>
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                        <label className={styles.formLabel}>Contact Email</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{company.email}</p>
                    </div>
                    <div>
                        <label className={styles.formLabel}>Phone Number</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{company.phone || '-'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className={styles.formLabel}>Corporate Address</label>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{company.address || '-'}</p>
                    </div>
                    {company.note && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className={styles.formLabel}>Admin Notes</label>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{company.note}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'grid', gap: '2rem' }}>
                <DataTable
                    title="Company Admins"
                    columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }]}
                    data={admins}
                    basePath="/dashboard/admins"
                />
                <DataTable
                    title="Staff Users"
                    columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }]}
                    data={users}
                    basePath="/dashboard/users"
                />
                <DataTable
                    title="Active Leads"
                    columns={[{ key: 'lead_name', label: 'Lead' }, { key: 'status', label: 'Status' }]}
                    data={leads}
                    basePath="/dashboard/leads"
                />
            </div>
        </div>
    );
}
