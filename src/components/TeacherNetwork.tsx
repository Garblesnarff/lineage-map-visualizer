import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { TeacherData } from "@/types/teacher";
import { RelationshipData } from "@/types/relationship";
import { createNetworkNodes, createNetworkEdges, networkOptions } from "@/utils/networkUtils";

interface TeacherNetworkProps {
  teachers: TeacherData[];
  relationships: RelationshipData[];
  onTeacherSelect: (teacher: TeacherData) => void;
}

/**
 * TeacherNetwork Component
 * Renders an interactive network visualization of teachers and their relationships.
 * Uses vis-network library for rendering the network graph.
 */
export const TeacherNetwork = ({ teachers, relationships, onTeacherSelect }: TeacherNetworkProps) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    console.log("TeacherNetwork received props:", { teachers, relationships });
    
    // Early return if network container or teacher data is not ready
    if (!networkRef.current || !teachers.length) {
      console.log("Network ref or teachers not ready:", { 
        hasNetworkRef: !!networkRef.current, 
        teachersLength: teachers.length 
      });
      return;
    }

    // Create network data structure
    const nodes = createNetworkNodes(teachers, selectedNodeId);
    const edges = createNetworkEdges(relationships);
    
    console.log("Created network data:", { nodes, edges });

    // Initialize network with data and options
    const network = new Network(networkRef.current, { nodes, edges }, networkOptions);

    /**
     * Event Handlers
     */
    network.on('selectNode', (params) => {
      console.log("Node selected:", params);
      const selectedTeacher = teachers.find(t => t.id === params.nodes[0]);
      if (selectedTeacher) {
        setSelectedNodeId(selectedTeacher.id);
        onTeacherSelect(selectedTeacher);
      }
    });

    network.on('deselectNode', () => {
      console.log("Node deselected");
      setSelectedNodeId(null);
    });

    // Cleanup network instance on unmount
    return () => network.destroy();
  }, [teachers, relationships, onTeacherSelect, selectedNodeId]);

  return (
    <div ref={networkRef} className="w-full h-[600px] bg-gray-900 rounded-lg" />
  );
};