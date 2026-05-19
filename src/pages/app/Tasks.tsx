import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { getRoleCategory, roleLabels } from "@/types/user";
import { mockUsers } from "@/data/mockUsers";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mockTasks, mockUpdates,
  Task, TaskStatus, TaskPriority, TaskUpdate, TaskUpdateReply, AttachedFile,
  KANBAN_COLUMNS, priorityConfig, statusConfig,
} from "@/data/tasksMock";
import { User } from "@/types/user";
import {
  Plus, Flag, AlertCircle, MessageCircle, CalendarDays,
  AtSign, ChevronDown, Bold, Italic, Underline, List, Link2,
  Paperclip, Smile, MoreHorizontal, X, Clock, ArrowRight,
  CheckCircle2, CornerDownRight, GripVertical, Trash2,
  Download, Eye, FileText, ImageIcon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_USER_TO_CLIENT_ID: Record<string, string> = { "3": "c1" };

const MOCK_CLIENTS = [
  { id: "c1", name: "בוטיק מיה" },
  { id: "c2", name: "שיפוץ בית" },
  { id: "c3", name: "גלריית אמנות ירדן" },
  { id: "c4", name: "קליניקת ד״ר לוי" },
  { id: "c5", name: "סטודיו פילאטיס גל" },
];

const STATUS_BG: Record<TaskStatus, string> = {
  open: "bg-slate-500", in_progress: "bg-blue-500",
  stuck: "bg-red-500",  done: "bg-green-500", cancelled: "bg-gray-400",
};
const STATUS_SHORT: Record<TaskStatus, string> = {
  open: "חדש", in_progress: "בטיפול",
  stuck: "תקוע", done: "הושלם", cancelled: "בוטל",
};
// Border + shadow now keyed on STATUS (more aesthetic, reflects work phase)
const STATUS_BORDER: Record<TaskStatus, string> = {
  open:        "border-l-slate-400",
  in_progress: "border-l-blue-500",
  stuck:       "border-l-red-500",
  done:        "border-l-green-500",
  cancelled:   "border-l-gray-300",
};
const STATUS_SHADOW: Record<TaskStatus, string> = {
  open:        "hover:shadow-slate-100",
  in_progress: "hover:shadow-blue-100",
  stuck:       "hover:shadow-red-100",
  done:        "hover:shadow-green-100",
  cancelled:   "hover:shadow-gray-100",
};

// Calendar helpers
const MONTHS_HE = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];
const DAYS_HE = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]; // Sun → Sat

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "עכשיו";
  if (diff < 3600)  return `לפני ${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע׳`;
  return `לפני ${Math.floor(diff / 86400)} ימים`;
}

function parseDDMMYYYY(s: string): Date | null {
  const p = s.split(".");
  if (p.length !== 3) return null;
  const d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  return isNaN(d.getTime()) ? null : d;
}

function getDueDateInfo(dueDate: string): { label: string; cls: string } {
  const due = parseDDMMYYYY(dueDate);
  if (!due) return { label: dueDate, cls: "text-muted-foreground" };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - today.getTime()) / 86400000;
  if (diff < 0)   return { label: dueDate,  cls: "text-red-500 font-semibold" };
  if (diff === 0) return { label: "היום",   cls: "bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-md text-[10px]" };
  if (diff <= 2)  return { label: dueDate,  cls: "text-orange-500 font-semibold" };
  return { label: dueDate, cls: "text-muted-foreground" };
}

