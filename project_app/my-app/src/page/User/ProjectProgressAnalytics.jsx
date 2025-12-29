import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProjectProgressCharts from '../../components/ProjectProgressCharts.jsx';

const ProjectProgressAnalytics = () => {
  const { projectId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencyMode, setCurrencyMode] = useState('LKR'); // 'LKR' | 'MILLION' | 'USD'

  useEffect(() => {
    if (!projectId) return;
    // Basic validation: projectId should be a 24-char hex Mongo id
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(projectId);
    if (!isValidObjectId) {
      setError('Invalid project id in URL. Please open Analytics from a project link.');
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        // Fetch all progress entries for a project
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/progress/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        // If API returns single entry when projectId is actually an _id, normalize to array
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setEntries(data);
      } catch (err) {
        console.error('Error fetching progress entries', err);
        setError('Failed to load progress entries');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Project Progress Analytics</h2>
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setCurrencyMode('LKR')}
          className={`px-3 py-1 rounded ${currencyMode === 'LKR' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          LKR
        </button>
        <button
          onClick={() => setCurrencyMode('MILLION')}
          className={`px-3 py-1 rounded ${currencyMode === 'MILLION' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Million
        </button>
        <button
          onClick={() => setCurrencyMode('USD')}
          className={`px-3 py-1 rounded ${currencyMode === 'USD' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          USD
        </button>
      </div>
      <ProjectProgressCharts entries={entries} currencyMode={currencyMode} />
    </div>
  );
};

export default ProjectProgressAnalytics;
