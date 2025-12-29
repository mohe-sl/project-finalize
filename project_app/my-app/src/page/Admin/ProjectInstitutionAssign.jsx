import React from 'react';

const ProjectInstitutionAssign = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Page removed</h2>
      <p className="text-sm text-gray-600">The Assign Institutions page has been removed per project configuration.</p>
    </div>
  );
};
  const fetchMissing = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/projects/missing-institution`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const assignSingle = async (projectId, institution) => {
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/projects/assign-institution/${projectId}`, { institution }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await fetchMissing();
      setSelected(prev => { const c = new Set(prev); c.delete(projectId); return c; });
    } catch (err) {
      console.error(err);
      setError('Failed to assign institution');
    } finally {
      setAssigning(false);
    }
  };

  const assignBulk = async () => {
    if (selected.size === 0) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const projectIds = Array.from(selected);
      await axios.put(`${API_URL}/projects/bulk-assign`, { projectIds, institution: selectedInstitution }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSelected(new Set());
      await fetchMissing();
    } catch (err) {
      console.error(err);
      setError('Bulk assign failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assign Institutions to Projects</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-2 bg-gray-200 rounded">Back</button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-4 flex items-center gap-3">
        <select value={selectedInstitution} onChange={e => setSelectedInstitution(e.target.value)} className="p-2 border rounded">
          {institutions.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <button disabled={assigning || selected.size === 0} onClick={assignBulk} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Assign Selected</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Select</th>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Created By</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td className="px-4 py-2">{p.projectName}</td>
                  <td className="px-4 py-2">{p.department}</td>
                  <td className="px-4 py-2">{p.createdBy}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => assignSingle(p._id, selectedInstitution)} className="px-2 py-1 bg-green-600 text-white rounded">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectInstitutionAssign;
