import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { mockScripts, Script } from "@/data/shootDaysMock";

// Re-using the ScriptDocumentView from ShootDays (we will extract it or import it)
// But for now, we'll create a dedicated minimal layout for public viewing.

import { platformConfig, contentTypeConfig, scriptStatusConfig } from "@/data/shootDaysMock";

export default function SharedScript() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from the backend without requiring auth.
    const s = mockScripts.find((s) => s.id === id);
    if (s) setScript(s);
  }, [id]);

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">התסריט לא נמצא</h1>
          <p className="text-muted-foreground">הקישור שבור או שהתסריט הוסר.</p>
        </div>
      </div>
    );
  }

  const sc = scriptStatusConfig[script.status];
  
  // We need a simple view of the script content
  // Since we are adding TipTap, the content will be HTML.
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
            J
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">JonJon H&G</h1>
            <p className="text-[10px] text-muted-foreground">Client Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.chipCls}`}>
            {sc.label}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-border overflow-hidden">
          <div className="px-10 pt-10 pb-6 border-b border-border bg-muted/5">
            <p className="text-sm text-primary font-semibold mb-2">{script.clientName}</p>
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">
              {script.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>נכתב ע"י <span className="font-medium text-foreground">{script.createdByName}</span></span>
              <span>·</span>
              <span>{new Date(script.createdAt).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          
          <div 
            className="px-10 py-10 prose prose-slate max-w-none prose-p:leading-8 prose-p:text-base prose-headings:text-foreground prose-a:text-primary min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: script.content }}
          />
        </div>
      </main>
    </div>
  );
}
