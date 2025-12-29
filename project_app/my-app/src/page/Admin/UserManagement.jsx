import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

    // For viewing user projects
    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedUserProjects, setSelectedUserProjects] = useState([]);
    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Users fetched successfully:', res.data);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err.response?.status, err.response?.data, err.message);
      setError(`Failed to load users. Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

    const handleViewProjects = async (userId, username) => {
      setSelectedUserName(username);
      setProjectsLoading(true);
      setActionError('');
    
      try {
        const res = await axios.get(`${API_URL}/projects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const userProjects = res.data.filter(p => p.createdBy === userId);
        setSelectedUserProjects(userProjects);
        setShowProjectsModal(true);
      } catch (err) {
        setActionError(`Failed to load projects: ${err.response?.data?.message || err.message}`);
        console.error('Fetch projects error:', err);
      } finally {
        setProjectsLoading(false);
      }
    };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      institutionId: user.institutionId,
      roleId: user.roleId,
    });
    setShowEditModal(true);
    setActionError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    
    try {
      await axios.put(`${API_URL}/users/${editingUser._id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update user in the list
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...editFormData } : u));
      setShowEditModal(false);
      setEditingUser(null);
      setEditFormData({});
    } catch (err) {
      setActionError(`Failed to update user: ${err.response?.data?.message || err.message}`);
      console.error('Edit user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
    setActionError('');
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setActionError('');
    
    try {
      await axios.delete(`${API_URL}/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove user from the list
      setUsers(users.filter(u => u._id !== deleteUserId));
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (err) {
      setActionError(`Failed to delete user: ${err.response?.data?.message || err.message}`);
      console.error('Delete user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.institutionId || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.roleId === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.roleId === 'physicalStaff'
                        ? 'bg-blue-100 text-blue-800'
                        : user.roleId === 'financialStaff'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.roleId === 'admin' ? 'ADMINISTRATOR' : user.roleId === 'physicalStaff' ? 'PHYSICAL STAFF' : user.roleId === 'financialStaff' ? 'FINANCIAL STAFF' : 'REGISTRAR'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleViewProjects(user._id, user.username)}
                        className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                        title="View projects created by this user"
                      >
                        Projects
                      </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Projects by {selectedUserName}</h2>
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{actionError}</div>
            )}

            {projectsLoading ? (
              <div className="text-center text-gray-500">Loading projects...</div>
            ) : selectedUserProjects.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No projects created by this user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedUserProjects.map((project) => (
                  <div key={project._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{project.projectName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold">Budget:</span> ${Number(project.budget).toLocaleString() || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold">Department:</span> {project.department || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold">Location:</span> {project.location || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold">Created:</span> {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {project.image && (
                        <img 
                          src={`${API_URL}${project.image}`} 
                          alt={project.projectName}
                          className="w-20 h-20 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowProjectsModal(false);
                  setSelectedUserName('');
                  setSelectedUserProjects([]);
                  setActionError('');
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{actionError}</div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={actionLoading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={actionLoading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Institution</label>
                <input
                  type="text"
                  name="institutionId"
                  value={editFormData.institutionId || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={actionLoading}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select
                  name="roleId"
                  value={editFormData.roleId || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={actionLoading}
                >
                  <option value="admin">Administrator</option>
                  <option value="physicalStaff">Physical Staff</option>
                  <option value="financialStaff">Financial Staff</option>
                  <option value="registrar">Registrar</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setEditFormData({});
                    setActionError('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-500 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete User</h2>
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{actionError}</div>
            )}

            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 rounded"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteUserId(null);
                  setActionError('');
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-500 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
