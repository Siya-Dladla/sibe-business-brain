import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

interface ChartData {
  chartType: "area" | "bar" | "pie";
  data: any[];
  xKey?: string;
  yKey?: string;
  title?: string;
}

interface TableData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
}

interface ChatVisualizationProps {
  type: "chart" | "table" | "kpi";
  data: KPIData[] | ChartData | TableData;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))", "#666666", "#888888"];

export function ChatVisualization({ type, data }: ChatVisualizationProps) {
  if (type === "kpi") {
    const kpiData = data as KPIData[];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-2xl font-light">{kpi.value}</div>
              {kpi.change !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {kpi.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {kpi.trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                  <span className={`text-xs ${
                    kpi.trend === "up" ? "text-green-500" : 
                    kpi.trend === "down" ? "text-red-500" : 
                    "text-muted-foreground"
                  }`}>
                    {kpi.change > 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    const chartData = data as ChartData;
    return (
      <Card className="bg-card border-border">
        {chartData.title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{chartData.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.chartType === "area" ? (
                <AreaChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey={chartData.xKey || "name"} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartData.yKey || "value"} 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                  />
                </AreaChart>
              ) : chartData.chartType === "bar" ? (
                <BarChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey={chartData.xKey || "name"} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey={chartData.yKey || "value"} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData.data}
                    dataKey={chartData.yKey || "value"}
                    nameKey={chartData.xKey || "name"}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "table") {
    const tableData = data as TableData;
    return (
      <Card className="bg-card border-border overflow-hidden">
        {tableData.title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{tableData.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {tableData.headers.map((header, index) => (
                    <TableHead key={index} className="text-muted-foreground">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border">
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
