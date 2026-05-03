import { useState } from "react";
import { Check, Lock, MapPin, Calendar, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
  onStageClick?: (stage: RoadmapStage) => void;
}

const defaultStages: RoadmapStage[] = [
  {
    id: "1",
    title: "התחלת תהליך",
    description: "חתימה על הסכם ותחילת העבודה המשותפת",
    expectedDate: "01.04",
    status: "completed",
    tasks: ["חתימה על הסכם", "מילוי שאלון לקוח", "גישה למערכת"],
  },
  {
    id: "2",
    title: "פגישת אסטרטגיה ראשונה",
    description: "הכרות מעמיקה עם העסק, קהל יעד ומטרות",
    expectedDate: "05.04",
    status: "completed",
    tasks: ["הכנת מצגת אסטרטגיה", "ניתוח מתחרים", "הגדרת יעדים"],
  },
  {
    id: "3",
    title: "כתיבת תסריטים",
    description: "הכנת תסריטים לסרטונים ותכני השיווק",
    expectedDate: "12.04",
    status: "completed",
    tasks: ["כתיבת 5 תסריטים", "התאמה לפלטפורמות", "בניית מסרים מרכזיים"],
  },
  {
    id: "4",
    title: "אישור תסריטים",
    description: "סקירה ואישור התכנים על ידי הלקוח",
    expectedDate: "16.04",
    status: "current",
    tasks: ["שליחת תסריטים לאישור", "שיחת פידבק", "אישור סופי"],
  },
  {
    id: "5",
    title: "יום צילום",
    description: "צילום כל התכנים במיקום שנקבע מראש",
    expectedDate: "25.04",
    status: "upcoming",
    tasks: ["תיאום מיקום", "הכנת ציוד", "צילום 8+ סרטונים"],
  },
  {
    id: "6",
    title: "עריכת סרטונים",
    description: "עריכה מקצועית של כל הסרטונים שנצלמו",
    expectedDate: "05.05",
    status: "upcoming",
    tasks: ["עריכה ראשונית", "הוספת כתוביות", "עיצוב גרפי"],
  },
  {
    id: "7",
    title: "אישור סרטונים",
    description: "הלקוח צופה ומאשר את הסרטונים הסופיים",
    expectedDate: "10.05",
    status: "locked",
    tasks: ["שליחת סרטונים לצפייה", "תיקונים אם נדרש", "אישור סופי"],
  },
  {
    id: "8",
    title: "בניית גאנט תוכן",
    description: "תכנון לוח זמנים לפרסום התכנים בכל הפלטפורמות",
    expectedDate: "14.05",
    status: "locked",
    tasks: ["תכנון חודשי", "התאמה לפלטפורמות", "אישור לו״ז"],
  },
  {
    id: "9",
    title: "קמפיין באוויר",
    description: "השקת הקמפיין הפרסומי בכל הערוצים",
    expectedDate: "20.05",
    status: "locked",
    tasks: ["העלאת תכנים", "הגדרת קהלי יעד", "ניהול תקציב"],
  },
  {
    id: "10",
    title: "דוח ראשון",
    description: "ניתוח ביצועים ותוצאות הקמפיין הראשון",
    expectedDate: "10.06",
    status: "locked",
    tasks: ["איסוף נתונים", "ניתוח ROI", "הכנת דוח מסכם"],
  },
  {
    id: "11",
    title: "פגישת המשך / שדרוג",
    description: "סיכום התהליך ותכנון השלב הבא",
    expectedDate: "15.06",
    status: "locked",
    tasks: ["סקירת תוצאות", "תכנון שלב ב׳", "הצעת שדרוג"],
  },
];

export function ClientRoadmap({
  stages = defaultStages,
  currentStageId,
  clientAvatar,
  clientName = "הלקוח",
  onStageClick,
}: ClientRoadmapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeStageId = currentStageId || stages.find((s) => s.status === "current")?.id;
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedCount / stages.length) * 100);

  const toggleExpand = (stage: RoadmapStage) => {
    setExpandedId(expandedId === stage.id ? null : stage.id);
    onStageClick?.(stage);
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">מפת הדרכים שלך</h3>
        <span className="text-sm font-medium text-accent">{progress}% הושלמו</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Roadmap path */}
      <div className="relative">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === "completed";
          const isCurrent = stage.id === activeStageId;
          const isLocked = stage.status === "locked";
          const isUpcoming = stage.status === "upcoming";
          const isExpanded = expandedId === stage.id;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.id} className="relative flex gap-4">
              {/* Vertical line + node */}
              <div className="flex flex-col items-center">
                {/* Node */}
                <button
                  onClick={() => toggleExpand(stage)}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? "bg-accent border-accent text-accent-foreground"
                      : isCurrent
                      ? "bg-card border-accent text-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.15)]"
                      : isUpcoming
                      ? "bg-card border-border text-muted-foreground"
                      : "bg-muted border-border text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    clientAvatar ? (
                      <UserAvatar name={clientName} avatar={clientAvatar} size="sm" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[24px] transition-colors ${
                      isCompleted ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                <button
                  onClick={() => toggleExpand(stage)}
                  className={`w-full text-right rounded-lg px-4 py-3 transition-all duration-200 ${
                    isCurrent
                      ? "bg-accent/8 border border-accent/20"
                      : isExpanded
                      ? "bg-muted/60"
                      : "hover:bg-muted/40"
                  } ${isLocked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-sm font-semibold ${
                            isCurrent ? "text-accent" : isLocked ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {stage.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-medium bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                            שלב נוכחי
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{stage.expectedDate}</span>
                      </div>
                    </div>
                    {!isLocked && (
                      isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && !isLocked && (
                  <div className="mt-2 mr-4 bg-muted/40 rounded-lg p-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                    {stage.tasks && stage.tasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ClipboardList className="w-3.5 h-3.5 text-accent" />
                          <span className="text-xs font-medium text-foreground">משימות קשורות</span>
                        </div>
                        <ul className="space-y-1.5">
                          {stage.tasks.map((task, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isCompleted ? "bg-accent" : "bg-border"
                                }`}
                              />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
