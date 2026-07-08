import { FREQUENCIES, type FrequencyChoice } from "@/lib/plants";
import { cn } from "@/lib/utils";

export function FrequencySelector({
  value,
  onChange,
}: {
  value: FrequencyChoice;
  onChange: (v: FrequencyChoice) => void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-muted p-1">
      {FREQUENCIES.map((f) => {
        const active = f.value === value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              "py-2.5 rounded-xl text-sm font-semibold transition-all",
              active ? "bg-primary-soft text-primary shadow-sm" : "text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
