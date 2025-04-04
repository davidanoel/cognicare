"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserForm from "./UserForm";
import { useRouter } from "next/navigation";

export default function UserList() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      let url = "/api/users?";
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (roleFilter) url += `role=${encodeURIComponent(roleFilter)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Error loading users");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError("Error deleting user");
      console.error("Error:", err);
    }
  };

  const handleUserAdded = () => {
    setShowAddUser(false);
    fetchUsers();
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="counselor">Counselor</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/users/${user._id}`} className="text-blue-600 hover:text-blue-800">
                    {user.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => router.push(`/users/${user._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <UserForm onSuccess={handleUserAdded} onCancel={() => setShowAddUser(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
