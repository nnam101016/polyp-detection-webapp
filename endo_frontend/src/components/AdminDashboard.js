import React, { useEffect, useState } from "react";
import API from "../api";

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_uploads: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("default");

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
      fetchUploads();
      fetchStats();
      fetchModels();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load users.");
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await API.get("/admin/uploads");
      setUploads(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load uploads.");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await API.get("/models");
      setModels(res.data.models);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const handlePromoteUser = async (id) => {
    if (!window.confirm("Promote this user to admin?")) return;
    try {
      await API.put(`/admin/users/${id}/promote`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to promote user.");
    }
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm("Delete this upload?")) return;
    try {
      await API.delete(`/admin/uploads/${id}`);
      fetchUploads();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete upload.");
    }
  };

  const filteredUploads = uploads.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.patient_name.toLowerCase().includes(q) ||
      u.user_email.toLowerCase().includes(q) ||
      u.patient_id?.toLowerCase().includes(q)
    );
  });

  if (!user?.is_admin) {
    return <p className="text-center mt-10 text-red-500">Access denied. Admins only.</p>;
  }

  return (
    <div className="p-6 w-full max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h2>

      <div className="flex justify-center gap-6 mb-8 text-center">
        <div className="bg-white rounded shadow p-4 w-40">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-xl font-bold text-blue-600">{stats.total_users}</p>
        </div>
        <div className="bg-white rounded shadow p-4 w-40">
          <p className="text-sm text-gray-600">Total Uploads</p>
          <p className="text-xl font-bold text-green-600">{stats.total_uploads}</p>
        </div>
      </div>

      {/* User list */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-2">Registered Users</h3>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Admin</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.name || "-"}</td>
                  <td className="p-2 border">{u.is_admin ? "Yes" : "No"}</td>
                  <td className="p-2 border space-x-2">
                    {!u.is_admin && (
                      <>
                        <button
                          onClick={() => handlePromoteUser(u._id)}
                          className="text-blue-600 hover:underline"
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upload list */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">All Uploads</h3>
          <input
            type="text"
            placeholder="Search by name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Patient Name</th>
                <th className="p-2 border">Uploader</th>
                <th className="p-2 border">Datetime</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUploads.map((u) => (
                <tr key={u._id}>
                  <td className="p-2 border">{u.patient_name}</td>
                  <td className="p-2 border">{u.user_email}</td>
                  <td className="p-2 border">{new Date(u.datetime).toLocaleString()}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDeleteUpload(u._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
