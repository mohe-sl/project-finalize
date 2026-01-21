import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { SectionCard, QuarterlyTargets, CalculatedField, PercentageInput } from "../../components/PhysicalProgressForm";

// Helper function to format dates for input fields (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

// Generate year options
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 5; i++) {
    years.push(i);
  }
  return years;
};

// Month options
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const UpdateProjectProgress = () => {
  const { progressId } = useParams();
  const navigate = useNavigate();

  // Form state with new structured fields
  const [form, setForm] = useState({
    // Overall Physical Targets
    overallTarget: "",
    progressAsOfPrevDecPercentage: "",

    // Targets for Selected Year
    targetYear: new Date().getFullYear(),
    targetMonth: "",
    currentYearDescriptiveTarget: "",

    // Quarterly Targets
    quarter1TargetPercentage: "",
    quarter2TargetPercentage: "",
    quarter3TargetPercentage: "",
    quarter4TargetPercentage: "",

    // Progress as at Selected Date
    progressDate: "",
    yearEndProgressDescription: "",
    yearEndProgressPercentage: "",
    cumulativeTargetAtYearEnd: "",
    cumulativeProgressDescriptionAtYearEnd: "",
    cumulativeProgressPercentageOfOverallTarget: "",

    // Additional Information
    physicalTargetFailureReasons: "",
    contractors: "",
    consultants: "",

    // Legacy fields for backwards compatibility
    progressName: "",
    mainObjective: "",
    location: "",
    totalCostOriginal: "",
    totalCostCurrent: "",
    awardedAmount: "",
    revisedEndDate: "",
    fundingSource: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projectName, setProjectName] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch the existing progress data when the component loads
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/progress/${progressId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = response.data;

        // Format the dates correctly for input fields
        const formattedData = {
          ...form,
          ...data,
          revisedEndDate: formatDateForInput(data.revisedEndDate),
          progressDate: formatDateForInput(data.progressDate),
          targetYear: data.targetYear || new Date().getFullYear(),
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

  // Auto-calculate cumulative physical target
  const calculateCumulativeTarget = useCallback(() => {
    const prevDec = parseFloat(form.progressAsOfPrevDecPercentage) || 0;
    const progressPercent = parseFloat(form.yearEndProgressPercentage) || 0;

    // Formula: Previous Dec % + (Progress % * remaining %)
    const remaining = 100 - prevDec;
    const cumulative = prevDec + (progressPercent * remaining / 100);

    return Math.min(100, Math.max(0, cumulative)).toFixed(2);
  }, [form.progressAsOfPrevDecPercentage, form.yearEndProgressPercentage]);

  // Update calculated field when dependencies change
  useEffect(() => {
    const calculatedValue = calculateCumulativeTarget();
    setForm(prev => ({
      ...prev,
      cumulativeProgressPercentageOfOverallTarget: calculatedValue
    }));
  }, [calculateCumulativeTarget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleQuarterlyChange = (values) => {
    setForm(prev => ({
      ...prev,
      quarter1TargetPercentage: values.q1,
      quarter2TargetPercentage: values.q2,
      quarter3TargetPercentage: values.q3,
      quarter4TargetPercentage: values.q4,
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validate quarterly targets
    const q1 = parseFloat(form.quarter1TargetPercentage) || 0;
    const q2 = parseFloat(form.quarter2TargetPercentage) || 0;
    const q3 = parseFloat(form.quarter3TargetPercentage) || 0;
    const q4 = parseFloat(form.quarter4TargetPercentage) || 0;

    if (q2 < q1) errors.q2 = "Q2 must be ≥ Q1";
    if (q3 < q2) errors.q3 = "Q3 must be ≥ Q2";
    if (q4 < q3) errors.q4 = "Q4 must be ≥ Q3";
    if (q4 !== 0 && q4 !== 100) errors.q4 = "Q4 must equal 100%";

    // Validate percentage fields
    const percentageFields = ['progressAsOfPrevDecPercentage', 'yearEndProgressPercentage'];
    percentageFields.forEach(field => {
      const val = parseFloat(form[field]);
      if (val !== undefined && val !== '' && (val < 0 || val > 100)) {
        errors[field] = "Must be between 0 and 100";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix validation errors before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/progress/${progressId}`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSuccess("✅ Progress updated successfully! Redirecting...");

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

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All unsaved changes will be lost.")) {
      window.location.reload();
    }
  };

  const handleGenerateReport = () => {
    navigate(`/progress-details/${progressId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 my-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Physical Progress Update
        </h1>
        {projectName && (
          <p className="text-blue-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
            </svg>
            Project: {projectName}
          </p>
        )}
      </div>

      {/* Status Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3"
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3"
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Overall Physical Targets */}
        <SectionCard
          title="Overall Physical Targets"
          headerColor="bg-blue-700"
          icon="📊"
          helperText="Define the overall expected outputs and previous year's cumulative progress"
        >
          <div className="form-grid">
            <div className="full-width">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Physical Target (Expected Outputs)
              </label>
              <textarea
                name="overallTarget"
                value={form.overallTarget || ""}
                onChange={handleChange}
                placeholder="Describe the overall physical targets and expected outputs..."
                rows={4}
                className="form-textarea w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>

            <PercentageInput
              label="Cumulative Physical Progress as at December (Previous Year)"
              name="progressAsOfPrevDecPercentage"
              value={form.progressAsOfPrevDecPercentage || ""}
              onChange={handleChange}
              placeholder="0"
              error={validationErrors.progressAsOfPrevDecPercentage}
            />
          </div>
        </SectionCard>

        {/* Section 2: Targets for Selected Year */}
        <SectionCard
          title="Targets for Selected Year"
          headerColor="bg-emerald-700"
          icon="📅"
        >
          <div className="form-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Year
              </label>
              <select
                name="targetYear"
                value={form.targetYear || new Date().getFullYear()}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              >
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Month
              </label>
              <select
                name="targetMonth"
                value={form.targetMonth || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              >
                <option value="">Select Month</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriptive Target for Selected Period
              </label>
              <textarea
                name="currentYearDescriptiveTarget"
                value={form.currentYearDescriptiveTarget || ""}
                onChange={handleChange}
                placeholder="Describe the targets for the selected year and period..."
                rows={3}
                className="form-textarea w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 3: Cumulative Quarterly Targets */}
        <SectionCard
          title="Cumulative Quarterly Targets (%)"
          headerColor="bg-purple-700"
          icon="📈"
          helperText="Enter cumulative percentage targets. Values must be progressive (Q2 ≥ Q1, Q3 ≥ Q2, Q4 ≥ Q3). Q4 should equal 100%."
        >
          <QuarterlyTargets
            values={{
              q1: form.quarter1TargetPercentage,
              q2: form.quarter2TargetPercentage,
              q3: form.quarter3TargetPercentage,
              q4: form.quarter4TargetPercentage,
            }}
            onChange={handleQuarterlyChange}
            errors={validationErrors}
          />
        </SectionCard>

        {/* Section 4: Progress as at Selected Date */}
        <SectionCard
          title="Progress as at Selected Date"
          headerColor="bg-indigo-700"
          icon="📋"
          helperText="Percentages are calculated based on overall physical targets"
        >
          <div className="form-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Date
              </label>
              <input
                type="date"
                name="progressDate"
                value={form.progressDate || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>

            <PercentageInput
              label="Progress as % of Target"
              name="yearEndProgressPercentage"
              value={form.yearEndProgressPercentage || ""}
              onChange={handleChange}
              placeholder="0"
              error={validationErrors.yearEndProgressPercentage}
            />

            <div className="full-width">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Description up to Selected Date
              </label>
              <textarea
                name="yearEndProgressDescription"
                value={form.yearEndProgressDescription || ""}
                onChange={handleChange}
                placeholder="Describe the progress achieved up to the selected date..."
                rows={3}
                className="form-textarea w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>

            <CalculatedField
              label="Cumulative Physical Target as at Selected Date"
              value={form.cumulativeProgressPercentageOfOverallTarget}
              suffix="%"
              formula="Previous Dec % + (Progress % × Remaining %)"
            />

            <div className="full-width">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cumulative Progress Description at Year End
              </label>
              <textarea
                name="cumulativeProgressDescriptionAtYearEnd"
                value={form.cumulativeProgressDescriptionAtYearEnd || ""}
                onChange={handleChange}
                placeholder="Describe the cumulative progress at year end..."
                rows={3}
                className="form-textarea w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 5: Additional Information */}
        <SectionCard
          title="Additional Information"
          headerColor="bg-gray-700"
          icon="📝"
        >
          <div className="form-grid">
            <div className="full-width">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reasons for Not Achieving Physical / Financial Targets
              </label>
              <textarea
                name="physicalTargetFailureReasons"
                value={form.physicalTargetFailureReasons || ""}
                onChange={handleChange}
                placeholder="If targets were not achieved, explain the reasons..."
                rows={3}
                className="form-textarea w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contractor Name
              </label>
              <input
                type="text"
                name="contractors"
                value={form.contractors || ""}
                onChange={handleChange}
                placeholder="Enter contractor name(s)..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant Name
              </label>
              <input
                type="text"
                name="consultants"
                value={form.consultants || ""}
                onChange={handleChange}
                placeholder="Enter consultant name(s)..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
              />
            </div>
          </div>
        </SectionCard>

        {/* Action Buttons */}
        <div className="action-buttons bg-white rounded-xl shadow-lg p-6">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Form
          </button>

          <button
            type="button"
            onClick={handleGenerateReport}
            className="btn btn-success"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report / PDF
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Progress
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProjectProgress;