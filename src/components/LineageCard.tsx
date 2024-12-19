import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineageData } from "@/types/lineage";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LineageCardProps {
  lineage: LineageData;
  onClose: () => void;
}

export const LineageCard = ({ lineage, onClose }: LineageCardProps) => {
  const { data: tags = [] } = useQuery({
    queryKey: ["teacherTags", lineage.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_tags')
        .select(`
          tag_id,
          tags (
            name
          )
        `)
        .eq('teacher_id', lineage.id);
      
      if (error) throw error;
      return data.map(item => item.tags);
    },
  });

  return (
    <Card className="w-full mt-4 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">{lineage.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-300">{lineage.description}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Text</h3>
          <p className="text-gray-600 dark:text-gray-300">{lineage.text}</p>
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
      </CardContent>
    </Card>
  );
};