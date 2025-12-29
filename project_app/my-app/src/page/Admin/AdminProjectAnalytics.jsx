import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:5000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminProjectAnalytics = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectIds } = location.state || { projectIds: [] };

    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!projectIds || projectIds.length === 0) {
            setError('No projects selected for analytics.');
            setLoading(false);
            return;
        }
        fetchAnalyticsData();
    }, [projectIds]);

    const fetchAnalyticsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            const promises = projectIds.map(async (id) => {
                // Fetch Project Details
                const projectRes = await axios.get(`${API_URL}/projects/${id}`, { headers });
                const project = projectRes.data;

                // Fetch Project Progress
                // using the existing route that returns a list by project ID
                // Note: server.js mounts this at /api/progress
                const progressRes = await axios.get(`${API_URL}/progress/${id}`, { headers });

                // Find the latest submitted report, or just the latest if none submitted
                let progressList = progressRes.data;
                if (!Array.isArray(progressList)) progressList = [progressList]; // Handle if it returned single object

                // Sort by createdAt desc
                progressList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const latestProgress = progressList.find(p => p.status === 'submitted') || progressList[0];

                return {
                    project,
                    progress: latestProgress || {}
                };
            });

            const results = await Promise.all(promises);
            setAnalyticsData(results);
        } catch (err) {
            console.error('Failed to fetch analytics data', err);
            setError(err.response?.data?.error || err.message || 'Failed to load project data.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const input = document.getElementById('analytics-dashboard');
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('project-analytics.pdf');
        });
    };

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;
    if (error) return (
        <div className="p-10 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600 underline">
                Back to Dashboard
            </button>
        </div>
    );

    // Prepare Data for Charts

    // 1. Physical Progress Comparison (Bar Chart)
    const physicalProgressData = analyticsData.map(item => ({
        name: item.project.projectName,
        'Cumulative Progress %': item.progress.cumulativeProgressPercentageOfOverallTarget || 0,
        'Year End Target %': item.progress.yearEndProgressPercentage || 0,
    }));

    // 2. Financial Overview (Pie Charts - one per project)
    // We will map over analyticsData in the render to create these

    // 3. Financial Comparison (Bar Chart)
    const financialComparisonData = analyticsData.map(item => ({
        name: item.project.projectName,
        Budget: item.project.budget || 0,
        'Actual Expenditure': item.progress.actualExpenditure || 0,
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-6" id="analytics-dashboard">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Project Analytics Overview</h1>
                    <button
                        onClick={downloadPDF}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Download PDF
                    </button>
                </div>

                {/* Project Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {analyticsData.map((item, idx) => (
                        <div key={item.project._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">{item.project.projectName}</h2>
                            <div className="text-sm text-gray-500 mb-4">{item.project.institution}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs text-blue-600 font-semibold uppercase">Budget</div>
                                    <div className="text-lg font-bold text-gray-800">
                                        ₨{item.project.budget?.toLocaleString() || 0}
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-xs text-green-600 font-semibold uppercase">Physical Progress</div>
                                    <div className="text-lg font-bold text-gray-800">
                                        {item.progress.cumulativeProgressPercentageOfOverallTarget || 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Physical Progress Comparison */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Physical Progress Comparison</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={physicalProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Cumulative Progress %" fill="#3B82F6" />
                                    <Bar dataKey="Year End Target %" fill="#93C5FD" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financial Comparison */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Financial Utilization</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Budget" fill="#10B981" />
                                    <Bar dataKey="Actual Expenditure" fill="#EF4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Individual Pie Charts for Budget Breakdown */}
                    {analyticsData.map((item, index) => {
                        const spent = item.progress.actualExpenditure || 0;
                        const remaining = Math.max(0, (item.project.budget || 0) - spent);
                        const pieData = [
                            { name: 'Spent', value: spent },
                            { name: 'Remaining', value: remaining }
                        ];

                        return (
                            <div key={item.project._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-700 mb-4">Budget Breakdown: {item.project.projectName}</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#EF4444" /> {/* Spent */}
                                                <Cell fill="#10B981" /> {/* Remaining */}
                                            </Pie>
                                            <Tooltip formatter={(value) => `₨${value.toLocaleString()}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center mt-4">
                                    <span className="text-sm text-gray-500">
                                        Total Budget: ₨{(item.project.budget || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default AdminProjectAnalytics;
