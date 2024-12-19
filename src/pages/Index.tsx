import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { LineageScatterPlot } from "@/components/LineageScatterPlot";
import { LineageCard } from "@/components/LineageCard";
import { LineageData } from "@/types/lineage";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLineage, setSelectedLineage] = useState<LineageData | null>(null);

  const { data: lineages = [], isLoading } = useQuery({
    queryKey: ["lineages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lineages")
        .select("id, name, description, text, x, y");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredLineages = lineages.filter(lineage =>
    lineage.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tibetan Teaching Lineages
        </h1>
        
        <div className="w-full max-w-md mx-auto mb-8">
          <Input
            type="search"
            placeholder="Search lineages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
          />
        </div>

        {isLoading ? (
          <div className="text-center">Loading lineages...</div>
        ) : (
          <>
            <LineageScatterPlot
              data={filteredLineages}
              onLineageSelect={setSelectedLineage}
            />
            
            {selectedLineage && (
              <LineageCard
                lineage={selectedLineage}
                onClose={() => setSelectedLineage(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;