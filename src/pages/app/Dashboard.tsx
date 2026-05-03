import { useAuth } from "@/contexts/AuthContext";
import { getRoleCategory } from "@/types/user";
import { getDashboardConfig } from "@/data/dashboardMock";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientRoadmap } from "@/components/ui/ClientRoadmap";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const category = getRoleCategory(user.role);
  const config = getDashboardConfig(category);

  return (
    <div className="animate-fade-in">
      <PageHeader title={config.title} description={config.description} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {config.cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {category === "client" && (
        <ClientRoadmap
          clientName={user.name}
          clientAvatar={user.avatar}
        />
      )}
    </div>
  );
}
