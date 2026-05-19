export type TaskStatus = "open" | "in_progress" | "stuck" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface TaskUpdateReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  mentions: string[];
  createdAt: string;
  attachments?: AttachedFile[];
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  text: string;
  mentions: string[];
  createdAt: string;
  replies: TaskUpdateReply[];
  attachments?: AttachedFile[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;   // "DD.MM.YYYY" optional
  clientId: string;
  clientName: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

export const statusConfig: Record<TaskStatus, { label: string; dotColor: string }> = {
  open: { label: "חדש", dotColor: "bg-slate-400" },
  in_progress: { label: "בטיפול", dotColor: "bg-blue-500" },
  stuck: { label: "תקוע", dotColor: "bg-red-500" },
  done: { label: "הושלם", dotColor: "bg-green-500" },
  cancelled: { label: "בוטל", dotColor: "bg-gray-300" },
};

export const priorityConfig: Record<TaskPriority, { label: string; flagColor: string; borderColor: string }> = {
  low: { label: "נמוך", flagColor: "text-slate-400", borderColor: "border-l-slate-300" },
  medium: { label: "בינוני", flagColor: "text-blue-400", borderColor: "border-l-blue-400" },
  high: { label: "גבוה", flagColor: "text-orange-500", borderColor: "border-l-orange-500" },
  urgent: { label: "דחוף", flagColor: "text-red-500", borderColor: "border-l-red-500" },
};

// Kanban columns definition — statuses that map to each column
export const KANBAN_COLUMNS: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  acceptStatuses: TaskStatus[];
}[] = [
  { id: "open", label: "משימות חדשות", dotColor: "bg-slate-400", acceptStatuses: ["open"] },
  {
    id: "in_progress",
    label: "משימות בטיפול",
    dotColor: "bg-blue-500",
    acceptStatuses: ["in_progress"],
  },
  { id: "stuck", label: "משימות תקועות", dotColor: "bg-red-500", acceptStatuses: ["stuck"] },
  { id: "done", label: "משימות שבוצעו", dotColor: "bg-green-500", acceptStatuses: ["done"] },
];

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "עריכת סרטון לרילס אינסטגרם",
    description: "עריכת סרטון 30 שניות לפוסט רילס — כולל לוגו, כיתוב ומוזיקת רקע.",
    status: "in_progress",
    priority: "high",
    clientId: "c1",
    clientName: "בוטיק מיה",
    assigneeId: "4",
    assigneeName: "עורך וידיאו",
    dueDate: "15.06.2026",
    createdAt: "2026-06-01T08:00:00.000Z",
    tags: ["וידיאו", "אינסטגרם"],
  },
  {
    id: "t2",
    title: "כתיבת 4 פוסטים לפייסבוק",
    description: "כתיבת תוכן לפוסטים שבועיים — מוצרים חדשים ומבצע קיץ.",
    status: "open",
    priority: "medium",
    clientId: "c1",
    clientName: "בוטיק מיה",
    assigneeId: "6",
    assigneeName: "כותבת תוכן",
    dueDate: "18.06.2026",
    createdAt: "2026-06-03T09:00:00.000Z",
    tags: ["כתיבה", "פייסבוק"],
  },
  {
    id: "t3",
    title: "הגשת קמפיין גוגל לאישור",
    description: "הכנת מסמך קמפיין גוגל ושליחה ללקוח לאישור לפני ההשקה.",
    status: "stuck",
    priority: "urgent",
    clientId: "c2",
    clientName: "שיפוץ בית",
    assigneeId: "8",
    assigneeName: "קמפיינר",
    dueDate: "12.06.2026",
    createdAt: "2026-06-02T07:30:00.000Z",
    tags: ["קמפיין", "גוגל"],
  },
  {
    id: "t4",
    title: "צילום מוצרים לחנות",
    description: "צילום 20 מוצרים חדשים לאתר — רקע לבן, 3 זוויות לכל מוצר.",
    status: "done",
    priority: "high",
    clientId: "c3",
    clientName: "גלריית אמנות ירדן",
    assigneeId: "5",
    assigneeName: "צלם",
    dueDate: "10.06.2026",
    createdAt: "2026-05-28T10:00:00.000Z",
    tags: ["צילום", "מוצרים"],
  },
  {
    id: "t5",
    title: "עדכון לינק ביו והייליטס",
    description: "עדכון לינקים בביו אינסטגרם ויצירת 3 הייליטס חדשים לקולקציית קיץ.",
    status: "open",
    priority: "low",
    clientId: "c2",
    clientName: "שיפוץ בית",
    assigneeId: "7",
    assigneeName: "מנהלת סושיאל",
    dueDate: "22.06.2026",
    createdAt: "2026-06-04T11:00:00.000Z",
    tags: ["סושיאל", "אינסטגרם"],
  },
  {
    id: "t6",
    title: "בניית משפך שיווקי — ליד מגנט",
    description: "הקמת אוטומציה לאיסוף לידים וסדרת מיילים ראשונית (3 מיילים).",
    status: "in_progress",
    priority: "urgent",
    clientId: "c4",
    clientName: "קליניקת ד״ר לוי",
    assigneeId: "9",
    assigneeName: "איש מערכות",
    dueDate: "16.06.2026",
    createdAt: "2026-06-01T06:00:00.000Z",
    tags: ["אוטומציה", "מיילים"],
  },
  {
    id: "t7",
    title: "דו״ח ביצועים חודשי — מאי",
    description: "הכנת דו״ח חודשי מאי עם נתוני קמפיין ופרסום ברשתות.",
    status: "stuck",
    priority: "medium",
    clientId: "c1",
    clientName: "בוטיק מיה",
    assigneeId: "8",
    assigneeName: "קמפיינר",
    dueDate: "14.06.2026",
    createdAt: "2026-06-06T08:00:00.000Z",
    tags: ["דוחות", "ניתוח"],
  },
  {
    id: "t8",
    title: "ניהול תגובות ומעורבות — שבוע 2",
    description: "מענה על תגובות בכל הפלטפורמות, לייקים ופולו-בק לחשבונות רלוונטיים.",
    status: "done",
    priority: "low",
    clientId: "c3",
    clientName: "גלריית אמנות ירדן",
    assigneeId: "7",
    assigneeName: "מנהלת סושיאל",
    dueDate: "09.06.2026",
    createdAt: "2026-06-03T09:00:00.000Z",
    tags: ["סושיאל", "מעורבות"],
  },
  {
    id: "t9",
    title: "פגישת קיק-אוף עם לקוח חדש",
    description: "תיאום ועריכת פגישת היכרות ראשונה, הגדרת יעדים וציפיות.",
    status: "open",
    priority: "high",
    clientId: "c5",
    clientName: "סטודיו פילאטיס גל",
    assigneeId: "2",
    assigneeName: "גוני",
    dueDate: "13.06.2026",
    createdAt: "2026-06-07T12:00:00.000Z",
    tags: ["ניהול", "פגישה"],
  },
  {
    id: "t10",
    title: "כתיבת בלוג — 3 מאמרים ליוני",
    description: "כתיבת 3 מאמרי בלוג לקידום אורגני בנושאי פילאטיס ובריאות.",
    status: "in_progress",
    priority: "medium",
    clientId: "c5",
    clientName: "סטודיו פילאטיס גל",
    assigneeId: "6",
    assigneeName: "כותבת תוכן",
    dueDate: "25.06.2026",
    createdAt: "2026-06-05T08:00:00.000Z",
    tags: ["כתיבה", "SEO"],
  },
  {
    id: "t11",
    title: "השקת קמפיין ממומן — ראש חודש",
    description: "הרצת קמפיין פייסבוק ואינסטגרם — תקציב 2,000 ש״ח.",
    status: "open",
    priority: "urgent",
    clientId: "c2",
    clientName: "שיפוץ בית",
    assigneeId: "8",
    assigneeName: "קמפיינר",
    dueDate: "01.07.2026",
    createdAt: "2026-06-08T10:00:00.000Z",
    tags: ["קמפיין", "ממומן"],
  },
  {
    id: "t12",
    title: "עיצוב תבניות סטוריז",
    description: "עיצוב 10 תבניות סטוריז מותאמות לברנד — צבעים, פונטים וסגנון.",
    status: "done",
    priority: "medium",
    clientId: "c4",
    clientName: "קליניקת ד״ר לוי",
    assigneeId: "7",
    assigneeName: "מנהלת סושיאל",
    dueDate: "08.06.2026",
    createdAt: "2026-05-30T09:00:00.000Z",
    tags: ["עיצוב", "סטוריז"],
  },
];

