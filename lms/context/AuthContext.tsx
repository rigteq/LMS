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
                throw new Error("User profile not found or access denied.");
            }

            if (!profile) {
                throw new Error("Access restricted: Profile not active.");
            }

            console.log("Profile successfully loaded:", profile);
            setUser(profile as User);
            return profile;
        } catch (err: any) {
            console.error("Critical Auth Error:", err);
            setError(err.message);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (e) {
                console.error("Initial session check failed", e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Changed:", event);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
            }
            if (isMounted) setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password = 'password123') => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Starting login process for:", email);
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                if (loginError.message.includes('Invalid login credentials')) {
                    throw new Error("Invalid email or password.");
                }
                throw loginError;
            }

            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                if (profile) {
                    console.log("Login successful, redirecting...");
                    // Use window.location.href for a harder redirect if router.replace hangs on mobile
                    window.location.href = '/dashboard';
                }
            } else {
                throw new Error("Server communication failed during login.");
            }
        } catch (err: any) {
            console.error("Login Step Failure:", err);
            setError(err.message || "An unexpected error occurred.");
            // Keep setIsLoading(false) so the button becomes active again
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            window.location.href = '/';
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            setIsLoading(false);
        }
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
