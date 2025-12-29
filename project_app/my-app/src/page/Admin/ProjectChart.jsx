import React, { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ProjectChart = () => {
  const dashboardRef = useRef(null);

  const progressData = [
    { quarter: "Q1", progress: 35 },
    { quarter: "Q2", progress: 50 },
    { quarter: "Q3", progress: 65 },
    { quarter: "Q4", progress: 85 },
  ];

  const financialData = [
    { name: "Spent", value: 65000 },
    { name: "Remaining", value: 35000 },
  ];

  const teamAllocation = [
    { name: "Contractors", value: 40 },
    { name: "Consultants", value: 30 },
    { name: "Internal Staff", value: 30 },
  ];

  const COLORS = ["#2563EB", "#16A34A", "#FACC15", "#F97316"];

  const handleDownloadPDF = () => {
    const input = dashboardRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("project-dashboard.pdf");
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-8"
      ref={dashboardRef}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">
          PROJECT DASHBOARD
        </h2>

        {/* Download PDF Button */}
        <div className="text-right mb-6">
          <button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition font-semibold"
          >
            📥 Download PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Budget", value: "$120,000", gradient: "from-blue-500 via-indigo-600 to-purple-700" },
            { title: "Spent", value: "$65,000", gradient: "from-red-500 via-pink-600 to-rose-700" },
            { title: "Remaining", value: "$55,000", gradient: "from-green-400 via-emerald-500 to-teal-600" },
            { title: "Overall Progress", value: "72%", gradient: "from-yellow-400 via-orange-500 to-red-500" },
          ].map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${card.gradient} backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-center border border-white/20 hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out`}
            >
              <h3 className="text-lg font-medium text-white">{card.title}</h3>
              <p className="text-3xl font-extrabold text-white mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Quarterly Progress Bar Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Quarterly Progress (%)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <XAxis dataKey="quarter" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#34D399" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Allocation Pie Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Financial Allocation
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
          </div>

          {/* Team Allocation Pie Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Team Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamAllocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {teamAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Placeholder / Additional Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 flex items-center justify-center text-gray-400 text-lg font-medium hover:scale-105 transition-transform">
            🚀 More charts coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectChart;
