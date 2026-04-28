import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskItem, type Task, getQuadrant } from "@/components/TaskItem";
import { TaskInput } from "@/components/TaskInput";
import { Crown, Trophy, Trash2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lions-agenda-v1";
const BIN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type Tab = "agenda" | "trophies" | "bin";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {}
    return [
      { id: "demo-1", text: "Close the deal before noon", completed: false, createdAt: Date.now(), important: true, urgent: true },
      { id: "demo-2", text: "Train. No excuses.", completed: false, createdAt: Date.now(), important: true, urgent: false },
      { id: "demo-3", text: "Reply to the inbox", completed: false, createdAt: Date.now(), important: false, urgent: true },
      { id: "demo-4", text: "Read for 20 minutes", completed: false, createdAt: Date.now(), important: false, urgent: false },
    ];
  });
  const [tab, setTab] = useState<Tab>("agenda");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Auto-purge bin items older than TTL on mount
  useEffect(() => {
    const now = Date.now();
    setTasks((prev) => prev.filter((t) => !t.deletedAt || now - t.deletedAt < BIN_TTL_MS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const active = useMemo(() => tasks.filter((t) => !t.completed && !t.deletedAt), [tasks]);
  const done = useMemo(() => tasks.filter((t) => t.completed && !t.deletedAt), [tasks]);
  const bin = useMemo(
    () => tasks.filter((t) => !!t.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [tasks]
  );

  const addTask = (text: string, important: boolean, urgent: boolean) => {
    setTasks((prev) => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now(), important, urgent },
      ...prev,
    ]);
  };

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const sendToBin = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, deletedAt: Date.now() } : t)));

  const restoreTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, deletedAt: undefined } : t)));

  const purgeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const emptyBin = () => setTasks((prev) => prev.filter((t) => !t.deletedAt));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: a, over } = event;
    if (!over || a.id === over.id) return;
    const ids = active.map((t) => t.id);
    const oldIndex = ids.indexOf(a.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newActive = arrayMove(active, oldIndex, newIndex);
    // Preserve other tasks (done + bin) order; rebuild
    const others = tasks.filter((t) => t.completed || t.deletedAt);
    setTasks([...newActive, ...others]);
  };

  // Group active tasks by quadrant for salience
  const grouped = useMemo(() => {
    const groups = {
      "urgent-important": [] as Task[],
      important: [] as Task[],
      urgent: [] as Task[],
      neither: [] as Task[],
    };
    for (const t of active) groups[getQuadrant(t)].push(t);
    return groups;
  }, [active]);

  const huntCount = grouped["urgent-important"].length;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      {/* Lion mane backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-mane opacity-25 blur-3xl animate-mane-spin" />
        <div className="absolute left-1/2 top-[-180px] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-gradient-gold opacity-20 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-mane-deep/30 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-2xl">
        {/* Crest */}
        <header className="mb-8 text-center">
          <div className="mx-auto -mb-6 flex items-center justify-center">
            <LionCrest />
          </div>
          <h1 className="relative z-10 font-display text-3xl font-bold uppercase tracking-[0.15em] sm:text-4xl">
            <span className="text-gradient-gold">The Lion's</span>
            <br />
            <span className="text-foreground">Agenda</span>
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Let's get to work
          </p>
        </header>

        {/* Input */}
        <TaskInput onAdd={addTask} />

        {/* Tabs */}
        <nav className="mt-8 flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 backdrop-blur">
          <TabButton active={tab === "agenda"} onClick={() => setTab("agenda")} icon={<Crown className="h-4 w-4" />} label="Agenda" count={active.length} />
          <TabButton active={tab === "trophies"} onClick={() => setTab("trophies")} icon={<Trophy className="h-4 w-4" />} label="Trophies" count={done.length} />
          <TabButton active={tab === "bin"} onClick={() => setTab("bin")} icon={<Trash2 className="h-4 w-4" />} label="Bin" count={bin.length} />
        </nav>

        {/* AGENDA */}
        {tab === "agenda" && (
          <section className="mt-6 mb-12">
            {active.length === 0 ? (
              <EmptyState
                title="The savanna is quiet."
                subtitle="Add your first hunt above."
              />
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={active.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {grouped["urgent-important"].length > 0 && (
                      <Group
                        title="Hunt Now"
                        subtitle="Important & urgent"
                        accent="text-quadrant-urgent-important"
                        icon={<Flame className="h-4 w-4 animate-ember" />}
                        count={huntCount}
                      >
                        {grouped["urgent-important"].map((t) => (
                          <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={sendToBin} />
                        ))}
                      </Group>
                    )}
                    {grouped["important"].length > 0 && (
                      <Group title="Important" subtitle="Schedule the work" accent="text-quadrant-important" count={grouped["important"].length}>
                        {grouped["important"].map((t) => (
                          <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={sendToBin} />
                        ))}
                      </Group>
                    )}
                    {grouped["urgent"].length > 0 && (
                      <Group title="Urgent" subtitle="Knock these out" accent="text-quadrant-urgent" count={grouped["urgent"].length}>
                        {grouped["urgent"].map((t) => (
                          <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={sendToBin} />
                        ))}
                      </Group>
                    )}
                    {grouped["neither"].length > 0 && (
                      <Group title="Whenever" subtitle="The long grass" accent="text-muted-foreground" count={grouped["neither"].length}>
                        {grouped["neither"].map((t) => (
                          <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={sendToBin} />
                        ))}
                      </Group>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        )}

        {/* TROPHIES */}
        {tab === "trophies" && (
          <section className="mt-6 mb-12">
            {done.length === 0 ? (
              <EmptyState title="No trophies yet." subtitle="Go take one." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {done.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={sendToBin} sortable={false} variant="done" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* BIN */}
        {tab === "bin" && (
          <section className="mt-6 mb-12">
            {bin.length === 0 ? (
              <EmptyState title="The bin is empty." subtitle="Nothing wasted." />
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Auto-cleared after 30 days
                  </p>
                  <button
                    onClick={emptyBin}
                    className="rounded-lg border border-destructive/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive transition-all hover:bg-destructive/10"
                  >
                    Empty bin
                  </button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {bin.map((t) => (
                    <TaskItem key={t.id} task={t} sortable={false} variant="bin" onRestore={restoreTask} onPurge={purgeTask} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-all",
        active
          ? "bg-gradient-gold text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function Group({
  title,
  subtitle,
  accent,
  icon,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon?: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline gap-2 px-1">
        <h2 className={cn("font-display text-sm font-bold uppercase tracking-[0.18em] flex items-center gap-1.5", accent)}>
          {icon}
          {title}
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          · {subtitle} · {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center backdrop-blur">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <LionCrest small />
      </div>
      <p className="font-display text-lg font-bold uppercase tracking-wider text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function LionCrest({ small = false }: { small?: boolean }) {
  const size = small ? 44 : 180;
  return (
    <img
      src="/lion-head.png"
      alt="Lion head"
      width={size}
      height={size}
      className="relative z-0 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      loading="lazy"
    />
  );
}

export default Index;
