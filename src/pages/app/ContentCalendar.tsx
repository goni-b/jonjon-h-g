import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleCategory } from "@/types/user";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  mockContentItems, ContentItem, ContentPlatform, ContentStatus,
  contentStatusConfig, platformConfig, contentTypeConfig, GANTT_PLATFORMS,
} from "@/data/shootDaysMock";
import {
  ChevronLeft, ChevronRight, X, CalendarDays, Users, Tag,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TO_ID: Record<string, string> = { "3": "c1" };
const COL_WIDTH = 52;     // px per day
const ROW_HEIGHT = 72;    // px per platform row

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DAYS_SHORT = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(d.getDate() + n); return r;
}
function startOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1);
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function isoToHe(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ─── Content Block Detail Card ────────────────────────────────────────────────

function ContentDetailCard({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const plt = platformConfig[item.platform];
  const sc  = contentStatusConfig[item.status];
  const typ = contentTypeConfig[item.contentType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}>
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-[340px] overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}>
        <div className={`h-1.5 w-full ${sc.activeCls.split(" ")[0]}`} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-lg">{plt.iconEmoji}</span>
                <span className={`text-[10px] font-bold ${plt.textColor}`}>{plt.label}</span>
                <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{typ.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.activeCls}`}>{sc.label}</span>
              </div>
              <h3 className="font-bold text-foreground leading-snug">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.clientName}</p>
            </div>
            <button type="button" onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0 ml-2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>דד-ליין: <span className="font-medium text-foreground">{isoToHe(item.dueDate)}</span></span>
              {item.publishDate && (
                <span className="mr-2">פרסום: <span className="font-medium text-foreground">{isoToHe(item.publishDate)}</span></span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <div className="flex items-center gap-1.5">
                <UserAvatar name={item.assigneeName} size="sm" />
                <span className="text-foreground">{item.assigneeName}</span>
              </div>
            </div>
            {item.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {item.tags.map((t) => (
                  <span key={t} className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{t}</span>
                ))}
              </div>
            )}
            {item.description && (
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl px-3 py-2 mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gantt Content Block ──────────────────────────────────────────────────────

function ContentBlock({
  item, rangeStart, totalDays, onClick,
}: {
  item: ContentItem; rangeStart: Date; totalDays: number;
  onClick: () => void;
}) {
  const dueDate = new Date(item.dueDate + "T12:00:00");
  const dayIdx  = diffDays(rangeStart, dueDate);

  // Only show if within range
  if (dayIdx < 0 || dayIdx >= totalDays) return null;

  const sc  = contentStatusConfig[item.status];
  const typ = contentTypeConfig[item.contentType];

  // Block spans 2 days width (or 1 at edge)
  const blockWidth = Math.min(COL_WIDTH * 2 - 4, (totalDays - dayIdx) * COL_WIDTH - 4);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${item.title} · ${sc.label}`}
      style={{
        position: "absolute",
        left:   dayIdx * COL_WIDTH + 2,
        top:    8,
        width:  blockWidth,
        height: ROW_HEIGHT - 16,
      }}
      className={`
        rounded-lg px-2 py-1 text-left flex flex-col justify-between
        cursor-pointer hover:brightness-95 transition-all shadow-sm border border-white/20
        ${sc.ganttCls} text-white overflow-hidden
      `}
    >
      <p className="text-[11px] font-semibold truncate leading-tight">{item.title}</p>
      <div className="flex items-center justify-between text-[9px] opacity-80">
        <span>{typ.label}</span>
        <span>{isoToHe(item.dueDate)}</span>
      </div>
    </button>
  );
}

// ─── Platform Row ─────────────────────────────────────────────────────────────

