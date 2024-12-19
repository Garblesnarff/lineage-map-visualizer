import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineageData } from "@/types/lineage";
import { X } from "lucide-react";

interface LineageCardProps {
  lineage: LineageData;
  onClose: () => void;
}

export const LineageCard = ({ lineage, onClose }: LineageCardProps) => {
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
      </CardContent>
    </Card>
  );
};