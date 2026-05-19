import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, getRoleCategory } from "@/types/user";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  mockEvents, CalendarEvent, EventType, eventTypeConfig,
} from "@/data/eventsMock";
import {
  Plus, ChevronLeft, ChevronRight, X, MapPin, Clock, Users, CalendarDays,
  AlignLeft, ExternalLink,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_HEIGHT  = 64;    // px per hour
const START_HOUR   = 6;     // 6 AM
const END_HOUR     = 22;    // 10 PM
const HOURS        = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;

const DAYS_SHORT_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const MONTHS_HE     = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const EVENT_BG: Record<EventType, string> = {
  shoot_day:       "bg-purple-100 border-l-4 border-purple-500 text-purple-900",
  meeting:         "bg-blue-100   border-l-4 border-blue-500   text-blue-900",
  deadline:        "bg-red-100    border-l-4 border-red-500    text-red-900",
  campaign_launch: "bg-green-100  border-l-4 border-green-500  text-green-900",
  other:           "bg-slate-100  border-l-4 border-slate-400  text-slate-800",
};

const CLIENT_USER_TO_CLIENT_ID: Record<string, string> = { "3": "c1" };

const MOCK_CLIENTS = [
  { id: "c1", name: "בוטיק מיה" },
  { id: "c2", name: "שיפוץ בית" },
  { id: "c3", name: "גלריית אמנות ירדן" },
  { id: "c4", name: "קליניקת ד״ר לוי" },
  { id: "c5", name: "סטודיו פילאטיס גל" },
];

const EVENT_TYPES: EventType[] = ["meeting", "shoot_day", "deadline", "campaign_launch", "other"];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getSunday(d: Date): Date {
  const r = new Date(d);
  r.setDate(d.getDate() - d.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function pad(n: number) { return String(n).padStart(2, "0"); }
function isoToHe(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function formatHour(h: number): string {
  if (h === 0)  return "12 AM";
  if (h < 12)   return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
function formatDateLabel(d: Date): string {
  return `${DAYS_SHORT_HE[d.getDay()]} ${d.getDate()} ${MONTHS_HE[d.getMonth()]}`;
}
function addOneHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const nh = Math.min(h + 1, 23);
  return `${pad(nh)}:${pad(m)}`;
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

function googleCalendarUrl(event: CalendarEvent): string {
  const [y, m, d] = event.date.split("-");
  let dateStr: string;
  if (event.time) {
    const [hh, mm] = event.time.split(":");
    const start = `${y}${m}${d}T${hh}${mm}00`;
    const endH  = String(Math.min(Number(hh) + 1, 23)).padStart(2, "0");
    const endTime = event.endTime
      ? `${y}${m}${d}T${event.endTime.replace(":", "")}00`
      : `${y}${m}${d}T${endH}${mm}00`;
    dateStr = `${start}/${endTime}`;
  } else {
    const next = new Date(Number(y), Number(m) - 1, Number(d) + 1);
    dateStr = `${y}${m}${d}/${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  }
  const params = new URLSearchParams({
    text:     event.title,
    dates:    dateStr,
    details:  [event.description, event.clientName ? `לקוח: ${event.clientName}` : ""].filter(Boolean).join("\n"),
    location: event.location ?? "",
    sf:       "true",
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

function GoogleCalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="white" stroke="#dadce0" strokeWidth="1.5"/>
      <path d="M16 2v4M8 2v4M3 9h18" stroke="#dadce0" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#4285F4"/>
      <rect x="13" y="13" width="4" height="4" rx="0.5" fill="#34A853"/>
      <rect x="7"  y="7"  width="4" height="4" rx="0.5" fill="#FBBC05"/>
      <rect x="13" y="7"  width="4" height="4" rx="0.5" fill="#EA4335"/>
    </svg>
  );
}

// ─── Event positioning ────────────────────────────────────────────────────────

function getEventStyle(event: CalendarEvent): { top: number; height: number } | null {
  if (!event.time) return null;
  const [sh, sm] = event.time.split(":").map(Number);
  if (sh < START_HOUR || sh >= END_HOUR) return null;
  const [eh, em] = event.endTime
    ? event.endTime.split(":").map(Number)
    : [Math.min(sh + 1, END_HOUR), sm];
  const top    = (sh - START_HOUR + sm / 60) * HOUR_HEIGHT;
  const height = Math.max(((eh - sh) + (em - sm) / 60) * HOUR_HEIGHT, 28);
  return { top, height };
}

// ─── Mini Calendar (for date input inside popup) ───────────────────────────────

function MiniCalendarPicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const init = value ? new Date(value + "T12:00:00") : new Date();
  const [v, setV] = useState({ y: init.getFullYear(), m: init.getMonth() });

  const firstDow    = new Date(v.y, v.m, 1).getDay();
  const daysInMonth = new Date(v.y, v.m + 1, 0).getDate();
  const today       = new Date(); today.setHours(0, 0, 0, 0);
  const selMs       = value ? new Date(value + "T12:00:00").setHours(0, 0, 0, 0) : null;
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const nav = (d: number) => {
    let nm = v.m + d, ny = v.y;
    if (nm < 0)  { nm = 11; ny--; }
    if (nm > 11) { nm = 0;  ny++; }
    setV({ y: ny, m: nm });
  };

  return (
    <div className="w-full bg-white rounded-xl border border-border p-3 select-none" dir="ltr">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => nav(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">‹</button>
        <span className="text-xs font-semibold">{MONTHS_HE[v.m].toUpperCase()} {v.y}</span>
        <button type="button" onClick={() => nav(1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT_HE.map((d) => <div key={d} className="text-center text-[9px] font-medium text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ms   = new Date(v.y, v.m, d).setHours(0, 0, 0, 0);
          const isTod = ms === today.getTime();
          const isSel = selMs !== null && ms === selMs;
          const iso   = `${v.y}-${pad(v.m + 1)}-${pad(d)}`;
          return (
            <button key={d} type="button" onClick={() => onChange(iso)}
              className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all font-medium
                ${isSel ? "bg-primary text-primary-foreground" : isTod ? "bg-yellow-100 text-yellow-700" : "hover:bg-muted text-foreground"}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Event Detail Card ────────────────────────────────────────────────────────

function EventDetailCard({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const cfg = eventTypeConfig[event.type];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-[320px] overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}>
        {/* Color header */}
        <div className={`h-2 w-full ${cfg.dotColor}`} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.chipCls} border`}>
                {cfg.iconEmoji} {cfg.label}
              </span>
              <h3 className="font-bold text-foreground mt-2 leading-snug">{event.title}</h3>
              {event.clientName && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.clientName}</p>
              )}
            </div>
            <button type="button" onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0 ml-2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>{isoToHe(event.date)}</span>
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                </span>
              )}
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-xs"
                >
                  {event.location}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {event.assigneeNames.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <div className="flex items-center gap-1">
                  {event.assigneeNames.map((n) => <UserAvatar key={n} name={n} size="sm" />)}
                </div>
              </div>
            )}

            {event.description && (
              <p className="text-muted-foreground text-xs leading-relaxed border-t border-border pt-2 mt-1">
                {event.description}
              </p>
            )}
          </div>

          <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl
              bg-white border border-border hover:shadow-sm transition-all w-full justify-center"
          >
            <GoogleCalendarIcon />
            הוסף ליומן גוגל
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Add Schedule Popup ───────────────────────────────────────────────────────

function AddSchedulePopup({
  defaultDate, defaultTime, currentUser, onClose, onAdd,
}: {
  defaultDate: string; defaultTime?: string;
  currentUser: User;
  onClose: () => void;
  onAdd: (ev: CalendarEvent) => void;
}) {
  const [title,     setTitle]     = useState("");
  const [type,      setType]      = useState<EventType>("meeting");
  const [date,      setDate]      = useState(defaultDate);
  const [startTime, setStart]     = useState(defaultTime ?? "10:00");
  const [endTime,   setEnd]       = useState(defaultTime ? addOneHour(defaultTime) : "11:00");
  const [location,  setLocation]  = useState("");
  const [desc,      setDesc]      = useState("");
  const [clientId,  setClientId]  = useState("");
  const [showCal,   setShowCal]   = useState(false);
  const [error,     setError]     = useState("");
  const [created,   setCreated]   = useState<CalendarEvent | null>(null);
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) { setError("כותרת האירוע היא שדה חובה"); return; }
    const client = MOCK_CLIENTS.find((c) => c.id === clientId);
    const newEv: CalendarEvent = {
      id:            `ev${Date.now()}`,
      title:         title.trim(),
      description:   desc.trim(),
      type,
      clientId,
      clientName:    client?.name ?? "פנים סוכנות",
      date,
      time:          startTime || undefined,
      endTime:       endTime || undefined,
      location:      location || undefined,
      assigneeIds:   [currentUser.id],
      assigneeNames: [currentUser.name],
      createdById:   currentUser.id,
    };
    onAdd(newEv);
    setCreated(newEv);
  };

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })
    : "בחר תאריך";

  const rowCls = "flex items-center gap-3 text-sm text-foreground";
  const iconCls = "w-4 h-4 text-muted-foreground shrink-0";

  // ── Success screen
  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-[360px] p-8 text-center border border-border">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
          <p className="text-lg font-bold mb-1">האירוע נוסף!</p>
          <p className="text-sm text-muted-foreground mb-1">{created.title}</p>
          <p className="text-xs text-muted-foreground mb-6">
            {isoToHe(created.date)}{created.time ? ` · ${created.time}` : ""}
          </p>
          <a href={googleCalendarUrl(created)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-white border border-border rounded-2xl
              px-5 py-3 text-sm font-semibold hover:shadow-md transition-all mx-auto mb-3 hover:border-primary/30">
            <GoogleCalendarIcon />
            פתח ביומן גוגל
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
          <button type="button" onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" dir="rtl">
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-[380px] overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <span className="text-sm font-semibold text-muted-foreground">הוסף אירוע</span>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-1.5">{error}</p>}

          {/* Title */}
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="כותרת האירוע..."
            className="w-full text-base font-medium border border-blue-200 rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all
              placeholder:text-muted-foreground/60 text-right"
          />

          {/* Event type */}
          <div className={rowCls}>
            <div className={`w-3 h-3 rounded-full ${eventTypeConfig[type].dotColor} shrink-0`} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{eventTypeConfig[t].iconEmoji} {eventTypeConfig[t].label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <button type="button"
              onClick={() => setShowCal((v) => !v)}
              className={`${rowCls} hover:bg-muted/50 rounded-xl px-2 py-1.5 -mx-2 transition-colors`}
            >
              <CalendarDays className={iconCls} />
              <span className={`flex-1 text-right ${!date ? "text-muted-foreground" : ""}`}>{formattedDate}</span>
            </button>
            {showCal && (
              <MiniCalendarPicker value={date} onChange={(iso) => { setDate(iso); setShowCal(false); }} />
            )}
          </div>

          {/* Time */}
          <div className={rowCls}>
            <Clock className={iconCls} />
            <input type="time" value={startTime} onChange={(e) => setStart(e.target.value)} dir="ltr"
              className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <span className="text-muted-foreground">–</span>
            <input type="time" value={endTime} onChange={(e) => setEnd(e.target.value)} dir="ltr"
              className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          {/* Client */}
          <div className={rowCls}>
            <Users className={iconCls} />
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}
              className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring bg-white">
              <option value="">פנים סוכנות</option>
              {MOCK_CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className={rowCls}>
            <MapPin className={iconCls} />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="הוסף מיקום (אופציונלי)"
              className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 text-right" />
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <AlignLeft className={`${iconCls} mt-1.5`} />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="הוסף תיאור (אופציונלי)" rows={2}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground/60 text-right" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted">
            ביטול
          </button>
          <button type="button" onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  weekDates, eventMap, todayISO, canManage,
  onEventClick, onSlotClick,
}: {
  weekDates: Date[];
  eventMap: Record<string, CalendarEvent[]>;
  todayISO: string;
  canManage: boolean;
  onEventClick: (ev: CalendarEvent) => void;
  onSlotClick: (iso: string, time: string) => void;
}) {
  // Current time indicator
  const now = new Date();
  const currentTimeTop = (now.getHours() - START_HOUR + now.getMinutes() / 60) * HOUR_HEIGHT;
  const showTimeLine   = now.getHours() >= START_HOUR && now.getHours() < END_HOUR;

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-background border-b border-border flex" dir="ltr">
        <div className="w-16 shrink-0 border-r border-border" />
        {weekDates.map((d) => {
          const iso     = toISO(d);
          const isToday = iso === todayISO;
          return (
            <div key={iso} className={`flex-1 text-center py-3 border-r border-border last:border-r-0
              ${isToday ? "bg-primary/5" : ""}`}
            >
              <p className="text-[11px] font-medium text-muted-foreground">{DAYS_SHORT_HE[d.getDay()]}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold
                ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row */}
      {weekDates.some((d) => (eventMap[toISO(d)] ?? []).some((ev) => !ev.time)) && (
        <div className="flex border-b border-border bg-muted/20" dir="ltr">
          <div className="w-16 shrink-0 border-r border-border px-1 py-1 text-[9px] text-muted-foreground text-center">כל היום</div>
          {weekDates.map((d) => {
            const iso       = toISO(d);
            const allDay    = (eventMap[iso] ?? []).filter((ev) => !ev.time);
            const isToday   = iso === todayISO;
            return (
              <div key={iso} className={`flex-1 border-r border-border last:border-r-0 py-1 px-1 min-h-[32px] ${isToday ? "bg-primary/5" : ""}`}>
                {allDay.map((ev) => {
                  const cfg = eventTypeConfig[ev.type];
                  return (
                    <button key={ev.id} type="button"
                      onClick={() => onEventClick(ev)}
                      className={`w-full text-right text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate mb-0.5 border ${cfg.chipCls}`}
                    >
                      {cfg.iconEmoji} {ev.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex relative" dir="ltr" style={{ height: TOTAL_HEIGHT }}>
        {/* Time axis */}
        <div className="w-16 shrink-0 relative border-r border-border">
          {HOURS.map((h) => (
            <div key={h} className="absolute w-full flex justify-end pr-2"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT - 8 }}>
              <span className="text-[10px] text-muted-foreground font-medium">{formatHour(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((d) => {
          const iso       = toISO(d);
          const isToday   = iso === todayISO;
          const dayEvents = (eventMap[iso] ?? []).filter((ev) => !!ev.time);

          return (
            <div key={iso}
              className={`flex-1 relative border-r border-border last:border-r-0 ${isToday ? "bg-primary/[0.02]" : ""}`}
              style={{ height: TOTAL_HEIGHT }}
            >
              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div key={h} className="absolute w-full border-t border-border/40"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
              ))}

              {/* Half-hour lines */}
              {HOURS.map((h) => (
                <div key={`h${h}`} className="absolute w-full border-t border-border/20"
                  style={{ top: (h - START_HOUR + 0.5) * HOUR_HEIGHT }} />
              ))}

              {/* Current time line */}
              {isToday && showTimeLine && (
                <div className="absolute w-full z-20 flex items-center pointer-events-none"
                  style={{ top: currentTimeTop }}>
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                  <div className="flex-1 border-t-2 border-red-500" />
                </div>
              )}

              {/* Clickable background for adding events */}
              <div className="absolute inset-0 cursor-pointer z-0"
                onClick={(e) => {
                  if (!canManage) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relY  = e.clientY - rect.top;
                  const hour  = Math.floor(relY / HOUR_HEIGHT) + START_HOUR;
                  const mins  = Math.round((relY % HOUR_HEIGHT) / HOUR_HEIGHT * 60 / 15) * 15;
                  onSlotClick(iso, `${pad(hour)}:${pad(mins)}`);
                }}
              />

              {/* Event blocks */}
              {dayEvents.map((ev) => {
                const style = getEventStyle(ev);
                if (!style) return null;
                return (
                  <button key={ev.id} type="button"
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    style={{ top: style.top, height: style.height }}
                    className={`absolute left-1 right-1 rounded-lg px-2 py-1 text-xs z-10 cursor-pointer
                      overflow-hidden text-right hover:brightness-95 transition-all shadow-sm
                      ${EVENT_BG[ev.type]}`}
                  >
                    <p className="font-semibold truncate leading-tight">{ev.title}</p>
                    {ev.time && style.height > 40 && (
                      <p className="opacity-70 text-[10px]">
                        {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}
                      </p>
                    )}
                    {ev.location && style.height > 56 && (
                      <p className="opacity-70 text-[10px] flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 inline shrink-0" />{ev.location}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month View (fallback) ────────────────────────────────────────────────────

function MonthView({
  view, events, todayISO, canManage,
  onDateClick, onEventClick,
}: {
  view: { y: number; m: number };
  events: CalendarEvent[];
  todayISO: string;
  canManage: boolean;
  onDateClick: (iso: string) => void;
  onEventClick: (ev: CalendarEvent) => void;
}) {
  const DAYS_HE = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
  const firstDow    = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventMap = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => { if (!m[ev.date]) m[ev.date] = []; m[ev.date].push(ev); });
    return m;
  }, [events]);

  return (
    <div className="flex-1 overflow-auto px-1">
      <div className="grid grid-cols-7 mb-1" dir="ltr">
        {DAYS_HE.map((d) => <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 pb-6" dir="ltr">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="min-h-[110px]" />;
          const iso       = `${view.y}-${pad(view.m + 1)}-${pad(day)}`;
          const isToday   = iso === todayISO;
          const dayEvts   = eventMap[iso] ?? [];
          return (
            <div key={iso}
              onClick={() => canManage && onDateClick(iso)}
              className={`min-h-[110px] rounded-xl p-1.5 border flex flex-col gap-1 transition-all
                ${canManage ? "cursor-pointer" : ""}
                ${isToday ? "bg-yellow-50 border-yellow-200" : "border-border/40 hover:border-border hover:bg-muted/20"}`}
            >
              <span className={`text-sm font-semibold self-end w-7 h-7 flex items-center justify-center rounded-full
                ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {day}
              </span>
              {dayEvts.slice(0, 3).map((ev) => {
                const cfg = eventTypeConfig[ev.type];
                return (
                  <button key={ev.id} type="button"
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className={`w-full text-right px-1.5 py-0.5 rounded-md text-[11px] font-medium truncate border ${cfg.chipCls}`}
                  >
                    {cfg.iconEmoji} {ev.title}
                  </button>
                );
              })}
              {dayEvts.length > 3 && (
                <span className="text-[10px] text-muted-foreground px-1">+{dayEvts.length - 3} נוספים</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user } = useAuth();
  const today    = new Date();
  const todayISO = toISO(today);

  const [viewMode,  setViewMode]  = useState<"week" | "month">("week");
  const [events,    setEvents]    = useState<CalendarEvent[]>(mockEvents);
  const [weekStart, setWeekStart] = useState(() => getSunday(today));
  const [monthView, setMonthView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const [addPopup,  setAddPopup]  = useState<{ date: string; time?: string } | null>(null);
  const [detailEv,  setDetailEv]  = useState<CalendarEvent | null>(null);

  if (!user) return null;

  const category  = getRoleCategory(user.role);
  const canManage = category === "admin" || category === "team";

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const eventMap = useMemo(() => {
    let list = events;
    if (category === "client") {
      const myClientId = CLIENT_USER_TO_CLIENT_ID[user.id] ?? "";
      list = list.filter((ev) => ev.clientId === myClientId);
    } else if (category === "team") {
      list = list.filter((ev) => ev.assigneeIds.includes(user.id) || user.assignedClients.includes(ev.clientId) || !ev.clientId);
    }
    const m: Record<string, CalendarEvent[]> = {};
    list.forEach((ev) => { if (!m[ev.date]) m[ev.date] = []; m[ev.date].push(ev); });
    return m;
  }, [events, user, category]);

  const navWeek = (d: number) => setWeekStart((p) => addDays(p, d * 7));
  const navMonth = (d: number) => setMonthView((p) => {
    let nm = p.m + d, ny = p.y;
    if (nm < 0)  { nm = 11; ny--; }
    if (nm > 11) { nm = 0;  ny++; }
    return { y: ny, m: nm };
  });

  const goToday = () => {
    setWeekStart(getSunday(today));
    setMonthView({ y: today.getFullYear(), m: today.getMonth() });
  };

  const weekLabel = (() => {
    const s = weekDates[0], e = weekDates[6];
    if (s.getMonth() === e.getMonth()) return `${s.getDate()}–${e.getDate()} ${MONTHS_HE[s.getMonth()]} ${s.getFullYear()}`;
    return `${s.getDate()} ${MONTHS_HE[s.getMonth()]} – ${e.getDate()} ${MONTHS_HE[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const monthLabel = `${MONTHS_HE[monthView.m]} ${monthView.y}`;

  const handleAddEvent = (ev: CalendarEvent) => {
    setEvents((p) => [...p, ev]);
    // If week view, navigate to event's week
    if (viewMode === "week") {
      const evDate = new Date(ev.date + "T12:00:00");
      setWeekStart(getSunday(evDate));
    } else {
      const [y, m] = ev.date.split("-").map(Number);
      setMonthView({ y, m: m - 1 });
    }
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
          {(["week", "month"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${viewMode === v ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {v === "week" ? "שבוע" : "חודש"}
            </button>
          ))}
        </div>

        {/* Period label */}
        <span className="text-sm font-semibold text-foreground min-w-[200px]">
          {viewMode === "week" ? weekLabel : monthLabel}
        </span>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            היום
          </button>
          <button type="button" onClick={() => viewMode === "week" ? navWeek(-1) : navMonth(-1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => viewMode === "week" ? navWeek(1) : navMonth(1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Add button */}
        {canManage && (
          <button type="button"
            onClick={() => setAddPopup({ date: todayISO })}
            className="mr-auto flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            הוסף אירוע
          </button>
        )}
      </div>

      {/* Calendar views */}
      {viewMode === "week" ? (
        <WeekView
          weekDates={weekDates}
          eventMap={eventMap}
          todayISO={todayISO}
          canManage={canManage}
          onEventClick={setDetailEv}
          onSlotClick={(date, time) => setAddPopup({ date, time })}
        />
      ) : (
        <MonthView
          view={monthView}
          events={Object.values(eventMap).flat()}
          todayISO={todayISO}
          canManage={canManage}
          onDateClick={(iso) => setAddPopup({ date: iso })}
          onEventClick={setDetailEv}
        />
      )}

      {/* Popups */}
      {detailEv && (
        <EventDetailCard event={detailEv} onClose={() => setDetailEv(null)} />
      )}

      {addPopup && (
        <AddSchedulePopup
          key={`${addPopup.date}-${addPopup.time}`}
          defaultDate={addPopup.date}
          defaultTime={addPopup.time}
          currentUser={user}
          onClose={() => setAddPopup(null)}
          onAdd={(ev) => { handleAddEvent(ev); }}
        />
      )}
    </div>
  );
}
