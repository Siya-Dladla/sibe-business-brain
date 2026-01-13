import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import WorkflowNode, { WorkflowNodeData } from "./WorkflowNode";
import { cn } from "@/lib/utils";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface WorkflowCanvasProps {
  nodes: WorkflowNodeData[];
  onNodesChange: (nodes: WorkflowNodeData[]) => void;
  aiEmployees: AIEmployee[];
}

const WorkflowCanvas = ({ nodes, onNodesChange, aiEmployees }: WorkflowCanvasProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  };

  const handleNodeDelete = (nodeId: string) => {
    onNodesChange(nodes.filter((n) => n.id !== nodeId));
    setSelectedNodeId(null);
  };

  const handleNodeConfigure = (nodeId: string) => {
    // Will implement configuration dialog
    console.log("Configure node:", nodeId);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!canvasRef.current) return;
    
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y,
    });
    setIsDragging(true);
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedNodeId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);

      onNodesChange(
        nodes.map((node) =>
          node.id === selectedNodeId
            ? { ...node, position: { x: newX, y: newY } }
            : node
        )
      );
    },
    [isDragging, selectedNodeId, dragOffset, nodes, onNodesChange]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Draw connection lines between nodes
  const renderConnections = () => {
    return nodes.flatMap((node) =>
      node.connections.map((targetId) => {
        const targetNode = nodes.find((n) => n.id === targetId);
        if (!targetNode) return null;

        const startX = node.position.x + 192; // node width
        const startY = node.position.y + 40;
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + 40;

        // Create curved path
        const midX = (startX + endX) / 2;
        const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

        return (
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ zIndex: 0 }}
          >
            <path
              d={path}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            {/* Arrow head */}
            <circle cx={endX} cy={endY} r="4" fill="hsl(var(--primary))" />
          </svg>
        );
      })
    );
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "flex-1 relative overflow-auto bg-background/50",
        "bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)]",
        "bg-[size:24px_24px]",
        isDragging && "cursor-grabbing"
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-8 text-center glass-card">
            <p className="text-lg font-light mb-2">Drag nodes here to build your workflow</p>
            <p className="text-sm text-muted-foreground">
              Start with a trigger, add AI employees, then actions
            </p>
          </Card>
        </div>
      )}

      {/* Connection Lines */}
      {renderConnections()}

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <WorkflowNode
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={() => handleNodeSelect(node.id)}
            onDelete={() => handleNodeDelete(node.id)}
            onConfigure={() => handleNodeConfigure(node.id)}
            aiEmployee={
              node.type === "ai_employee"
                ? aiEmployees.find((e) => e.id === node.config.employeeId)
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
};

export default WorkflowCanvas;
