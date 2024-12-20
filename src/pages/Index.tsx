import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { TeacherNetwork } from "@/components/TeacherNetwork";
import { LineageCard } from "@/components/LineageCard";
import { TeacherData } from "@/types/teacher";
import { RelationshipData } from "@/types/relationship";
import { supabase } from "@/integrations/supabase/client";
import { UMAP } from 'umap-js';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);

  // Fetch teachers data
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      console.log("Starting teacher data fetch...");
      
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("*");
      
      if (teachersError) {
        console.error("Error fetching teachers:", teachersError);
        throw teachersError;
      }
      
      console.log("Teachers data fetched:", teachersData);

      // Generate circular layout coordinates
      const teachersWithCoordinates = teachersData.map((teacher, index) => {
        const angle = (index * 2 * Math.PI) / teachersData.length;
        const radius = 300; // Adjust this value to change the circle size
        return {
          ...teacher,
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        };
      });
      
      console.log("Final teachers data with coordinates:", teachersWithCoordinates);
      return teachersWithCoordinates as TeacherData[];
    },
  });

  // Fetch relationships data
  const { data: relationships = [], isLoading: isLoadingRelationships } = useQuery({
    queryKey: ["relationships"],
    queryFn: async () => {
      console.log("Starting relationships fetch...");
      
      const { data, error } = await supabase
        .from("relationships")
        .select("*");
      
      if (error) {
        console.error("Error fetching relationships:", error);
        throw error;
      }
      
      console.log("Relationships data fetched:", data);
      return data as RelationshipData[];
    },
  });

  // Apply search filter
  const filteredTeachers = searchTerm
    ? teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teachers;

  console.log("Filtered teachers being passed to TeacherNetwork:", filteredTeachers);
  console.log("Relationships being passed to TeacherNetwork:", relationships);

  const isLoading = isLoadingTeachers || isLoadingRelationships;

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
          <div className="text-center">Loading teachers and relationships...</div>
        ) : (
          <>
            <TeacherNetwork
              teachers={filteredTeachers}
              relationships={relationships}
              onTeacherSelect={setSelectedTeacher}
            />
            {selectedTeacher && (
              <LineageCard
                teacher={selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;