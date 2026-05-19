import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleCategory, UserRole } from "@/types/user";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mockShootDays, mockContentItems, mockScripts, mockVideoFiles,
  ShootDay, ContentItem, Script, VideoFile,
  ShootDayStatus, ContentStatus, ScriptStatus, VideoStatus,
  shootDayStatusConfig, contentStatusConfig, scriptStatusConfig,
  videoStatusConfig, VIDEO_KANBAN_COLS,
  platformConfig, contentTypeConfig, GANTT_PLATFORMS,
} from "@/data/shootDaysMock";
import {
  Plus, Camera, FileText, Video, MapPin, Users, X, MoreHorizontal,
  ChevronLeft, Search, ExternalLink, CalendarDays, CheckCircle2,
  MessageCircle, Clock, GripVertical, Send, CornerDownRight, Folder,
  Check, AlertCircle, ArrowRight, Share2, Bold, Italic, Underline as UnderlineIcon,
  AlignRight, AlignLeft, AlignCenter, List, ListOrdered, AtSign, ThumbsUp, Reply, Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Mention from "@tiptap/extension-mention";
import { CommentMark } from "@/components/editor/CommentMark";
import { mentionSuggestion } from "@/components/editor/mentionSuggestion";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TO_ID: Record<string, string> = { "3": "c1" };
const MOCK_CLIENTS = [
  { id: "c1", name: "בוטיק מיה" },
  { id: "c2", name: "שיפוץ בית" },
  { id: "c3", name: "גלריית אמנות ירדן" },
  { id: "c4", name: "קליניקת ד״ר לוי" },
  { id: "c5", name: "סטודיו פילאטיס גל" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoToHe(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function formatDuration(s: number): string {
  if (s === 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60)    return "עכשיו";
  if (d < 3600)  return `לפני ${Math.floor(d / 60)} דק׳`;
  if (d < 86400) return `לפני ${Math.floor(d / 3600)} שע׳`;
  return `לפני ${Math.floor(d / 86400)} ימים`;
}

function googleCalendarUrl(day: ShootDay): string {
  const [y, m, d] = day.date.split("-");
  const params = new URLSearchParams({
    text:     `יום צילום — ${day.clientName}`,
    dates:    `${y}${m}${d}/${y}${m}${d}`,
    location: day.location ?? "",
    details:  day.notes,
    sf:       "true",
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

// ─── Status Pipeline (shared, compact) ───────────────────────────────────────

function StatusPipeline({ status, compact = false }: { status: ContentStatus; compact?: boolean }) {
  const steps = Object.entries(contentStatusConfig).sort(([, a], [, b]) => a.step - b.step);
  const cur   = contentStatusConfig[status].step;
  if (compact) {
    return (
      <div className="flex items-center gap-1 mt-1">
        {steps.map(([s, cfg]) => (
          <div key={s} title={cfg.label}
            className={`w-2 h-2 rounded-full ${cfg.step <= cur ? cfg.activeCls.split(" ")[0] : "bg-border"}`} />
        ))}
        <span className="text-[10px] text-muted-foreground mr-1">{contentStatusConfig[status].label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map(([s, cfg], i) => {
        const isActive = cfg.step === cur;
        const isPast   = cfg.step < cur;
        return (
          <div key={s} className="flex items-center gap-1">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
              ${isActive ? cfg.activeCls + " scale-105 shadow-sm"
              : isPast   ? "bg-muted text-muted-foreground/60 line-through"
                         : "bg-muted/40 text-muted-foreground border border-border"}`}>
              {cfg.step <= cur && "✓ "}{cfg.label}
            </span>
            {i < steps.length - 1 && <ChevronLeft className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 1: ימי צילום
// ═══════════════════════════════════════════════════════════════════════

function ShootDayCard({
  day, scripts, videos, isSelected, onClick, onFolderClick,
}: {
  day: ShootDay;
  scripts: Script[]; videos: VideoFile[];
  isSelected: boolean;
  onClick: () => void;
  onFolderClick: (folder: "scripts" | "videos") => void;
}) {
  const sc = shootDayStatusConfig[day.status];
  const [d, m, y] = day.date.split("-").map(Number);
  const dateLabel = `${d} ${["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"][m-1]} ${y}`;

  return (
    <div
      className={`bg-white dark:bg-card rounded-2xl border border-border shadow-sm
        hover:shadow-lg transition-all duration-200 overflow-hidden
        ${isSelected ? "ring-2 ring-primary/40" : ""}`}
    >
      {/* Header */}
      <div onClick={onClick}
        className={`cursor-pointer px-5 pt-5 pb-4 border-b border-border/60
          bg-gradient-to-l from-muted/30 to-transparent`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <span className="font-bold text-foreground">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.chipCls}`}>
              {sc.label}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" style={{ direction: "rtl" }}>
                <DropdownMenuItem asChild>
                  <a href={googleCalendarUrl(day)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer">
                    <CalendarDays className="w-4 h-4" />הוסף ליומן גוגל
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="font-semibold text-foreground mb-1">{day.clientName}</p>

        {day.location && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent(day.location)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 shrink-0" />
            {day.location}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      {/* Crew */}
      {day.crewNames.length > 0 && (
        <div className="px-5 py-2.5 border-b border-border/40 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1">
            {day.crewNames.map((n) => <UserAvatar key={n} name={n} size="sm" />)}
          </div>
          <span className="text-xs text-muted-foreground mr-1">{day.crewNames.join(", ")}</span>
        </div>
      )}

      {/* Drive folders */}
      <div className="px-5 py-3 grid grid-cols-3 gap-2">
        <button type="button"
          onClick={() => onFolderClick("scripts")}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-muted/30
            hover:bg-blue-50 hover:text-blue-700 transition-all group border border-transparent hover:border-blue-200"
        >
          <FileText className="w-5 h-5 text-blue-500" />
          <span className="text-[10px] font-semibold">תסריטים</span>
          <span className="text-[9px] text-muted-foreground">
            {scripts.length > 0 ? `${scripts.length} קבצים` : "—"}
          </span>
        </button>

        <button type="button"
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-muted/30
            hover:bg-muted/60 transition-all border border-transparent cursor-default"
        >
          <Folder className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] font-semibold text-muted-foreground">חומרי גלם</span>
          <span className="text-[9px] text-muted-foreground">בקרוב</span>
        </button>

        <button type="button"
          onClick={() => onFolderClick("videos")}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-muted/30
            hover:bg-purple-50 hover:text-purple-700 transition-all group border border-transparent hover:border-purple-200"
        >
          <Video className="w-5 h-5 text-purple-500" />
          <span className="text-[10px] font-semibold">עריכות</span>
          <span className="text-[9px] text-muted-foreground">
            {videos.length > 0 ? `${videos.length} קבצים` : "—"}
          </span>
        </button>
      </div>
    </div>
  );
}

function ShootDayDetailPanel({
  day, scripts, videos, onClose, onStatusChange, onFolderClick, canManage,
}: {
  day: ShootDay; scripts: Script[]; videos: VideoFile[];
  onClose: () => void;
  onStatusChange: (id: string, s: ShootDayStatus) => void;
  onFolderClick: (folder: "scripts" | "videos") => void;
  canManage: boolean;
}) {
  const sc = shootDayStatusConfig[day.status];
  const statusOrder: ShootDayStatus[] = ["planned", "in_progress", "done", "cancelled", "rescheduled"];
  const [showSelfieDialog, setShowSelfieDialog] = useState(false);

  const handleClockIn = () => {
    onStatusChange(day.id, "in_progress");
    setShowSelfieDialog(false);
    toast.success("יום הצילום התחיל בהצלחה! שעת כניסה נרשמה.");
  };

  const handleClockOut = () => {
    onStatusChange(day.id, "done");
    toast.success("יום הצילום הסתיים! נפתחה משימה להעלאת חומרי גלם.", {
      description: "מנהלת הקריאייטיב עודכנה.",
    });
  };

  return (
    <div
      className="fixed inset-y-0 left-0 w-full sm:w-[480px] bg-background z-40
        flex flex-col border-r border-border shadow-[4px_0_40px_rgba(0,0,0,0.12)]
        animate-in slide-in-from-left duration-300 ease-out"
      dir="rtl" onClick={(e) => e.stopPropagation()}
    >
      <div className={`h-1 w-full ${sc.dotColor}`} />

      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">📸</span>
            <span className="font-bold text-foreground">{isoToHe(day.date)}</span>
          </div>
          <p className="font-semibold text-foreground">{day.clientName}</p>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {canManage && (
        <div className="px-5 py-3 border-b border-border shrink-0 flex items-center gap-1.5 flex-wrap">
          {statusOrder.map((s) => (
            <button key={s} type="button"
              onClick={() => day.status !== s && onStatusChange(day.id, s)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border
                ${day.status === s
                  ? `${shootDayStatusConfig[s].dotColor} text-white border-transparent shadow-sm scale-105`
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted cursor-pointer"}`}
            >
              {shootDayStatusConfig[s].label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        
        {/* Photographer Action Center */}
        {canManage && (
          <div className="bg-slate-50 dark:bg-muted/20 border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> ניהול יום צילום
            </h3>
            
            {day.status === "planned" && (
              <Button onClick={() => setShowSelfieDialog(true)} className="w-full h-11 bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all">
                התחל יום צילום (Clock In)
              </Button>
            )}
            
            {day.status === "in_progress" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  יום הצילום פעיל כעת... צלם בעבודה!
                </div>
                <Button onClick={handleClockOut} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-sm">
                  סיום יום צילום (Clock Out)
                </Button>
              </div>
            )}
            
            {day.status === "done" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100 font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> יום הצילום הושלם</span>
                  <span className="opacity-80">9:00 - 15:30 (סה"כ 6.5 שעות)</span>
                </div>
                <Button onClick={() => toast("פותח מערכת העלאת קבצים...")} variant="outline" className="w-full h-11 gap-2 border-primary/20 text-primary hover:bg-primary/5">
                  <Folder className="w-4 h-4" /> העלאת חומרי גלם (Raw Materials)
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {day.location && (
            <div className="col-span-2 bg-muted/40 rounded-xl px-3 py-2.5">
              <p className="text-xs text-muted-foreground mb-1">מיקום</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(day.location)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{day.location}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="bg-muted/40 rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-1">צוות</p>
            <div className="flex gap-1">
              {day.crewNames.map((n) => <UserAvatar key={n} name={n} size="sm" />)}
            </div>
          </div>
        </div>

        {day.notes && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">הערות</p>
            <p className="text-sm leading-relaxed bg-muted/20 rounded-xl px-3 py-2.5">{day.notes}</p>
          </div>
        )}

        {/* Folder quick-links */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => { onClose(); onFolderClick("scripts"); }}
            className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            <FileText className="w-5 h-5 shrink-0" />
            <div className="text-right">
              <p className="text-xs font-semibold">תסריטים</p>
              <p className="text-[10px] opacity-70">{scripts.length} קבצים</p>
            </div>
          </button>
          <button type="button" onClick={() => { onClose(); onFolderClick("videos"); }}
            className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            <Video className="w-5 h-5 shrink-0" />
            <div className="text-right">
              <p className="text-xs font-semibold">עריכות וידיאו</p>
              <p className="text-[10px] opacity-70">{videos.length} קבצים</p>
            </div>
          </button>
        </div>
      </div>

      {/* Selfie Check-in Dialog */}
      <Dialog open={showSelfieDialog} onOpenChange={setShowSelfieDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> אימות הגעה ליום צילום
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-border mb-2">
              <Camera className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground">צלם סלפי שלך עם הלקוח ({day.clientName})</p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              תמונה זו תשמש לאימות הגעה ותישמר בתיקיית יום הצילום עבור מנהלת הקריאייטיב.
            </p>
            <Button variant="outline" className="gap-2 mt-2">
              <Camera className="w-4 h-4" /> פתח מצלמה
            </Button>
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowSelfieDialog(false)}>
              ביטול
            </Button>
            <Button type="button" onClick={handleClockIn} className="gap-2">
              <Clock className="w-4 h-4" /> אשר כניסה ליום צילום
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2: תסריטים
// ═══════════════════════════════════════════════════════════════════════

function ScriptCard({
  script, isSelected, onClick,
}: {
  script: Script; isSelected: boolean; onClick: () => void;
}) {
  const sc = scriptStatusConfig[script.status];
  return (
    <button onClick={onClick}
      className={`w-full text-right bg-white dark:bg-card rounded-2xl border border-border/60
        shadow-sm hover:shadow-md transition-all p-4
        ${isSelected ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📄</span>
        <span className="font-semibold text-foreground text-sm leading-snug flex-1">{script.title}</span>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.chipCls}`}>
          {sc.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{script.clientName}</p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {script.comments.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {script.comments.length} הערות
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {script.createdByName}
        </span>
        <span className="mr-auto flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(script.createdAt)}
        </span>
      </div>
    </button>
  );
}

function ScriptDetailPanel({
  script, onClose, onStatusChange, canManage, isClient, currentUserId, currentUserName,
}: {
  script: Script; onClose: () => void;
  onStatusChange: (id: string, s: ScriptStatus) => void;
  canManage: boolean; isClient: boolean;
  currentUserId: string; currentUserName: string;
}) {
  const sc = scriptStatusConfig[script.status];
  const [replyText, setReplyText] = useState("");
  const [comments, setComments] = useState(script.comments);

  const sendComment = () => {
    if (!replyText.trim()) return;
    setComments((p) => [...p, {
      id: `scc${Date.now()}`, authorId: currentUserId, authorName: currentUserName,
      text: replyText.trim(), createdAt: new Date().toISOString(), resolved: false,
    }]);
    setReplyText("");
  };

  const statusOrder: ScriptStatus[] = ["draft", "pending_approval", "approved", "revision_requested"];

  return (
    <div
      className="fixed inset-y-0 left-0 w-full sm:w-[540px] bg-background z-40
        flex flex-col border-r border-border shadow-[4px_0_40px_rgba(0,0,0,0.12)]
        animate-in slide-in-from-left duration-300 ease-out"
      dir="rtl" onClick={(e) => e.stopPropagation()}
    >
      <div className={`h-1 w-full ${sc.dotColor}`} />

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📄</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.chipCls}`}>{sc.label}</span>
          </div>
          <h2 className="font-bold text-foreground leading-snug">{script.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{script.clientName}</p>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Action buttons */}
      {(canManage || isClient) && (
        <div className="px-5 py-3 border-b border-border shrink-0 flex items-center gap-2 flex-wrap">
          {canManage && script.status === "draft" && (
            <Button size="sm" onClick={() => onStatusChange(script.id, "pending_approval")}
              className="gap-1.5 h-8 text-xs">
              <Send className="w-3 h-3" /> שלח לאישור לקוח
            </Button>
          )}
          {isClient && script.status === "pending_approval" && (
            <>
              <Button size="sm" onClick={() => onStatusChange(script.id, "approved")}
                className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700">
                <Check className="w-3 h-3" /> אשר תסריט ✓
              </Button>
              <Button size="sm" variant="outline" onClick={() => onStatusChange(script.id, "revision_requested")}
                className="gap-1.5 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                <AlertCircle className="w-3 h-3" /> דרוש תיקון
              </Button>
            </>
          )}
          {script.status === "approved" && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> התסריט אושר — מוכן לצילום
            </span>
          )}
        </div>
      )}

      {/* Script content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3">תוכן התסריט</p>
          <div className="bg-muted/10 border border-border rounded-2xl p-5 font-mono text-sm
            leading-7 whitespace-pre-wrap text-foreground" dir="rtl">
            {script.content}
          </div>
        </div>

        {/* Comments */}
        <div className="px-5 pb-5">
          <p className="text-xs font-semibold text-muted-foreground mb-4">
            הערות {comments.length > 0 && `(${comments.length})`}
          </p>
          <div className="flex flex-col gap-4">
            {comments.map((c) => {
              const isOwn = c.authorId === currentUserId;
              return (
                <div key={c.id} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <UserAvatar name={c.authorName} size="sm" />
                  <div className={`flex-1 max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!isOwn && <span className="text-xs font-semibold">{c.authorName}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${isOwn ? "bg-primary text-primary-foreground rounded-tl-md" : "bg-muted text-foreground rounded-tr-md"}
                      ${c.resolved ? "opacity-60" : ""}`}>
                      {c.text}
                      {c.resolved && <span className="text-[10px] block opacity-70 mt-1">✓ נפתרה</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div className="p-5 border-t border-border shrink-0">
        <div className="flex gap-2">
          <UserAvatar name={currentUserName} size="sm" />
          <div className="flex-1 rounded-xl border border-border bg-white dark:bg-card
            focus-within:ring-2 focus-within:ring-primary/25 overflow-hidden">
            <textarea value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendComment(); } }}
              placeholder="הוסף הערה... (Ctrl+Enter לשליחה)"
              rows={2}
              className="w-full px-4 py-3 text-sm bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground" />
            <div className="flex justify-end px-3 py-2 border-t border-border/60">
              <Button size="sm" onClick={sendComment} disabled={!replyText.trim()}
                className="gap-1.5 h-7 text-xs">
                <Send className="w-3 h-3" /> שלח
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3: עריכות סרטונים (Kanban)
// ═══════════════════════════════════════════════════════════════════════

function VideoKanbanCard({
  video, isDragging, onClick, onDragStart, onDragEnd,
}: {
  video: VideoFile; isDragging: boolean;
  onClick: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white dark:bg-card rounded-2xl border border-border shadow-sm
        hover:shadow-md cursor-grab active:cursor-grabbing select-none
        overflow-hidden transition-all duration-200
        ${isDragging ? "opacity-25 scale-95 rotate-1" : "opacity-100"}`}
    >
      {/* Thumbnail */}
      <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
        <span className="text-5xl">{video.thumbnailEmoji}</span>
        {video.version > 1 && (
          <span className="absolute top-2 left-2 bg-white/20 text-white text-[10px] font-bold
            px-2 py-0.5 rounded-full backdrop-blur-sm">
            V{video.version}
          </span>
        )}
        {video.durationSeconds > 0 && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px]
            px-2 py-0.5 rounded-full">
            ⏱ {formatDuration(video.durationSeconds)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="font-semibold text-foreground text-sm leading-snug mb-0.5 truncate">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground mb-2">{video.clientName}</p>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {video.fileSizeMB > 0 && (
            <span>📦 {video.fileSizeMB.toFixed(1)} MB</span>
          )}
          {video.comments.filter((c) => !c.resolved).length > 0 && (
            <span className="flex items-center gap-0.5 text-orange-600">
              <MessageCircle className="w-3 h-3" />
              {video.comments.filter((c) => !c.resolved).length}
            </span>
          )}
          <div className="mr-auto" title={video.editorName}>
            <UserAvatar name={video.editorName} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoDetailPanel({
  video, onClose, onStatusChange, canManage, isClient, currentUserId, currentUserName,
}: {
  video: VideoFile; onClose: () => void;
  onStatusChange: (id: string, s: VideoStatus) => void;
  canManage: boolean; isClient: boolean;
  currentUserId: string; currentUserName: string;
}) {
  const sc = videoStatusConfig[video.status];
  const [comments, setComments] = useState(video.comments);
  const [replyText, setReplyText] = useState("");
  const [timestamp, setTimestamp] = useState(0);

  const sendComment = () => {
    if (!replyText.trim()) return;
    setComments((p) => [...p, {
      id: `vc${Date.now()}`, authorId: currentUserId, authorName: currentUserName,
      text: replyText.trim(), timestampSeconds: timestamp,
      resolved: false, createdAt: new Date().toISOString(),
    }]);
    setReplyText(""); setTimestamp(0);
  };

  const openComments   = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  return (
    <div
      className="fixed inset-y-0 left-0 w-full sm:w-[520px] bg-background z-40
        flex flex-col border-r border-border shadow-[4px_0_40px_rgba(0,0,0,0.12)]
        animate-in slide-in-from-left duration-300 ease-out"
      dir="rtl" onClick={(e) => e.stopPropagation()}
    >
      {/* Thumbnail header */}
      <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative shrink-0">
        <span className="text-7xl">{video.thumbnailEmoji}</span>
        {video.version > 1 && (
          <span className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold
            px-3 py-1 rounded-full backdrop-blur-sm">
            גרסה V{video.version}
          </span>
        )}
        <button type="button" onClick={onClose}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white
            rounded-full p-1.5 backdrop-blur-sm transition-colors">
          <X className="w-4 h-4" />
        </button>
        {video.durationSeconds > 0 && (
          <div className="absolute bottom-4 right-4 left-4 flex items-center gap-2 text-white text-xs">
            <span>⏱ {formatDuration(video.durationSeconds)}</span>
            {video.fileSizeMB > 0 && <span>· 📦 {video.fileSizeMB.toFixed(1)} MB</span>}
          </div>
        )}
        {/* Future: real video player goes here */}
        <div className="absolute inset-0 flex items-end pb-12 justify-center opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-white/60 text-xs bg-black/40 px-3 py-1.5 rounded-full">
            נגן וידיאו — Sprint 4
          </span>
        </div>
      </div>

      {/* Title + meta */}
      <div className="px-5 pt-4 pb-3 border-b border-border shrink-0">
        <h2 className="font-bold text-foreground leading-snug">{video.title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{video.clientName}</p>
      </div>

      {/* Status + actions */}
      <div className="px-5 py-3 border-b border-border shrink-0">
        {/* Status chips */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {VIDEO_KANBAN_COLS.map((col) => (
            <button key={col.id} type="button"
              disabled={!canManage || video.status === col.id}
              onClick={() => canManage && onStatusChange(video.id, col.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border
                ${video.status === col.id
                  ? `${col.dotColor} text-white border-transparent shadow-sm scale-105`
                  : canManage
                    ? "bg-transparent text-muted-foreground border-border hover:bg-muted cursor-pointer"
                    : "bg-transparent text-muted-foreground border-border/50 cursor-default"}`}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Client action buttons */}
        {isClient && video.status === "in_review" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onStatusChange(video.id, "approved")}
              className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700 flex-1">
              <Check className="w-3 h-3" /> Approve ✓
            </Button>
            <Button size="sm" variant="outline" onClick={() => { onStatusChange(video.id, "in_progress"); toast.info("הסרטון הועבר חזרה לעבודה (דרוש תיקון)"); }}
              className="gap-1.5 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 flex-1">
              <AlertCircle className="w-3 h-3" /> Request Changes
            </Button>
          </div>
        )}

        {video.status === "approved" && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> הסרטון אושר ✓
          </span>
        )}
      </div>

      {/* Scrollable: meta + comments */}
      <div className="flex-1 overflow-y-auto">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 px-5 py-4 border-b border-border/40 text-sm">
          <div className="bg-muted/40 rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-1">עורך</p>
            <div className="flex items-center gap-1.5">
              <UserAvatar name={video.editorName} size="sm" />
              <span className="font-medium text-sm">{video.editorName}</span>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-1">הועלה</p>
            <span className="font-medium text-sm">{timeAgo(video.uploadedAt)}</span>
          </div>
        </div>

        {/* Comments */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-muted-foreground mb-4">
            הערות {openComments.length > 0 && <span className="text-orange-600">({openComments.length} פתוחות)</span>}
          </p>
          <div className="flex flex-col gap-3">
            {[...openComments, ...resolvedComments].map((c) => {
              const isOwn = c.authorId === currentUserId;
              return (
                <div key={c.id}
                  className={`flex gap-2.5 p-3 rounded-xl border ${c.resolved ? "opacity-50 bg-muted/10 border-border/30" : "bg-white border-border shadow-sm"}`}
                >
                  <UserAvatar name={c.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{c.authorName}</span>
                      <span className="text-[10px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                        ⏱ {formatDuration(c.timestampSeconds)}
                      </span>
                      {c.resolved && <span className="text-[10px] text-green-600">✓ טופל</span>}
                      <span className="text-[10px] text-muted-foreground mr-auto">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add comment */}
      <div className="p-5 border-t border-border shrink-0">
        <div className="rounded-xl border border-border bg-white dark:bg-card overflow-hidden
          focus-within:ring-2 focus-within:ring-primary/25">
          <textarea value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendComment(); } }}
            placeholder="הוסף הערה (Ctrl+Enter לשליחה)..."
            rows={2}
            className="w-full px-4 py-3 text-sm bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground" />
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⏱</span>
              <input type="number" min={0} value={timestamp}
                onChange={(e) => setTimestamp(Number(e.target.value))}
                className="w-16 border border-border rounded-lg px-2 py-1 text-xs text-center bg-background"
                placeholder="שנ׳" />
              <span>שניות</span>
            </div>
            <Button size="sm" onClick={sendComment} disabled={!replyText.trim()} className="gap-1.5 h-7 text-xs">
              <Send className="w-3 h-3" />הוסף הערה
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoKanbanColumn({
  col, videos, draggedId, isDropTarget, onCardClick, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}: {
  col: { id: VideoStatus; label: string; dotColor: string };
  videos: VideoFile[]; draggedId: string | null; isDropTarget: boolean;
  onCardClick: (v: VideoFile) => void;
  onDragStart: (id: string) => void; onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-[260px] flex-1">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-3 h-3 rounded-full ${col.dotColor}`} />
        <span className="font-bold text-sm text-foreground flex-1">{col.label}</span>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-semibold">{videos.length}</span>
      </div>
      <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        className={`flex flex-col gap-2.5 flex-1 min-h-[100px] rounded-2xl p-2 transition-all duration-200
          ${isDropTarget ? "bg-primary/5 ring-2 ring-primary/25 ring-inset scale-[1.01]" : "bg-muted/20"}`}
      >
        {videos.map((v) => (
          <VideoKanbanCard key={v.id} video={v}
            isDragging={draggedId === v.id}
            onClick={() => onCardClick(v)}
            onDragStart={() => onDragStart(v.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {videos.length === 0 && !isDropTarget && (
          <div className="h-16 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40">ריק</span>
          </div>
        )}
        {isDropTarget && (
          <div className="h-16 rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center">
            <span className="text-xs text-primary/60 font-medium">שחרר כאן ✓</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCRIPT DOCUMENT VIEW (Google Docs style full-screen)
// ═══════════════════════════════════════════════════════════════════════

function ScriptDocumentView({
  script, onBack, onStatusChange, onScriptUpdate, canManage, isClient,
  currentUserId, currentUserName, currentUserRole
}: {
  script: Script; onBack: () => void;
  onStatusChange: (id: string, s: ScriptStatus) => void;
  onScriptUpdate: (id: string, content: string) => void;
  canManage: boolean; isClient: boolean;
  currentUserId: string; currentUserName: string; currentUserRole: UserRole;
}) {
  const sc = scriptStatusConfig[script.status];
  const [comments, setComments] = useState(script.comments);
  const [replyText, setReplyText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Interactive comment states
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);
  
  // Can this user edit the script?
  const canEditScript = ["content_writer", "social_manager", "team_manager", "admin"].includes(currentUserRole);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CommentMark,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-primary/10 text-primary px-1 rounded-sm font-medium',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content: script.content.replace(/\n/g, '<br>'), // Convert plain text newlines to breaks if needed
    editable: canEditScript,
    onUpdate: ({ editor }) => {
      onScriptUpdate(script.id, editor.getHTML());
    }
  });

  // Handle DOM events for marks inside TipTap
  useEffect(() => {
    if (!editor) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.hasAttribute('data-comment-id')) {
        const id = target.getAttribute('data-comment-id');
        if (id) setHoveredCommentId(id);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.hasAttribute('data-comment-id')) {
        setHoveredCommentId(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.hasAttribute('data-comment-id')) {
        const id = target.getAttribute('data-comment-id');
        if (id) {
          setActiveCommentId(id);
          // Scroll sidebar to the comment
          setTimeout(() => {
            document.getElementById(`comment-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }
      } else {
        // Clicked outside a mark, clear active
        setActiveCommentId(null);
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener('mouseover', handleMouseOver);
    dom.addEventListener('mouseout', handleMouseOut);
    dom.addEventListener('click', handleClick);

    return () => {
      dom.removeEventListener('mouseover', handleMouseOver);
      dom.removeEventListener('mouseout', handleMouseOut);
      dom.removeEventListener('click', handleClick);
    };
  }, [editor]);

  const sendComment = (parentId?: string) => {
    if (!replyText.trim()) return;
    
    if (parentId) {
      // Add reply to existing comment
      setComments(comments.map(c => {
        if (c.id === parentId) {
          const newReply = {
            id: `rep${Date.now()}`, authorId: currentUserId, authorName: currentUserName,
            text: replyText.trim(), createdAt: new Date().toISOString(),
          };
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      }));
    } else {
      // Add new root comment
      let highlightId = pendingHighlightId;
      // If user has text selected and no pending highlight, highlight it now
      if (!highlightId && editor && !editor.state.selection.empty) {
        highlightId = `scc${Date.now()}`;
        editor.chain().focus().setComment(highlightId).run();
      }
      
      const newCommentId = highlightId || `scc${Date.now()}`;
      const newComment = {
        id: newCommentId,
        authorId: currentUserId, authorName: currentUserName,
        text: replyText.trim(), createdAt: new Date().toISOString(),
        resolved: false, likes: 0, replies: [], highlightId: newCommentId
      };
      
      setComments((p) => [...p, newComment]);
      setActiveCommentId(newComment.id);
      setPendingHighlightId(null);
    }
    
    setReplyText(""); 
    setShowInput(false);
    setReplyingTo(null);
  };

  const resolveComment = (id: string) => {
    setComments((p) => p.map((c) => c.id === id ? { ...c, resolved: true } : c));
  };
  
  const toggleLike = (id: string) => {
    setComments((p) => p.map((c) => {
      if (c.id === id) {
        const likedBy = c.likedBy || [];
        const hasLiked = likedBy.includes(currentUserId);
        return {
          ...c,
          likedBy: hasLiked ? likedBy.filter(uid => uid !== currentUserId) : [...likedBy, currentUserId]
        };
      }
      return c;
    }));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/share/script/${script.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("לינק הועתק בהצלחה!", { description: "הקישור לתסריט הועתק ללוח." });
  };

  const openComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  const created = new Date(script.createdAt).toLocaleDateString("he-IL", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const btnCls = "p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in" dir="rtl">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background shrink-0 flex-wrap">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium hover:bg-muted px-3 py-1.5 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4" /> חזרה לתסריטים
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* TipTap Formatting */}
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().toggleBold().run()} className={`${btnCls} ${editor?.isActive('bold') ? 'bg-muted text-foreground' : ''}`}><Bold className="w-4 h-4" /></button>
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().toggleItalic().run()} className={`${btnCls} ${editor?.isActive('italic') ? 'bg-muted text-foreground' : ''}`}><Italic className="w-4 h-4" /></button>
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`${btnCls} ${editor?.isActive('underline') ? 'bg-muted text-foreground' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
          <span className="w-px h-4 bg-border mx-1" />
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`${btnCls} ${editor?.isActive('bulletList') ? 'bg-muted text-foreground' : ''}`}><List className="w-4 h-4" /></button>
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`${btnCls} ${editor?.isActive('orderedList') ? 'bg-muted text-foreground' : ''}`}><ListOrdered className="w-4 h-4" /></button>
          <span className="w-px h-4 bg-border mx-1" />
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={`${btnCls} ${editor?.isActive({ textAlign: 'right' }) ? 'bg-muted text-foreground' : ''}`}><AlignRight className="w-4 h-4" /></button>
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={`${btnCls} ${editor?.isActive({ textAlign: 'center' }) ? 'bg-muted text-foreground' : ''}`}><AlignCenter className="w-4 h-4" /></button>
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={`${btnCls} ${editor?.isActive({ textAlign: 'left' }) ? 'bg-muted text-foreground' : ''}`}><AlignLeft className="w-4 h-4" /></button>
          <span className="w-px h-4 bg-border mx-1" />
          <button type="button" disabled={!editor || !canEditScript} onClick={() => editor?.chain().focus().insertContent('@').run()} className={btnCls}><AtSign className="w-4 h-4" /></button>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.chipCls} ml-1`}>{sc.label}</span>

        <div className="mr-auto flex items-center gap-2">
          {canManage && script.status === "draft" && (
            <Button size="sm" onClick={() => onStatusChange(script.id, "pending_approval")} className="gap-1.5 h-8 text-xs"><Send className="w-3 h-3" />שלח לאישור</Button>
          )}
          {isClient && script.status === "pending_approval" && (
            <>
              <Button size="sm" onClick={() => onStatusChange(script.id, "approved")} className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700"><Check className="w-3 h-3" />אשר תסריט ✓</Button>
              <Button size="sm" variant="outline" onClick={() => onStatusChange(script.id, "revision_requested")} className="gap-1.5 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"><AlertCircle className="w-3 h-3" />דרוש תיקון</Button>
            </>
          )}
          {script.status === "approved" && (
             <>
               <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />אושר ✓</span>
               {canManage && (
                 <Button size="sm" variant="outline" onClick={() => onStatusChange(script.id, "draft")} className="gap-1.5 h-8 text-xs text-muted-foreground hover:bg-muted ml-2">
                   <Unlock className="w-3 h-3" />פתח מחדש לעריכה
                 </Button>
               )}
             </>
          )}
          <Button size="sm" variant="outline" onClick={handleShare} className="gap-1.5 h-8 text-xs">
            <Share2 className="w-3.5 h-3.5" />שתף
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-slate-50 dark:bg-muted/20">
        {/* Document area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto relative">
            {/* Context menu hint for clients */}
            {isClient && (
              <div className="absolute -left-6 top-10 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg shadow-sm -rotate-90 origin-top-left opacity-60 pointer-events-none">
                סמן טקסט כדי להעיר
              </div>
            )}
            <div className="bg-white dark:bg-card rounded-2xl shadow-md border border-border overflow-hidden">
              <div className="px-10 pt-10 pb-6 border-b border-border bg-muted/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.chipCls}`}>{sc.label}</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground leading-tight mb-3">{script.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span>נכתב ע"י <span className="font-medium text-foreground">{script.createdByName}</span></span>
                  <span>·</span>
                  <span>{created}</span>
                </div>
              </div>

              {/* TipTap Editor */}
              <div className="px-10 py-8 prose prose-slate max-w-none min-h-[500px] outline-none relative" dir="rtl">
                 <style>{`
                   mark[data-comment-id] {
                     background-color: #fef3c7; /* bg-amber-100 */
                     border-radius: 2px;
                     transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
                     cursor: pointer;
                     border-bottom: 2px solid transparent;
                   }
                   mark[data-comment-id]:hover,
                   .hovering-comment mark[data-comment-id="${hoveredCommentId}"] {
                     background-color: #fde68a !important; /* bg-amber-200 */
                     border-bottom-color: #f59e0b; /* amber-500 */
                   }
                   .active-comment mark[data-comment-id="${activeCommentId}"] {
                     background-color: #fcd34d !important; /* bg-amber-300 */
                     border-bottom-color: #d97706; /* amber-600 */
                   }
                 `}</style>
                 {editor && (
                   <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }} className="bg-white shadow-lg border border-border/50 rounded-full px-1.5 py-1.5 flex gap-1 items-center animate-in zoom-in-95">
                     <button
                       onClick={() => {
                         const newId = `scc${Date.now()}`;
                         editor.chain().focus().setComment(newId).run();
                         setPendingHighlightId(newId);
                         setShowInput(true);
                         setReplyText("");
                         setReplyingTo(null);
                       }}
                       className="p-1.5 hover:bg-muted rounded-full transition-colors text-primary flex items-center justify-center cursor-pointer"
                       title="הוסף הערה"
                     >
                       <MessageCircle className="w-4 h-4" />
                     </button>
                   </BubbleMenu>
                 )}
                 <div className={`editor-container ${hoveredCommentId ? 'hovering-comment' : ''} ${activeCommentId ? 'active-comment' : ''}`}>
                   <EditorContent editor={editor} className="outline-none" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="w-80 shrink-0 border-r border-border bg-background overflow-y-auto flex flex-col shadow-[[-10px_0_20px_rgba(0,0,0,0.03)]] z-10">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">
              הערות {openComments.length > 0 && <span className="mr-1.5 text-[10px] bg-orange-100 text-orange-700 rounded-full px-1.5 py-0.5">{openComments.length} פתוחות</span>}
            </span>
            <button type="button" onClick={() => setShowInput((v) => !v)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
              <Plus className="w-3.5 h-3.5" />הוסף
            </button>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-2.5 overflow-y-auto">
            {showInput && !replyingTo && (
              <div className="border border-primary/30 rounded-2xl overflow-hidden bg-white shadow-sm mb-1">
                <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                  <UserAvatar name={currentUserName} size="sm" />
                  <span className="text-xs font-semibold text-foreground">{currentUserName}</span>
                  <span className="text-[10px] text-muted-foreground">עכשיו</span>
                </div>
                <textarea
                  value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendComment(); } }}
                  placeholder="כתוב הערה... (Ctrl+Enter לשליחה)" rows={3} autoFocus
                  className="w-full px-4 pb-2 text-sm bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex justify-between items-center px-3 py-2 border-t border-border/60">
                  <button type="button" onClick={() => setShowInput(false)} className="text-xs text-muted-foreground hover:text-foreground">ביטול</button>
                  <Button size="sm" onClick={() => sendComment()} disabled={!replyText.trim()} className="h-7 text-xs gap-1"><Send className="w-3 h-3" />שלח</Button>
                </div>
              </div>
            )}

            {openComments.map((c) => {
              const isActive = activeCommentId === c.id;
              const isHovered = hoveredCommentId === c.id;
              return (
              <div 
                key={c.id} 
                id={`comment-card-${c.id}`}
                onMouseEnter={() => setHoveredCommentId(c.id)}
                onMouseLeave={() => setHoveredCommentId(null)}
                onClick={() => {
                   setActiveCommentId(c.id);
                   // Scroll to the highlight in the editor
                   if (c.highlightId) {
                     const mark = document.querySelector(`mark[data-comment-id="${c.highlightId}"]`);
                     if (mark) {
                       mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     }
                   }
                }}
                className={`border rounded-2xl p-4 bg-white transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer
                  ${isActive 
                    ? 'ring-2 ring-primary/40 shadow-xl -translate-x-1 border-primary/40' 
                    : isHovered 
                      ? 'border-primary shadow-lg scale-[1.02] -translate-x-1' 
                      : 'border-border shadow-sm hover:border-primary/40'}`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <UserAvatar name={c.authorName} size="sm" />
                  <span className="font-semibold text-sm text-foreground">{c.authorName}</span>
                  <span className="text-[10px] text-muted-foreground mr-auto">{timeAgo(c.createdAt)}</span>
                  <button type="button" onClick={() => resolveComment(c.id)} className="p-0.5 rounded hover:bg-muted transition-colors"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{c.text}</p>
                
                {/* Replies */}
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-3 pl-3 border-r-2 border-muted" dir="rtl">
                    {c.replies.map(r => (
                       <div key={r.id} className="mt-3 flex gap-2">
                         <UserAvatar name={r.authorName} size="sm" />
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="font-semibold text-xs text-foreground">{r.authorName}</span>
                             <span className="text-[10px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                           </div>
                           <p className="text-xs text-muted-foreground mt-0.5">{r.text}</p>
                         </div>
                       </div>
                    ))}
                  </div>
                )}

                {replyingTo === c.id && (
                  <div className="mt-3 bg-muted/20 rounded-xl p-2 border border-border">
                     <textarea
                        value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        placeholder="הגב להערה..." rows={2} autoFocus
                        className="w-full px-2 py-1 text-xs bg-transparent border-0 rounded outline-none resize-none mb-2"
                      />
                      <div className="flex justify-end gap-2 border-t border-border pt-2">
                        <button type="button" onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-[10px] text-muted-foreground font-medium">ביטול</button>
                        <Button size="sm" onClick={() => sendComment(c.id)} disabled={!replyText.trim()} className="h-6 text-[10px] px-3 py-0 bg-primary/90">הגב</Button>
                      </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40 text-xs font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleLike(c.id)} className={`flex items-center gap-1.5 transition-colors ${c.likedBy?.includes(currentUserId) ? 'text-primary' : 'hover:text-foreground'}`}>
                    <ThumbsUp className="w-3.5 h-3.5" /> Like {c.likedBy && c.likedBy.length > 0 ? `(${c.likedBy.length})` : ''}
                  </button>
                  <button type="button" onClick={() => { setReplyingTo(c.id); setReplyText(""); }} className="flex items-center gap-1.5 hover:text-foreground transition-colors"><Reply className="w-3.5 h-3.5" />Reply</button>
                  <button type="button" onClick={() => resolveComment(c.id)} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"><Check className="w-3.5 h-3.5" />Resolve</button>
                </div>
              </div>
              );
            })}

            {resolvedComments.length > 0 && (
              <div className="border border-border/40 rounded-2xl overflow-hidden mt-4">
                <div className="px-4 py-2.5 bg-muted/30 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {resolvedComments.length} הערות נפתרו
                </div>
              </div>
            )}
            
            {comments.length === 0 && !showInput && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">אין הערות עדיין</p>
                <button type="button" onClick={() => setShowInput(true)} className="text-xs text-primary hover:underline font-medium">הוסף הערה ראשונה</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

type TabId = "shoots" | "scripts" | "videos";

export default function ShootDays() {
  const { user } = useAuth();

  const [shootDays,    setShootDays]    = useState<ShootDay[]>(mockShootDays);
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContentItems);
  const [scripts,      setScripts]      = useState<Script[]>(mockScripts);
  const [videoFiles,   setVideoFiles]   = useState<VideoFile[]>(mockVideoFiles);

  const [activeTab,    setActiveTab]    = useState<TabId>("shoots");
  const [shootFilter,  setShootFilter]  = useState<string | null>(null); // filter scripts/videos by shoot day
  const [search,       setSearch]       = useState("");

  const [selectedDay,    setSelectedDay]    = useState<ShootDay | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedVideo,  setSelectedVideo]  = useState<VideoFile | null>(null);
  const [scriptFullScreen, setScriptFullScreen] = useState(false);

  // DnD state for video Kanban
  const [draggedId,  setDraggedId]  = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<VideoStatus | null>(null);

  if (!user) return null;

  const category   = getRoleCategory(user.role);
  const canManage  = category === "admin" || category === "team";
  const isClient   = category === "client";
  const myClientId = isClient ? (CLIENT_TO_ID[user.id] ?? user.id) : null;

  // ── Filtered data ─────────────────────────────────────────────────

  const visibleShootDays = useMemo(() => {
    let list = shootDays;
    if (myClientId) list = list.filter((d) => d.clientId === myClientId);
    if (search) list = list.filter((d) => d.clientName.includes(search) || d.location.includes(search));
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [shootDays, myClientId, search]);

  const visibleScripts = useMemo(() => {
    let list = scripts;
    if (myClientId) list = list.filter((s) => s.clientId === myClientId);
    if (shootFilter) list = list.filter((s) => s.shootDayId === shootFilter);
    if (search) list = list.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) || s.clientName.includes(search)
    );
    return list;
  }, [scripts, myClientId, shootFilter, search]);

  const visibleVideos = useMemo(() => {
    let list = videoFiles;
    if (myClientId) list = list.filter((v) => v.clientId === myClientId);
    if (shootFilter) list = list.filter((v) => v.shootDayId === shootFilter);
    if (search) list = list.filter((v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) || v.clientName.includes(search)
    );
    return list;
  }, [videoFiles, myClientId, shootFilter, search]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleShootStatusChange = useCallback((id: string, status: ShootDayStatus) => {
    setShootDays((p) => p.map((d) => d.id === id ? { ...d, status } : d));
    setSelectedDay((p) => p?.id === id ? { ...p, status } : p);
  }, []);

  const handleScriptStatusChange = useCallback((id: string, status: ScriptStatus) => {
    setScripts((p) => p.map((s) => s.id === id
      ? { ...s, status, approvedAt: status === "approved" ? new Date().toISOString() : s.approvedAt }
      : s
    ));
    setSelectedScript((p) => p?.id === id ? { ...p, status } : p);
  }, []);

  const handleScriptUpdate = useCallback((id: string, content: string) => {
    setScripts((p) => p.map((s) => s.id === id ? { ...s, content } : s));
    setSelectedScript((p) => p?.id === id ? { ...p, content } : p);
  }, []);

  const handleVideoStatusChange = useCallback((id: string, status: VideoStatus) => {
    setVideoFiles((p) => p.map((v) => v.id === id ? { ...v, status } : v));
    setSelectedVideo((p) => p?.id === id ? { ...p, status } : p);
  }, []);

  const handleDropVideo = useCallback((videoId: string, status: VideoStatus) => {
    setVideoFiles((p) => p.map((v) => v.id === videoId ? { ...v, status } : v));
    setSelectedVideo((p) => p?.id === videoId ? { ...p, status } : p);
  }, []);

  const handleFolderClick = (day: ShootDay, folder: "scripts" | "videos") => {
    setShootFilter(day.id);
    setSearch("");
    setSelectedDay(null);
    setActiveTab(folder === "scripts" ? "scripts" : "videos");
  };

  // helpers for cross-references
  const getShootScripts = (day: ShootDay) => scripts.filter((s) => s.shootDayId === day.id);
  const getShootVideos  = (day: ShootDay) => videoFiles.filter((v) => v.shootDayId === day.id);

  const shootFilterLabel = shootFilter
    ? shootDays.find((d) => d.id === shootFilter)?.clientName
    : null;

  const anyPanelOpen = !!(selectedDay || selectedScript || selectedVideo) && !scriptFullScreen;

  // ── Full-screen script document view ──────────────────────────────
  if (scriptFullScreen && selectedScript) {
    return (
      <ScriptDocumentView
        script={selectedScript}
        onBack={() => { setScriptFullScreen(false); setSelectedScript(null); }}
        onStatusChange={handleScriptStatusChange}
        onScriptUpdate={handleScriptUpdate}
        canManage={canManage}
        isClient={isClient}
        currentUserId={user.id}
        currentUserName={user.name}
        currentUserRole={user.role}
      />
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <PageHeader
        title="תוכן"
        description="ניהול ימי צילום, תסריטים ועריכות סרטונים"
        action={
          canManage ? (
            <div className="flex gap-2">
              {activeTab === "shoots" && (
                <Button type="button" variant="outline" onClick={() => toast.info("פתיחת טופס: יום צילום (Sprint 4)")} className="gap-2">
                  <Camera className="w-4 h-4" /> יום צילום
                </Button>
              )}
              {activeTab === "scripts" && (
                <Button type="button" onClick={() => toast.info("פתיחת טופס: תסריט חדש (Sprint 4)")} className="gap-2">
                  <FileText className="w-4 h-4" /> תסריט חדש
                </Button>
              )}
              {activeTab === "videos" && (
                <Button type="button" onClick={() => toast.info("פתיחת טופס: העלאת סרטון (Sprint 4)")} className="gap-2">
                  <Video className="w-4 h-4" /> + סרטון
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop */}
        {anyPanelOpen && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-30"
            onClick={() => { setSelectedDay(null); setSelectedScript(null); setSelectedVideo(null); }} />
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar + filters */}
          <div className="flex items-center gap-3 border-b border-border px-1 pb-3 pt-1 shrink-0 flex-wrap">
            {/* Tabs */}
            <div className="flex">
              {([
                { id: "shoots",  label: "ימי צילום",        count: visibleShootDays.length },
                { id: "scripts", label: "תסריטים",           count: visibleScripts.length },
                { id: "videos",  label: "עריכות סרטונים",    count: visibleVideos.length },
              ] as { id: TabId; label: string; count: number }[]).map(({ id, label, count }) => (
                <button key={id} type="button"
                  onClick={() => { setActiveTab(id); setSearch(""); }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
                    ${activeTab === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-xs flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9 h-8 text-sm" />
            </div>

            {/* Shoot filter badge */}
            {shootFilter && (shootFilterLabel) && (
              <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary
                rounded-full px-3 py-1 font-medium">
                <Folder className="w-3 h-3" />
                {shootFilterLabel}
                <button type="button" onClick={() => setShootFilter(null)} className="hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* ── Shoots tab ── */}
            {activeTab === "shoots" && (
              visibleShootDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Camera className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">אין ימי צילום</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleShootDays.map((day) => (
                    <ShootDayCard
                      key={day.id} day={day}
                      scripts={getShootScripts(day)}
                      videos={getShootVideos(day)}
                      isSelected={selectedDay?.id === day.id}
                      onClick={() => { setSelectedDay(day); setSelectedScript(null); setSelectedVideo(null); }}
                      onFolderClick={(folder) => handleFolderClick(day, folder)}
                    />
                  ))}
                </div>
              )
            )}

            {/* ── Scripts tab ── */}
            {activeTab === "scripts" && (
              visibleScripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FileText className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">אין תסריטים</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-w-2xl">
                  {visibleScripts.map((s) => (
                    <ScriptCard key={s.id} script={s}
                      isSelected={selectedScript?.id === s.id}
                      onClick={() => {
                        setSelectedScript(s);
                        setScriptFullScreen(true);
                        setSelectedDay(null);
                        setSelectedVideo(null);
                      }}
                    />
                  ))}
                </div>
              )
            )}

            {/* ── Videos Kanban tab ── */}
            {activeTab === "videos" && (
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-5 pb-6 pt-1" style={{ minWidth: "max-content" }}>
                  {VIDEO_KANBAN_COLS.map((col) => (
                    <VideoKanbanColumn
                      key={col.id}
                      col={col}
                      videos={visibleVideos.filter((v) => v.status === col.id)}
                      draggedId={draggedId}
                      isDropTarget={dropTarget === col.id && !!draggedId}
                      onCardClick={(v) => { setSelectedVideo(v); setSelectedDay(null); setSelectedScript(null); }}
                      onDragStart={(id) => setDraggedId(id)}
                      onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(col.id); }}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedId) { handleDropVideo(draggedId, col.id); setDraggedId(null); setDropTarget(null); }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail panels */}
        {selectedDay && (
          <ShootDayDetailPanel
            day={selectedDay}
            scripts={getShootScripts(selectedDay)}
            videos={getShootVideos(selectedDay)}
            onClose={() => setSelectedDay(null)}
            onStatusChange={handleShootStatusChange}
            onFolderClick={(folder) => handleFolderClick(selectedDay, folder)}
            canManage={canManage}
          />
        )}
        {selectedScript && (
          <ScriptDetailPanel
            script={selectedScript}
            onClose={() => setSelectedScript(null)}
            onStatusChange={handleScriptStatusChange}
            canManage={canManage}
            isClient={isClient}
            currentUserId={user.id}
            currentUserName={user.name}
          />
        )}
        {selectedVideo && (
          <VideoDetailPanel
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onStatusChange={handleVideoStatusChange}
            canManage={canManage}
            isClient={isClient}
            currentUserId={user.id}
            currentUserName={user.name}
          />
        )}
      </div>
    </div>
  );
}
