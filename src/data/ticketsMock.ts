export type TicketStatus   = "open" | "pending" | "in_progress" | "closed";
export type TicketPriority = "normal" | "urgent";

export type TicketCategory =
  | "design" | "photography" | "social" | "reports"
  | "billing" | "technical" | "content" | "general";

export const ticketCategoryConfig: Record<TicketCategory, { label: string; emoji: string }> = {
  design:      { label: "עיצוב ויצירתיות",  emoji: "🎨" },
  photography: { label: "צילום וסרטונים",   emoji: "📸" },
  social:      { label: "ניהול סושיאל",     emoji: "📱" },
  reports:     { label: "דוחות וניתוחים",   emoji: "📊" },
  billing:     { label: "חיוב ותשלומים",    emoji: "💰" },
  technical:   { label: "טכני",              emoji: "🔧" },
  content:     { label: "שיווק ותוכן",       emoji: "💬" },
  general:     { label: "שאלה כללית",        emoji: "❓" },
};

export interface TicketAttachment {
  id: string; name: string; size: number;
  mimeType: string; dataUrl: string; uploadedAt: string;
}

export interface TicketReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  isInternal: boolean; // true = note visible only to team/admin
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: TicketCategory;
  clientId: string;
  clientName: string;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  replies: TicketReply[];
  attachments?: TicketAttachment[];
  triageNotes?: string;
  approvedById?: string;
  dueDate?: string;
}

export const ticketStatusConfig: Record<TicketStatus, { label: string; dotColor: string; chipCls: string }> = {
  open:        { label: "פנייה חדשה",   dotColor: "bg-blue-500",   chipCls: "bg-blue-100 text-blue-700 border-blue-200" },
  pending:     { label: "ממתין לטיפול", dotColor: "bg-orange-500", chipCls: "bg-orange-100 text-orange-700 border-orange-200" },
  in_progress: { label: "בטיפול",       dotColor: "bg-yellow-500", chipCls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  closed:      { label: "פנייה נסגרה",  dotColor: "bg-emerald-500",chipCls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export const ticketPriorityConfig: Record<TicketPriority, { label: string; borderCls: string; badgeCls: string }> = {
  normal: { label: "רגיל", borderCls: "border-l-slate-400", badgeCls: "bg-slate-100 text-slate-600" },
  urgent: { label: "דחוף", borderCls: "border-l-red-500",   badgeCls: "bg-red-100 text-red-600" },
};

export const mockTickets: Ticket[] = [
  {
    id: "tk1",
    subject: "לא מצליח לראות את הדוח החודשי",
    body: "שלום, ניסיתי להיכנס לדוח הביצועים של מאי 2026 אבל הדף לא נטען. מה עושים?",
    status: "open",
    priority: "urgent",
    clientId: "c1",
    clientName: "בוטיק מיה",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    replies: [],
  },
  {
    id: "tk2",
    subject: "בקשה לשינוי תאריך יום הצילום",
    body: "היי, האם ניתן להזיז את יום הצילום מ-15.06 ל-18.06? יש לי אירוע משפחתי באמצע החודש.",
    status: "in_progress",
    priority: "normal",
    clientId: "c1",
    clientName: "בוטיק מיה",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    assignedToId: "2",
    assignedToName: "גוני",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    replies: [
      {
        id: "r1",
        authorId: "2",
        authorName: "גוני",
        text: "היי! כן בהחלט, הצלם שלנו פנוי ב-18.06. אשנה את הלוח.",
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
  {
    id: "tk3",
    subject: "תכנים שפורסמו לא תואמים את מה שאושר",
    body: "פורסם היום פוסט בפייסבוק עם טקסט שלא אושר על ידי. אנא בדקו ותתקנו בהקדם.",
    status: "open",
    priority: "urgent",
    clientId: "c2",
    clientName: "שיפוץ בית",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    replies: [],
  },
  {
    id: "tk4",
    subject: "שאלה לגבי לוח הגאנט",
    body: "לא מצליח להבין את לוח הגאנט — האם אפשר לקבל הדרכה קצרה?",
    status: "closed",
    priority: "normal",
    clientId: "c3",
    clientName: "גלריית אמנות ירדן",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    assignedToId: "2",
    assignedToName: "גוני",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replies: [
      {
        id: "r2",
        authorId: "2",
        authorName: "גוני",
        text: "שלחתי לך מייל עם מדריך וידיאו קצר. אם יש עוד שאלות — אני כאן!",
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: "tk5",
    subject: "בקשה להוספת פלטפורמה חדשה — TikTok",
    body: "אנחנו רוצים להתחיל לפעול גם ב-TikTok. האם זה אפשרי במסגרת החבילה הנוכחית?",
    status: "in_progress",
    priority: "normal",
    clientId: "c4",
    clientName: "קליניקת ד״ר לוי",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    assignedToId: "1",
    assignedToName: "חופית פינטו",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    replies: [
      {
        id: "r3",
        authorId: "1",
        authorName: "חופית פינטו",
        text: "שאלה מצוינת! TikTok ניתן להוסיף כתוספת לחבילה בתוספת של 500 ש״ח לחודש. אשלח הצעה מלאה.",
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: "r4",
        authorId: "1",
        authorName: "חופית פינטו",
        text: "הלקוח מתעניין ברצינות — לוודא עם הצוות לגבי קיבולת תוכן חדשה",
        isInternal: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: "tk6",
    subject: "עדכון פרטי חיוב",
    body: "ברצוני לשנות את כרטיס האשראי לתשלום החודשי. מה התהליך?",
    status: "closed",
    priority: "normal",
    clientId: "c5",
    clientName: "סטודיו פילאטיס גל",
    createdById: "3",
    createdByName: "לקוח לדוגמה",
    assignedToId: "10",
    assignedToName: "מנהלת משרד",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    replies: [
      {
        id: "r5",
        authorId: "10",
        authorName: "מנהלת משרד",
        text: "שלחתי לך לינק מאובטח לעדכון פרטי התשלום. פרטיך עודכנו בהצלחה.",
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
      },
    ],
  },
];
