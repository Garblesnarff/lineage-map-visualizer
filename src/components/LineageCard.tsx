import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherData } from "@/types/teacher";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LineageCardProps {
  teacher: TeacherData;
  onClose: () => void;
}

export const LineageCard = ({ teacher, onClose }: LineageCardProps) => {
  const { data: tags = [] } = useQuery({
    queryKey: ["teacherTags", teacher.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_tags')
        .select(`
          tag_id,
          tags (
            name
          )
        `)
        .eq('teacher_id', teacher.id);
      
      if (error) throw error;
      return data.map(item => item.tags);
    },
  });

  return (
    <Card className="w-full mt-4 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">{teacher.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-300">{teacher.description}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Details</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Period: {teacher.period || 'Unknown'}<br />
            Location: {teacher.location_name || 'Unknown'}<br />
            Tradition: {teacher.tradition}<br />
            Scores:<br />
            Scholastic: {teacher.scholastic || 0}<br />
            Tantric: {teacher.tantric || 0}<br />
            Meditation: {teacher.meditation || 0}<br />
            Philosophical: {teacher.philosophical || 0}
          </p>
        </div>
        {tags.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};