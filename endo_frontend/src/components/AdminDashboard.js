import React, { useEffect, useState } from "react";
import API from "../api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_uploads: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchUploads();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await API.get("/admin/uploads");
      setUploads(res.data);
    } catch (err) {
      console.error("Failed to fetch uploads", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const promoteUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/promote`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to promote user", err);
    }
  };

  const deleteUpload = async (id) => {
    if (!window.confirm("Are you sure you want to delete this upload?")) return;
    try {
      await API.delete(`/admin/uploads/${id}`);
      fetchUploads();
    } catch (err) {
      console.error("Failed to delete upload", err);
    }
  };

  const filteredUploads = uploads.filter((u) =>
    u.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Admin Dashboard</h2>

      {/* Stats */}
      <div className="flex space-x-4 mb-6">
        <div className="bg-white shadow rounded px-4 py-3">
          <p className="font-semibold">Total Users</p>
          <p>{stats.total_users}</p>
        </div>
        <div className="bg-white shadow rounded px-4 py-3">
          <p className="font-semibold">Total Uploads</p>
          <p>{stats.total_uploads}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="p-2 text-left border">Email</th>
                <th className="p-2 text-left border">Is Admin</th>
                <th className="p-2 text-left border">Created</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.is_admin ? "Yes" : "No"}</td>
                  <td className="p-2 border">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="p-2 border space-x-2">
                    {!u.is_admin && (
                      <button onClick={() => promoteUser(u._id)} className="text-blue-600 hover:underline">
                        Promote
                      </button>
                    )}
                    <button onClick={() => deleteUser(u._id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uploads Table */}
      <div>
        <h3 className="text-xl font-semibold mb-2">All Uploads</h3>
        <input
          type="text"
          placeholder="Search by name/email..."
          className="mb-4 p-2 border w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="p-2 text-left border">Patient Name</th>
                <th className="p-2 text-left border">Uploader</th>
                <th className="p-2 text-left border">Datetime</th>
                <th className="p-2 text-left border">URL</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUploads.map((u) => (
                <tr key={u._id}>
                  <td className="p-2 border">{u.patient_name}</td>
                  <td className="p-2 border">{u.user_email || ""}</td>
                  <td className="p-2 border">{new Date(u.datetime).toLocaleString()}</td>
                  <td className="p-2 border">
                    {u.processed_s3_url ? (
                      <a
                        href={u.processed_s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 border">
                    <button onClick={() => deleteUpload(u._id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
