import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleCategory } from "@/types/user";
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
  mockTickets, Ticket, TicketStatus, TicketReply, TicketCategory,
  TicketAttachment, ticketStatusConfig, ticketPriorityConfig,
  ticketCategoryConfig,
} from "@/data/ticketsMock";
import {
  Plus, MessageCircle, Clock, X, AlertCircle, User,
  MoreHorizontal, Send, Lock, Unlock, GripVertical, Paperclip,
  Download, Eye, FileText, ImageIcon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TO_ID: Record<string, string> = { "3": "c1" };

const MOCK_CLIENTS = [
  { id: "c1", name: "בוטיק מיה" },
  { id: "c2", name: "שיפוץ בית" },
  { id: "c3", name: "גלריית אמנות ירדן" },
  { id: "c4", name: "קליניקת ד״ר לוי" },
  { id: "c5", name: "סטודיו פילאטיס גל" },
];

const STATUS_ORDER: TicketStatus[] = ["open", "pending", "in_progress", "closed"];

const STATUS_BG: Record<TicketStatus, string> = {
  open:        "bg-blue-500",
  pending:     "bg-orange-500",
  in_progress: "bg-yellow-500",
  closed:      "bg-emerald-500",
};

const TICKET_KANBAN_COLS = [
  { id: "open"        as TicketStatus, label: "פניות חדשות",  dotColor: "bg-blue-500" },
  { id: "pending"     as TicketStatus, label: "ממתין לטיפול", dotColor: "bg-orange-500" },
  { id: "in_progress" as TicketStatus, label: "בטיפול",       dotColor: "bg-yellow-500" },
  { id: "closed"      as TicketStatus, label: "פנייה נסגרה",  dotColor: "bg-emerald-500" },
];

const PRIORITY_BORDER: Record<string, string> = {
  normal: "border-l-slate-400",
  urgent: "border-l-red-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60)    return "עכשיו";
  if (d < 3600)  return `לפני ${Math.floor(d / 60)} דק׳`;
  if (d < 86400) return `לפני ${Math.floor(d / 3600)} שע׳`;
  return `לפני ${Math.floor(d / 86400)} ימים`;
}

function formatBytes(n: number): string {
  if (n < 1024)        return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function readFilesAsAttachments(
  fileList: FileList,
  onDone: (files: TicketAttachment[]) => void
) {
  const result: TicketAttachment[] = [];
  let remaining = fileList.length;
  if (remaining === 0) { onDone([]); return; }
  Array.from(fileList).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      result.push({
        id: `ta${Date.now()}${Math.random().toString(36).slice(2)}`,
        name: file.name, size: file.size, mimeType: file.type,
        dataUrl: ev.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
      remaining--;
      if (remaining === 0) onDone(result);
    };
    reader.readAsDataURL(file);
  });
}

function downloadFile(f: TicketAttachment) {
  const a = document.createElement("a");
  a.href = f.dataUrl; a.download = f.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Attachment Chip ──────────────────────────────────────────────────────────

function AttachmentChip({
  file, onRemove, onView,
}: {
  file: TicketAttachment; onRemove?: () => void; onView?: () => void;
}) {
  const isImage = file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/");
  return (
    <div className="relative group flex items-center gap-2 bg-muted rounded-xl overflow-hidden border border-border pr-2 max-w-[160px]">
      {file.mimeType.startsWith("image/") ? (
        <img src={file.dataUrl} alt={file.name} className="w-10 h-10 object-cover shrink-0" />
      ) : file.mimeType.startsWith("video/") ? (
        <div className="w-10 h-10 bg-muted-foreground/10 flex items-center justify-center shrink-0">
          <span className="text-lg">🎥</span>
        </div>
      ) : (
        <div className="w-10 h-10 bg-muted-foreground/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground/50" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
      <div className="flex items-center gap-0.5">
        {onView && (
          <button type="button" onClick={onView}
            className="shrink-0 w-5 h-5 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center transition-colors">
            <Eye className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
        {onRemove && (
          <button type="button" onClick={onRemove}
            className="shrink-0 w-5 h-5 rounded-full hover:bg-destructive hover:text-white flex items-center justify-center transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── File View Modal ──────────────────────────────────────────────────────────

function FileViewModal({ file, onClose }: { file: TicketAttachment | null; onClose: () => void }) {
  if (!file) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-[500] flex items-center justify-center p-6"
      onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-1.5 shadow-xl z-10 hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-700" />
        </button>
        {file.mimeType.startsWith("image/") ? (
          <img src={file.dataUrl} alt={file.name}
            className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain" />
        ) : file.mimeType.startsWith("video/") ? (
          <video src={file.dataUrl} controls
            className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold mb-6">{file.name}</p>
            <Button onClick={() => downloadFile(file)} className="gap-2">
              <Download className="w-4 h-4" /> הורד
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
          <span className="text-white text-sm font-medium">{file.name}</span>
          <span className="text-white/60 text-xs">{formatBytes(file.size)}</span>
          <Button size="sm" onClick={() => downloadFile(file)}
            className="bg-white text-gray-900 hover:bg-gray-100 gap-1.5 ml-2">
            <Download className="w-3.5 h-3.5" /> הורד
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Kanban Card (team/admin) ──────────────────────────────────────────

function TicketKanbanCard({
  ticket, isDragging, onClick, onDragStart, onDragEnd,
}: {
  ticket: Ticket; isDragging: boolean;
  onClick: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  const sc = ticketStatusConfig[ticket.status];
  const pc = ticketPriorityConfig[ticket.priority];
  const cat = ticket.category ? ticketCategoryConfig[ticket.category] : null;

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-card rounded-xl border border-border/60
        border-l-[3px] ${pc.borderCls}
        shadow-sm hover:shadow-md transition-all duration-200
        cursor-grab active:cursor-grabbing select-none p-4
        ${isDragging ? "opacity-25 scale-95 rotate-1" : "opacity-100"}
      `}
    >
      <div className="absolute top-3 left-2 opacity-0 group-hover:opacity-25 transition-opacity pointer-events-none">
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Header chips */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {ticket.priority === "urgent" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            🚨 דחוף
          </span>
        )}
        {cat && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {cat.emoji} {cat.label}
          </span>
        )}
      </div>

      <p className="font-semibold text-[13.5px] text-foreground leading-snug mb-1">
        {ticket.subject}
      </p>
      <p className="text-xs text-muted-foreground mb-3">{ticket.clientName}</p>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Clock className="w-3 h-3 shrink-0" />
        <span>{timeAgo(ticket.createdAt)}</span>
        {ticket.replies.length > 0 && (
          <span className="flex items-center gap-0.5">
            <MessageCircle className="w-3 h-3" />
            {ticket.replies.length}
          </span>
        )}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <span className="flex items-center gap-0.5">
            <Paperclip className="w-3 h-3" />
            {ticket.attachments.length}
          </span>
        )}
        <div className="mr-auto" title={ticket.assignedToName ?? "לא הוקצה"}>
          {ticket.assignedToId
            ? <UserAvatar name={ticket.assignedToName!} size="sm" />
            : <User className="w-4 h-4 text-muted-foreground/40" />
          }
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Kanban Column ─────────────────────────────────────────────────────

function TicketKanbanColumn({
  label, dotColor, tickets, draggedId, isDropTarget,
  onCardClick, onAddClick, onDragStart, onDragEnd,
  onDragOver, onDragLeave, onDrop,
}: {
  label: string; dotColor: string; tickets: Ticket[];
  draggedId: string | null; isDropTarget: boolean;
  onCardClick: (t: Ticket) => void; onAddClick: () => void;
  onDragStart: (id: string) => void; onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px] flex-1">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-3 h-3 rounded-full ${dotColor}`} />
        <span className="font-bold text-sm text-foreground flex-1">{label}</span>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-semibold">
          {tickets.length}
        </span>
        <button type="button" onClick={onAddClick}
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        className={`
          flex flex-col gap-2.5 flex-1 min-h-[100px] rounded-2xl p-2 transition-all duration-200
          ${isDropTarget ? "bg-primary/5 ring-2 ring-primary/25 ring-inset scale-[1.01]" : "bg-muted/20"}
        `}
      >
        {tickets.map((t) => (
          <TicketKanbanCard
            key={t.id} ticket={t}
            isDragging={draggedId === t.id}
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
        {!isDropTarget && tickets.length === 0 && (
          <div className="h-14 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40">ריק</span>
          </div>
        )}
      </div>

      <button type="button" onClick={onAddClick}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors">
        <Plus className="w-3.5 h-3.5" /> הוסף פנייה
      </button>
    </div>
  );
}

// ─── List Card (client view) ──────────────────────────────────────────────────

function TicketListCard({
  ticket, isSelected, onClick,
}: {
  ticket: Ticket; isSelected: boolean; onClick: () => void;
}) {
  const sc  = ticketStatusConfig[ticket.status];
  const pc  = ticketPriorityConfig[ticket.priority];
  const cat = ticket.category ? ticketCategoryConfig[ticket.category] : null;

  return (
    <button onClick={onClick}
      className={`
        w-full text-right bg-white dark:bg-card rounded-2xl border border-l-[3px]
        ${pc.borderCls} shadow-sm hover:shadow-md transition-all duration-200 p-4
        ${isSelected ? "ring-2 ring-primary/40" : "border-border/60"}
      `}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-mono">#{ticket.id.replace("tk", "")}</span>
        {ticket.priority === "urgent" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">דחוף</span>
        )}
        {cat && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {cat.emoji} {cat.label}
          </span>
        )}
        <span className={`mr-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.chipCls}`}>
          {sc.label}
        </span>
      </div>
      <p className="font-semibold text-[0.875rem] text-foreground leading-snug mb-1.5">{ticket.subject}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/70">{ticket.clientName}</span>
        {ticket.replies.length > 0 && (
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{ticket.replies.length}</span>
        )}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{ticket.attachments.length}</span>
        )}
        <span className="flex items-center gap-1 mr-auto"><Clock className="w-3 h-3" />{timeAgo(ticket.createdAt)}</span>
      </div>
    </button>
  );
}

// ─── Ticket Detail / Chat Panel ───────────────────────────────────────────────

function TicketChatPanel({
  ticket, canManage, currentUserId, currentUserName,
  onClose, onAddReply, onStatusChange,
}: {
  ticket: Ticket; canManage: boolean;
  currentUserId: string; currentUserName: string;
  onClose: () => void;
  onAddReply: (ticketId: string, text: string, isInternal: boolean, attachments: TicketAttachment[]) => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
}) {
  const [replyText, setReplyText]   = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<TicketAttachment[]>([]);
  const [viewFile, setViewFile]     = useState<TicketAttachment | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sc = ticketStatusConfig[ticket.status];
  const cat = ticket.category ? ticketCategoryConfig[ticket.category] : null;

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    readFilesAsAttachments(files, (attached) =>
      setPendingFiles((p) => [...p, ...attached])
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if (!replyText.trim() && pendingFiles.length === 0) return;
    onAddReply(ticket.id, replyText.trim(), isInternal, pendingFiles);
    setReplyText(""); setPendingFiles([]); setIsInternal(false);
  };

  return (
    <div
      className="fixed inset-y-0 left-0 w-full sm:w-[720px] bg-background z-40
        flex flex-col border-r border-border shadow-[4px_0_40px_rgba(0,0,0,0.12)]
        animate-in slide-in-from-left duration-300 ease-out"
      dir="rtl" onClick={(e) => e.stopPropagation()}
    >
      <FileViewModal file={viewFile} onClose={() => setViewFile(null)} />

      {/* Accent strip */}
      <div className={`h-1 w-full ${STATUS_BG[ticket.status]}`} />

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono">#{ticket.id.replace("tk", "")}</span>
            {cat && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat.emoji} {cat.label}</span>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.chipCls}`}>{sc.label}</span>
          </div>
          <h2 className="text-base font-bold text-foreground leading-snug">{ticket.subject}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5 mt-1 inline-block">{ticket.clientName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44" style={{ direction: "rtl" }}>
                {STATUS_ORDER.filter((s) => s !== ticket.status).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => onStatusChange(ticket.id, s)} className="gap-2 cursor-pointer">
                    <span className={`w-2 h-2 rounded-full ${ticketStatusConfig[s].dotColor}`} />
                    שנה ל: {ticketStatusConfig[s].label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClose} className="gap-2 cursor-pointer">
                  <X className="w-4 h-4" /> סגור
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Status chips */}
      {canManage && (
        <div className="px-5 py-3 border-b border-border shrink-0 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground ml-2">סטטוס:</span>
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button"
              onClick={() => ticket.status !== s && onStatusChange(ticket.id, s)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border
                ${ticket.status === s
                  ? `${STATUS_BG[s]} text-white border-transparent shadow-sm scale-105`
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted cursor-pointer"
                }`}
            >
              {ticketStatusConfig[s].label}
            </button>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 px-5 py-3 border-b border-border bg-muted/10 text-xs shrink-0">
        <div>
          <p className="text-muted-foreground mb-0.5">נפתחה ע״י</p>
          <div className="flex items-center gap-1.5">
            <UserAvatar name={ticket.createdByName} size="sm" />
            <span className="font-medium">{ticket.createdByName}</span>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">מוקצה ל</p>
          {ticket.assignedToId ? (
            <div className="flex items-center gap-1.5">
              <UserAvatar name={ticket.assignedToName!} size="sm" />
              <span className="font-medium">{ticket.assignedToName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/60 flex items-center gap-1">
              <User className="w-3 h-3" /> לא הוקצה
            </span>
          )}
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">נפתחה</p>
          <span className="font-medium">{timeAgo(ticket.createdAt)}</span>
        </div>
        {ticket.priority === "urgent" && (
          <div>
            <p className="text-muted-foreground mb-0.5">עדיפות</p>
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <AlertCircle className="w-3 h-3" /> דחוף
            </span>
          </div>
        )}
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 flex flex-col gap-4">
          {/* Triage Brief / Admin Instructions */}
          {canManage && ticket.triageNotes && (
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 mb-2 flex flex-col gap-2">
               <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
                 <FileText className="w-4 h-4" /> בריף מנהל פנימי לאיש הצוות
               </div>
               <p className="text-sm text-purple-900/80 leading-relaxed">
                 {ticket.triageNotes}
               </p>
            </div>
          )}

          {/* Original message */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <UserAvatar name={ticket.createdByName} size="sm" />
              <span className="text-xs font-semibold">{ticket.createdByName}</span>
              <span className="text-[10px] text-muted-foreground mr-auto">{timeAgo(ticket.createdAt)}</span>
            </div>
            <div className="bg-muted/40 rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-relaxed mr-8">
              {ticket.body}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/40">
                  {ticket.attachments.map((f) => (
                    <AttachmentChip key={f.id} file={f}
                      onView={() => setViewFile(f)}
                      onRemove={undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Replies */}
          {ticket.replies.map((reply) => {
            if (!canManage && reply.isInternal) return null;
            const isOwn = reply.authorId === currentUserId;
            return (
              <div key={reply.id} className={`flex flex-col gap-2 ${isOwn ? "items-end" : "items-start"}`}>
                {reply.isInternal && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Lock className="w-2.5 h-2.5" /> הערה פנימית
                  </div>
                )}
                <div className={`flex items-end gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && <UserAvatar name={reply.authorName} size="sm" />}
                  <div>
                    {!isOwn && <span className="text-xs font-semibold block mb-1 px-1">{reply.authorName}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${isOwn
                        ? "bg-primary text-primary-foreground rounded-tl-md shadow-sm"
                        : reply.isInternal
                          ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tr-md"
                          : "bg-muted text-foreground rounded-tr-md"
                      }`}
                    >
                      {reply.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block px-1">{timeAgo(reply.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply input */}
      {ticket.status !== "closed" ? (
        <div className="p-4 border-t border-border shrink-0 bg-background">
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleAttach} />

          {canManage && (
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setIsInternal((v) => !v)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all
                  ${isInternal
                    ? "bg-amber-50 border-amber-300 text-amber-700 font-medium"
                    : "bg-muted border-border text-muted-foreground"}`}
              >
                {isInternal ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isInternal ? "הערה פנימית" : "תגובה ציבורית"}
              </button>
            </div>
          )}

          <div className={`rounded-xl border overflow-hidden transition-all
            ${isInternal
              ? "border-amber-300 focus-within:ring-2 focus-within:ring-amber-300/40"
              : "border-border focus-within:ring-2 focus-within:ring-primary/25"}`}
          >
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1">
                {pendingFiles.map((f) => (
                  <AttachmentChip key={f.id} file={f}
                    onRemove={() => setPendingFiles((p) => p.filter((x) => x.id !== f.id))}
                  />
                ))}
              </div>
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }}
              placeholder={isInternal ? "הוסף הערה פנימית..." : "כתוב תגובה... (Ctrl+Enter לשליחה)"}
              rows={3}
              className={`w-full px-4 py-3 text-sm bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground
                ${isInternal ? "bg-amber-50/30" : ""}`}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/10">
              <button type="button" onClick={() => fileRef.current?.click()}
                className={`p-1.5 rounded-md hover:bg-muted transition-colors ${pendingFiles.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                title="צרף קובץ">
                <Paperclip className="w-4 h-4" />
              </button>
              <Button type="button" size="sm" onClick={submit}
                disabled={!replyText.trim() && pendingFiles.length === 0}
                className={`gap-1.5 h-8 px-4 text-xs font-semibold
                  ${isInternal ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}`}
              >
                <Send className="w-3 h-3" />
                {isInternal ? "שמור הערה" : "שלח"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 border-t border-border pt-4 text-center shrink-0">
          <span className="bg-green-100 text-green-700 rounded-full px-4 py-2 text-xs font-medium">✓ הפנייה נסגרה</span>
          {canManage && (
            <button type="button" onClick={() => onStatusChange(ticket.id, "open")}
              className="block mx-auto mt-2 text-xs text-primary hover:underline">פתח מחדש</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── New Ticket Dialog ────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: TicketCategory[] = [
  "general", "social", "content", "design", "photography", "reports", "technical", "billing",
];

export function NewTicketDialog({
  open, onClose, onAdd, currentUserId, currentUserName, defaultClientId,
}: {
  open: boolean; onClose: () => void;
  onAdd: (t: Ticket) => void;
  currentUserId: string; currentUserName: string;
  defaultClientId?: string;
}) {
  const [subject,    setSubject]   = useState("");
  const [body,       setBody]      = useState("");
  const [priority,   setPriority]  = useState<"normal" | "urgent">("normal");
  const [category,   setCategory]  = useState<TicketCategory>("general");
  const [clientId,   setClientId]  = useState(defaultClientId ?? "");
  const [files,      setFiles]     = useState<TicketAttachment[]>([]);
  const [error,      setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files; if (!fl) return;
    readFilesAsAttachments(fl, (attached) => setFiles((p) => [...p, ...attached]));
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setSubject(""); setBody(""); setPriority("normal");
    setCategory("general"); setClientId(defaultClientId ?? "");
    setFiles([]); setError("");
  };

  const handleSubmit = () => {
    if (!subject.trim()) { setError("נושא הפנייה הוא שדה חובה"); return; }
    if (!body.trim())    { setError("תיאור הבעיה הוא שדה חובה"); return; }
    const client = MOCK_CLIENTS.find((c) => c.id === clientId)
      ?? { id: currentUserId, name: currentUserName };
    onAdd({
      id:             `tk${Date.now()}`,
      subject:        subject.trim(),
      body:           body.trim(),
      status:         "pending",
      priority,
      category,
      clientId:       client.id,
      clientName:     client.name,
      createdById:    currentUserId,
      createdByName:  currentUserName,
      createdAt:      new Date().toISOString(),
      replies:        [],
      attachments:    files.length > 0 ? files : undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { reset(); onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> פנייה חדשה
          </DialogTitle>
        </DialogHeader>

        <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleAttach} />

        <div className="flex flex-col gap-4 py-2">
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          {/* Category */}
          <div className="grid gap-1.5">
            <Label>מחלקה / קטגוריה</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => {
                  const cfg = ticketCategoryConfig[c];
                  return (
                    <SelectItem key={c} value={c}>
                      {cfg.emoji} {cfg.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="grid gap-1.5">
            <Label>נושא הפנייה *</Label>
            <Input
              placeholder="לדוגמה: לא מצליח לראות את הדוח"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoFocus
            />
          </div>

          {/* Body */}
          <div className="grid gap-1.5">
            <Label>תיאור הבעיה *</Label>
            <textarea
              rows={4}
              placeholder="תאר את הבעיה או הבקשה בפירוט. כמה יותר פרטים — כך נוכל לעזור מהר יותר."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); } }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Attachments */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label>קבצים מצורפים (אופציונלי)</Label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                <Paperclip className="w-3.5 h-3.5" /> צרף תמונה / סרטון
              </button>
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <AttachmentChip key={f.id} file={f}
                    onRemove={() => setFiles((p) => p.filter((x) => x.id !== f.id))} />
                ))}
              </div>
            )}
            {files.length === 0 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 py-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                <Paperclip className="w-6 h-6 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">גרור קבצים לכאן או <span className="text-primary font-medium">בחר קובץ</span></span>
                <span className="text-[10px] text-muted-foreground/60">תמונות וסרטונים</span>
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="grid gap-1.5">
            <Label>עדיפות</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as "normal" | "urgent")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">רגיל</SelectItem>
                <SelectItem value="urgent">🚨 דחוף — דורש מענה מיידי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client (admin only) */}
          {!defaultClientId && (
            <div className="grid gap-1.5">
              <Label>עבור לקוח</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                <SelectContent>
                  {MOCK_CLIENTS.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-row-reverse">
          <Button type="button" onClick={handleSubmit} className="gap-1.5">
            <Send className="w-4 h-4" /> שלח פנייה
          </Button>
          <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>ביטול</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const LIST_TABS = [
  { id: "open"        as TicketStatus, label: "פניות חדשות" },
  { id: "pending"     as TicketStatus, label: "ממתין לטיפול" },
  { id: "in_progress" as TicketStatus, label: "בטיפול" },
  { id: "closed"      as TicketStatus, label: "סגורות" },
];

export default function Tickets() {
  const { user } = useAuth();

  const [tickets,    setTickets]   = useState<Ticket[]>(mockTickets);
  const [selected,   setSelected]  = useState<Ticket | null>(null);
  const [newDialog,  setNewDialog] = useState(false);
  const [activeTab,  setActiveTab] = useState<TicketStatus>("open");

  // DnD state (team/admin only)
  const [draggedId,  setDraggedId]  = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TicketStatus | null>(null);

  useEffect(() => {
    const handleNewTicket = (e: CustomEvent<Ticket>) => {
      setTickets((prev) => {
        if (prev.some(t => t.id === e.detail.id)) return prev;
        return [e.detail, ...prev];
      });
      if (e.detail.status) setActiveTab(e.detail.status);
    };
    window.addEventListener("new-ticket", handleNewTicket as EventListener);
    return () => window.removeEventListener("new-ticket", handleNewTicket as EventListener);
  }, []);

  if (!user) return null;

  const category  = getRoleCategory(user.role);
  const canManage = category === "admin" || category === "team";

  // ── Hooks (all before early return) ──────────────────────────────────────

  const visibleTickets = useMemo(() => {
    if (category === "client") {
      const myClientId = CLIENT_TO_ID[user.id] ?? user.id;
      return tickets.filter((t) => t.clientId === myClientId);
    }
    return tickets;
  }, [tickets, user, category]);

  const tabCounts: Record<TicketStatus, number> = useMemo(() => ({
    open:        visibleTickets.filter((t) => t.status === "open").length,
    pending:     visibleTickets.filter((t) => t.status === "pending").length,
    in_progress: visibleTickets.filter((t) => t.status === "in_progress").length,
    closed:      visibleTickets.filter((t) => t.status === "closed").length,
  }), [visibleTickets]);

  const handleDropTicket = useCallback((ticketId: string, status: TicketStatus) => {
    setTickets((p) => p.map((t) => t.id === ticketId ? { ...t, status } : t));
    setSelected((p) => p?.id === ticketId ? { ...p, status } : p);
  }, []);

  const handleAddReply = useCallback((
    ticketId: string, text: string, isInternal: boolean, attachments: TicketAttachment[]
  ) => {
    const reply: TicketReply = {
      id: `r${Date.now()}`,
      authorId: user.id, authorName: user.name,
      text, isInternal,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, replies: [...t.replies, reply] } : t));
    setSelected((prev) => prev?.id === ticketId ? { ...prev, replies: [...prev.replies, reply] } : prev);
  }, [user]);

  const handleStatusChange = useCallback((ticketId: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    setSelected((prev) => prev?.id === ticketId ? { ...prev, status } : prev);
  }, []);

  const handleAddTicket = useCallback((t: Ticket) => {
    setTickets((prev) => [t, ...prev]);
    setSelected(t);
    setActiveTab(t.status);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const defaultClientId = category === "client" ? (CLIENT_TO_ID[user.id] ?? "") : undefined;

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <PageHeader
        title="פניות"
        description={canManage ? "פניות מלקוחות הדורשות מענה" : "הפניות שלך לצוות"}
        action={
          <Button type="button" onClick={() => setNewDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" /> פנייה חדשה
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop */}
        {selected && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-30"
            onClick={() => setSelected(null)} />
        )}

        {/* ── TEAM/ADMIN: Kanban board ── */}
        {canManage ? (
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="flex gap-5 pb-6 pt-1 px-1" style={{ minWidth: "max-content", minHeight: "100%" }}>
              {TICKET_KANBAN_COLS.map((col) => (
                <TicketKanbanColumn
                  key={col.id}
                  label={col.label}
                  dotColor={col.dotColor}
                  tickets={visibleTickets.filter((t) => t.status === col.id)}
                  draggedId={draggedId}
                  isDropTarget={dropTarget === col.id && !!draggedId}
                  onCardClick={(t) => setSelected(t)}
                  onAddClick={() => setNewDialog(true)}
                  onDragStart={(id) => setDraggedId(id)}
                  onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(col.id); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedId) { handleDropTicket(draggedId, col.id); setDraggedId(null); setDropTarget(null); }
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── CLIENT: List view ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border px-1 shrink-0">
              {LIST_TABS.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setActiveTab(id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                  {tabCounts[id] > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
                      ${activeTab === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {tabCounts[id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
              {visibleTickets.filter((t) => t.status === activeTab).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">אין פניות להצגה</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => setNewDialog(true)} className="gap-1.5 mt-1">
                    <Plus className="w-3.5 h-3.5" /> פנייה חדשה
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-w-2xl">
                  {visibleTickets.filter((t) => t.status === activeTab).map((t) => (
                    <TicketListCard
                      key={t.id} ticket={t}
                      isSelected={selected?.id === t.id}
                      onClick={() => setSelected(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat panel (shared) */}
        {selected && (
          <TicketChatPanel
            ticket={selected}
            canManage={canManage}
            currentUserId={user.id}
            currentUserName={user.name}
            onClose={() => setSelected(null)}
            onAddReply={handleAddReply}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <NewTicketDialog
        open={newDialog}
        onClose={() => setNewDialog(false)}
        onAdd={handleAddTicket}
        currentUserId={user.id}
        currentUserName={user.name}
        defaultClientId={defaultClientId}
      />
    </div>
  );
}
