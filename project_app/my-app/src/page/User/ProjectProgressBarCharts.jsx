import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const COLORS = ["#3b82f6", "#22c55e", "#facc15", "#ef4444"];

const ProjectProgressBarCharts = () => {
  const { progressId } = useParams(); // e.g. /progress-details/:progressId
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/progress/${progressId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setProgress(res.data);
      } catch (err) {
        console.error("❌ Error fetching progress:", err);
        setError("Failed to load project progress data");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [progressId]);

  if (loading) return <div className="text-center text-lg mt-10">Loading charts...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!progress) return <div className="text-center mt-10">No progress data found.</div>;

  // --- Prepare chart data ---
  const physicalData = [
    { name: "Q1", Target: progress.quarter1TargetPercentage || 0 },
    { name: "Q2", Target: progress.quarter2TargetPercentage || 0 },
    { name: "Q3", Target: progress.quarter3TargetPercentage || 0 },
    { name: "Q4", Target: progress.quarter4TargetPercentage || 0 },
  ];

  const financialData = [
    { name: "Allocation", value: progress.allocationCurrentYear || 0 },
    { name: "Expenditure", value: progress.actualExpenditure || 0 },
    { name: "Bills in Hand", value: progress.billsInHand || 0 },
    { name: "Price Escalation", value: progress.priceEscalation || 0 },
  ];

  const yearEndComparison = [
    {
      name: "Target vs Achieved",
      Target: progress.cumulativeProgressPercentageOfOverallTarget || 0,
      Achieved: progress.yearEndProgressPercentage || 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 bg-white shadow-2xl rounded-2xl my-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        📈 Project Progress Overview
      </h2>
      <p className="text-gray-600 mb-10">
        {progress.projectId?.projectName} – {progress.location}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* PHYSICAL PROGRESS BY QUARTER */}
        <motion.div
          className="bg-blue-50 p-6 rounded-2xl shadow-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Physical Progress by Quarter (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={physicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Target" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* FINANCIAL PROGRESS PIE CHART */}
        <motion.div
          className="bg-green-50 p-6 rounded-2xl shadow-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-green-700 mb-4">
            Financial Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* TARGET VS ACHIEVED BAR */}
        <motion.div
          className="bg-yellow-50 p-6 rounded-2xl shadow-md col-span-1 md:col-span-2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-yellow-700 mb-4">
            Target vs Achieved (Year-End %)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearEndComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Target" fill="#facc15" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Achieved" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Extra Summary Section */}
      <motion.div
        className="mt-10 bg-gray-50 p-6 rounded-2xl shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Summary</h3>
        <p className="text-gray-700 mb-2">
          <strong>Main Objective:</strong> {progress.mainObjective}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Overall Target:</strong> {progress.overallTarget}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Funding Source:</strong> {progress.fundingSource}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Contractors:</strong> {progress.contractors}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Consultants:</strong> {progress.consultants}
        </p>
      </motion.div>
    </div>
  );
};

export default ProjectProgressBarCharts;
