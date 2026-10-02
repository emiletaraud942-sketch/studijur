import { FicheLesson } from "./FicheLesson";
import type { Lesson } from "@/lib/types";

export function FicheCondensee({ lessons }: { lessons: Lesson[] }) {
  if (!lessons.length) return null;

  return (
    <div className="space-y-3">
      {lessons.map((l) => (
        <div key={l.id} data-hue="gold" className="card overflow-hidden">
          <FicheLesson lesson={l} />
        </div>
      ))}
    </div>
  );
}
