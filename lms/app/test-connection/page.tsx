"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConnectionTest() {
    const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        async function test() {
            try {
                // Test basic query
                const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
                if (error) throw error;
                setStatus('success');
                setDetails({ profilesCount: data });
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setDetails(err.message);
            }
        }
        test();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Database Connection Test</h1>
            <p>Status: <strong style={{ color: status === 'success' ? 'green' : 'red' }}>{status.toUpperCase()}</strong></p>
            <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
                {JSON.stringify(details, null, 2)}
            </pre>
        </div>
    );
}
