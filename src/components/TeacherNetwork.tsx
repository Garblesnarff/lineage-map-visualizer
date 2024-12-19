import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { TeacherData } from "@/types/teacher";
import { RelationshipData } from "@/types/relationship";

interface TeacherNetworkProps {
  teachers: TeacherData[];
  relationships: RelationshipData[];
  onTeacherSelect: (teacher: TeacherData) => void;
}

export const TeacherNetwork = ({ teachers, relationships, onTeacherSelect }: TeacherNetworkProps) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    console.log("TeacherNetwork received props:", { teachers, relationships });
    
    if (!networkRef.current || !teachers.length) {
      console.log("Network ref or teachers not ready:", { 
        hasNetworkRef: !!networkRef.current, 
        teachersLength: teachers.length 
      });
      return;
    }

    // Create nodes from teachers
    const nodes = teachers.map(teacher => ({
      id: teacher.id,
      label: teacher.name,
      title: `${teacher.name}\n${teacher.tradition} tradition`,
      x: teacher.x,
      y: teacher.y,
      color: {
        background: teacher.id === selectedNodeId ? '#48bb78' : '#4a5568',
        border: teacher.id === selectedNodeId ? '#2f855a' : '#2d3748',
        highlight: {
          background: '#48bb78',
          border: '#2f855a',
        },
      },
    }));
    console.log("Created nodes:", nodes);

    // Create edges from relationships
    const edges = relationships.map(rel => ({
      from: rel.source_id,
      to: rel.target_id,
      label: rel.relationship_type || '',
      arrows: 'to',
    }));
    console.log("Created edges:", edges);

    // Network configuration
    const options = {
      nodes: {
        shape: 'circle',
        size: 25,
        font: {
          size: 14,
          color: '#ffffff',
        },
      },
      edges: {
        color: '#718096',
        font: {
          size: 12,
          color: '#a0aec0',
          strokeWidth: 0,
        },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5,
        },
      },
      physics: {
        enabled: true,
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -2000,
          springConstant: 0.04,
        },
      },
    };

    // Create network
    console.log("Initializing network with:", { nodes, edges, options });
    const network = new Network(networkRef.current, { nodes, edges }, options);

    // Handle node selection
    network.on('selectNode', (params) => {
      console.log("Node selected:", params);
      const selectedTeacher = teachers.find(t => t.id === params.nodes[0]);
      if (selectedTeacher) {
        setSelectedNodeId(selectedTeacher.id);
        onTeacherSelect(selectedTeacher);
      }
    });

    // Handle deselection
    network.on('deselectNode', () => {
      console.log("Node deselected");
      setSelectedNodeId(null);
    });

    return () => {
      network.destroy();
    };
  }, [teachers, relationships, onTeacherSelect, selectedNodeId]);

  return (
    <div ref={networkRef} className="w-full h-[600px] bg-gray-900 rounded-lg" />
  );
};