// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import API from "../api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_uploads: 0 });
  const [search, setSearch] = useState("");

  // --- Create User (existing behavior) ---
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateMsg("");
    try {
      await API.post("/admin/users", {
        email: newEmail,
        password: newPassword,
        name: newName,
        is_admin: newIsAdmin,
      });
      setCreateMsg("✅ User created");
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewIsAdmin(false);
      fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to create user";
      setCreateMsg(`❌ ${msg}`);
    }
  };

  const filteredUploads = uploads.filter((u) =>
    (u.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.user_email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl px-4 py-3">
          <p className="font-semibold text-gray-700">Total Users</p>
          <p className="text-2xl font-bold">{stats.total_users}</p>
        </div>
        <div className="bg-white shadow rounded-xl px-4 py-3">
          <p className="font-semibold text-gray-700">Total Uploads</p>
          <p className="text-2xl font-bold">{stats.total_uploads}</p>
        </div>
      </div>

      {/* Create User */}
      <div className="mb-8 bg-white shadow rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3 text-blue-600">Create New User</h3>
        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          onSubmit={handleCreateUser}
        >
          <input
            type="text"
            className="border p-2 rounded-lg"
            placeholder="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            className="border p-2 rounded-lg"
            placeholder="Email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            type="password"
            className="border p-2 rounded-lg"
            placeholder="Password (min 6)"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newIsAdmin}
              onChange={(e) => setNewIsAdmin(e.target.checked)}
            />
            <span>Is Admin</span>
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
        </form>
        {createMsg && <p className="mt-2 text-sm">{createMsg}</p>}
      </div>

      {/* Users Table */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-xl">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-2 text-left border">Email</th>
                <th className="p-2 text-left border">Is Admin</th>
                <th className="p-2 text-left border">Created</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.is_admin ? "Yes" : "No"}</td>
                  <td className="p-2 border">
                    {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border space-x-3">
                    {!u.is_admin && (
                      <button
                        onClick={() => promoteUser(u._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Promote
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="p-3 text-center border" colSpan={4}>No users</td>
                </tr>
              )}
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
          className="mb-4 p-2 border rounded-lg w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-xl">
            <thead className="sticky top-0 bg-gray-50">
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
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{u.patient_name}</td>
                  <td className="p-2 border">{u.user_email || ""}</td>
                  <td className="p-2 border">
                    {u.datetime ? new Date(u.datetime).toLocaleString() : "-"}
                  </td>
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
                    <button
                      onClick={() => deleteUpload(u._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUploads.length === 0 && (
                <tr>
                  <td className="p-3 text-center border" colSpan={5}>No uploads</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