function isoToDisplay(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function renderMentions(text: string) {
  return text.split(/(@\S+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <mark key={i} className="bg-primary/15 text-primary font-semibold not-italic rounded px-0.5">{part}</mark>
    ) : <span key={i}>{part}</span>
  );
}

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  if (priority === "urgent") return <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
  if (priority === "high")   return <Flag className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="currentColor" />;
  if (priority === "medium") return <Flag className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  return <Flag className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ value, onChange, minDate }: {
  value: string; onChange: (iso: string) => void; minDate?: string;
}) {
  const init = value ? new Date(value + "T12:00:00") : new Date();
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth() });

  const firstDow = new Date(view.y, view.m, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selMs  = value ? new Date(value + "T12:00:00").setHours(0, 0, 0, 0) : null;
  const minMs  = minDate ? new Date(minDate + "T12:00:00").setHours(0, 0, 0, 0) : null;

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navigate = (delta: number) => {
    let nm = view.m + delta, ny = view.y;
    if (nm < 0)  { nm = 11; ny--; }
    if (nm > 11) { nm = 0;  ny++; }
    setView({ y: ny, m: nm });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-72 bg-white dark:bg-card rounded-2xl shadow-xl border border-border p-5 select-none" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground text-lg font-light transition-colors">
          ‹
        </button>
        <span className="text-sm font-semibold text-foreground tracking-wide">
          {MONTHS_HE[view.m].toUpperCase()} {view.y}
        </span>
        <button type="button" onClick={() => navigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground text-lg font-light transition-colors">
          ›
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_HE.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const thisMs = new Date(view.y, view.m, d).setHours(0, 0, 0, 0);
          const isToday    = thisMs === today.getTime();
          const isSelected = selMs !== null && thisMs === selMs;
          const isDisabled = minMs !== null && thisMs < minMs;
          const iso = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;

          return (
            <button key={d} type="button" disabled={isDisabled}
              onClick={() => !isDisabled && onChange(iso)}
              className={`
                relative aspect-square flex items-center justify-center text-sm rounded-xl
                transition-all duration-150 font-medium
                ${isDisabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}
                ${isSelected
                  ? "ring-2 ring-primary text-primary bg-primary/8 font-bold"
                  : isToday
                    ? "bg-yellow-100 text-yellow-700 font-bold"
                    : !isDisabled ? "hover:bg-muted text-foreground" : ""}
              `}
            >
              {d}
              {isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerInput({ value, onChange, placeholder, minDate }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const display = value
    ? new Date(value + "T12:00:00").toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 h-10 px-3 rounded-lg border text-sm text-right transition-colors
          ${open ? "ring-2 ring-ring border-ring" : "border-input hover:border-muted-foreground"}
          ${!value ? "text-muted-foreground" : "text-foreground"} bg-background`}
      >
        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
        {display || placeholder || "בחר תאריך"}
      </button>
      {open && (
        <div className="absolute top-full mt-1 z-[300] right-0">
          <MiniCalendar value={value} onChange={(iso) => { onChange(iso); setOpen(false); }} minDate={minDate} />
        </div>
      )}
    </div>
  );
}

// ─── File Helpers ─────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024)        return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function downloadFile(file: AttachedFile) {
  const a = document.createElement("a");
  a.href = file.dataUrl;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function readFilesAsAttached(
  fileList: FileList,
  onDone: (files: AttachedFile[]) => void
) {
  const result: AttachedFile[] = [];
  let remaining = fileList.length;
  if (remaining === 0) { onDone([]); return; }
  Array.from(fileList).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      result.push({
        id: `af${Date.now()}${Math.random().toString(36).slice(2)}`,
        name: file.name, size: file.size,
        mimeType: file.type,
        dataUrl: ev.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
      remaining--;
      if (remaining === 0) onDone(result);
    };
    reader.readAsDataURL(file);
  });
}

// ─── File View Modal (Lightbox) ────────────────────────────────────────────────

function FileViewModal({ file, onClose }: { file: AttachedFile | null; onClose: () => void }) {
  if (!file) return null;
  const isImage = file.mimeType.startsWith("image/");

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[500] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button type="button" onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-1.5 shadow-xl z-10 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {isImage ? (
          <img
            src={file.dataUrl}
            alt={file.name}
            className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain"
          />
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center shadow-2xl min-w-[280px]">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">{file.name}</p>
            <p className="text-sm text-muted-foreground mb-6">{formatBytes(file.size)}</p>
            <Button onClick={() => downloadFile(file)} className="gap-2">
              <Download className="w-4 h-4" /> הורד קובץ
            </Button>
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
          <span className="text-white text-sm font-medium truncate max-w-[300px]">{file.name}</span>
          <span className="text-white/60 text-xs">{formatBytes(file.size)}</span>
          <Button size="sm" onClick={() => downloadFile(file)}
            className="gap-1.5 bg-white text-gray-900 hover:bg-gray-100 ml-2">
            <Download className="w-3.5 h-3.5" /> הורד
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Attachment Chip (preview + remove) ───────────────────────────────────────

function AttachmentChip({ file, onRemove }: { file: AttachedFile; onRemove?: () => void }) {
  const isImage = file.mimeType.startsWith("image/");
  return (
    <div className="relative group flex items-center gap-2 bg-muted rounded-xl overflow-hidden border border-border pr-2">
      {isImage ? (
        <img src={file.dataUrl} alt={file.name} className="w-10 h-10 object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 bg-muted-foreground/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground/50" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="shrink-0 w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-destructive hover:text-white flex items-center justify-center transition-colors ml-1">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

// ─── Rocket Animation ─────────────────────────────────────────────────────────

function RocketBuddy() {
  return (
    <svg width="90" height="130" viewBox="0 0 90 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cone */}
      <path d="M45 2 L14 44 L76 44 Z" fill="#3B9FE8"/>
      <circle cx="45" cy="22" r="9" fill="white" opacity="0.55"/>
      <text x="40.5" y="27" fontSize="11" fill="white" fontWeight="bold">★</text>
      {/* Body */}
      <rect x="14" y="42" width="62" height="58" rx="7" fill="#FF6A3D"/>
      <rect x="30" y="42" width="14" height="58" fill="white" opacity="0.7"/>
      {/* Eyes */}
      <ellipse cx="33" cy="62" rx="7" ry="8" fill="white"/>
      <ellipse cx="57" cy="62" rx="7" ry="8" fill="white"/>
      <ellipse cx="34" cy="64" rx="4.5" ry="5" fill="#1a1a1a"/>
      <ellipse cx="58" cy="64" rx="4.5" ry="5" fill="#1a1a1a"/>
      <circle cx="32" cy="61" r="1.5" fill="white"/>
      <circle cx="56" cy="61" r="1.5" fill="white"/>
      {/* Blush */}
      <ellipse cx="23" cy="72" rx="5" ry="3" fill="#FF9999" opacity="0.7"/>
      <ellipse cx="67" cy="72" rx="5" ry="3" fill="#FF9999" opacity="0.7"/>
      {/* Smile */}
      <path d="M35 80 Q45 88 55 80" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Arms */}
      <ellipse cx="9" cy="65" rx="7" ry="4.5" fill="#FF6A3D" transform="rotate(-25 9 65)"/>
      <ellipse cx="81" cy="65" rx="7" ry="4.5" fill="#FF6A3D" transform="rotate(25 81 65)"/>
      {/* Fins */}
      <path d="M14 80 L0 108 L22 100 Z" fill="#E85523"/>
      <path d="M76 80 L90 108 L68 100 Z" fill="#E85523"/>
      {/* Fire */}
      <ellipse cx="45" cy="106" rx="14" ry="9" fill="#FFD700" className="rocket-fire"/>
      <ellipse cx="39" cy="113" rx="8" ry="10" fill="#FF8C00" className="rocket-fire"/>
      <ellipse cx="51" cy="113" rx="8" ry="10" fill="#FF6B35" className="rocket-fire"/>
      <ellipse cx="45" cy="120" rx="5" ry="7" fill="#FFE55C" className="rocket-fire"/>
      {/* Sparks */}
      <circle cx="30" cy="118" r="3" fill="#FFD700" className="rocket-spark"/>
      <circle cx="60" cy="116" r="2.5" fill="#FF8C00" className="rocket-spark-2"/>
      <circle cx="45" cy="125" r="2" fill="#FFE55C" className="rocket-spark-3"/>
    </svg>
  );
}

function RocketAnimation({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      key={String(active)}
      className="fixed z-[300] pointer-events-none rocket-fly"
      style={{ bottom: "25%", left: 0 }}
    >
      <RocketBuddy />
    </div>
  );
}

// ─── Trash Can Drop Zone ──────────────────────────────────────────────────────

function TrashDropZone({
  visible, isOver,
  onDragOver, onDragLeave, onDrop,
}: {
  visible: boolean; isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex flex-col items-center gap-2 px-10 py-5 rounded-3xl
        border-2 border-dashed cursor-pointer select-none
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}
        ${isOver
          ? "bg-red-50 border-red-400 scale-110 shadow-2xl shadow-red-200"
          : "bg-white/95 dark:bg-card/95 backdrop-blur-sm border-gray-300 shadow-xl"
        }
      `}
    >
      {/* Trash can SVG */}
      <div className="relative flex flex-col items-center">
        {/* Lid — lifts on hover */}
        <div className={`
          w-16 h-4 rounded-xl shadow-md mb-0.5 z-10 relative
          transition-all duration-300 ease-out origin-left
          ${isOver ? "rotate-[-28deg] translate-x-3 -translate-y-1 bg-red-400 shadow-red-300" : "bg-gray-400"}
        `}>
          {/* Lid handle */}
          <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-2 rounded-t-full
            ${isOver ? "bg-red-500" : "bg-gray-500"} transition-colors`} />
        </div>

        {/* Can body */}
        <div className={`
          w-14 h-[52px] rounded-b-2xl shadow-inner flex items-center justify-center gap-1
          transition-all duration-300
          ${isOver ? "bg-red-500 scale-105" : "bg-gray-400"}
        `}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1 h-7 bg-white/25 rounded-full" />
          ))}
        </div>

        {/* Flies when active */}
        {isOver && (
          <>
            <span className="absolute -top-4 -right-3 text-base animate-bounce select-none">💥</span>
            <span className="absolute -top-5 left-0 text-xs animate-spin select-none">✨</span>
            <span className="absolute top-0 -right-5 text-xs animate-pulse select-none">🔥</span>
          </>
        )}
      </div>

      <p className={`text-xs font-bold transition-colors duration-200 ${isOver ? "text-red-600" : "text-muted-foreground"}`}>
        {isOver ? "😱 שחרר למחיקה!" : "🗑️ גרור כאן למחיקה"}
      </p>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task, updatesCount, isDragging, canDrag,
  onClick, onDragStart, onDragEnd,
}: {
  task: Task; updatesCount: number; isDragging: boolean; canDrag: boolean;
  onClick: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  const di = getDueDateInfo(task.dueDate);

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-card rounded-xl select-none
        border border-border/60 border-l-[3px] ${STATUS_BORDER[task.status]}
        shadow-sm hover:shadow-lg ${STATUS_SHADOW[task.status]}
        transition-all duration-200 ease-out
        ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${isDragging ? "opacity-25 scale-95 rotate-1 blur-[0.5px]" : "opacity-100"}
      `}
    >
      {canDrag && (
        <div className="absolute top-3 left-2 opacity-0 group-hover:opacity-25 transition-opacity pointer-events-none">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}

      <div className="px-4 pt-3.5 pb-3">
        <p className="font-semibold text-[13.5px] text-foreground leading-snug mb-1">{task.title}</p>
        <span className="inline-flex text-[11px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5 mb-2.5">
          {task.clientName}
        </span>

        <div className="flex items-center gap-1.5 text-[11px]">
          <PriorityIcon priority={task.priority} />

          {task.startDate ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="w-3 h-3 shrink-0" />
              {task.startDate}
              <ArrowRight className="w-2 h-2" />
              <span className={di.cls}>{di.label}</span>
            </span>
          ) : (
            <span className={`flex items-center gap-1 ${di.cls}`}>
              <CalendarDays className="w-3 h-3 shrink-0" />
              {di.label}
            </span>
          )}

          {updatesCount > 0 && (
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <MessageCircle className="w-3 h-3" />{updatesCount}
            </span>
          )}

          <div className="mr-auto" title={task.assigneeName}>
            <UserAvatar name={task.assigneeName} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mention Dropdown ─────────────────────────────────────────────────────────

function MentionDropdown({ search, currentUserId, onSelect }: {
  search: string; currentUserId: string; onSelect: (u: User) => void;
}) {
  const filtered = mockUsers.filter(
    (u) => u.id !== currentUserId &&
      (search === "" || u.name.includes(search) || u.name.toLowerCase().includes(search.toLowerCase()))
  );
  if (!filtered.length) return null;
  return (
    <div className="absolute bottom-full mb-1 right-0 left-0 bg-popover border border-border rounded-xl shadow-2xl z-[200] max-h-44 overflow-y-auto">
      {filtered.map((u) => (
        <button key={u.id} type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(u); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-muted transition-colors text-right"
        >
          <UserAvatar name={u.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground">{u.name}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[u.role]}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Update Editor ────────────────────────────────────────────────────────────

function UpdateEditor({
  onSubmit, replyingTo, onCancelReply, currentUser, autoFocus = false,
}: {
  onSubmit: (text: string, mentions: string[], attachments: AttachedFile[]) => void;
  replyingTo: TaskUpdate | null; onCancelReply: () => void;
  currentUser: User; autoFocus?: boolean;
}) {
  const [text, setText]               = useState("");
  const [search, setSearch]           = useState("");
  const [showAt, setShowAt]           = useState(false);
  const [atStart, setAtStart]         = useState(0);
  const [mentioned, setMentioned]     = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([]);
  const ref     = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 150);
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value; setText(val);
    const cursor = e.target.selectionStart ?? val.length;
    const up = val.slice(0, cursor);
    const idx = up.lastIndexOf("@");
    if (idx !== -1 && !up.slice(idx + 1).includes(" ")) {
      setSearch(up.slice(idx + 1)); setAtStart(idx); setShowAt(true);
    } else setShowAt(false);
  };

  const selectMention = (u: User) => {
    const before = text.slice(0, atStart);
    const after  = text.slice(atStart + 1 + search.length);
    setText(`${before}@${u.name} ${after}`);
    setMentioned((p) => p.includes(u.id) ? p : [...p, u.id]);
    setShowAt(false);
    setTimeout(() => ref.current?.focus(), 0);
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    readFilesAsAttached(files, (attached) =>
      setPendingFiles((prev) => [...prev, ...attached])
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if (!text.trim() && pendingFiles.length === 0) return;
    onSubmit(text.trim(), mentioned, pendingFiles);
    setText(""); setMentioned([]); setShowAt(false); setPendingFiles([]);
  };

  const insertAt = () => {
    const pos = ref.current?.selectionStart ?? text.length;
    setText((p) => p.slice(0, pos) + "@" + p.slice(pos));
    setSearch(""); setAtStart(pos); setShowAt(true);
    setTimeout(() => ref.current?.focus(), 0);
  };

  const btnCls = "p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 mt-1"><UserAvatar name={currentUser.name} size="sm" /></div>
      <div className="flex-1 min-w-0 rounded-xl border border-border bg-white dark:bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/40 transition-all">

        {/* Hidden file input */}
        <input ref={fileRef} type="file" multiple accept="*/*" className="hidden" onChange={handleAttach} />

        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/60 bg-muted/20 rounded-t-xl">
          <button type="button" title="מודגש" className={btnCls}><Bold className="w-3.5 h-3.5" /></button>
          <button type="button" title="נטוי" className={btnCls}><Italic className="w-3.5 h-3.5" /></button>
          <button type="button" title="קו תחתון" className={btnCls}><Underline className="w-3.5 h-3.5" /></button>
          <span className="w-px h-4 bg-border mx-1" />
          <button type="button" title="רשימה" className={btnCls}><List className="w-3.5 h-3.5" /></button>
          <button type="button" title="קישור" className={btnCls}><Link2 className="w-3.5 h-3.5" /></button>
        </div>

        {/* Reply banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-1.5 text-xs bg-primary/5 border-b border-border/60">
            <span className="text-muted-foreground flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" />
              מגיב ל: <span className="font-semibold text-foreground mr-1">{replyingTo.authorName}</span>
            </span>
            <button type="button" onClick={onCancelReply} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={ref}
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }}
            placeholder={replyingTo ? "כתוב תגובה..." : "כתוב עדכון... (@ לתיוג, Ctrl+Enter לשליחה)"}
            rows={3}
            className="w-full px-4 py-3 text-sm bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground"
          />
          {showAt && <MentionDropdown search={search} currentUserId={currentUser.id} onSelect={selectMention} />}
        </div>

        {/* Pending file attachments */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3 border-t border-border/40 pt-2">
            {pendingFiles.map((f) => (
              <AttachmentChip
                key={f.id}
                file={f}
                onRemove={() => setPendingFiles((p) => p.filter((x) => x.id !== f.id))}
              />
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/10 rounded-b-xl">
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={insertAt} title="תייג" className={btnCls}><AtSign className="w-4 h-4" /></button>
            <button type="button" onClick={() => fileRef.current?.click()} title="צרף קובץ"
              className={`${btnCls} ${pendingFiles.length > 0 ? "text-primary" : ""}`}>
              <Paperclip className="w-4 h-4" />
              {pendingFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {pendingFiles.length}
                </span>
              )}
            </button>
            <button type="button" title="אמוג׳י" className={btnCls}><Smile className="w-4 h-4" /></button>
          </div>
          <Button type="button" size="sm" onClick={submit}
            disabled={!text.trim() && pendingFiles.length === 0}
            className="gap-1.5 h-8 px-4 text-xs font-semibold rounded-lg">
            {replyingTo ? "הגב" : "עדכן"}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ update, isOwn, onReply }: {
  update: TaskUpdate; isOwn: boolean; onReply: (u: TaskUpdate) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className={`flex gap-2.5 group ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && <div className="shrink-0 mt-1"><UserAvatar name={update.authorName} size="sm" /></div>}

      <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && <span className="text-xs font-semibold text-foreground px-1">{update.authorName}</span>}

        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? "bg-primary text-primary-foreground rounded-tl-md shadow-sm"
            : "bg-muted text-foreground rounded-tr-md"
          }`}
        >
          {update.text && renderMentions(update.text)}
          {/* Inline attachments inside bubble */}
          {update.attachments && update.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/20">
              {update.attachments.map((f) => (
                <AttachmentChip key={f.id} file={f} />
              ))}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />{timeAgo(update.createdAt)}
          </span>
          <button type="button" onClick={() => onReply(update)}
            className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors opacity-0 group-hover:opacity-100">
            <CornerDownRight className="w-3 h-3" />הגב
          </button>
          {update.replies.length > 0 && (
            <button type="button" onClick={() => setShowReplies((v) => !v)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
              <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? "rotate-180" : ""}`} />
              {update.replies.length} תגובות
            </button>
          )}
        </div>

        {showReplies && update.replies.length > 0 && (
          <div className="border-r-2 border-primary/20 pr-3 space-y-2 mr-2 mt-1">
            {update.replies.map((r) => (
              <div key={r.id} className="flex gap-2">
                <UserAvatar name={r.authorName} size="sm" />
                <div>
                  <span className="text-xs font-semibold block mb-0.5">{r.authorName}</span>
                  <div className="bg-background border border-border rounded-xl px-3 py-1.5 text-sm">
                    {renderMentions(r.text)}
                    {r.attachments && r.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border">
                        {r.attachments.map((f) => <AttachmentChip key={f.id} file={f} />)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{timeAgo(r.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Selector ──────────────────────────────────────────────────────────

function StatusSelector({ current, onChange, canEdit }: {
  current: TaskStatus; onChange: (s: TaskStatus) => void; canEdit: boolean;
}) {
  const order: TaskStatus[] = ["open", "in_progress", "stuck", "done"];
  const idx = order.indexOf(current);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {order.map((s, i) => {
        const isActive = current === s;
        const isPast   = i < idx;
        return (
          <button key={s} type="button" disabled={!canEdit} onClick={() => canEdit && onChange(s)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 border
              ${isActive
                ? `${STATUS_BG[s]} text-white border-transparent shadow-sm scale-105`
                : isPast
                  ? "bg-muted/60 text-muted-foreground/50 border-transparent line-through"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              }
              ${canEdit ? "cursor-pointer" : "cursor-default"}
            `}
          >
            {isActive && <CheckCircle2 className="w-3 h-3" />}
            {STATUS_SHORT[s]}
          </button>
        );
      })}
    </div>
  );
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────

function TaskDetailPanel({
  task, updates, currentUser, canEdit, autoReply,
  onClose, onAddUpdate, onAddReply, onStatusChange, onDelete,
}: {
  task: Task; updates: TaskUpdate[]; currentUser: User; canEdit: boolean; autoReply: boolean;
  onClose: () => void;
  onAddUpdate: (taskId: string, text: string, mentions: string[], attachments: AttachedFile[]) => void;
  onAddReply: (updateId: string, text: string, mentions: string[], attachments: AttachedFile[]) => void;
  onStatusChange: (taskId: string, s: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}) {
  const [activeTab, setActiveTab]     = useState<"updates" | "files" | "activity">("updates");
  const [replyingTo, setReplyingTo]   = useState<TaskUpdate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [files, setFiles]             = useState<AttachedFile[]>([]);
  const [viewFile, setViewFile]       = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const di = getDueDateInfo(task.dueDate);

  const handleSubmit = (text: string, mentions: string[], attachments: AttachedFile[]) => {
    if (replyingTo) { onAddReply(replyingTo.id, text, mentions, attachments); setReplyingTo(null); }
    else            { onAddUpdate(task.id, text, mentions, attachments); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFiles((prev) => [...prev, {
          id: `f${Date.now()}${Math.random()}`,
          name: file.name, size: file.size,
          mimeType: file.type,
          dataUrl: ev.target?.result as string,
          uploadedAt: new Date().toISOString(),
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const TABS = [
    { id: "updates"  as const, label: "עדכונים", count: updates.length },
    { id: "files"    as const, label: "קבצים",   count: files.length },
    { id: "activity" as const, label: "פעילות",  count: 0 },
  ];

  return (
    <div
      className="fixed inset-y-0 left-0 w-full sm:w-[520px] bg-background z-40
        flex flex-col border-r border-border shadow-[4px_0_40px_rgba(0,0,0,0.12)]
        animate-in slide-in-from-left duration-300 ease-out"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* File lightbox */}
      <FileViewModal file={viewFile} onClose={() => setViewFile(null)} />

      {/* Status accent strip */}
      <div className={`h-1 w-full ${STATUS_BG[task.status]}`} />

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-tight">{task.title}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5 mt-1 inline-block">
            {task.clientName}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <UserAvatar name={currentUser.name} size="sm" />

          {/* 3-dot menu with delete */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44" style={{ direction: "rtl" }}>
                <DropdownMenuItem onClick={() => setConfirmDelete(true)}
                  className="text-destructive focus:text-destructive gap-2 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                  מחק משימה
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClose} className="gap-2 cursor-pointer">
                  <X className="w-4 h-4" />סגור
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Confirm delete banner */}
      {confirmDelete && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-5 py-3 flex items-center gap-3 shrink-0">
          <Trash2 className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-sm text-destructive font-medium flex-1">למחוק את המשימה לצמיתות?</span>
          <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)} className="h-7 text-xs">מחק</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} className="h-7 text-xs">ביטול</Button>
        </div>
      )}

      {/* Status selector */}
      <div className="px-5 py-4 border-b border-border shrink-0 space-y-4">
        <StatusSelector current={task.status} onChange={(s) => onStatusChange(task.id, s)} canEdit={canEdit} />

        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            {
              label: "אחראי",
              content: (
                <div className="flex items-center gap-1.5 mt-1">
                  <UserAvatar name={task.assigneeName} size="sm" />
                  <span className="font-semibold truncate">{task.assigneeName}</span>
                </div>
              ),
            },
            {
              label: "דד-ליין",
              content: <span className={`font-semibold mt-1 block ${di.cls}`}>{di.label}</span>,
            },
            {
              label: "עדיפות",
              content: (
                <span className="flex items-center gap-1 font-semibold mt-1">
                  <PriorityIcon priority={task.priority} />
                  {priorityConfig[task.priority].label}
                </span>
              ),
            },
          ].map(({ label, content }) => (
            <div key={label} className="bg-muted/40 rounded-xl px-3 py-2.5">
              <p className="text-muted-foreground">{label}</p>
              {content}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 px-5 gap-1">
        {TABS.map(({ id, label, count }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
            {count > 0 && (
              <span className="mr-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "updates" && (
          <div className="p-5 flex flex-col gap-5">
            <UpdateEditor
              onSubmit={handleSubmit}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              currentUser={currentUser}
              autoFocus={autoReply}
            />
            {updates.length > 0 ? (
              <div className="flex flex-col gap-5 pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />
                  <span className="bg-muted rounded-full px-2 py-0.5">{updates.length} עדכונים</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {[...updates].reverse().map((u) => (
                  <ChatBubble key={u.id} update={u} isOwn={u.authorId === currentUser.id} onReply={setReplyingTo} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <MessageCircle className="w-10 h-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">עדיין אין עדכונים</p>
                <p className="text-xs text-muted-foreground/50">כתוב את הראשון!</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "files" && (
          <div className="p-5 flex flex-col gap-4">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" multiple accept="*/*"
              className="hidden" onChange={handleFileChange} />

            {/* Upload zone */}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dt = e.dataTransfer.files;
                if (dt.length) {
                  const fakeEvt = { target: { files: dt, value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileChange(fakeEvt);
                }
              }}
              className="flex flex-col items-center gap-3 py-8 px-4 rounded-2xl border-2 border-dashed border-border
                hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Paperclip className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">גרור קבצים לכאן</p>
                <p className="text-xs text-muted-foreground mt-0.5">או <span className="text-primary font-medium">לחץ לבחירה</span></p>
              </div>
              <p className="text-xs text-muted-foreground/60">תמונות, מסמכים, PDF — כל פורמט</p>
            </button>

            {/* Uploaded files grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {files.map((f) => (
                  <div key={f.id} className="relative group rounded-xl border border-border overflow-hidden bg-muted/20">
                    {/* Preview or icon */}
                    {f.mimeType.startsWith("image/") ? (
                      <img src={f.dataUrl} alt={f.name}
                        className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 flex flex-col items-center justify-center gap-1 bg-muted/40">
                        <Paperclip className="w-8 h-8 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground uppercase font-mono">
                          {f.name.split(".").pop()}
                        </span>
                      </div>
                    )}
                    {/* Info bar */}
                    <div className="px-2 py-1.5 border-t border-border">
                      <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatBytes(f.size)}</p>
                    </div>
                    {/* Hover overlay — View + Download + Delete */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => setViewFile(f)}
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        title="צפה">
                        <Eye className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                      <button type="button" onClick={() => downloadFile(f)}
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        title="הורד">
                        <Download className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                        title="מחק">
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "activity" && (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs">המשימה נוצרה</span>
              <span className="text-xs mr-auto">{timeAgo(task.createdAt)}</span>
            </div>
            {[...updates].reverse().map((u) => (
              <div key={u.id} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs">
                  <span className="font-medium text-foreground">{u.authorName}</span> הוסיף עדכון
                </span>
                <span className="text-xs mr-auto">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Task Dialog ──────────────────────────────────────────────────────────

function NewTaskDialog({
  open, onClose, defaultStatus, currentUser, onAdd,
}: {
  open: boolean; onClose: () => void; defaultStatus: TaskStatus;
  currentUser: User; onAdd: (task: Task) => void;
}) {
  const category = getRoleCategory(currentUser.role);
  const canChooseAssignee = category === "admin";

  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [status,   setStatus]   = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [clientId, setClient]   = useState("");
  const [assigneeId, setAssignee] = useState(currentUser.id);
  const [startDate, setStart]   = useState("");
  const [dueDate,  setDue]      = useState("");
  const [error,    setError]    = useState("");

  const reset = () => {
    setTitle(""); setDesc(""); setStatus(defaultStatus); setPriority("medium");
    setClient(""); setAssignee(currentUser.id); setStart(""); setDue(""); setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!title.trim()) { setError("שם המשימה הוא שדה חובה"); return; }
    if (!clientId)     { setError("יש לבחור לקוח"); return; }
    const client   = MOCK_CLIENTS.find((c) => c.id === clientId)!;
    const assignee = mockUsers.find((u) => u.id === assigneeId) ?? currentUser;
    onAdd({
      id: `t${Date.now()}`, title: title.trim(), description: desc.trim(),
      status, priority, clientId: client.id, clientName: client.name,
      assigneeId: assignee.id, assigneeName: assignee.name,
      startDate: startDate ? isoToDisplay(startDate) : undefined,
      dueDate:   dueDate   ? isoToDisplay(dueDate)   : "—",
      createdAt: new Date().toISOString(), tags: [],
    });
    reset(); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Plus className="w-5 h-5" /> משימה חדשה
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid gap-1.5">
            <Label>כותרת *</Label>
            <Input placeholder="לדוגמה: עריכת סרטון לאינסטגרם" value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} autoFocus />
          </div>

          <div className="grid gap-1.5">
            <Label>תיאור (אופציונלי)</Label>
            <textarea rows={2} placeholder="פרט את המשימה..." value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>עמודה</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusConfig[col.id].dotColor}`} />
                        {col.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>עדיפות</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 דחוף</SelectItem>
                  <SelectItem value="high">🟠 גבוה</SelectItem>
                  <SelectItem value="medium">🔵 בינוני</SelectItem>
                  <SelectItem value="low">⚪ נמוך</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>לקוח *</Label>
              <Select value={clientId} onValueChange={setClient}>
                <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                <SelectContent>
                  {MOCK_CLIENTS.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>שיוך {!canChooseAssignee && <span className="text-muted-foreground font-normal text-xs">(אוטומטי)</span>}</Label>
              {canChooseAssignee ? (
                <Select value={assigneeId} onValueChange={setAssignee}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mockUsers.filter((u) => u.role !== "client").map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <span className="flex items-center gap-2">
                          {u.name} <span className="text-xs text-muted-foreground">{roleLabels[u.role]}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 border border-border rounded-lg bg-muted/30">
                  <UserAvatar name={currentUser.name} size="sm" />
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>תאריכים</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">התחלה (אופציונלי)</p>
                <DatePickerInput value={startDate} onChange={setStart} placeholder="בחר תאריך התחלה" />
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">דד-ליין / יעד</p>
                <DatePickerInput value={dueDate} onChange={setDue} placeholder="בחר דד-ליין" minDate={startDate || undefined} />
              </div>
            </div>
            {startDate && dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-1">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{isoToDisplay(startDate)}</span>
                <ArrowRight className="w-3 h-3 mx-0.5" />
                <span className="font-medium text-primary">{isoToDisplay(dueDate)}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 flex-row-reverse">
          <Button type="button" onClick={handleSubmit} className="gap-1.5">
            <Plus className="w-4 h-4" />צור משימה
          </Button>
          <Button type="button" variant="outline" onClick={handleClose}>ביטול</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  label, dotColor, tasks, updatesMap, draggedId, isDropTarget, canDrag,
  onCardClick, onAddClick, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}: {
  label: string; dotColor: string; tasks: Task[];
  updatesMap: Record<string, TaskUpdate[]>;
  draggedId: string | null; isDropTarget: boolean; canDrag: boolean;
  onCardClick: (t: Task) => void; onAddClick: () => void;
  onDragStart: (id: string) => void; onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px] flex-1">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm`} />
        <span className="font-bold text-sm text-foreground flex-1">{label}</span>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-semibold">{tasks.length}</span>
        <button type="button" onClick={onAddClick}
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          flex flex-col gap-2.5 flex-1 min-h-[100px] rounded-2xl p-2 transition-all duration-200
          ${isDropTarget
            ? "bg-primary/8 ring-2 ring-primary/30 ring-inset scale-[1.01]"
            : "bg-muted/20"
          }
        `}
      >
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t}
            updatesCount={(updatesMap[t.id] ?? []).length}
            isDragging={draggedId === t.id}
            canDrag={canDrag}
            onClick={() => onCardClick(t)}
            onDragStart={() => onDragStart(t.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {isDropTarget && (
          <div className="h-14 rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center">
            <span className="text-xs text-primary/60 font-medium">שחרר כאן ✓</span>
          </div>
        )}
        {!isDropTarget && tasks.length === 0 && (
          <div className="h-14 rounded-xl border border-dashed border-border flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40">ריק</span>
          </div>
        )}
      </div>

      <button type="button" onClick={onAddClick}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors">
        <Plus className="w-3.5 h-3.5" />הוסף משימה
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CLIENT_LABELS: Partial<Record<TaskStatus, string>> = {
  open: "מתוכנן", in_progress: "מתבצע", stuck: "ממתין", done: "הושלם",
};

export default function Tasks() {
  const { user }            = useAuth();
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks]           = useState<Task[]>(mockTasks);
  const [updatesMap, setUpdatesMap] = useState<Record<string, TaskUpdate[]>>(() => {
    const m: Record<string, TaskUpdate[]> = {};
    mockUpdates.forEach((u) => { if (!m[u.taskId]) m[u.taskId] = []; m[u.taskId].push(u); });
    return m;
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [autoReply, setAutoReply]       = useState(false);
  const [newTaskCol, setNewTaskCol]     = useState<TaskStatus | null>(null);
  const [draggedId, setDraggedId]       = useState<string | null>(null);
  const [dropTarget, setDropTarget]     = useState<TaskStatus | null>(null);
  const [isTrashOver, setTrashOver]     = useState(false);
  const [rocketKey, setRocketKey]       = useState(0);
  const [rocketActive, setRocketActive] = useState(false);

  const category = user ? getRoleCategory(user.role) : "client";
  const canEdit  = category === "admin" || category === "team";

  // ── Hooks before early return ─────────────────────────────────────────────

  useEffect(() => {
    const openId  = searchParams.get("open");
    const doReply = searchParams.get("reply") === "true";
    if (openId) {
      const task = tasks.find((t) => t.id === openId);
      if (task) { setSelectedTask(task); setAutoReply(doReply); }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, tasks, setSearchParams]);

  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (category === "admin") return tasks;
    if (category === "team")
      return tasks.filter((t) => t.assigneeId === user.id || user.assignedClients.includes(t.clientId));
    const myId = CLIENT_USER_TO_CLIENT_ID[user.id] ?? "";
    return tasks.filter((t) => t.clientId === myId);
  }, [tasks, user, category]);

  const handleAddTask = useCallback((task: Task) => {
    setTasks((p) => [...p, task]);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((p) => p.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  }, []);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((p) => p.map((t) => t.id === taskId ? { ...t, status } : t));
    setSelectedTask((p) => p?.id === taskId ? { ...p, status } : p);
    if (status === "done") {
      setRocketActive(false);
      setTimeout(() => {
        setRocketKey((k) => k + 1);
        setRocketActive(true);
      }, 50);
      setTimeout(() => setRocketActive(false), 2600);
    }
  }, []);

  const handleDropTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((p) => p.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    setSelectedTask((p) => p?.id === taskId ? { ...p, status: newStatus } : p);
  }, []);

  const handleAddUpdate = useCallback((taskId: string, text: string, mentions: string[], attachments: AttachedFile[]) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId); if (!task) return;
    const upd: TaskUpdate = {
      id: `u${Date.now()}`, taskId, authorId: user.id, authorName: user.name,
      text, mentions, createdAt: new Date().toISOString(), replies: [],
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    setUpdatesMap((p) => ({ ...p, [taskId]: [...(p[taskId] ?? []), upd] }));
    mentions.forEach((id) => addNotification({
      toUserId: id, fromUserId: user.id, fromUserName: user.name,
      type: "mention", taskId, taskTitle: task.title,
      message: `תייג אותך בעדכון: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}"`,
    }));
  }, [tasks, user, addNotification]);

  const handleAddReply = useCallback((updateId: string, text: string, mentions: string[], attachments: AttachedFile[]) => {
    if (!user || !selectedTask) return;
    const reply: TaskUpdateReply = {
      id: `r${Date.now()}`, authorId: user.id, authorName: user.name,
      text, mentions, createdAt: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    setUpdatesMap((p) => {
      const arr = p[selectedTask.id] ?? [];
      return { ...p, [selectedTask.id]: arr.map((u) => u.id === updateId ? { ...u, replies: [...u.replies, reply] } : u) };
    });
    mentions.forEach((id) => addNotification({
      toUserId: id, fromUserId: user.id, fromUserName: user.name,
      type: "mention", taskId: selectedTask.id, taskTitle: selectedTask.title,
      message: `תייג אותך בתגובה: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}"`,
    }));
  }, [user, selectedTask, addNotification]);

  // ── Early return ──────────────────────────────────────────────────────────
  if (!user) return null;

  const selectedUpdates = selectedTask ? (updatesMap[selectedTask.id] ?? []) : [];
  const columns = KANBAN_COLUMNS.map((col) => ({
    ...col,
    label: category === "client" ? (CLIENT_LABELS[col.id] ?? col.label) : col.label,
  }));

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <PageHeader
        title="משימות"
        description={
          category === "admin" ? "כל המשימות הפעילות של הסוכנות" :
          category === "team"  ? "המשימות שמשויכות אליך" : "המשימות שלך"
        }
        action={
          canEdit ? (
            <Button type="button" onClick={() => setNewTaskCol("open")} className="gap-2">
              <Plus className="w-4 h-4" />משימה חדשה
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop — click to close panel */}
        {selectedTask && (
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-30"
            onClick={() => setSelectedTask(null)}
          />
        )}

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-5 pb-6 pt-1 px-1" style={{ minWidth: "max-content", minHeight: "100%" }}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                label={col.label}
                dotColor={col.dotColor}
                tasks={visibleTasks.filter((t) => col.acceptStatuses.includes(t.status))}
                updatesMap={updatesMap}
                draggedId={draggedId}
                isDropTarget={dropTarget === col.id && !!draggedId && !isTrashOver}
                canDrag={canEdit}
                onCardClick={(t) => { setSelectedTask(t); setAutoReply(false); }}
                onAddClick={() => setNewTaskCol(col.id)}
                onDragStart={(id) => setDraggedId(id)}
                onDragEnd={() => { setDraggedId(null); setDropTarget(null); setTrashOver(false); }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(col.id); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) { handleDropTask(draggedId, col.id); setDraggedId(null); setDropTarget(null); }
                }}
              />
            ))}
          </div>
        </div>

        {/* 🚀 Rocket animation — fires when task marked done */}
        <RocketAnimation active={rocketActive} key={rocketKey} />

        {/* Animated Trash Drop Zone */}
        <TrashDropZone
          visible={!!draggedId && canEdit}
          isOver={isTrashOver}
          onDragOver={() => setTrashOver(true)}
          onDragLeave={() => setTrashOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedId) {
              if (selectedTask?.id === draggedId) setSelectedTask(null);
              handleDeleteTask(draggedId);
              setDraggedId(null);
              setTrashOver(false);
            }
          }}
        />

        {/* Detail panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            updates={selectedUpdates}
            currentUser={user}
            canEdit={canEdit}
            autoReply={autoReply}
            onClose={() => setSelectedTask(null)}
            onAddUpdate={handleAddUpdate}
            onAddReply={handleAddReply}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
          />
        )}
      </div>

      {newTaskCol && (
        <NewTaskDialog
          open onClose={() => setNewTaskCol(null)}
          defaultStatus={newTaskCol}
          currentUser={user}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}
