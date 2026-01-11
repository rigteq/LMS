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
            console.log("Fetching profile for:", userId);
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, email, role, company_id')
                .eq('id', userId)
                .is('is_deleted', false)
                .single();

            if (profileError) {
                console.error("Profile query error:", profileError);
                throw new Error("Could not find your user profile. Please contact support.");
            }

            if (!profile) {
                throw new Error("User profile not found.");
            }

            console.log("Profile loaded:", profile);
            setUser(profile as User);
            return profile;
        } catch (err: any) {
            console.error("Profile fetch exception:", err);
            setError(err.message);
            return null;
        }
    };

    useEffect(() => {
        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (e) {
                console.error("Session check failed", e);
            } finally {
                setIsLoading(false);
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event:", event);
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
            console.log("Attempting login for:", email);
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                if (loginError.message === 'Invalid login credentials') {
                    throw new Error("Email or password incorrect.");
                }
                throw loginError;
            }

            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                if (profile) {
                    router.replace('/dashboard');
                }
            } else {
                throw new Error("Login succeeded but no user data returned.");
            }
        } catch (err: any) {
            console.error("Login failure:", err);
            setError(err.message);
            // We use alert as a fallback for immediate feedback
            alert(err.message);
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
