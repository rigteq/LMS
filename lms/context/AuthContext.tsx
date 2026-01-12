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
        // Prevent redundant fetches if the user is already loaded
        if (user && user.id === userId) return user;

        try {
            console.log("Fetching profile for:", userId);
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, email, role, company_id')
                .eq('id', userId)
                .is('is_deleted', false)
                .single();

            if (profileError) {
                // Handle AbortErrors gracefully (e.g. navigation or aborted request)
                const isAbort = profileError.message?.includes('AbortError') || profileError.name === 'AbortError';
                if (isAbort) {
                    console.log("Profile fetch aborted gracefully.");
                    return null;
                }

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
            // Only set a critical error if it's not a standard abort
            if (err.name !== 'AbortError' && !err.message?.includes('AbortError')) {
                console.error("Critical Auth Error:", err);
                setError(err.message);
            } else {
                console.log("Ignored AbortError in fetchProfile.");
            }
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        async function getInitialSession() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session?.user && isMounted) {
                    await fetchProfile(session.user.id);
                }
            } catch (e: any) {
                // Suppress abort errors in initial check as they are usually transient or navigation-related
                if (e.name !== 'AbortError' && !e.message?.includes('AbortError')) {
                    console.error("Initial session check failed", e);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Changed:", event);
            if (session?.user && isMounted) {
                // Add a small delay or check to see if we already have the user to prevent double-firing fetch
                await fetchProfile(session.user.id);
            } else if (!session && isMounted) {
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
                // Even if fetchProfile returns null (aborted), check if user state was set by onAuthStateChange
                // Use a functional update style or just check if the profile exists
                if (profile || user) {
                    console.log("Login successful, redirecting...");
                    window.location.href = '/dashboard';
                    return;
                } else {
                    // This is a real error - profile really doesn't exist
                    throw new Error("User profile registration not found.");
                }
            } else {
                throw new Error("Server communication failed during login.");
            }
        } catch (err: any) {
            // Check if we are actually logged in despite the error (race condition)
            if (user) {
                console.warn("Login reported error but user state exists, redirecting anyway.");
                window.location.href = '/dashboard';
                return;
            }

            console.error("Login Step Failure:", err);
            setError(err.message || "An unexpected error occurred.");
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
