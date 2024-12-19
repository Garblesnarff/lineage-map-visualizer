import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { LineageScatterPlot } from "@/components/LineageScatterPlot";
import { LineageCard } from "@/components/LineageCard";
import { LineageData } from "@/types/lineage";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLineage, setSelectedLineage] = useState<LineageData | null>(null);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, tibetan_name, period, tradition, scholastic, tantric, meditation, philosophical, location_name");
      
      if (error) throw error;
      
      // Transform teacher data to match LineageData interface
      return data.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        description: `${teacher.name} (${teacher.tibetan_name || 'No Tibetan name'}) - ${teacher.tradition} tradition`,
        text: `Period: ${teacher.period || 'Unknown'}\nLocation: ${teacher.location_name || 'Unknown'}\n\nScores:\nScholastic: ${teacher.scholastic || 0}\nTantric: ${teacher.tantric || 0}\nMeditation: ${teacher.meditation || 0}\nPhilosophical: ${teacher.philosophical || 0}`,
        x: teacher.scholastic || 0,
        y: teacher.meditation || 0,
        scholastic: teacher.scholastic || 0, // Added this line to include the scholastic score
      }));
    },
  });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
          />
        </div>

        {isLoading ? (
          <div className="text-center">Loading teachers...</div>
        ) : (
          <>
            <LineageScatterPlot
              data={filteredTeachers}
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