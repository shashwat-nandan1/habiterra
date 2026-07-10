import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlantPicker } from "@/components/PlantPicker";
import { FrequencySelector } from "@/components/FrequencySelector";
import { FREQUENCIES, plantByType, type FrequencyChoice, type PlantType } from "@/lib/plants";
import { Check, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [freq, setFreq] = useState<FrequencyChoice>("daily");
  const [plant, setPlant] = useState<PlantType>("sunflower");
  const [saving, setSaving] = useState(false);

  const next = async () => {
    if (name.trim().length < 2 || name.length > 60) {
      toast.error("Give your habit a name (2–60 characters).");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const p = plantByType(plant);
    const freqOpt = FREQUENCIES.find((f) => f.value === freq)!;
    const { error } = await supabase.from("habits").insert({
      user_id: userData.user.id,
      name: name.trim(),
      frequency_type: freq,
      target_per_week: freqOpt.target_per_week,
      plant_type: plant,
      plant_label: p.label,
    });
    setSaving(false);
    if (error) return toast.error("Couldn't plant your habit", { description: error.message });
    toast.success("Habit planted 🌱");
    setStep(2);
  };

  const finish = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userData.user.id);
    navigate({ to: "/today", replace: true });
  };

  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-8 pb-8">
      <header className="text-center">
        <h1 className="text-4xl font-black text-primary">🌿 Habiterra 🌿</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card soft-shadow px-2 py-1">
          <StepDot n={1} active={step >= 1} />
          <div className={`h-0.5 w-8 ${step === 2 ? "bg-primary" : "bg-border"}`} />
          <StepDot n={2} active={step === 2} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Step {step} of 2</p>
      </header>

      {step === 1 ? (
        <Step1
          name={name} setName={setName}
          freq={freq} setFreq={setFreq}
          plant={plant} setPlant={setPlant}
          onNext={next} saving={saving}
        />
      ) : (
        <Step2 onFinish={finish} />
      )}
    </div>
  );
}

function StepDot({ n, active }: { n: number; active: boolean }) {
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    }`}>
      {n}
    </div>
  );
}

function Step1({
  name, setName, freq, setFreq, plant, setPlant, onNext, saving,
}: any) {
  return (
    <>
      <div className="mt-6 aspect-square rounded-3xl bg-gradient-to-b from-[oklch(0.92_0.05_230)] to-[oklch(0.88_0.06_140)] soft-shadow flex items-center justify-center text-8xl">
        🌱
      </div>
      <div className="mt-6 rounded-3xl bg-card soft-shadow p-5">
        <h2 className="text-2xl font-black text-center text-primary">Plant your first habit</h2>
        <p className="text-center text-muted-foreground text-sm">Start small. Grow big.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold flex items-center gap-2">🌱 Habit name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read for 10 minutes"
              maxLength={60}
              className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">🌱 How often?</label>
            <FrequencySelector value={freq} onChange={setFreq} />
          </div>
          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">🌱 Choose your plant</label>
            <PlantPicker value={plant} onChange={setPlant} />
          </div>
        </div>
      </div>
      <button
        onClick={onNext} disabled={saving}
        className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 font-bold soft-shadow active:scale-[0.98] disabled:opacity-70"
      >
        {saving ? "Planting…" : "Next"}
      </button>
    </>
  );
}

function Step2({ onFinish }: { onFinish: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [sent, setSent] = useState<Record<string, "sending" | "sent">>({});

  const doSearch = async (val: string) => {
    setQ(val);
    if (val.trim().length < 2) { setResults([]); setStatus("idle"); return; }
    setStatus("loading");
    const { data, error } = await supabase.rpc("search_profiles", {
      search_query: val.trim(),
    });
    if (error) return setStatus("error");
    setResults((data ?? []).slice(0, 10));
    setStatus((data?.length ?? 0) === 0 ? "empty" : "idle");
  };

  const sendReq = async (id: string) => {
    setSent((s) => ({ ...s, [id]: "sending" }));
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { error } = await supabase.from("friend_requests").insert({
      requester_id: me.user.id, receiver_id: id,
    });
    if (error) {
      const duplicate = error.code === "23505";
      toast.error(duplicate ? "Friend request already exists" : "Couldn't send request", {
        description: duplicate ? "You already have an active request or friendship with this gardener." : error.message,
      });
      setSent((s) => { const c = { ...s }; delete c[id]; return c; });
      return;
    }
    setSent((s) => ({ ...s, [id]: "sent" }));
    toast.success("Friend request sent 🌿");
  };

  return (
    <>
      <h2 className="mt-6 text-3xl font-black text-primary text-center leading-tight">Add friends to<br />your world 🍀</h2>
      <p className="mt-2 text-center text-muted-foreground">Invite friends to build and care for beautiful gardens together.</p>

      <div className="mt-6 aspect-[4/3] rounded-3xl bg-gradient-to-b from-[oklch(0.92_0.05_230)] to-[oklch(0.85_0.06_230)] soft-shadow relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">🌳</div>
        <div className="absolute top-4 left-4 text-3xl">🏡</div>
        <div className="absolute top-6 right-6 text-3xl">🦋</div>
        <div className="absolute bottom-6 left-6 text-3xl">👧</div>
        <div className="absolute bottom-6 right-6 text-3xl">👦</div>
      </div>

      <div className="mt-6 rounded-3xl bg-card soft-shadow p-5">
        <div className="flex items-center gap-2 font-bold text-primary">
          <span>👥</span> Find friends
        </div>
        <p className="text-sm text-muted-foreground">Search by name or email and send a friend request.</p>
        <div className="mt-3 relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => doSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-2xl bg-muted pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mt-4 space-y-2">
          {status === "idle" && q.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">Search by name or email to find friends.</p>
          )}
          {status === "loading" && (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          )}
          {status === "empty" && (
            <p className="text-sm text-muted-foreground text-center py-4">No gardeners found.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive text-center py-4">Couldn't search right now. Try again.</p>
          )}
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2">
              <div className="h-11 w-11 rounded-full bg-primary-soft overflow-hidden shrink-0 flex items-center justify-center text-lg">
                {r.avatar_url ? <img src={r.avatar_url} alt="" className="h-full w-full object-cover" /> : "👤"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-foreground truncate">{r.full_name ?? "Gardener"}</div>
                <div className="text-xs text-muted-foreground truncate">{r.email}</div>
              </div>
              <button
                onClick={() => sendReq(r.id)}
                disabled={!!sent[r.id]}
                className="rounded-full bg-primary-soft text-primary px-4 py-2 text-sm font-bold disabled:opacity-70"
              >
                {sent[r.id] === "sent" ? "Sent" : sent[r.id] === "sending" ? "…" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onFinish}
        className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 font-bold soft-shadow active:scale-[0.98]"
      >
        Start growing
      </button>
      <button
        onClick={onFinish}
        className="mt-3 w-full text-center text-muted-foreground font-semibold py-2"
      >
        Skip for now
      </button>
    </>
  );
}