function PlatformRow({
  platform, items, rangeStart, totalDays, todayIdx, onItemClick,
}: {
  platform: ContentPlatform;
  items: ContentItem[];
  rangeStart: Date;
  totalDays: number;
  todayIdx: number;
  onItemClick: (item: ContentItem) => void;
}) {
  const plt = platformConfig[platform];

  return (
    <div className="flex border-b border-border/40 last:border-b-0"
      style={{ height: ROW_HEIGHT }}>
      {/* Platform label */}
      <div className="shrink-0 w-28 flex items-center gap-2 px-3 border-r border-border/40 bg-background sticky left-0 z-10">
        <span className="text-base">{plt.iconEmoji}</span>
        <span className="text-xs font-semibold text-foreground">{plt.label}</span>
      </div>

      {/* Timeline area */}
      <div className="flex-1 relative" style={{ minWidth: totalDays * COL_WIDTH }}>
        {/* Today column highlight */}
        {todayIdx >= 0 && todayIdx < totalDays && (
          <div
            className="absolute top-0 bottom-0 bg-yellow-50 border-x border-yellow-200/60 z-0"
            style={{ left: todayIdx * COL_WIDTH, width: COL_WIDTH }}
          />
        )}

        {/* Content blocks */}
        {items
          .filter((i) => i.platform === platform)
          .map((item) => (
            <ContentBlock
              key={item.id}
              item={item}
              rangeStart={rangeStart}
              totalDays={totalDays}
              onClick={() => onItemClick(item)}
            />
          ))}
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function StatusLegend() {
  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
      <span className="text-muted-foreground font-medium">סטטוס:</span>
      {Object.entries(contentStatusConfig).map(([s, cfg]) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-sm ${cfg.ganttCls}`} />
          <span className="text-muted-foreground">{cfg.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentCalendar() {
  const { user } = useAuth();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [viewMode,    setViewMode]    = useState<"2weeks" | "month">("2weeks");
  const [rangeOffset, setRangeOffset] = useState(0); // weeks or months offset from today
  const [selected,    setSelected]    = useState<ContentItem | null>(null);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const category   = getRoleCategory(user.role);
  const myClientId = category === "client" ? (CLIENT_TO_ID[user.id] ?? user.id) : null;

  // Compute date range
  const { rangeStart, totalDays, rangeLabel } = useMemo(() => {
    if (viewMode === "2weeks") {
      const base  = addDays(today, rangeOffset * 14);
      const start = addDays(base, -base.getDay()); // week start (Sun)
      const days  = 14;
      const end   = addDays(start, days - 1);
      const label = `${start.getDate()} ${MONTHS_HE[start.getMonth()]} – ${end.getDate()} ${MONTHS_HE[end.getMonth()]} ${end.getFullYear()}`;
      return { rangeStart: start, totalDays: days, rangeLabel: label };
    } else {
      const base  = new Date(today.getFullYear(), today.getMonth() + rangeOffset, 1);
      const days  = daysInMonth(base.getFullYear(), base.getMonth());
      const label = `${MONTHS_HE[base.getMonth()]} ${base.getFullYear()}`;
      return { rangeStart: base, totalDays: days, rangeLabel: label };
    }
  }, [viewMode, rangeOffset]);

  // Build range dates
  const rangeDates = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i)),
    [rangeStart, totalDays]
  );

  const todayIdx = diffDays(rangeStart, today);

  // Filter content items
  const visibleItems = useMemo(() => {
    let list = mockContentItems;
    if (myClientId)          list = list.filter((i) => i.clientId === myClientId);
    if (clientFilter !== "all") list = list.filter((i) => i.clientId === clientFilter);
    return list;
  }, [myClientId, clientFilter]);

  const CLIENTS = [
    { id: "c1", name: "בוטיק מיה" },
    { id: "c2", name: "שיפוץ בית" },
    { id: "c3", name: "גלריית אמנות ירדן" },
    { id: "c4", name: "קליניקת ד״ר לוי" },
    { id: "c5", name: "סטודיו פילאטיס גל" },
  ];

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Detail popup */}
      {selected && <ContentDetailCard item={selected} onClose={() => setSelected(null)} />}

      <PageHeader
        title="גאנט תוכן"
        description="תצוגת ציר-זמן של כל תכני הסוכנות לפי פלטפורמה"
      />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
          {([["2weeks","שבועיים"], ["month","חודש"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => { setViewMode(v); setRangeOffset(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${viewMode === v ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Period navigation */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setRangeOffset(0)}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            היום
          </button>
          <button type="button" onClick={() => setRangeOffset((p) => p - 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setRangeOffset((p) => p + 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <span className="text-sm font-semibold text-foreground min-w-[200px]">{rangeLabel}</span>

        {/* Client filter (admin/team only) */}
        {!myClientId && (
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="mr-auto text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">כל הלקוחות</option>
            {CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Legend */}
      <div className="mb-3">
        <StatusLegend />
      </div>

      {/* Gantt grid */}
      <div className="flex-1 overflow-auto rounded-2xl border border-border bg-background shadow-sm" ref={scrollRef}>
        {/* Header: date row */}
        <div className="flex sticky top-0 z-20 bg-background border-b border-border shadow-sm" dir="ltr">
          {/* Platform label column */}
          <div className="w-28 shrink-0 border-r border-border/40 bg-background" />

          {/* Date columns */}
          <div className="flex" style={{ minWidth: totalDays * COL_WIDTH }}>
            {rangeDates.map((d, i) => {
              const isToday  = toISO(d) === toISO(today);
              const isSunday = d.getDay() === 0;
              return (
                <div key={i}
                  style={{ width: COL_WIDTH }}
                  className={`shrink-0 border-r border-border/30 last:border-r-0 py-2 text-center
                    ${isToday ? "bg-yellow-50" : isSunday ? "bg-muted/20" : ""}`}
                >
                  <p className="text-[9px] text-muted-foreground">{DAYS_SHORT[d.getDay()]}</p>
                  <p className={`text-xs font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform rows */}
        <div dir="ltr">
          {GANTT_PLATFORMS.map((platform) => {
            const platformItems = visibleItems.filter((i) => i.platform === platform);
            return (
              <PlatformRow
                key={platform}
                platform={platform}
                items={platformItems}
                rangeStart={rangeStart}
                totalDays={totalDays}
                todayIdx={todayIdx}
                onItemClick={setSelected}
              />
            );
          })}

          {/* "Other" row */}
          {(() => {
            const otherItems = visibleItems.filter((i) => !GANTT_PLATFORMS.includes(i.platform));
            if (otherItems.length === 0) return null;
            return (
              <PlatformRow
                key="other"
                platform="other"
                items={otherItems}
                rangeStart={rangeStart}
                totalDays={totalDays}
                todayIdx={todayIdx}
                onItemClick={setSelected}
              />
            );
          })()}
        </div>

        {/* Empty state */}
        {visibleItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-3xl">📭</p>
            <p className="text-sm text-muted-foreground">אין תכנים להצגה בתקופה זו</p>
          </div>
        )}
      </div>
    </div>
  );
}
