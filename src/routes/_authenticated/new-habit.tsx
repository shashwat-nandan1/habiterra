import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlantPicker } from "@/components/PlantPicker";
import { FREQUENCIES, plantByType, type FrequencyChoice, type PlantType } from "@/lib/plants";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/new-habit")({
  component: NewHabit,
});

function NewHabit() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [freq, setFreq] = useState<FrequencyChoice>("daily");
  const [plant, setPlant] = useState<PlantType>("sprout");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2 || name.length > 60) {
      toast.error("Give your habit a name (2–60 characters).");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const freqOpt = FREQUENCIES.find((f) => f.value === freq)!;
    const p = plantByType(plant);
    const { error } = await supabase.from("habits").insert({
      user_id: userData.user.id,
      name: name.trim(),
      frequency_type: freq,
      target_per_week: freqOpt.target_per_week,
      plant_type: plant,
      plant_label: p.label,
    });
    setSaving(false);
    if (error) return toast.error("Couldn't create habit", { description: error.message });
    toast.success("Habit planted 🌱");
    navigate({ to: "/today" });
  };

  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-8 pb-10">
      <header className="text-center">
        <h1 className="text-4xl font-black text-primary">🌿 Habiterra</h1>
        <p className="text-sm text-muted-foreground">✨ Grow small, live better ✨</p>
      </header>
      <div className="mt-4 aspect-[4/3] rounded-3xl bg-gradient-to-b from-[oklch(0.92_0.05_230)] to-[oklch(0.85_0.08_140)] soft-shadow flex items-center justify-center text-7xl">
        🌱
      </div>
      <div className="mt-4 rounded-3xl bg-card soft-shadow p-5">
        <h2 className="text-2xl font-black text-primary text-center">New habit</h2>
        <p className="text-center text-muted-foreground text-sm">Plant a seed, grow your world.</p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-bold flex items-center gap-2">🌱 Habit name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink water"
              maxLength={60}
              className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-bold flex items-center gap-2">📆 Frequency</label>
            <div className="mt-1 relative">
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as FrequencyChoice)}
                className="w-full appearance-none rounded-2xl bg-muted px-4 py-3 pr-10 font-semibold outline-none focus:ring-2 focus:ring-primary"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">🌱 Choose your plant</label>
            <PlantPicker value={plant} onChange={setPlant} showDescription />
          </div>
        </div>
      </div>

      <button
        onClick={submit} disabled={saving}
        className="mt-5 w-full rounded-full bg-primary text-primary-foreground py-4 font-bold soft-shadow active:scale-[0.98] disabled:opacity-70"
      >
        {saving ? "Planting…" : "Create habit"}
      </button>
      <button
        onClick={() => navigate({ to: "/today" })}
        className="mt-2 w-full py-3 font-semibold text-muted-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
