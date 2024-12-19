import { TeacherData } from "@/types/teacher";
import { RelationshipData } from "@/types/relationship";

/**
 * Creates node objects for vis-network from teacher data
 * @param teachers - Array of teacher data
 * @param selectedNodeId - Currently selected node ID
 * @returns Array of node objects compatible with vis-network
 */
export const createNetworkNodes = (teachers: TeacherData[], selectedNodeId: string | null) => 
  teachers.map(teacher => ({
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

/**
 * Creates edge objects for vis-network from relationship data
 * @param relationships - Array of relationship data
 * @returns Array of edge objects compatible with vis-network
 */
export const createNetworkEdges = (relationships: RelationshipData[]) =>
  relationships.map(rel => ({
    from: rel.source_id,
    to: rel.target_id,
    label: rel.relationship_type || '',
    arrows: 'to',
  }));

/**
 * Network visualization configuration options
 * Defines appearance and behavior of nodes, edges, and physics simulation
 */
export const networkOptions = {
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