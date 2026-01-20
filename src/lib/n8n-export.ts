import { WorkflowNodeData } from "@/components/workflow/WorkflowNode";

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main: N8nConnection[][] }>;
  active: boolean;
  settings: {
    executionOrder: string;
  };
  versionId: string;
  meta: {
    instanceId: string;
    templateCredsSetupCompleted: boolean;
  };
  tags: string[];
}

// Map Sibe trigger types to n8n trigger nodes
const triggerTypeMap: Record<string, { type: string; name: string; params: Record<string, any> }> = {
  manual: {
    type: "n8n-nodes-base.manualTrigger",
    name: "Manual Trigger",
    params: {},
  },
  scheduled: {
    type: "n8n-nodes-base.scheduleTrigger",
    name: "Schedule Trigger",
    params: {
      rule: {
        interval: [{ field: "hours", hoursInterval: 1 }],
      },
    },
  },
  data_change: {
    type: "n8n-nodes-base.webhook",
    name: "Webhook",
    params: {
      httpMethod: "POST",
      path: "data-change-webhook",
      responseMode: "onReceived",
    },
  },
};

// Map Sibe action types to n8n nodes
const actionTypeMap: Record<string, { type: string; name: string; params: Record<string, any> }> = {
  analyze_data: {
    type: "n8n-nodes-base.code",
    name: "Analyze Data",
    params: {
      jsCode: `// Data analysis logic
const items = $input.all();
const analyzed = items.map(item => ({
  ...item.json,
  analyzed: true,
  analyzedAt: new Date().toISOString()
}));
return analyzed.map(data => ({ json: data }));`,
    },
  },
  create_task: {
    type: "n8n-nodes-base.set",
    name: "Create Task",
    params: {
      mode: "manual",
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: "task_title", name: "title", value: "={{ $json.title }}", type: "string" },
          { id: "task_status", name: "status", value: "pending", type: "string" },
          { id: "task_created", name: "created_at", value: "={{ $now.toISO() }}", type: "string" },
        ],
      },
    },
  },
  generate_report: {
    type: "n8n-nodes-base.code",
    name: "Generate Report",
    params: {
      jsCode: `// Report generation logic
const items = $input.all();
const report = {
  title: 'Generated Report',
  generatedAt: new Date().toISOString(),
  data: items.map(i => i.json),
  summary: \`Report generated with \${items.length} items\`
};
return [{ json: report }];`,
    },
  },
  send_alert: {
    type: "n8n-nodes-base.slack",
    name: "Send Alert (Slack)",
    params: {
      resource: "message",
      operation: "post",
      channel: "#alerts",
      text: "={{ $json.message || 'Alert from Sibe workflow' }}",
    },
  },
  send_email: {
    type: "n8n-nodes-base.emailSend",
    name: "Send Email",
    params: {
      fromEmail: "workflow@example.com",
      toEmail: "={{ $json.email }}",
      subject: "={{ $json.subject || 'Notification from Sibe' }}",
      text: "={{ $json.message }}",
    },
  },
  sync_data: {
    type: "n8n-nodes-base.httpRequest",
    name: "Sync Data (HTTP)",
    params: {
      method: "POST",
      url: "https://api.example.com/sync",
      sendBody: true,
      bodyParameters: {
        parameters: [{ name: "data", value: "={{ $json }}" }],
      },
    },
  },
};

