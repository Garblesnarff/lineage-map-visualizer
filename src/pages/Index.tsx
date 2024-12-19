import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { TeacherNetwork } from "@/components/TeacherNetwork";
import { LineageCard } from "@/components/LineageCard";
import { TeacherData } from "@/types/teacher";
import { RelationshipData } from "@/types/relationship";
import { supabase } from "@/integrations/supabase/client";
import { Pipeline } from '@xenova/transformers';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);

  // Fetch teachers data
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*");
      
      if (error) throw error;
      return data as TeacherData[];
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
      return data as RelationshipData[];
    },
  });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <TeacherNetwork
            teachers={filteredTeachers}
            relationships={relationships}
            onTeacherSelect={setSelectedTeacher}
          />
        )}
      </div>
    </div>
  );
};

export default Index;