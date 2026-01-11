"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Role = 'SuperAdmin' | 'Admin' | 'User';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    company_id: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchProfile = async (userId: string) => {
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, email, role, company_id')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;
            if (!profile) throw new Error("Profile not found in database.");

            setUser(profile as User);
            return profile;
        } catch (err: any) {
            console.error("Profile fetch error:", err);
            setError(err.message || "Could not retrieve user profile.");
            return null;
        }
    };

    useEffect(() => {
        async function getInitialSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setIsLoading(false);
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password = 'password123') => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;

            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                if (profile) {
                    router.replace('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
            alert(err.message || "An error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.replace('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
