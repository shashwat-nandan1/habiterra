import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GardenView } from "@/components/GardenView";
import { BottomNav } from "@/components/BottomNav";
import { plantByType, todayISO, weekStartISO } from "@/lib/plants";
import { Plus, Leaf, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/today")({
  component: TodayPage,
});

interface Habit {
  id: string; name: string; frequency_type: string; target_per_week: number | null;
  plant_type: string; plant_label: string;
}
interface Completion {
  id: string; habit_id: string; completed_on: string; plant_type: string;
}

function TodayPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<Completion[]>([]);
  const [weekCompletions, setWeekCompletions] = useState<Completion[]>([]);
  const [gardenCompletions, setGardenCompletions] = useState<Completion[]>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);

  const today = todayISO();
  const weekStart = weekStartISO();

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const uid = userData.user.id;
    const [
      { data: prof },
      { data: hs },
      { data: todays },
      { data: week },
      { count },
      { data: garden },
    ] = await Promise.all([
      supabase.from("profiles").select("onboarding_completed").eq("id", uid).maybeSingle(),
      supabase.from("habits").select("*").eq("user_id", uid).eq("is_active", true).order("created_at"),
      supabase.from("habit_completions").select("*").eq("user_id", uid).eq("completed_on", today),
      supabase.from("habit_completions").select("*").eq("user_id", uid).gte("completed_on", weekStart),
      supabase.from("habit_completions").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("habit_completions").select("*").eq("user_id", uid).order("completed_on", { ascending: false }).limit(40),
    ]);
    if (prof && !prof.onboarding_completed) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setHabits((hs as Habit[]) ?? []);
    setTodayCompletions((todays as Completion[]) ?? []);
    setWeekCompletions((week as Completion[]) ?? []);
    setGardenCompletions((garden as Completion[]) ?? []);
    setTotalCompletions(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const dailyHabits = habits.filter((h) => h.frequency_type === "daily");
  const weeklyHabits = habits.filter((h) => h.frequency_type !== "daily");
  const dueToday = dailyHabits.length + weeklyHabits.filter((h) => {
    const doneThisWeek = weekCompletions.filter((c) => c.habit_id === h.id).length;
    const target = h.target_per_week ?? 1;
    return doneThisWeek < target;
  }).length;
  const doneToday = todayCompletions.length;

  const complete = async (habit: Habit) => {
    if (todayCompletions.some((c) => c.habit_id === habit.id)) {
      toast.info("Already tended today");
      return;
    }
    if (habit.frequency_type !== "daily") {
      const doneThisWeek = weekCompletions.filter((c) => c.habit_id === habit.id).length;
      const target = habit.target_per_week ?? 1;
      if (doneThisWeek >= target) {
        toast.info("Weekly target already met");
        return;
      }
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const optimistic: Completion = {
      id: `tmp-${habit.id}-${today}`,
      habit_id: habit.id,
      completed_on: today,
      plant_type: habit.plant_type,
    };
    setTodayCompletions((c) => [...c, optimistic]);
    setWeekCompletions((c) => [...c, optimistic]);
    setGardenCompletions((c) => [optimistic, ...c].slice(0, 40));
    setTotalCompletions((count) => count + 1);
    const { data, error } = await supabase.from("habit_completions").insert({
      habit_id: habit.id, user_id: userData.user.id, completed_on: today, plant_type: habit.plant_type,
    }).select().single();
    if (error) {
      setTodayCompletions((c) => c.filter((x) => x.id !== optimistic.id));
      setWeekCompletions((c) => c.filter((x) => x.id !== optimistic.id));
      setGardenCompletions((c) => c.filter((x) => x.id !== optimistic.id));
      setTotalCompletions((count) => Math.max(0, count - 1));
      const duplicate = error.code === "23505";
      toast.error(duplicate ? "Already marked today" : "Couldn't mark as done", {
        description: duplicate ? "This habit has already been tended today." : error.message,
      });
      return;
    }
    setTodayCompletions((c) => c.map((x) => (x.id === optimistic.id ? (data as Completion) : x)));
    setWeekCompletions((c) => c.map((x) => (x.id === optimistic.id ? (data as Completion) : x)));
    setGardenCompletions((c) => c.map((x) => (x.id === optimistic.id ? (data as Completion) : x)));
    toast.success(`${plantByType(habit.plant_type).emoji} ${habit.name} tended!`);
  };

  if (loading) {
    return <div className="min-h-dvh flex items-center justify-center text-3xl">🌱</div>;
  }

  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-8 pb-28 relative">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-4xl font-black text-primary">🌿 Habiterra</h1>
          <p className="text-sm text-muted-foreground">Your garden, your day</p>
        </div>
        <div className="rounded-full bg-card soft-shadow px-3 py-1.5 flex items-center gap-1 font-bold text-primary text-sm shrink-0">
          <Leaf className="h-4 w-4" />{totalCompletions}
        </div>
      </header>

      <div className="mt-4">
        <GardenView completions={gardenCompletions} />
      </div>

      {/* Progress */}
      <div className="mt-4 rounded-3xl bg-card soft-shadow p-4 flex items-center gap-4">
        <div className="text-5xl">🌻</div>
        <div className="flex-1 text-center">
          <div className="text-xl font-black text-primary">
            {doneToday} <span className="text-muted-foreground font-bold">of</span> {Math.max(dueToday, doneToday)}
          </div>
          <div className="text-sm font-bold">tended today</div>
          <div className="text-xs text-primary">small steps, big growth</div>
          <div className="mt-1 flex justify-center gap-0.5">
            {Array.from({ length: Math.max(dueToday, doneToday, 1) }).map((_, i) => (
              <Leaf key={i} className={`h-3 w-3 ${i < doneToday ? "text-primary" : "text-muted"}`} fill="currentColor" />
            ))}
          </div>
        </div>
      </div>

      {/* Daily habits */}
      <section className="mt-4 rounded-3xl bg-card soft-shadow p-4">
        <h2 className="font-bold flex items-center gap-2">🌱 Daily habits</h2>
        {dailyHabits.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground text-center py-4">No daily habits yet.</p>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {dailyHabits.map((h) => {
              const done = todayCompletions.some((c) => c.habit_id === h.id);
              return (
                <HabitRow key={h.id} habit={h} done={done} onComplete={() => complete(h)} subtitle="Every day" />
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly habits */}
      <section className="mt-4 rounded-3xl bg-card soft-shadow p-4">
        <h2 className="font-bold flex items-center gap-2">📆 Weekly habits</h2>
        {weeklyHabits.length === 0 ? (
          <div className="mt-3 rounded-2xl border-2 border-dashed border-border p-6 text-center">
            <div className="text-2xl">🌱</div>
            <p className="mt-1 font-bold">No weekly habits yet</p>
            <p className="text-xs text-muted-foreground">Add a weekly habit to see it here.</p>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {weeklyHabits.map((h) => {
              const done = todayCompletions.some((c) => c.habit_id === h.id);
              const doneWk = weekCompletions.filter((c) => c.habit_id === h.id).length;
              const target = h.target_per_week ?? 1;
              return (
                <HabitRow
                  key={h.id}
                  habit={h}
                  done={done}
                  onComplete={() => complete(h)}
                  subtitle={`${doneWk} of ${target} this week`}
                />
              );
            })}
          </div>
        )}
      </section>

      {habits.length === 0 && (
        <div className="mt-4 rounded-3xl bg-primary-soft p-6 text-center">
          <div className="text-3xl">🌱</div>
          <p className="mt-2 font-bold">No habits yet</p>
          <Link to="/new-habit" className="mt-3 inline-block rounded-full bg-primary text-primary-foreground px-5 py-2 font-bold">
            Create your first habit
          </Link>
        </div>
      )}

      <Link
        to="/new-habit"
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center soft-shadow active:scale-95 z-30"
        aria-label="New habit"
      >
        <Plus className="h-7 w-7" />
      </Link>

      <BottomNav />
    </div>
  );
}

function HabitRow({
  habit, done, onComplete, subtitle,
}: {
  habit: Habit; done: boolean; onComplete: () => void; subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center text-2xl shrink-0">
        {plantByType(habit.plant_type).emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold truncate">{habit.name}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      {done ? (
        <div className="h-10 w-10 rounded-xl bg-primary-soft border-2 border-primary flex items-center justify-center text-primary shrink-0">
          <Check className="h-5 w-5" />
        </div>
      ) : (
        <button
          onClick={onComplete}
          className="rounded-full border-2 border-border px-3 py-2 text-xs font-bold text-primary hover:bg-primary-soft transition-colors shrink-0"
        >
          Mark as done
        </button>
      )}
    </div>
  );
}
