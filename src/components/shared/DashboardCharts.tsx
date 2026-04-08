"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#010101",
  "#4B5563",
  "#78c7e9",
  "#9CA3AF",
  "#374151",
  "#6B7280",
  "#D1D5DB",
  "#1F2937",
];

interface Props {
  monthlyData: { month: string; debit: number; credit: number }[];
  categoryData: { category: string; total: number }[];
}

export default function DashboardCharts({ monthlyData, categoryData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Monthly bar chart */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border">
        <h2 className="text-base font-bold mb-1">Monthly Spending</h2>
        <p className="text-xs text-gray-400 mb-4">Last 6 months overview</p>
        {monthlyData.every((d) => d.debit === 0 && d.credit === 0) ? (
          <EmptyChart message="No spending data yet" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={14} barGap={4}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                  width={45}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #d9ddde",
                    fontSize: "12px",
                    boxShadow: "none",
                  }}
                />
                <Bar
                  dataKey="debit"
                  name="Spent"
                  fill="#010101"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="credit"
                  name="Received"
                  fill="#78c7e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 justify-center">
              <LegendDot color="#010101" label="Spent" />
              <LegendDot color="#78c7e9" label="Received" />
            </div>
          </>
        )}
      </div>

      {/* Category donut chart */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border">
        <h2 className="text-base font-bold mb-1">By Category</h2>
        <p className="text-xs text-gray-400 mb-4">
          This month&apos;s breakdown
        </p>
        {categoryData.length === 0 ? (
          <EmptyChart message="No spending this month yet" />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `₹${value.toLocaleString("en-IN")}`,
                  "",
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #d9ddde",
                  fontSize: "12px",
                  boxShadow: "none",
                }}
              />
              <Legend
                iconSize={8}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ fontSize: "11px", color: "#6B7280" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[200px] flex items-center justify-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
