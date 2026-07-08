import { plantByType } from "@/lib/plants";

interface Completion {
  id: string;
  plant_type: string;
}

// Deterministic scatter positions from an id hash
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function GardenView({ completions }: { completions: Completion[] }) {
  const capped = completions.slice(0, 40);
  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden soft-shadow bg-gradient-to-b from-[oklch(0.93_0.05_230)] to-[oklch(0.88_0.06_230)]">
      {/* Clouds */}
      <div className="absolute top-4 left-6 text-4xl opacity-80 select-none">☁️</div>
      <div className="absolute top-8 right-8 text-3xl opacity-70 select-none">☁️</div>
      <div className="absolute top-6 right-24 text-2xl opacity-60 select-none">🦋</div>

      {/* Floating island */}
      <div className="absolute inset-x-6 bottom-4 top-16 rounded-[50%_50%_40%_40%/40%_40%_60%_60%] bg-gradient-to-b from-[oklch(0.75_0.14_140)] to-[oklch(0.55_0.14_140)] soft-shadow">
        {/* Soil patch */}
        <div className="absolute left-1/2 -translate-x-1/2 top-8 w-3/4 h-3/4 rounded-[40%] bg-[oklch(0.45_0.08_60)]/70" />
        {/* Plants */}
        {capped.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-plant-pop">🌱</div>
        )}
        {capped.map((c, i) => {
          const h = hash(c.id + i);
          const left = 15 + (h % 70);
          const top = 20 + ((h >> 3) % 60);
          const size = 28 + ((h >> 6) % 14);
          const p = plantByType(c.plant_type);
          return (
            <span
              key={c.id}
              className="absolute animate-plant-pop select-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${size}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {p.emoji}
            </span>
          );
        })}
        {/* Decorative fence */}
        <div className="absolute bottom-2 left-4 text-2xl">🪵</div>
        <div className="absolute bottom-2 right-4 text-2xl">🪴</div>
      </div>
    </div>
  );
}
