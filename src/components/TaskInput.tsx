import { useState, KeyboardEvent } from "react";
import { Plus, Flame, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onAdd: (text: string, important: boolean, urgent: boolean) => void;
}

export function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed, important, urgent);
    setValue("");
    setImportant(false);
    setUrgent(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="rounded-2xl bg-card p-3 shadow-pop ring-1 ring-border transition-all focus-within:ring-2 focus-within:ring-primary/60">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Flame className="ml-2 h-5 w-5 shrink-0 text-primary" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder="What will you hunt today?"
          className="flex-1 bg-transparent py-1.5 text-base font-semibold text-foreground placeholder:font-medium placeholder:text-muted-foreground focus:outline-none"
          aria-label="New task"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-gold px-4 font-display font-bold uppercase tracking-wider text-primary-foreground shadow-soft transition-all hover:shadow-glow active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Add
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Mark as:</span>
        <Toggle
          active={important}
          onClick={() => setImportant(!important)}
          icon={<Star className="h-3.5 w-3.5" strokeWidth={2.5} />}
          label="Important"
          activeClass="bg-quadrant-important/20 text-quadrant-important border-quadrant-important/60"
        />
        <Toggle
          active={urgent}
          onClick={() => setUrgent(!urgent)}
          icon={<Zap className="h-3.5 w-3.5" strokeWidth={2.5} />}
          label="Urgent"
          activeClass="bg-quadrant-urgent/20 text-quadrant-urgent border-quadrant-urgent/60"
        />
        {important && urgent && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-quadrant-urgent-important/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-quadrant-urgent-important border border-quadrant-urgent-important/40">
            <Flame className="h-3 w-3" /> Hunt now
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all",
        active ? activeClass : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
