"use client";

import { useState, useEffect } from "react";

export default function ClientForm({ client, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    contactInfo: {
      email: "",
      phone: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    },
    initialAssessment: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (client) {
      // Populate form with client data for editing
      setFormData({
        name: client.name || "",
        age: client.age || "",
        gender: client.gender || "male",
        contactInfo: {
          email: client.contactInfo?.email || "",
          phone: client.contactInfo?.phone || "",
          emergencyContact: {
            name: client.contactInfo?.emergencyContact?.name || "",
            relationship: client.contactInfo?.emergencyContact?.relationship || "",
            phone: client.contactInfo?.emergencyContact?.phone || "",
          },
        },
        initialAssessment: client.initialAssessment || "",
        status: client.status || "active",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (e.g., contactInfo.email)
      const parts = name.split(".");

      if (parts.length === 2) {
        // Handle contactInfo.email, contactInfo.phone
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      } else if (parts.length === 3) {
        // Handle contactInfo.emergencyContact.name
        const [parent, middle, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...(prev[parent]?.[middle] || { name: "", relationship: "", phone: "" }),
              [child]: value,
            },
          },
        }));
      }
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.age) errors.age = "Age is required";
    else if (isNaN(formData.age) || formData.age <= 0) errors.age = "Age must be a positive number";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.initialAssessment.trim())
      errors.initialAssessment = "Initial assessment is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const url = client ? `/api/clients/${client._id}` : "/api/clients";
      const method = client ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save client");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving client:", err);
      setError(err.message || "An error occurred while saving the client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              validationErrors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.age ? "border-red-500" : "border-gray-300"
              }`}
            />
            {validationErrors.age && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {validationErrors.gender && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Emergency Contact */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                name="contactInfo.emergencyContact.name"
                value={formData.contactInfo.emergencyContact.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Relationship</label>
              <input
                type="text"
                name="contactInfo.emergencyContact.relationship"
                value={formData.contactInfo.emergencyContact.relationship}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                name="contactInfo.emergencyContact.phone"
                value={formData.contactInfo.emergencyContact.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Initial Assessment */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Assessment <span className="text-red-500">*</span>
          </label>
          <textarea
            name="initialAssessment"
            value={formData.initialAssessment}
            onChange={handleChange}
            rows={6}
            className={`w-full p-2 border rounded ${
              validationErrors.initialAssessment ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe the client's presenting issues, mental status, and initial observations..."
          ></textarea>
          {validationErrors.initialAssessment && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.initialAssessment}</p>
          )}
        </div>

        {/* Status - Only shown when editing */}
        {client && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : client ? "Update Client" : "Add Client"}
        </button>
      </div>
    </form>
  );
}
