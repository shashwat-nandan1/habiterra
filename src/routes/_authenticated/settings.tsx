import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(data);
    })();
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };
  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-10 pb-28">
      <h1 className="text-4xl font-black text-primary text-center">Settings</h1>
      <div className="mt-6 rounded-3xl bg-card soft-shadow p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-soft overflow-hidden flex items-center justify-center text-2xl">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : "👤"}
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">{profile?.full_name ?? "Gardener"}</div>
          <div className="text-sm text-muted-foreground truncate">{profile?.email}</div>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-card soft-shadow p-5 text-muted-foreground text-sm">
        More settings coming soon 🌱
      </div>
      <button
        onClick={signOut}
        className="mt-6 w-full rounded-full bg-card border border-border py-4 font-bold flex items-center justify-center gap-2 text-destructive soft-shadow active:scale-[0.98]"
      >
        <LogOut className="h-5 w-5" /> Sign out
      </button>
      <BottomNav />
    </div>
  );
}
