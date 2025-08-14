import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  })();
  const tokenUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return null;
      return user?._id || user?.id || null;
    } catch { return null; }
  })();
  const currentUserId = currentUser?._id || currentUser?.id || tokenUserId || null;

  // Redirect if not admin (optional: rely on backend anyway)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError('Admin access required');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setUsers((prev) => [...prev, data]);
      setForm({ username: '', email: '', password: '', role: 'user' });
      setShowAdd(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to delete user');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            aria-label="Go to home"
          >
            Home
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!!error}
          >
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Username</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users
                .filter((u) => (currentUserId ? u._id !== currentUserId : true))
                .map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{u.username}</td>
                  <td className="px-4 py-2 text-sm">{u.email || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {u._id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add User</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;