// AI Employee node template
const createAIEmployeeNode = (
  nodeId: string,
  employee: { name: string; role: string; department: string } | undefined,
  position: [number, number]
): N8nNode => ({
  id: nodeId,
  name: employee ? `AI: ${employee.name}` : "AI Employee",
  type: "n8n-nodes-base.openAi",
  typeVersion: 1,
  position,
  parameters: {
    resource: "chat",
    operation: "message",
    model: "gpt-4",
    messages: {
      values: [
        {
          content: `You are ${employee?.name || 'an AI assistant'}, a ${employee?.role || 'professional'} in the ${employee?.department || 'general'} department. Process the incoming data and provide insights.

Input: {{ $json }}

Provide a structured response with your analysis.`,
        },
      ],
    },
    options: {
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
});

// Condition node template
const createConditionNode = (
  nodeId: string,
  position: [number, number]
): N8nNode => ({
  id: nodeId,
  name: "Condition",
  type: "n8n-nodes-base.if",
  typeVersion: 2,
  position,
  parameters: {
    conditions: {
      options: {
        leftValue: "={{ $json.status }}",
        caseSensitive: true,
        typeValidation: "strict",
      },
      combinator: "and",
      conditions: [
        {
          leftValue: "={{ $json.status }}",
          rightValue: "active",
          operator: {
            type: "string",
            operation: "equals",
          },
        },
      ],
    },
  },
});

export interface ExportOptions {
  workflowName: string;
  nodes: WorkflowNodeData[];
  aiEmployees: Array<{ id: string; name: string; role: string; department: string }>;
}

export const convertToN8nWorkflow = ({
  workflowName,
  nodes,
  aiEmployees,
}: ExportOptions): N8nWorkflow => {
  const n8nNodes: N8nNode[] = [];
  const connections: Record<string, { main: N8nConnection[][] }> = {};

  // Sort nodes by position (left to right, top to bottom) for logical ordering
  const sortedNodes = [...nodes].sort((a, b) => {
    if (Math.abs(a.position.x - b.position.x) < 50) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  // Convert each Sibe node to n8n node
  sortedNodes.forEach((node, index) => {
    const position: [number, number] = [
      250 + (index % 4) * 300,
      100 + Math.floor(index / 4) * 200,
    ];

    let n8nNode: N8nNode;

    switch (node.type) {
      case "trigger": {
        const triggerConfig = triggerTypeMap[node.config.triggerType] || triggerTypeMap.manual;
        n8nNode = {
          id: node.id,
          name: triggerConfig.name,
          type: triggerConfig.type,
          typeVersion: 1,
          position,
          parameters: triggerConfig.params,
        };
        break;
      }

      case "ai_employee": {
        const employee = aiEmployees.find((e) => e.id === node.config.employeeId);
        n8nNode = createAIEmployeeNode(node.id, employee, position);
        break;
      }

      case "action": {
        const actionConfig = actionTypeMap[node.config.actionType] || actionTypeMap.analyze_data;
        n8nNode = {
          id: node.id,
          name: actionConfig.name,
          type: actionConfig.type,
          typeVersion: 1,
          position,
          parameters: actionConfig.params,
        };
        break;
      }

      case "condition": {
        n8nNode = createConditionNode(node.id, position);
        break;
      }

      default:
        n8nNode = {
          id: node.id,
          name: node.name,
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
          position,
          parameters: {},
        };
    }

    n8nNodes.push(n8nNode);
  });

  // Build connections based on node.connections
  sortedNodes.forEach((node) => {
    if (node.connections.length > 0) {
      const sourceNode = n8nNodes.find((n) => n.id === node.id);
      if (sourceNode) {
        connections[sourceNode.name] = {
          main: [
            node.connections.map((targetId) => {
              const targetNode = n8nNodes.find((n) => n.id === targetId);
              return {
                node: targetNode?.name || "",
                type: "main",
                index: 0,
              };
            }),
          ],
        };
      }
    }
  });

  // If no connections defined, create a linear flow
  if (Object.keys(connections).length === 0 && n8nNodes.length > 1) {
    n8nNodes.forEach((node, index) => {
      if (index < n8nNodes.length - 1) {
        connections[node.name] = {
          main: [
            [
              {
                node: n8nNodes[index + 1].name,
                type: "main",
                index: 0,
              },
            ],
          ],
        };
      }
    });
  }

  return {
    name: workflowName,
    nodes: n8nNodes,
    connections,
    active: false,
    settings: {
      executionOrder: "v1",
    },
    versionId: crypto.randomUUID(),
    meta: {
      instanceId: "sibe-export",
      templateCredsSetupCompleted: false,
    },
    tags: ["sibe-export", "ai-workflow"],
  };
};

export const exportToClipboard = async (workflow: N8nWorkflow): Promise<void> => {
  const jsonString = JSON.stringify(workflow, null, 2);
  await navigator.clipboard.writeText(jsonString);
};

export const downloadAsFile = (workflow: N8nWorkflow, filename?: string): void => {
  const jsonString = JSON.stringify(workflow, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${workflow.name.replace(/\s+/g, "-").toLowerCase()}-n8n.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
