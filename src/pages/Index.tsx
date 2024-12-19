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
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("*");
      
      if (teachersError) throw teachersError;
      
      console.log("Teachers data fetched:", teachersData);

      // Generate embeddings using the Edge Function
      const descriptions = teachersData.map(t => t.description || '');
      const { data: embeddingsData, error: embeddingsError } = await supabase.functions
        .invoke('generate-embeddings', {
          body: { descriptions }
        });

      if (embeddingsError) throw embeddingsError;
      console.log("Embeddings generated:", embeddingsData);

      // Use UMAP with specified parameters
      const umap = new UMAP({
        nComponents: 2,
        nNeighbors: 15,
        minDist: 0.1,
        spread: 1.0,
        nEpochs: 100
      });
      
      // Add mock coordinates if embeddings are all zeros
      let coordinates;
      if (embeddingsData.embeddings.every((embedding: number[]) => embedding.every(val => val === 0))) {
        console.log("Using mock coordinates since embeddings are all zeros");
        coordinates = teachersData.map((_, index) => [
          Math.cos(index * Math.PI / teachersData.length),
          Math.sin(index * Math.PI / teachersData.length)
        ]);
      } else {
        coordinates = umap.fit(embeddingsData.embeddings);
      }
      
      console.log("UMAP coordinates generated:", coordinates);

      // Combine teacher data with coordinates
      const teachersWithCoordinates = teachersData.map((teacher, index) => ({
        ...teacher,
        x: coordinates[index][0] * 100, // Scale coordinates for better visibility
        y: coordinates[index][1] * 100,
      })) as TeacherData[];
      
      console.log("Final teachers data with coordinates:", teachersWithCoordinates);
      return teachersWithCoordinates;
    },
  });

  // Fetch relationships data
  const { data: relationships = [], isLoading: isLoadingRelationships } = useQuery({
    queryKey: ["relationships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relationships")
        .select("*");
      
      if (error) throw error;
      console.log("Relationships data fetched:", data);
      return data as RelationshipData[];
    },
  });

  // Apply search filter only if there's a search term
  const filteredTeachers = searchTerm
    ? teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teachers;

  console.log("Filtered teachers being passed to TeacherNetwork:", filteredTeachers);

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