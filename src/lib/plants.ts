export type PlantType = "sunflower" | "tulip" | "clover" | "lavender" | "sprout" | "daisy";

export interface Plant {
  type: PlantType;
  label: string;
  emoji: string;
  description: string;
}

export const PLANTS: Plant[] = [
  { type: "sunflower", label: "Sunflower", emoji: "🌻", description: "Bright energy for your daily wins." },
  { type: "tulip", label: "Tulip", emoji: "🌷", description: "A gentle bloom for steady progress." },
  { type: "sprout", label: "Sprout", emoji: "🌱", description: "A fresh start for a new you." },
  { type: "lavender", label: "Lavender", emoji: "💜", description: "Calm growth, one day at a time." },
  { type: "daisy", label: "Daisy", emoji: "🌼", description: "Simple, joyful consistency." },
  { type: "clover", label: "Clover", emoji: "🍀", description: "Little bits of luck as you grow." },
];

export function plantByType(type: string): Plant {
  return PLANTS.find((p) => p.type === type) ?? PLANTS[0];
}

export type FrequencyChoice = "daily" | "custom_weekly" | "weekly";
export interface FrequencyOption {
  value: FrequencyChoice;
  label: string;
  target_per_week: number | null;
}
export const FREQUENCIES: FrequencyOption[] = [
  { value: "daily", label: "Every day", target_per_week: null },
  { value: "custom_weekly", label: "3x/week", target_per_week: 3 },
  { value: "weekly", label: "Weekly", target_per_week: 1 },
];

function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return formatLocalDateISO(new Date());
}

export function weekStartISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // Monday as start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return formatLocalDateISO(d);
}
