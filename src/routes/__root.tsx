import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "root" });
  }, [error]);
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="text-6xl">🥀</div>
        <h1 className="text-xl font-bold">Something wilted</h1>
        <p className="text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
          >Try again</button>
          <a href="/" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Habiterra — Grow better, together" },
      { name: "description", content: "A cozy, gamified habit tracker where every habit you build grows a beautiful garden." },
      { name: "theme-color", content: "#4F8F3A" },
      { property: "og:title", content: "Habiterra — Grow better, together" },
      { property: "og:description", content: "A cozy, gamified habit tracker where every habit you build grows a beautiful garden." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Habiterra — Grow better, together" },
      { name: "twitter:description", content: "A cozy, gamified habit tracker where every habit you build grows a beautiful garden." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa87be01-1f2a-4526-8a24-126208eb24e3/id-preview-538ebfb8--d86b0264-b5b7-48cb-9062-291a0613c016.lovable.app-1783516301997.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa87be01-1f2a-4526-8a24-126208eb24e3/id-preview-538ebfb8--d86b0264-b5b7-48cb-9062-291a0613c016.lovable.app-1783516301997.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-dvh flex items-center justify-center px-6 text-center">
      <div>
        <div className="text-6xl mb-3">🌿</div>
        <h1 className="text-2xl font-bold">Lost in the garden</h1>
        <a href="/" className="mt-4 inline-block rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">Go home</a>
      </div>
    </div>
  ),
  errorComponent: ErrorFallback,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
