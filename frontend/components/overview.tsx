// components/overview.tsx
"use client"; // Add this at the very top

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Jan",
    "On Time": 4000,
    "Late": 2400,
  },
  {
    name: "Feb",
    "On Time": 3000,
    "Late": 1398,
  },
  {
    name: "Mar",
    "On Time": 2000,
    "Late": 9800,
  },
  {
    name: "Apr",
    "On Time": 2780,
    "Late": 3908,
  },
  {
    name: "May",
    "On Time": 1890,
    "Late": 4800,
  },
  {
    name: "Jun",
    "On Time": 2390,
    "Late": 3800,
  },
  {
    name: "Jul",
    "On Time": 3490,
    "Late": 4300,
  },
];

export function Overview() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="On Time" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Late" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}