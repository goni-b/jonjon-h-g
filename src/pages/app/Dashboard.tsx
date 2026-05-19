import { useAuth } from "@/contexts/AuthContext";
import { getRoleCategory } from "@/types/user";
import { getDashboardConfig } from "@/data/dashboardMock";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientRoadmap } from "@/components/ui/ClientRoadmap";
import { useRoadmap } from "@/hooks/useRoadmap";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const category = getRoleCategory(user.role);
  const config = getDashboardConfig(category);

  if (category === "client") {
    return <ClientDashboard userId={user.id} userName={user.name} userAvatar={user.avatar} stats={config.cards} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={config.title} description={config.description} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {config.cards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </div>
    </div>
  );
}

// Extracted so the hook only runs for client users
function ClientDashboard({
  userId,
  userName,
  userAvatar,
  stats,
}: {
  userId: string;
  userName: string;
  userAvatar: string;
  stats: ReturnType<typeof getDashboardConfig>["cards"];
}) {
  const { data: stages } = useRoadmap(userId);

  return (
    // -m-6 cancels the parent <main> p-6 so the map fills edge-to-edge
    <div className="animate-fade-in -m-6 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <ClientRoadmap
        stages={stages}
        clientName={userName}
        clientAvatar={userAvatar}
        stats={stats}
      />
    </div>
  );
}
