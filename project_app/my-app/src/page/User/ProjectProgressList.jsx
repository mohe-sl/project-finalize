import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ProjectProgressList = () => {
  const { projectId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    fetchEntries();
  }, [projectId]);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/progress/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch progress entries', err);
      setError('Failed to load progress entries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading progress entries...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Progress entries for project</h2>
        <div className="text-sm text-gray-600">Total: {entries.length}</div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenditure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imprest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{(e.cumulativeProgressPercentageOfOverallTarget ?? e.yearEndProgressPercentage ?? 0).toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm text-gray-700">₨{(e.actualExpenditure ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">Requested: ₨{(e.imprestRequested ?? 0).toLocaleString()} / Received: ₨{(e.imprestReceived ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex space-x-3">
                    <button onClick={() => navigate(`/projects/${projectId}/analytics`)} className="text-blue-600 hover:underline">View Analytics</button>
                    <button onClick={() => navigate(`/progress-details/${e._id}`)} className="text-green-600 hover:underline">View Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectProgressList;
