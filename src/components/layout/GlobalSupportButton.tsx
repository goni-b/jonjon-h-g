import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { NewTicketDialog } from "@/pages/app/Tickets";
import { mockTickets, Ticket } from "@/data/ticketsMock";

// Simple mapping for client IDs (matches the one in Tickets.tsx)
const CLIENT_TO_ID: Record<string, string> = { "3": "c1" };

export function GlobalSupportButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // If there's no user or they are not a client, don't render the global support button
  if (!user || user.role !== "client") return null;

  const defaultClientId = user.role === "client" ? (CLIENT_TO_ID[user.id] ?? "") : undefined;

  const handleAddTicket = (t: Ticket) => {
    // Add to global mock data
    mockTickets.unshift(t);
    // Dispatch event
    window.dispatchEvent(new CustomEvent("new-ticket", { detail: t }));
    
    // Show success toast
    toast.success("תודה על פנייתך!", {
      description: "הצוות שלנו יחזור אליך בהקדם האפשרי.",
    });
  };

  return (
    <>
      <div className="fixed bottom-8 left-8 flex flex-col items-center z-50 group">
        <div className="absolute bottom-full mb-3 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 duration-300 whitespace-nowrap font-medium">
          צריך עזרה? נשמח לעזור!
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-primary/90 hover:scale-110 transition-all"
        >
          <HelpCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <NewTicketDialog
        open={open}
        onClose={() => setOpen(false)}
        onAdd={handleAddTicket}
        currentUserId={user.id}
        currentUserName={user.name}
        defaultClientId={defaultClientId}
      />
    </>
  );
}
