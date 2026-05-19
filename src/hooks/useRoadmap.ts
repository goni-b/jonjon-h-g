import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { defaultRoadmapStages } from "@/data/roadmapDefaults";
import type { RoadmapStage } from "@/components/ui/ClientRoadmap";

async function fetchStages(clientId: string): Promise<RoadmapStage[]> {
  if (!supabaseEnabled || !supabase) return defaultRoadmapStages;

  const { data, error } = await supabase
    .from("roadmap_stages")
    .select("id, title, description, expected_date, status, order_index, tasks")
    .eq("client_id", clientId)
    .order("order_index");

  if (error || !data || data.length === 0) return defaultRoadmapStages;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    expectedDate: row.expected_date ?? "",
    status: row.status,
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
  }));
}

export function useRoadmap(clientId?: string) {
  return useQuery({
    queryKey: ["roadmap", clientId],
    queryFn: () => fetchStages(clientId!),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    placeholderData: defaultRoadmapStages,
  });
}
