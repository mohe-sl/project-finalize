import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const IMAGE_URL = 'http://localhost:5000/api/uploads';

const ProjectNewDahsboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const navigate = useNavigate();

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

  const institutions = useMemo(() => {
    const vals = Array.from(new Set((projects || []).map(p => p.institution).filter(Boolean)));
    return ['All', ...vals];
  }, [projects]);

  const departments = useMemo(() => {
    const vals = Array.from(new Set((projects || []).map(p => p.department).filter(Boolean)));
    return ['All', ...vals];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    return (projects || []).filter(p => {
      if (q) {
        const name = (p.projectName || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (institutionFilter && institutionFilter !== 'All') {
        if ((p.institution || '') !== institutionFilter) return false;
      }
      if (departmentFilter && departmentFilter !== 'All') {
        if ((p.department || '') !== departmentFilter) return false;
      }
      return true;
    });
  }, [projects, search, institutionFilter, departmentFilter]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      // refresh
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
      setError('Failed to delete project');
    }
  };

  const openProgressList = (projectId) => {
    // Navigate to the new progress-list route
    navigate(`/projects/${projectId}/progress-list`);
  };

  if (loading) return <div className="p-6">Loading projects...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Project New Dashboard</h1>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name..."
          className="w-full md:w-1/3 px-3 py-2 border rounded mb-2 md:mb-0"
        />
        <select
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
          className="w-full md:w-1/4 px-3 py-2 border rounded mb-2 md:mb-0"
        >
          {institutions.map((ins, i) => (
            <option key={i} value={ins}>{ins}</option>
          ))}
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full md:w-1/4 px-3 py-2 border rounded"
        >
          {departments.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
        <button onClick={() => { setSearch(''); setInstitutionFilter('All'); setDepartmentFilter('All'); }} className="mt-2 md:mt-0 px-3 py-2 bg-gray-200 rounded">Clear</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center" onClick={() => openProgressList(p._id)}>
                  {p.image ? (
                    <img src={`${IMAGE_URL}/${p.image.split('/').pop()}`} alt={p.projectName} className="w-10 h-10 rounded-full mr-3 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">🏗️</div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{p.projectName}</div>
                    <div className="text-sm text-gray-500">{p.institution || ''}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.department || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">₨{p.budget ? p.budget.toLocaleString() : '0'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'} — {p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Click project name to open progress list</div>
                    <div className="flex space-x-3">
                      {(() => {
                        try {
                          const role = localStorage.getItem('role');
                          if (role === 'admin') {
                            return (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/projects/edit/${p._id}`); }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); await handleDelete(p._id); }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </>
                            );
                          }
                        } catch (e) {
                          console.error('Error reading role from localStorage', e);
                        }
                        return null;
                      })()}
                    </div>
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

export default ProjectNewDahsboard;
