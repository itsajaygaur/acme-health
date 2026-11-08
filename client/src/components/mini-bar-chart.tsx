import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@shared/dashboard.schema";

interface MiniBarChartProps {
  data?: DashboardSummary;
  isLoading: boolean;
}

export function MiniBarChart({ data, isLoading }: MiniBarChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = [
    {
      name: "Not Started",
      value: data.notStarted,
      fill: "#f97316"
    },
    {
      name: "In Progress", 
      value: data.inProgress,
      fill: "#a855f7"
    },
    // {
    //   name: "FL Review",
    //   value: data.jobsReviewed,
    //   fill: "#22c55e"
    // },
    {
      name: "Submitted to HR",
      value: data.submittedToHr,
      fill: "#3b82f6"
    },
    {
      name: "Completed",
      value: data.completed,
      fill: "#10b981"
    }
  ];

  const COLORS = ["#f97316", "#a855f7", "#22c55e", "#3b82f6", "#10b981"];

  return (
    <div className="p-4 -mt-8">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="35%"
            cy="50%"
            innerRadius={25}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
            contentStyle={{ 
              backgroundColor: "white", 
              border: "1px solid #e5e7eb",
              borderRadius: "6px"
            }}
          />
          <Legend 
            verticalAlign="middle" 
            align="right"
            layout="vertical"
            iconSize={8}
            fontSize={12}
            wrapperStyle={{ 
              paddingLeft: "10px", 
              fontSize: "12px",
              lineHeight: "1.8",
              maxWidth: "120px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}