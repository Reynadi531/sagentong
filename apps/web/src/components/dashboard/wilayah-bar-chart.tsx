"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WilayahBarChartProps {
  data: { name: string; value: number }[];
}

export default function WilayahBarChart({ data }: WilayahBarChartProps) {
  // Find max value to highlight it
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

  return (
    <div className="h-[260px] md:h-[300px] w-full rounded-2xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="mb-4 md:mb-6 text-[15px] md:text-[17px] font-semibold text-[#0f374c]">
        Wilayah dengan Kebutuhan Terbanyak
      </h3>
      <div className="h-[180px] md:h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value === maxValue && maxValue > 0 ? "#2C869A" : "#DDEBEE"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
