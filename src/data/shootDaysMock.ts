export type ShootDayStatus  = "planned" | "in_progress" | "done" | "cancelled" | "rescheduled";
export type ContentStatus   = "planning" | "shooting" | "editing" | "pending_approval" | "approved" | "published";
export type ContentPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "other";
export type ContentType     = "reel" | "post" | "story" | "video" | "article" | "ad";

export interface ShootDay {
  id: string;
  clientId: string;
  clientName: string;
  date: string;        // "YYYY-MM-DD"
  location: string;
  status: ShootDayStatus;
  crewIds: string[];
  crewNames: string[];
  notes: string;
  contentIds: string[];
  
  clockInTime?: string;
  clockOutTime?: string;
  selfieVerificationUrl?: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  clientName: string;
  shootDayId?: string;
  title: string;
  description: string;
  platform: ContentPlatform;
  contentType: ContentType;
  status: ContentStatus;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;       // "YYYY-MM-DD"
  publishDate?: string;  // "YYYY-MM-DD"
  notes: string;
  tags: string[];
}

// ─── Status configs ───────────────────────────────────────────────────────────

export const shootDayStatusConfig: Record<ShootDayStatus, { label: string; dotColor: string; borderColor: string; chipCls: string }> = {
  planned:    { label: "תוכנן",   dotColor: "bg-blue-500",   borderColor: "border-l-blue-500",   chipCls: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress:{ label: "בצילומים", dotColor: "bg-purple-500", borderColor: "border-l-purple-500", chipCls: "bg-purple-100 text-purple-700 border-purple-200" },
  done:       { label: "בוצע",    dotColor: "bg-green-500",  borderColor: "border-l-green-500",  chipCls: "bg-green-100 text-green-700 border-green-200" },
  cancelled:  { label: "בוטל",    dotColor: "bg-red-500",    borderColor: "border-l-red-500",    chipCls: "bg-red-100 text-red-700 border-red-200" },
  rescheduled:{ label: "נדחה",    dotColor: "bg-orange-500", borderColor: "border-l-orange-500", chipCls: "bg-orange-100 text-orange-700 border-orange-200" },
};

export const contentStatusConfig: Record<ContentStatus, { label: string; step: number; activeCls: string; inactiveCls: string; ganttCls: string }> = {
  planning:         { label: "תכנון",         step: 1, activeCls: "bg-slate-500 text-white",   inactiveCls: "bg-slate-100 text-slate-500",   ganttCls: "bg-slate-300" },
  shooting:         { label: "צילום",          step: 2, activeCls: "bg-purple-500 text-white",  inactiveCls: "bg-purple-100 text-purple-400", ganttCls: "bg-purple-400" },
  editing:          { label: "עריכה",          step: 3, activeCls: "bg-blue-500 text-white",    inactiveCls: "bg-blue-100 text-blue-400",     ganttCls: "bg-blue-400" },
  pending_approval: { label: "ממתין לאישור",    step: 4, activeCls: "bg-orange-500 text-white",  inactiveCls: "bg-orange-100 text-orange-400", ganttCls: "bg-orange-400" },
  approved:         { label: "מאושר",          step: 5, activeCls: "bg-teal-500 text-white",    inactiveCls: "bg-teal-100 text-teal-400",     ganttCls: "bg-teal-400" },
  published:        { label: "פורסם",          step: 6, activeCls: "bg-green-500 text-white",   inactiveCls: "bg-green-100 text-green-400",   ganttCls: "bg-green-500" },
};

export const platformConfig: Record<ContentPlatform, { label: string; iconEmoji: string; bgColor: string; textColor: string }> = {
  instagram: { label: "Instagram", iconEmoji: "📸", bgColor: "bg-gradient-to-br from-pink-500 to-purple-600", textColor: "text-pink-600" },
  tiktok:    { label: "TikTok",   iconEmoji: "🎵", bgColor: "bg-black",                                       textColor: "text-gray-800" },
  youtube:   { label: "YouTube",  iconEmoji: "▶️", bgColor: "bg-red-600",                                     textColor: "text-red-600" },
  facebook:  { label: "Facebook", iconEmoji: "👍", bgColor: "bg-blue-600",                                    textColor: "text-blue-600" },
  linkedin:  { label: "LinkedIn", iconEmoji: "💼", bgColor: "bg-blue-800",                                    textColor: "text-blue-800" },
  other:     { label: "אחר",      iconEmoji: "📌", bgColor: "bg-slate-500",                                   textColor: "text-slate-600" },
};

export const contentTypeConfig: Record<ContentType, { label: string }> = {
  reel:    { label: "רילס" },
  post:    { label: "פוסט" },
  story:   { label: "סטורי" },
  video:   { label: "וידיאו" },
  article: { label: "מאמר" },
  ad:      { label: "פרסום ממומן" },
};

// ─── Platforms list for Gantt rows ────────────────────────────────────────────
export const GANTT_PLATFORMS: ContentPlatform[] = ["instagram", "tiktok", "youtube", "facebook", "linkedin"];

// ─── Script types ─────────────────────────────────────────────────────────────

export type ScriptStatus = "draft" | "pending_approval" | "approved" | "revision_requested";

export const scriptStatusConfig: Record<ScriptStatus, { label: string; chipCls: string; dotColor: string }> = {
  draft:              { label: "טיוטה",           chipCls: "bg-slate-100 text-slate-700 border-slate-200",   dotColor: "bg-slate-400"  },
  pending_approval:   { label: "ממתין לאישור",     chipCls: "bg-orange-100 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
  approved:           { label: "אושר ✓",           chipCls: "bg-green-100 text-green-700 border-green-200",   dotColor: "bg-green-500"  },
  revision_requested: { label: "דרושים תיקונים",   chipCls: "bg-red-100 text-red-700 border-red-200",         dotColor: "bg-red-500"    },
};

export interface ScriptComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  resolved: boolean;
  highlightId?: string;
  likedBy?: string[];
  replies?: {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
  }[];
}

export interface Script {
  id: string;
  shootDayId: string;
  clientId: string;
  clientName: string;
  title: string;
  content: string;        // plain text in Sprint 1; rich HTML in Sprint 2
  status: ScriptStatus;
  createdById: string;
  createdByName: string;
  createdAt: string;
  approvedAt?: string;
  comments: ScriptComment[];
}

// ─── Video Review types ───────────────────────────────────────────────────────

export type VideoStatus = "to_do" | "in_progress" | "in_review" | "approved";

export const videoStatusConfig: Record<VideoStatus, { label: string; dotColor: string; bgCls: string }> = {
  to_do:       { label: "To Do",    dotColor: "bg-slate-400",  bgCls: "bg-slate-50"  },
  in_progress: { label: "בעריכה",   dotColor: "bg-blue-500",   bgCls: "bg-blue-50"   },
  in_review:   { label: "בבדיקה",   dotColor: "bg-orange-500", bgCls: "bg-orange-50" },
  approved:    { label: "מאושר ✓",  dotColor: "bg-green-500",  bgCls: "bg-green-50"  },
};

export const VIDEO_KANBAN_COLS: { id: VideoStatus; label: string; dotColor: string }[] = [
  { id: "to_do",       label: "To Do",     dotColor: "bg-slate-400"  },
  { id: "in_progress", label: "בעריכה",    dotColor: "bg-blue-500"   },
  { id: "in_review",   label: "בבדיקה",    dotColor: "bg-orange-500" },
  { id: "approved",    label: "מאושר ✓",   dotColor: "bg-green-500"  },
];

export interface VideoComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestampSeconds: number;
  resolved: boolean;
  createdAt: string;
}

