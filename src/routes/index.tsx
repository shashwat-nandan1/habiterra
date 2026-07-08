import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Sprout, Users, Flower2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.session.user.id)
          .maybeSingle();
        navigate({ to: p?.onboarding_completed ? "/today" : "/onboarding", replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Couldn't sign in", { description: String(result.error.message ?? result.error) });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    // popup path: session set, decide destination
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: p } = await supabase
        .from("profiles").select("onboarding_completed").eq("id", data.user.id).maybeSingle();
      navigate({ to: p?.onboarding_completed ? "/today" : "/onboarding", replace: true });
    }
    setLoading(false);
  };

  if (checking) return <div className="min-h-dvh flex items-center justify-center text-2xl">🌱</div>;

  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-10 pb-8 flex flex-col">
      <header className="text-center">
        <h1 className="text-5xl font-black text-primary tracking-tight flex items-center justify-center gap-2">
          <span>🌿</span>Habiterra<span>🌿</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Grow better, together.</p>
      </header>

      {/* Hero garden */}
      <div className="mt-6 relative aspect-square rounded-3xl overflow-hidden soft-shadow bg-gradient-to-b from-[oklch(0.92_0.05_230)] to-[oklch(0.85_0.06_230)]">
        <div className="absolute top-6 left-6 text-4xl">☁️</div>
        <div className="absolute top-10 right-8 text-3xl">🦋</div>
        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-6xl">🌳</div>
        <div className="absolute bottom-24 left-8 text-5xl">🏡</div>
        <div className="absolute bottom-16 right-8 text-4xl">🌸</div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 text-4xl">
          <span>🌻</span><span>🌷</span><span>🌼</span><span>💜</span>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-card soft-shadow p-2 divide-y divide-border">
        <FeatureRow icon={<Sprout className="h-6 w-6 text-primary" />} title="Daily habits" desc="Build healthy habits with gentle reminders and rewards." />
        <FeatureRow icon={<Users className="h-6 w-6 text-primary" />} title="Friend activity" desc="See what your friends are up to and celebrate together." />
        <FeatureRow icon={<Flower2 className="h-6 w-6 text-primary" />} title="Shared gardens" desc="Create and grow in beautiful gardens with friends." />
      </div>

      <button
        onClick={signIn}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 font-bold flex items-center justify-center gap-3 soft-shadow active:scale-[0.98] transition-transform disabled:opacity-70"
      >
        <span className="bg-white rounded-full p-1">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.3 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.4 6.6 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19c9.9 0 18.4-7.2 19.4-16.5.1-.6.1-1.3.1-2.5 0-1.5-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.4 6.6 28.9 5 24 5 16.1 5 9.4 9.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c4.8 0 9.2-1.6 12.6-4.4l-5.8-4.9c-2 1.4-4.5 2.3-6.8 2.3-5.4 0-9.9-2.7-11.3-6.9l-6.6 5.1C9.2 38.7 16 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 1.9-1.9 3.5-3.5 4.7l5.8 4.9c-.4.4 6.4-4.7 6.4-13.6 0-1.5-.1-2.4-.4-3.5z"/></svg>
        </span>
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By continuing, you agree to our <span className="text-primary font-semibold">Terms of Service</span> and <span className="text-primary font-semibold">Privacy Policy</span>.
      </p>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="h-12 w-12 rounded-2xl bg-primary-soft flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-bold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
