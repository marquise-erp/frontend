"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // 1. Create the QueryClient lazily (once per app lifecycle)
    // This ensures data isn't lost during re-renders or hot-reloads
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 2. Data remains "fresh" for 1 minute (prevents immediate refetching)
                        staleTime: 60 * 1000,

                        // 3. Retry failed requests once before throwing an error
                        retry: 1,

                        // 4. Do not refetch on window focus automatically (optional, good for forms)
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* 5. DevTools (Only visible in development) */}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    );
}