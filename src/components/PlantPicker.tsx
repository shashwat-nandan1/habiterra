import { PLANTS, type PlantType } from "@/lib/plants";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: PlantType;
  onChange: (v: PlantType) => void;
  showDescription?: boolean;
  options?: PlantType[];
}

export function PlantPicker({ value, onChange, showDescription, options }: Props) {
  const list = options ? PLANTS.filter((p) => options.includes(p.type)) : PLANTS;
  const selected = list.find((p) => p.type === value) ?? list[0];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {list.map((p) => {
          const active = p.type === value;
          return (
            <button
              key={p.type}
              type="button"
              onClick={() => onChange(p.type)}
              className={cn(
                "relative aspect-square rounded-2xl bg-card flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95",
                active ? "border-primary bg-primary-soft" : "border-transparent",
              )}
            >
              <span className="text-3xl">{p.emoji}</span>
              {active && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showDescription && (
        <div className="rounded-2xl bg-primary-soft/50 p-4 text-center">
          <div className="font-semibold text-foreground flex items-center justify-center gap-2">
            <span className="text-xl">{selected.emoji}</span>
            {selected.label}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
        </div>
      )}
    </div>
  );
}
