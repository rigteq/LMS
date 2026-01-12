import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lmqrchkzrkpxehnmayqw.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_R2Vnz1IRMkb3DuHkQNQS8w_dl1arnYx";

export const updateSession = async (request: NextRequest) => {
    try {
        // Create an unmodified response
        let supabaseResponse = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(
            supabaseUrl!,
            supabaseKey!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                            supabaseResponse = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        } catch (e) {
                            console.error("Cookie setAll error:", e);
                        }
                    },
                },
            },
        );

        // This will refresh session if expired - required for Server Components
        await supabase.auth.getUser();

        return supabaseResponse;
    } catch (e) {
        console.error("Middleware updateSession error:", e);
        // Return original response if something fails
        return NextResponse.next({
            request: {
                headers: request.headers,
            }
        });
    }
};
