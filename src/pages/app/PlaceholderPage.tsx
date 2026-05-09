import { EmptyState } from "@/components/ui/EmptyState";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="animate-fade-in">
      <EmptyState
        title={`${title} — בקרוב`}
        description="עדיין אין כאן נתונים. ברגע שנתחיל לעבוד על המודול הזה, הנתונים יוצגו כאן בצורה מסודרת."
      />
    </div>
  );
}
