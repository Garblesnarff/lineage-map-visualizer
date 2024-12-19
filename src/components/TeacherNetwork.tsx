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
    if (!networkRef.current || !teachers.length) return;

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

    // Create edges from relationships
    const edges = relationships.map(rel => ({
      from: rel.source_id,
      to: rel.target_id,
      label: rel.relationship_type || '',
      arrows: 'to',
    }));

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
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -2000,
          springConstant: 0.04,
        },
      },
    };

    // Create network
    const network = new Network(networkRef.current, { nodes, edges }, options);

    // Handle node selection
    network.on('selectNode', (params) => {
      const selectedTeacher = teachers.find(t => t.id === params.nodes[0]);
      if (selectedTeacher) {
        setSelectedNodeId(selectedTeacher.id);
        onTeacherSelect(selectedTeacher);
      }
    });

    // Handle deselection
    network.on('deselectNode', () => {
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