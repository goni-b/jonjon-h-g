import { useState, useRef } from "react";
import { Check, Lock, MapPin, CheckCircle2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { DashboardCard } from "@/data/dashboardMock";
import { defaultRoadmapStages } from "@/data/roadmapDefaults";

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  expectedDate: string;
  status: "completed" | "current" | "upcoming" | "locked";
  tasks?: string[];
}

interface ClientRoadmapProps {
  stages?: RoadmapStage[];
  currentStageId?: string;
  clientAvatar?: string;
  clientName?: string;
  stats?: DashboardCard[];
}

const GRID_CELL = 240;
const START_X = 800;
const START_Y = 150;

const STAGE_POSITIONS = [
  { x: START_X, y: START_Y },
  { x: START_X - GRID_CELL, y: START_Y },
  { x: START_X - 2 * GRID_CELL, y: START_Y },
  { x: START_X - 3 * GRID_CELL, y: START_Y },
  { x: START_X - 3 * GRID_CELL, y: START_Y + GRID_CELL },
  { x: START_X - 2 * GRID_CELL, y: START_Y + GRID_CELL },
  { x: START_X - GRID_CELL, y: START_Y + GRID_CELL },
  { x: START_X, y: START_Y + GRID_CELL },
  { x: START_X, y: START_Y + 2 * GRID_CELL },
  { x: START_X - GRID_CELL, y: START_Y + 2 * GRID_CELL },
  { x: START_X - 2 * GRID_CELL, y: START_Y + 2 * GRID_CELL },
];

const statColorMap: Record<string, string> = {
  primary: "text-amber-700 bg-amber-50 border-amber-200",
  accent:  "text-amber-600 bg-amber-50 border-amber-200",
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-orange-500 bg-orange-50 border-orange-200",
  info:    "text-blue-600 bg-blue-50 border-blue-200",
};