export interface VideoFile {
  id: string;
  shootDayId: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  status: VideoStatus;
  version: number;           // V1, V2, V3…
  durationSeconds: number;
  fileSizeMB: number;
  thumbnailEmoji: string;    // emoji placeholder until real uploads
  assigneeId: string;        // who requested/manages it (client rep or PM)
  assigneeName: string;
  editorId: string;
  editorName: string;
  uploadedAt: string;
  comments: VideoComment[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockShootDays: ShootDay[] = [
  {
    id: "sd1",
    clientId: "c1", clientName: "בוטיק מיה",
    date: "2026-06-03",
    location: "סטודיו תל-אביב, רחוב דיזנגוף 50",
    status: "planned",
    crewIds: ["5", "4"], crewNames: ["צלם", "עורך וידיאו"],
    notes: "צילום קולקציית קיץ — 20 מוצרים, רקע לבן. לוודא סוללות מטעונות.",
    contentIds: ["ci1", "ci2", "ci3"],
  },
  {
    id: "sd2",
    clientId: "c2", clientName: "שיפוץ בית",
    date: "2026-05-28",
    location: "אתר הפרויקט, רחובות",
    status: "done",
    crewIds: ["5"], crewNames: ["צלם"],
    notes: "צילום פרויקטי שיפוץ לפורטפוליו. 3 דירות, לפני ואחרי.",
    contentIds: ["ci4", "ci5"],
  },
  {
    id: "sd3",
    clientId: "c3", clientName: "גלריית אמנות ירדן",
    date: "2026-06-18",
    location: "הגלריה, רחוב דיזנגוף 100",
    status: "planned",
    crewIds: ["5", "4"], crewNames: ["צלם", "עורך וידיאו"],
    notes: "צילום יצירות חדשות + ראיון עם האמנית.",
    contentIds: ["ci6", "ci7"],
  },
  {
    id: "sd4",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    date: "2026-06-25",
    location: "הקליניקה, הרצליה",
    status: "planned",
    crewIds: ["5", "4"], crewNames: ["צלם", "עורך וידיאו"],
    notes: "צילום סרטון לרילס + תכני שיווק לקליניקה.",
    contentIds: ["ci8", "ci9"],
  },
  {
    id: "sd5",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    date: "2026-05-20",
    location: "הסטודיו, תל-אביב",
    status: "done",
    crewIds: ["5"], crewNames: ["צלם"],
    notes: "צילום שיעור לייב + פורטרטים של המאמנות.",
    contentIds: ["ci10", "ci11"],
  },
  {
    id: "sd6",
    clientId: "c1", clientName: "בוטיק מיה",
    date: "2026-07-10",
    location: "חוץ — חוף הים, תל-אביב",
    status: "planned",
    crewIds: ["5", "4"], crewNames: ["צלם", "עורך וידיאו"],
    notes: "קמפיין קיץ — שוט בחוף. שעת זריחה.",
    contentIds: ["ci12"],
  },
  {
    id: "sd7",
    clientId: "c2", clientName: "שיפוץ בית",
    date: "2026-04-15",
    location: "פרויקט ירושלים",
    status: "cancelled",
    crewIds: ["5"], crewNames: ["צלם"],
    notes: "בוטל עקב מזג אויר.",
    contentIds: [],
  },
  {
    id: "sd8",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    date: "2026-05-12",
    location: "הקליניקה, הרצליה",
    status: "rescheduled",
    crewIds: ["5"], crewNames: ["צלם"],
    notes: "נדחה ל-25.06 — הרופא לא פנוי.",
    contentIds: [],
  },
];

export const mockContentItems: ContentItem[] = [
  // ── בוטיק מיה ────────────────────────────────────────────────
  {
    id: "ci1",
    clientId: "c1", clientName: "בוטיק מיה",
    shootDayId: "sd1",
    title: "רילס קולקציית קיץ",
    description: "סרטון 30 שניות של לוק קיץ לאינסטגרם",
    platform: "instagram", contentType: "reel",
    status: "editing",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-10",
    publishDate: "2026-06-15",
    notes: "מוזיקה — ויראלית + קצב מהיר",
    tags: ["קיץ", "פאשן"],
  },
  {
    id: "ci2",
    clientId: "c1", clientName: "בוטיק מיה",
    shootDayId: "sd1",
    title: "פוסט מוצר — שמלת לילה",
    description: "תמונת מוצר מקצועית + קופי",
    platform: "instagram", contentType: "post",
    status: "pending_approval",
    assigneeId: "6", assigneeName: "כותבת תוכן",
    dueDate: "2026-06-12",
    publishDate: "2026-06-17",
    notes: "",
    tags: ["מוצר"],
  },
  {
    id: "ci3",
    clientId: "c1", clientName: "בוטיק מיה",
    shootDayId: "sd1",
    title: "סטורי מכירה — Flash Sale",
    description: "5 סטוריז לאירוע מבצע",
    platform: "instagram", contentType: "story",
    status: "approved",
    assigneeId: "7", assigneeName: "מנהלת סושיאל",
    dueDate: "2026-06-08",
    publishDate: "2026-06-09",
    notes: "",
    tags: ["מבצע"],
  },
  {
    id: "ci4",
    clientId: "c1", clientName: "בוטיק מיה",
    title: "פוסט פייסבוק — מוצרים חדשים",
    description: "4 פוסטים שבועיים על מוצרים חדשים",
    platform: "facebook", contentType: "post",
    status: "planning",
    assigneeId: "6", assigneeName: "כותבת תוכן",
    dueDate: "2026-06-20",
    notes: "",
    tags: ["שיווק"],
  },
  {
    id: "ci5",
    clientId: "c1", clientName: "בוטיק מיה",
    title: "טיקטוק טרנד — Try On",
    description: "וידיאו לטיקטוק בסגנון Try On Haul",
    platform: "tiktok", contentType: "video",
    status: "planning",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-25",
    notes: "לחקות טרנד ויראלי",
    tags: ["טרנד", "ויראלי"],
  },

  // ── שיפוץ בית ────────────────────────────────────────────────
  {
    id: "ci6",
    clientId: "c2", clientName: "שיפוץ בית",
    shootDayId: "sd2",
    title: "Before & After — דירת ירושלים",
    description: "סרטון לפני ואחרי שיפוץ",
    platform: "instagram", contentType: "reel",
    status: "published",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-05-30",
    publishDate: "2026-06-01",
    notes: "פורסם — ביצועים טובים!",
    tags: ["לפני ואחרי"],
  },
  {
    id: "ci7",
    clientId: "c2", clientName: "שיפוץ בית",
    shootDayId: "sd2",
    title: "פורטפוליו פרויקטים — יוטיוב",
    description: "תיעוד מקצועי של 3 פרויקטים",
    platform: "youtube", contentType: "video",
    status: "editing",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-15",
    publishDate: "2026-06-20",
    notes: "",
    tags: ["פורטפוליו"],
  },
  {
    id: "ci8",
    clientId: "c2", clientName: "שיפוץ בית",
    title: "קמפיין ממומן — מטבחים",
    description: "מודעות ממומנות לפייסבוק",
    platform: "facebook", contentType: "ad",
    status: "approved",
    assigneeId: "8", assigneeName: "קמפיינר",
    dueDate: "2026-06-05",
    notes: "תקציב 2000 ש״ח",
    tags: ["ממומן"],
  },

  // ── גלריית אמנות ירדן ─────────────────────────────────────────
  {
    id: "ci9",
    clientId: "c3", clientName: "גלריית אמנות ירדן",
    shootDayId: "sd3",
    title: "ראיון אמנית — אינסטגרם",
    description: "סרטון ראיון 2 דקות",
    platform: "instagram", contentType: "video",
    status: "shooting",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-22",
    publishDate: "2026-06-28",
    notes: "",
    tags: ["ראיון", "אמנות"],
  },
  {
    id: "ci10",
    clientId: "c3", clientName: "גלריית אמנות ירדן",
    title: "סיור וירטואלי — תוכן יוטיוב",
    description: "וידיאו 10 דקות של הגלריה",
    platform: "youtube", contentType: "video",
    status: "planning",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-07-01",
    notes: "",
    tags: ["גלריה"],
  },
  {
    id: "ci11",
    clientId: "c3", clientName: "גלריית אמנות ירדן",
    title: "פוסטים שבועיים — יצירות",
    description: "3 פוסטים על יצירות חדשות",
    platform: "instagram", contentType: "post",
    status: "pending_approval",
    assigneeId: "7", assigneeName: "מנהלת סושיאל",
    dueDate: "2026-06-18",
    notes: "",
    tags: ["אמנות"],
  },

  // ── קליניקת ד״ר לוי ──────────────────────────────────────────
  {
    id: "ci12",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    shootDayId: "sd4",
    title: "רילס עצות בריאות",
    description: "3 רילס עם טיפים רפואיים",
    platform: "instagram", contentType: "reel",
    status: "planned" as unknown as ContentStatus,
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-28",
    publishDate: "2026-07-01",
    notes: "לפי אישור ד״ר לוי",
    tags: ["בריאות"],
  },
  {
    id: "ci13",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    title: "מאמר בריאות — לינקדאין",
    description: "מאמר מקצועי על רפואה מונעת",
    platform: "linkedin", contentType: "article",
    status: "editing",
    assigneeId: "6", assigneeName: "כותבת תוכן",
    dueDate: "2026-06-14",
    publishDate: "2026-06-17",
    notes: "",
    tags: ["מאמר", "בריאות"],
  },
  {
    id: "ci14",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    title: "טיקטוק — מיתוסים רפואיים",
    description: "וידיאו ויראלי על מיתוסים נפוצים",
    platform: "tiktok", contentType: "video",
    status: "approved",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-10",
    publishDate: "2026-06-12",
    notes: "",
    tags: ["ויראלי", "בריאות"],
  },

  // ── סטודיו פילאטיס גל ─────────────────────────────────────────
  {
    id: "ci15",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    shootDayId: "sd5",
    title: "רילס שיעור פילאטיס",
    description: "הדגמת תרגיל קצר לאינסטגרם",
    platform: "instagram", contentType: "reel",
    status: "published",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-05-22",
    publishDate: "2026-05-25",
    notes: "ביצועים מצוינים!",
    tags: ["פילאטיס", "בריאות"],
  },
  {
    id: "ci16",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "מאמרי בלוג — SEO",
    description: "3 מאמרי בלוג לקידום אורגני",
    platform: "other", contentType: "article",
    status: "editing",
    assigneeId: "6", assigneeName: "כותבת תוכן",
    dueDate: "2026-06-20",
    notes: "",
    tags: ["SEO", "בלוג"],
  },
  {
    id: "ci17",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "פוסטי פייסבוק — לוח שיעורים",
    description: "פוסטים שבועיים על לוח שיעורים",
    platform: "facebook", contentType: "post",
    status: "pending_approval",
    assigneeId: "7", assigneeName: "מנהלת סושיאל",
    dueDate: "2026-06-08",
    notes: "",
    tags: ["לוח שיעורים"],
  },
  {
    id: "ci18",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "טיקטוק — אתגר פילאטיס",
    description: "וידיאו אתגר ויראלי",
    platform: "tiktok", contentType: "video",
    status: "planning",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-06-25",
    notes: "",
    tags: ["אתגר", "ויראלי"],
  },
  {
    id: "ci19",
    clientId: "c2", clientName: "שיפוץ בית",
    title: "לינקדאין — טיפים לשיפוץ",
    description: "מאמר מקצועי על תכנון שיפוץ",
    platform: "linkedin", contentType: "article",
    status: "approved",
    assigneeId: "6", assigneeName: "כותבת תוכן",
    dueDate: "2026-06-11",
    publishDate: "2026-06-13",
    notes: "",
    tags: ["מאמר", "שיפוץ"],
  },
  {
    id: "ci20",
    clientId: "c1", clientName: "בוטיק מיה",
    shootDayId: "sd6",
    title: "קמפיין קיץ — יוטיוב",
    description: "פרסומת 60 שניות לסדרת הקיץ",
    platform: "youtube", contentType: "ad",
    status: "planning",
    assigneeId: "4", assigneeName: "עורך וידיאו",
    dueDate: "2026-07-12",
    publishDate: "2026-07-15",
    notes: "",
    tags: ["קיץ", "פרסומת"],
  },
];

// ─── Scripts Mock Data ────────────────────────────────────────────────────────

export const mockScripts: Script[] = [
  {
    id: "sc1",
    shootDayId: "sd1",
    clientId: "c1", clientName: "בוטיק מיה",
    title: "תסריט — רילס קולקציית קיץ",
    content: `שין: 1 — פתיחה (0:00–0:05)
מצלמה מתקרבת לשמלה מונחת על ספה לבנה.
צליל: מוזיקה עדינה נכנסת.
כיתוב: "הקולקציה שכולן מחכות לה 🌸"

שין: 2 — קרוסל מוצרים (0:05–0:20)
Model לובשת 3 ביגוד — חיתוך מהיר בין כל פריט.
זווית: מלא גוף + ספוט על הפרטים.
כיתוב: "קיץ 2026 — זמין עכשיו"

שין: 3 — Call to Action (0:20–0:30)
Model מחייכת למצלמה ומצביעה מעלה.
כיתוב: "לחצי על הלינק בביו 👆"
לוגו + מוזיקה יורדת.`,
    status: "pending_approval",
    createdById: "6", createdByName: "כותבת תוכן",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    comments: [
      {
        id: "scc1",
        authorId: "3", authorName: "לקוח לדוגמה",
        text: "שין 2 — אפשר 4 פריטים במקום 3? יש לנו מוצר חדש שחשוב להציג.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        resolved: false,
        likedBy: ["u2"],
        replies: [
          {
            id: "scc1_r1",
            authorId: "6", authorName: "כותבת תוכן",
            text: "בטח, עדכנתי בתסריט.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          }
        ]
      },
    ],
  },
  {
    id: "sc2",
    shootDayId: "sd1",
    clientId: "c1", clientName: "בוטיק מיה",
    title: "תסריט — סטורי Flash Sale",
    content: `5 סטוריז לאירוע מבצע:

סטורי 1: "⚡ Flash Sale מחר בלבד"
רקע אדום דינמי + טיימר ספירה לאחור.

סטורי 2: "עד 50% הנחה על כל הקולקציה"
תמונות מוצרים עם תג מחיר מחוק + מחיר חדש.

סטורי 3: "איך מזמינים?"
3 שלבים פשוטים עם אנימציה.

סטורי 4: "שאלות נפוצות"
Q&A עם טקסט פשוט.

סטורי 5: "ספרי לחברה שלך 💌"
שיתוף + לינק.`,
    status: "approved",
    createdById: "6", createdByName: "כותבת תוכן",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    comments: [],
  },
  {
    id: "sc3",
    shootDayId: "sd3",
    clientId: "c3", clientName: "גלריית אמנות ירדן",
    title: "תסריט — ראיון האמנית",
    content: `שאלות לראיון (2 דקות):

שאלה 1 (0:00–0:30):
"מה ההשראה שעומדת מאחורי הסדרה החדשה?"
— ירדן מספרת על הנסיעה לאיטליה.

שאלה 2 (0:30–1:00):
"מה הטכניקה הייחודית שאת משתמשת בה?"
— הדגמה של הברשות על הבד.

שאלה 3 (1:00–1:30):
"מה מסר אחד שתרצי להעביר לצופים?"
— ציטוט מרגש לסיום.

Outro (1:30–2:00):
תמונות יצירות + פרטי הגלריה.`,
    status: "draft",
    createdById: "6", createdByName: "כותבת תוכן",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    comments: [],
  },
  {
    id: "sc4",
    shootDayId: "sd4",
    clientId: "c4", clientName: "קליניקת ד״ר לוי",
    title: "תסריט — רילס עצות בריאות",
    content: `"3 דברים שרופאים לא יספרו לך" 🩺

Hook (0:00–0:03):
"עשיתי טעות שכמעט עלתה לי ביוקר..."
[חיתוך מהיר לפנים ד״ר לוי]

Point 1 (0:03–0:15):
"שינה של פחות מ-7 שעות = חיסון חלש ב-30%"
[אינפוגרפיק פשוט]

Point 2 (0:15–0:25):
"הליכה של 10 דקות אחרי ארוחה = מדד סוכר תקין"
[אנימציה]

Point 3 (0:25–0:35):
"שתיית מים בבוקר = פחות כאבי ראש ב-40%"

CTA (0:35–0:45):
"שמרי ושתפי עם חברה שצריכה לדעת 👇"
[לינק לקביעת תור]`,
    status: "revision_requested",
    createdById: "6", createdByName: "כותבת תוכן",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    comments: [
      {
        id: "scc2",
        authorId: "1", authorName: "חופית פינטו",
        text: "ד״ר לוי ביקש לשנות את הנתונים — לוודא עם מקורות רפואיים. גם ה-CTA צריך לעבור אישור משפטי.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        resolved: false,
        likedBy: [],
        replies: []
      },
    ],
  },
  {
    id: "sc5",
    shootDayId: "sd5",
    clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "תסריט — הדגמת שיעור פילאטיס",
    content: `"תרגיל אחד ליום — גב בריא לתמיד" 🧘‍♀️

Opening (0:00–0:05):
גל בסטודיו, מחייכת למצלמה.
"שלום! אני גל ואני מראה לכם את התרגיל הכי חשוב לגב."

Demo (0:05–0:40):
הדגמה של "Cat-Cow":
- שלב 1: גב מקומר
- שלב 2: גב שקוע
[כיתובים עם ספירה]

Tips (0:40–0:55):
"3 שגיאות נפוצות שכולם עושים:"
טקסט + אנימציה.

CTA (0:55–1:00):
"עקבי אחרינו לתרגיל יומי 💪"
@studiogal_pilates`,
    status: "approved",
    createdById: "6", createdByName: "כותבת תוכן",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    comments: [
      {
        id: "scc3",
        authorId: "3", authorName: "לקוח לדוגמה",
        text: "מצוין! אפשר להוסיף את שם הסטודיו בהתחלה?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
        resolved: true,
        likes: 2,
        replies: []
      },
    ],
  },
];

// ─── Video Files Mock Data ────────────────────────────────────────────────────

export const mockVideoFiles: VideoFile[] = [
  // ── בוטיק מיה ────────────────────────────────────────────────
  {
    id: "vf1",
    shootDayId: "sd1", clientId: "c1", clientName: "בוטיק מיה",
    title: "רילס קולקציית קיץ — V2",
    description: "סרטון 30 שניות לאינסטגרם, קולקציית קיץ",
    status: "in_review", version: 2,
    durationSeconds: 30, fileSizeMB: 45.2,
    thumbnailEmoji: "👗",
    assigneeId: "1", assigneeName: "חופית פינטו",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    comments: [
      { id: "vc1", authorId: "3", authorName: "לקוח לדוגמה", text: "המוזיקה חזקה מדי בהתחלה — אפשר להנמיך?", timestampSeconds: 5, resolved: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { id: "vc2", authorId: "3", authorName: "לקוח לדוגמה", text: "אהבתי את הסיום! ✨", timestampSeconds: 28, resolved: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ],
  },
  {
    id: "vf2",
    shootDayId: "sd1", clientId: "c1", clientName: "בוטיק מיה",
    title: "סטורי Flash Sale — V1",
    description: "5 סטוריז לאינסטגרם",
    status: "approved", version: 1,
    durationSeconds: 75, fileSizeMB: 22.8,
    thumbnailEmoji: "⚡",
    assigneeId: "7", assigneeName: "מנהלת סושיאל",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    comments: [],
  },
  {
    id: "vf3",
    shootDayId: "sd6", clientId: "c1", clientName: "בוטיק מיה",
    title: "קמפיין קיץ — חוף הים V1",
    description: "פרסומת 60 שניות לקיץ",
    status: "in_progress", version: 1,
    durationSeconds: 60, fileSizeMB: 0,
    thumbnailEmoji: "🏖️",
    assigneeId: "1", assigneeName: "חופית פינטו",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    comments: [],
  },
  // ── שיפוץ בית ────────────────────────────────────────────────
  {
    id: "vf4",
    shootDayId: "sd2", clientId: "c2", clientName: "שיפוץ בית",
    title: "Before & After — דירת ירושלים V3",
    description: "סרטון לפני ואחרי שיפוץ",
    status: "approved", version: 3,
    durationSeconds: 45, fileSizeMB: 68.4,
    thumbnailEmoji: "🏠",
    assigneeId: "2", assigneeName: "גוני",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    comments: [],
  },
  {
    id: "vf5",
    shootDayId: "sd2", clientId: "c2", clientName: "שיפוץ בית",
    title: "פורטפוליו — 3 פרויקטים V1",
    description: "תיעוד מקצועי של פרויקטי שיפוץ",
    status: "in_review", version: 1,
    durationSeconds: 480, fileSizeMB: 312.1,
    thumbnailEmoji: "🔨",
    assigneeId: "2", assigneeName: "גוני",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    comments: [
      { id: "vc3", authorId: "3", authorName: "לקוח לדוגמה", text: "הפרויקט השני נראה חשוך מדי — אפשר לבהיר?", timestampSeconds: 185, resolved: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    ],
  },
  // ── גלריית אמנות ירדן ─────────────────────────────────────────
  {
    id: "vf6",
    shootDayId: "sd3", clientId: "c3", clientName: "גלריית אמנות ירדן",
    title: "ראיון האמנית — V1",
    description: "ראיון וידיאו 2 דקות",
    status: "to_do", version: 1,
    durationSeconds: 0, fileSizeMB: 0,
    thumbnailEmoji: "🎨",
    assigneeId: "1", assigneeName: "חופית פינטו",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    comments: [],
  },
  {
    id: "vf7",
    shootDayId: "sd3", clientId: "c3", clientName: "גלריית אמנות ירדן",
    title: "סיור וירטואלי בגלריה — V2",
    description: "וידיאו 10 דקות",
    status: "in_progress", version: 2,
    durationSeconds: 600, fileSizeMB: 890.0,
    thumbnailEmoji: "🖼️",
    assigneeId: "2", assigneeName: "גוני",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    comments: [],
  },
  // ── קליניקת ד״ר לוי ──────────────────────────────────────────
  {
    id: "vf8",
    shootDayId: "sd4", clientId: "c4", clientName: "קליניקת ד״ר לוי",
    title: "רילס עצות בריאות — V1",
    description: "3 רילס עם טיפים רפואיים",
    status: "to_do", version: 1,
    durationSeconds: 0, fileSizeMB: 0,
    thumbnailEmoji: "🩺",
    assigneeId: "1", assigneeName: "חופית פינטו",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    comments: [],
  },
  {
    id: "vf9",
    shootDayId: "sd8", clientId: "c4", clientName: "קליניקת ד״ר לוי",
    title: "מיתוסים רפואיים — Teaser V1",
    description: "טיזר ויראלי לטיקטוק",
    status: "in_progress", version: 1,
    durationSeconds: 15, fileSizeMB: 18.5,
    thumbnailEmoji: "💊",
    assigneeId: "9", assigneeName: "איש מערכות",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    comments: [],
  },
  // ── סטודיו פילאטיס גל ─────────────────────────────────────────
  {
    id: "vf10",
    shootDayId: "sd5", clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "שיעור פילאטיס — Reel V2",
    description: "הדגמת שיעור, 60 שניות",
    status: "approved", version: 2,
    durationSeconds: 60, fileSizeMB: 72.3,
    thumbnailEmoji: "🧘‍♀️",
    assigneeId: "2", assigneeName: "גוני",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    comments: [],
  },
  {
    id: "vf11",
    shootDayId: "sd5", clientId: "c5", clientName: "סטודיו פילאטיס גל",
    title: "אתגר פילאטיס TikTok — V1",
    description: "וידיאו ויראלי לאתגר",
    status: "in_review", version: 1,
    durationSeconds: 30, fileSizeMB: 38.9,
    thumbnailEmoji: "🏋️‍♀️",
    assigneeId: "7", assigneeName: "מנהלת סושיאל",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    comments: [
      { id: "vc4", authorId: "3", authorName: "לקוח לדוגמה", text: "אהבתי! רק לשנות את הלוגו בסיום — גדול מדי", timestampSeconds: 27, resolved: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ],
  },
  {
    id: "vf12",
    clientId: "c2", clientName: "שיפוץ בית",
    shootDayId: "sd7",
    title: "Testimonial לקוח מרוצה — V1",
    description: "עדות לקוח על השיפוץ",
    status: "to_do", version: 1,
    durationSeconds: 0, fileSizeMB: 0,
    thumbnailEmoji: "⭐",
    assigneeId: "2", assigneeName: "גוני",
    editorId: "4", editorName: "עורך וידיאו",
    uploadedAt: new Date().toISOString(),
    comments: [],
  },
];
