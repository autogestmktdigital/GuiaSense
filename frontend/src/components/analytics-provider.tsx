"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushDataLayerEvent } from "@/lib/analytics";

const TRACK_MANUAL_PAGE_VIEW = process.env.NEXT_PUBLIC_TRACK_MANUAL_PAGE_VIEW !== "false";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    if (!TRACK_MANUAL_PAGE_VIEW) return;
    const params = searchParams?.toString();
    const pagePath = params ? `${pathname}?${params}` : pathname;
    if (lastPage.current === pagePath) return;
    lastPage.current = pagePath;
    pushDataLayerEvent("page_view", { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
      {children}
    </Suspense>
  );
}