export const mockUpdates: TaskUpdate[] = [
  {
    id: "upd1",
    taskId: "t1",
    authorId: "1",
    authorName: "חופית פינטו",
    text: "קיבלתי את הקובץ הגולמי מהצלם. @עורך וידיאו — אתה יכול להתחיל את העריכה?",
    mentions: ["4"],
    createdAt: "2026-06-02T10:30:00.000Z",
    replies: [
      {
        id: "r1",
        authorId: "4",
        authorName: "עורך וידיאו",
        text: "בטח! כבר עובד על זה. אסיים עד מחר בצהריים.",
        mentions: [],
        createdAt: "2026-06-02T11:05:00.000Z",
      },
    ],
  },
  {
    id: "upd2",
    taskId: "t1",
    authorId: "4",
    authorName: "עורך וידיאו",
    text: "הגרסה הראשונה מוכנה — שלחתי לינק ב-Dropbox. @חופית פינטו אנא אשרי לפני שאני ממשיך.",
    mentions: ["1"],
    createdAt: "2026-06-03T14:20:00.000Z",
    replies: [],
  },
  {
    id: "upd3",
    taskId: "t3",
    authorId: "8",
    authorName: "קמפיינר",
    text: "הקמפיין מוכן ומחכה לאישור לקוח. @גוני — האם ניצור קשר עם הלקוח?",
    mentions: ["2"],
    createdAt: "2026-06-04T09:00:00.000Z",
    replies: [
      {
        id: "r2",
        authorId: "2",
        authorName: "גוני",
        text: "שלחתי מייל ללקוח. מחכה לתגובה עד סוף יום.",
        mentions: [],
        createdAt: "2026-06-04T09:45:00.000Z",
      },
    ],
  },
  {
    id: "upd4",
    taskId: "t6",
    authorId: "9",
    authorName: "איש מערכות",
    text: "האוטומציה עלתה! עכשיו צריך לכתוב את הטקסטים של 3 המיילים. @כותבת תוכן — תוכלי לכתוב עד סוף השבוע?",
    mentions: ["6"],
    createdAt: "2026-06-05T16:00:00.000Z",
    replies: [],
  },
];
