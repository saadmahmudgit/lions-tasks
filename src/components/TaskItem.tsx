import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Check, RotateCcw, Flame, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type Quadrant = "urgent-important" | "important" | "urgent" | "neither";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  important: boolean;
  urgent: boolean;
  deletedAt?: number;
};

export function getQuadrant(t: Pick<Task, "important" | "urgent">): Quadrant {
  if (t.important && t.urgent) return "urgent-important";
  if (t.important) return "important";
  if (t.urgent) return "urgent";
  return "neither";
}

const quadrantStyles: Record<Quadrant, { ring: string; bar: string; chip: string; label: string; icon: typeof Flame }> = {
  "urgent-important": {
    ring: "ring-2 ring-quadrant-urgent-important/70 shadow-[0_0_24px_-4px_hsl(var(--q-urgent-important)/0.55)]",
    bar: "bg-gradient-fire",
    chip: "bg-quadrant-urgent-important/15 text-quadrant-urgent-important border border-quadrant-urgent-important/40",
    label: "Hunt now",
    icon: Flame,
  },
  important: {
    ring: "ring-1 ring-quadrant-important/60",
    bar: "bg-gradient-gold",
    chip: "bg-quadrant-important/15 text-quadrant-important border border-quadrant-important/40",
    label: "Important",
    icon: Star,
  },
  urgent: {
    ring: "ring-1 ring-quadrant-urgent/50",
    bar: "bg-quadrant-urgent",
    chip: "bg-quadrant-urgent/15 text-quadrant-urgent border border-quadrant-urgent/40",
    label: "Urgent",
    icon: Zap,
  },
  neither: {
    ring: "",
    bar: "bg-quadrant-neither",
    chip: "bg-muted text-muted-foreground border border-border",
    label: "Whenever",
    icon: Star,
  },
};

interface Props {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPurge?: (id: string) => void;
  sortable?: boolean;
  variant?: "active" | "done" | "bin";
}

export function TaskItem({ task, onToggle, onDelete, onRestore, onPurge, sortable = true, variant = "active" }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const q = getQuadrant(task);
  const s = quadrantStyles[q];
  const QIcon = s.icon;
  const isHero = variant === "active" && q === "urgent-important";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl bg-card p-3 pl-2 shadow-card animate-pop-in",
        "border border-border transition-all hover:border-primary/40 hover:-translate-y-0.5",
        variant === "active" && s.ring,
        task.completed && "bg-gradient-done opacity-90",
        isHero && "p-4 pl-2"
      )}
    >
      {sortable && variant === "active" ? (
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="flex h-9 w-6 cursor-grab touch-none items-center justify-center text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      ) : (
        <span className="w-6" />
      )}

      <span className={cn("h-10 w-1.5 shrink-0 rounded-full", s.bar, isHero && "h-12 w-2")} />

      {variant !== "bin" && onToggle && (
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Mark as not done" : "Mark as done"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            task.completed
              ? "border-completed bg-completed text-primary-foreground"
              : "border-foreground/25 hover:border-primary hover:scale-110"
          )}
        >
          {task.completed && <Check className="h-4 w-4 animate-check-pop" strokeWidth={3} />}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "leading-snug text-foreground",
            isHero ? "text-lg font-bold" : "text-base font-semibold",
            task.completed && "text-muted-foreground line-through"
          )}
        >
          {task.text}
        </p>
        {variant === "active" && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.chip)}>
              <QIcon className="h-3 w-3" strokeWidth={2.5} />
              {s.label}
            </span>
          </div>
        )}
      </div>

      {variant === "bin" ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRestore?.(task.id)}
            aria-label="Restore task"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPurge?.(task.id)}
            aria-label="Delete forever"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onDelete?.(task.id)}
          aria-label="Send to bin"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/60 opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
