import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [form, setForm] = useState({ username: '', email: '', institutionId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // fetch profile
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setForm({ username: data.username || '', email: data.email || '', institutionId: data.institutionId || '', password: '' });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: form.username, email: form.email, institutionId: form.institutionId, password: form.password || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      // update localStorage userData
      localStorage.setItem('userData', JSON.stringify({ id: data._id, username: data.username, email: data.email, institutionId: data.institutionId, roleId: data.roleId }));
      if (data.token) localStorage.setItem('token', data.token);
      setMsg('Profile updated successfully');
      setForm({ ...form, password: '' });
    } catch (err) {
      setMsg(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {msg && <div className="mb-4 text-sm text-green-600">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input name="username" value={form.username} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Institution ID</label>
          <input name="institutionId" value={form.institutionId} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password (leave blank to keep current)</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="flex space-x-2">
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