export function ClientRoadmap({
  stages = defaultRoadmapStages,
  currentStageId,
  clientAvatar,
  clientName = "הלקוח",
  stats,
}: ClientRoadmapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState("grab");

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStageId = currentStageId ?? stages.find((s) => s.status === "current")?.id;
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedCount / stages.length) * 100);
  const currentStage = stages.find((s) => s.id === activeStageId);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setCursorStyle("grabbing");
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    // Only register as a real drag after a small movement threshold
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setHoveredId(null);
    setDragOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const onMouseUp = () => {
    isDragging.current = false;
    setCursorStyle("grab");
  };

  // ── Hover popup ───────────────────────────────────────────────────────────
  const handleNodeEnter = (id: string, el: HTMLElement) => {
    if (isDragging.current) return;
    const rect = el.getBoundingClientRect();
    setPopupPos({ x: rect.left + rect.width / 2, y: rect.top });
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredId(id);
  };

  const handleNodeLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredId(null), 180);
  };

  const keepPopupOpen = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const closePopup = () => {
    hoverTimeout.current = setTimeout(() => setHoveredId(null), 180);
  };

  const hoveredStage = stages.find((s) => s.id === hoveredId);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-8 pt-5 pb-4 border-b border-border/40 bg-white">
        <div>
          <h2 className="text-xl font-bold text-foreground">מפת הדרכים לפרויקט</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            עברו עם העכבר על נקודה לפרטים &nbsp;·&nbsp; גררו להזזת המפה
          </p>
        </div>

        <div className="flex items-center gap-6">
          {currentStage && (
            <div className="hidden sm:block text-left border-r border-border/40 pr-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">שלב נוכחי</p>
              <p className="text-sm font-semibold text-primary mt-0.5">{currentStage.title}</p>
            </div>
          )}
          <div className="text-left">
            <span className="text-3xl font-bold text-primary">{progress}%</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {completedCount}/{stages.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Map ── */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          cursor: cursorStyle,
          perspective: "1000px",
          background: "radial-gradient(ellipse at 50% 40%, #fffbf0 0%, #F8F9FB 65%)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Panning layer */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
        >
          {/* Isometric container */}
          <div
            className="relative w-[1100px] h-[800px]"
            style={{
              transform: "rotateX(55deg) rotateZ(-45deg) scale(0.85) translate3d(0, -100px, 0)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* SVG path connectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {stages.map((stage, i) => {
                if (i === 0) return null;
                const prev = STAGE_POSITIONS[i - 1];
                const curr = STAGE_POSITIONS[i];
                const isActive = stage.status === "completed" || stage.status === "current";
                const isCurrent = stage.status === "current";
                return (
                  <line
                    key={`line-${i}`}
                    x1={prev.x} y1={prev.y}
                    x2={curr.x} y2={curr.y}
                    stroke={isActive ? "#D4AF37" : "#e2e8f0"}
                    strokeWidth={isActive ? "6" : "4"}
                    strokeDasharray={isCurrent ? "14 8" : "0"}
                    strokeLinecap="round"
                    filter={isActive ? "url(#glow)" : undefined}
                    opacity={isActive ? 1 : 0.6}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {stages.map((stage, i) => {
              const pos = STAGE_POSITIONS[i];
              const isCompleted = stage.status === "completed";
              const isCurrent = stage.id === activeStageId;
              const isLocked = stage.status === "locked";

              return (
                <div
                  key={stage.id}
                  className="absolute"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: "translate3d(-50%, -50%, 0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Drop shadow */}
                  <div
                    className="absolute inset-0 rounded-full bg-black/10 blur-lg"
                    style={{ transform: "scale(1.6) translate3d(0, 10px, -2px)" }}
                  />

                  {/* Node */}
                  <button
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-200 z-10 outline-none ${
                      isCompleted
                        ? "bg-primary border-white text-white shadow-[0_4px_16px_rgba(212,175,55,0.45)]"
                        : isCurrent
                        ? "bg-white border-primary text-primary shadow-[0_0_24px_rgba(212,175,55,0.55)] scale-125"
                        : isLocked
                        ? "bg-slate-100 border-white/80 text-muted-foreground/40 shadow-sm"
                        : "bg-white border-slate-200 text-muted-foreground shadow-sm hover:border-primary/40 hover:scale-110"
                    }`}
                    onMouseEnter={(e) => handleNodeEnter(stage.id, e.currentTarget)}
                    onMouseLeave={handleNodeLeave}
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: "all" }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      clientAvatar ? (
                        <UserAvatar name={clientName} avatar={clientAvatar} size="sm" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-bold">{i + 1}</span>
                    )}
                  </button>

                  {/* Pulse ring for current stage */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Floating popup — rendered outside 3D transforms via fixed ── */}
      {hoveredStage && (
        <div
          className="fixed z-[9999] pointer-events-auto"
          style={{
            left: popupPos.x,
            top: popupPos.y,
            transform: "translate(-50%, calc(-100% - 18px))",
          }}
          onMouseEnter={keepPopupOpen}
          onMouseLeave={closePopup}
        >
          <div className="w-64 bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] border border-border/60 overflow-hidden">
            {/* Status stripe */}
            <div
              className={`h-1.5 w-full ${
                hoveredStage.status === "completed"
                  ? "bg-primary"
                  : hoveredStage.status === "current"
                  ? "bg-primary animate-pulse"
                  : hoveredStage.status === "upcoming"
                  ? "bg-blue-400"
                  : "bg-muted"
              }`}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4
                  className={`font-bold text-sm leading-snug ${
                    hoveredStage.status === "current" ? "text-primary" : "text-foreground"
                  }`}
                >
                  {hoveredStage.title}
                </h4>
                <span className="shrink-0 text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {hoveredStage.expectedDate}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {hoveredStage.description}
              </p>
              {hoveredStage.tasks && hoveredStage.tasks.length > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 mb-2 font-medium">
                    משימות
                  </p>
                  <ul className="space-y-1.5">
                    {hoveredStage.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            hoveredStage.status === "completed" ? "text-primary" : "text-muted-foreground/30"
                          }`}
                        />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 bg-white border-b border-r border-border/60" />
        </div>
      )}

      {/* ── Stats bar ── */}
      {stats && stats.length > 0 && (
        <div className="shrink-0 border-t border-border/40 bg-white px-8 py-4">
          <div
            className={`grid gap-3 ${
              stats.length <= 2
                ? "grid-cols-2"
                : stats.length === 3
                ? "grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              const colors = statColorMap[stat.color] ?? statColorMap.info;
              return (
                <div
                  key={stat.title}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${colors}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-base font-bold leading-none">{stat.value}</p>
                    <p className="text-[11px] mt-0.5 opacity-70 leading-tight">{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
