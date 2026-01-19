import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

// Helper function to format dates for input fields (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const UpdateProjectProgress = () => {
  const { progressId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true); // Start true to show loading while fetching
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projectName, setProjectName] = useState(""); // For display in the header

  // Fetch the existing progress data when the component loads
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/progress/${progressId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = response.data;

        // Format the date correctly for the input field before setting state
        const formattedData = {
          ...data,
          revisedEndDate: formatDateForInput(data.revisedEndDate),
        };

        setForm(formattedData);
        if (data.projectId && data.projectId.projectName) {
          setProjectName(data.projectId.projectName);
        }

      } catch (err) {
        console.error("❌ Error fetching progress data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [progressId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/progress/${progressId}`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSuccess("✅ Progress updated successfully! Redirecting...");

      // Redirect back to the details page after a short delay
      setTimeout(() => {
        navigate(`/progress-details/${progressId}`);
      }, 2000);

    } catch (err) {
      console.error("❌ Error updating progress:", err);
      setError(err.response?.data?.error || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable input field
  const renderInput = ({ label, name, type = "text" }) => (
    <div key={name} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  // Define the form structure (same as your original form)
  const sections = [
    {
      title: "Basic Info",
      fields: [
        { label: "Progress Name", name: "progressName" },
        { label: "Main Objective", name: "mainObjective" },
        { label: "Location", name: "location" },
        { label: "Total Cost (Original)", name: "totalCostOriginal", type: "number" },
        { label: "Total Cost (Current)", name: "totalCostCurrent", type: "number" },
        { label: "Awarded Amount", name: "awardedAmount", type: "number" },
        { label: "Revised End Date", name: "revisedEndDate", type: "date" },
        { label: "Funding Source", name: "fundingSource" },
      ],
    },
    {
      title: "Physical Progress",
      fields: [
        { label: "Overall Target", name: "overallTarget" },
        { label: "Progress as of Previous Dec (%)", name: "progressAsOfPrevDecPercentage", type: "number" },
        { label: "Current Year Descriptive Target", name: "currentYearDescriptiveTarget" },
        { label: "Quarter 1 Target (%)", name: "quarter1TargetPercentage", type: "number" },
        { label: "Quarter 2 Target (%)", name: "quarter2TargetPercentage", type: "number" },
        { label: "Quarter 3 Target (%)", name: "quarter3TargetPercentage", type: "number" },
        { label: "Quarter 4 Target (%)", name: "quarter4TargetPercentage", type: "number" },
        { label: "Year End Progress Description", name: "yearEndProgressDescription" },
        { label: "Year End Progress (%)", name: "yearEndProgressPercentage", type: "number" },
        { label: "Cumulative Target at Year End", name: "cumulativeTargetAtYearEnd" },
        { label: "Cumulative Progress Description at Year End", name: "cumulativeProgressDescriptionAtYearEnd" },
        { label: "Cumulative Progress (% of Overall Target)", name: "cumulativeProgressPercentageOfOverallTarget", type: "number" },
        { label: "Reasons for Not Achieving Physical Targets", name: "physicalTargetFailureReasons" },
        { label: "Contractors", name: "contractors" },
        { label: "Consultants", name: "consultants" },
      ],
    },
    {
      title: "Financial Progress",
      fields: [
        { label: "Allocation for Current Year", name: "allocationCurrentYear", type: "number" },
        { label: "Expenditure Target", name: "expenditureTarget", type: "number" },
        { label: "Imprest Requested", name: "imprestRequested", type: "number" },
        { label: "Imprest Received", name: "imprestReceived", type: "number" },
        { label: "Actual Expenditure", name: "actualExpenditure", type: "number" },
        { label: "Bills in Hand", name: "billsInHand", type: "number" },
        { label: "Price Escalation", name: "priceEscalation", type: "number" },
        { label: "Cumulative Expenditure at Year End", name: "cumulativeExpenditureAtYearEnd", type: "number" },
        { label: "Reasons for Not Achieving Financial Targets", name: "financialTargetFailureReasons" },
      ],
    },
  ];

  if (loading) {
    return <div className="text-center p-10">Loading form...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-2xl my-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Update Progress</h1>
      {projectName && <p className="text-lg text-gray-600 mb-6">For Project: {projectName}</p>}

      {success && <motion.div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">{success}</motion.div>}
      {error && <motion.div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">❌ {error}</motion.div>}

      <form onSubmit={handleSubmit}>
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {section.fields.map(field => renderInput(field))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(`/progress-details/${progressId}`)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Progress"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProjectProgress;