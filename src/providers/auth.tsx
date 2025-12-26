"use client";
import { toastError } from '@/app/lib/toastify';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext: any = createContext<any>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [auth, setAuth] = useState<any>(null);

    useEffect(() => {
        const getAuthInfo = async () => {
            const data: any = await getAuth();

            if (data.ok) {
                setAuth(data);

                if (!data.ok && pathname === "/") {
                    router.push("/auth");
                }

                if (data.ok && pathname === "/auth") {
                    router.push("/");
                }
            } else {
                if (pathname === "/") {
                    router.push("/auth");
                    toastError("Unauthorized");
                }
            }
        }

        if (!auth) getAuthInfo();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): any {
    return useContext(AuthContext);
}

export async function getAuth(): Promise<any> {
    const res = await fetch(`/api/auth`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Unauthorized" };
    }

    const data = await res.json();
    return data;
}