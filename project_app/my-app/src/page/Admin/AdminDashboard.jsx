import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        if (prev.length >= 2) return prev; // Limit to 2
        return [...prev, projectId];
      }
    });
  };

  const handleViewAnalytics = () => {
    navigate('/admin/analytics', { state: { projectIds: selectedProjects } });
  };

  const countFinished = () => {
    const now = new Date();
    return projects.filter(p => p.endDate && new Date(p.endDate) < now).length;
  };

  const countInProgress = () => {
    const now = new Date();
    return projects.filter(p => p.startDate && p.endDate && new Date(p.startDate) <= now && new Date(p.endDate) >= now).length;
  };

  const countUpcoming = () => {
    const now = new Date();
    return projects.filter(p => p.startDate && new Date(p.startDate) > now).length;
  };

  const totalBudget = () => {
    return projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <div className="flex gap-4">
          <button
            onClick={handleViewAnalytics}
            disabled={selectedProjects.length === 0 || selectedProjects.length > 2}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedProjects.length > 0 && selectedProjects.length <= 2
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            View Analytics ({selectedProjects.length})
          </button>
          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Projects</div>
          <div className="text-2xl font-bold">{projects.length}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-bold">{countInProgress()}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Finished</div>
          <div className="text-2xl font-bold">{countFinished()}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold">{countUpcoming()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Budget (LKR)</div>
          <div className="text-2xl font-bold">₨{totalBudget().toLocaleString()}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Most Recent Projects</div>
          <ul className="mt-3 space-y-2 max-h-60 overflow-auto">
            {projects.slice().reverse().map(p => (
              <li key={p._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(p._id)}
                    onChange={() => handleSelectProject(p._id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium">{p.projectName}</div>
                    <div className="text-xs text-gray-500">{p.institution || ''}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
