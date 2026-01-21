import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTranslation } from "../../i18n";
import { PhysicalProgressSection, FinancialProgressSection } from "../../components/PhysicalProgressForm";

const ProjectProgressForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const defaultForm = {
    projectId: "",
    progressName: "",
    mainObjective: "",
    location: "",
    totalCostOriginal: "",
    totalCostCurrent: "",
    awardedAmount: "",
    revisedEndDate: "",
    fundingSource: "",
    overallTarget: "",
    progressAsOfPrevDecPercentage: "",
    currentYearDescriptiveTarget: "",
    quarter1TargetPercentage: "",
    quarter2TargetPercentage: "",
    quarter3TargetPercentage: "",
    quarter4TargetPercentage: "",
    yearEndProgressDescription: "",
    yearEndProgressPercentage: "",
    cumulativeTargetAtYearEnd: "",
    cumulativeProgressDescriptionAtYearEnd: "",
    cumulativeProgressPercentageOfOverallTarget: "",
    physicalProgressImage1: null,
    physicalProgressImage2: null,
    physicalProgressImage3: null,
    physicalTargetFailureReasons: "",
    contractors: "",
    consultants: "",
    allocationCurrentYear: "",
    expenditureTarget: "",
    imprestRequested: "",
    imprestReceived: "",
    actualExpenditure: "",
    billsInHand: "",
    priceEscalation: "",
    cumulativeExpenditureAtYearEnd: "",
    financialTargetFailureReasons: "",
  };

  // State for image previews
  const [imagePreviews, setImagePreviews] = useState({
    physicalProgressImage1: null,
    physicalProgressImage2: null,
    physicalProgressImage3: null,
  });

  const [form, setForm] = useState(defaultForm);
  const [step, setStep] = useState(0);
  const [isEditing, setIsEditing] = useState(true); // Control edit mode for Physical Staff
  const [isFinancialEditing, setIsFinancialEditing] = useState(true); // Control edit mode for Financial Staff
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  // New state for Drafts (Financial Staff)
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [userInstitution, setUserInstitution] = useState("");
  const [userRole, setUserRole] = useState("");
  const [savedProgressId, setSavedProgressId] = useState(null);
  const { t } = useTranslation();

  // Get user's institution and role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "");

    let mounted = true;
    const setFromLocal = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          if (mounted) setUserInstitution(user.institutionId || "");
        }
      } catch (err) {
        console.error("Error getting user institution from localStorage:", err);
      }
    };

    // first set from localStorage (fast), then fetch fresh profile from API
    setFromLocal();

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data && data.institutionId) {
          setUserInstitution(data.institutionId);
          // update localStorage userData so other components stay in sync
          try {
            const stored = localStorage.getItem('userData');
            const parsed = stored ? JSON.parse(stored) : {};
            parsed.institutionId = data.institutionId;
            localStorage.setItem('userData', JSON.stringify(parsed));
          } catch (e) {
            // ignore localStorage errors
          }
        }
      } catch (err) {
        console.error('Error fetching user profile for institution:', err);
      }
    };

    fetchProfile();

    return () => { mounted = false; };
  }, []);

  // Fetch available projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/projects", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setProjects(response.data);
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects by user's institution
  useEffect(() => {
    if (userInstitution && projects.length > 0) {
      const filtered = projects.filter(
        (project) => project.institution === userInstitution
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [userInstitution, projects]);

  // Update form when projectId changes
  useEffect(() => {
    if (projectId) {
      setForm(prev => ({ ...prev, projectId: projectId }));
    }
  }, [projectId]);
  // Fetch Drafts for Financial Staff
  useEffect(() => {
    if (userRole === 'financialStaff' && userInstitution) {
      const fetchDrafts = async () => {
        setLoadingDrafts(true);
        try {
          const token = localStorage.getItem("token");
          // Fetch status=draft. We might need to filter by institution client-side 
          // if the backend doesn't support complex filtering, 
          // OR we rely on the returned drafts having projectId populated.
          const res = await axios.get("http://localhost:5000/api/progress?status=draft", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          // Filter drafts that belong to the user's institution
          // We need projectId to be populated for this check
          const myDrafts = res.data.filter(d =>
            d.projectId && d.projectId.institution === userInstitution
          );
          setDrafts(myDrafts);
        } catch (err) {
          console.error("❌ Error fetching drafts:", err);
        } finally {
          setLoadingDrafts(false);
        }
      };
      fetchDrafts();
    }
  }, [userRole, userInstitution]);

  const handleDraftSelect = (e) => {
    const draftId = e.target.value;
    if (!draftId) return;

    console.log("🔍 Checking draftId:", draftId);
    console.log("📂 Available Drafts:", drafts);
    console.log("📂 Submitted Progress:", submittedProgress);

    const selectedDraft = drafts.find(d => d._id === draftId) || submittedProgress.find(d => d._id === draftId);

    console.log("✅ Selected Draft Found:", selectedDraft);

    if (selectedDraft) {
      console.log("📝 Populating form with:", selectedDraft);
      try {
        const newForm = { ...defaultForm, ...selectedDraft };

        // Handle nested ObjectId for projectId if populated
        if (selectedDraft.projectId && typeof selectedDraft.projectId === 'object') {
          console.log("🆔 Handling object-type projectId:", selectedDraft.projectId);
          newForm.projectId = selectedDraft.projectId._id;
        } else {
          console.log("🆔 ProjectId is primitive or missing:", selectedDraft.projectId);
        }

        // Ensure dates are formatted for input[type="date"] if needed (YYYY-MM-DD)
        if (newForm.revisedEndDate) {
          try {
            newForm.revisedEndDate = new Date(newForm.revisedEndDate).toISOString().split('T')[0];
          } catch (dateErr) {
            console.error("⚠️ Error parsing revisedEndDate:", newForm.revisedEndDate, dateErr);
            newForm.revisedEndDate = ""; // Fallback
          }
        }

        setForm(newForm);
        setSavedProgressId(selectedDraft._id);

        // Also set preview images if they exist
        const previews = { ...imagePreviews };
        ['physicalProgressImage1', 'physicalProgressImage2', 'physicalProgressImage3'].forEach(imgField => {
          if (selectedDraft[imgField]) {
            previews[imgField] = `http://localhost:5000/api/uploads/${selectedDraft[imgField]}`;
          }
        });
        setImagePreviews(previews);
        console.log("✅ Form updated successfully");
      } catch (err) {
        console.error("❌ Error in handleDraftSelect:", err);
      }
    } else {
      console.warn("⚠️ No draft found for ID:", draftId);
    }
  };

  // Admin view: fetch submitted progress entries
  // Fetch progress entries for registrar or admin with filter
  const [submittedProgress, setSubmittedProgress] = useState([]);
  const [filterStatus, setFilterStatus] = useState('draft');
  useEffect(() => {
    if (userRole === 'registrar' || userRole === 'admin') {
      const fetchProgress = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/progress?status=${filterStatus}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          let data = res.data;

          // If registrar, filter by institution
          if (userRole === 'registrar' && userInstitution) {
            data = data.filter(item =>
              item.projectId && item.projectId.institution === userInstitution
            );
          }

          setSubmittedProgress(data);
        } catch (err) {
          console.error('❌ Error fetching progress for filter:', err);
        }
      };
      fetchProgress();
    }
  }, [userRole, filterStatus]);

  const steps = [t('basicInfo'), t('physicalProgress'), t('financialProgress')];

  // Helper to determine if a field is editable by current role
  const isFieldEditable = (role, fieldName) => {
    if (role === 'physicalStaff') {
      if (!isEditing) return false; // Freeze fields if not in edit mode
      const basicFields = ['projectId', 'progressName', 'mainObjective', 'location', 'totalCostOriginal', 'totalCostCurrent', 'awardedAmount', 'revisedEndDate', 'fundingSource'];
      const physicalFields = ['overallTarget', 'progressAsOfPrevDecPercentage', 'currentYearDescriptiveTarget', 'quarter1TargetPercentage', 'quarter2TargetPercentage', 'quarter3TargetPercentage', 'quarter4TargetPercentage', 'yearEndProgressDescription', 'yearEndProgressPercentage', 'cumulativeTargetAtYearEnd', 'cumulativeProgressDescriptionAtYearEnd', 'cumulativeProgressPercentageOfOverallTarget', 'physicalProgressImage1', 'physicalProgressImage2', 'physicalProgressImage3', 'physicalTargetFailureReasons', 'contractors', 'consultants'];
      return basicFields.includes(fieldName) || physicalFields.includes(fieldName);
    } else if (role === 'financialStaff') {
      if (!isFinancialEditing) return false;
      const financialFields = ['allocationCurrentYear', 'expenditureTarget', 'imprestRequested', 'imprestReceived', 'actualExpenditure', 'billsInHand', 'priceEscalation', 'cumulativeExpenditureAtYearEnd', 'financialTargetFailureReasons'];
      return financialFields.includes(fieldName);
    } else if (role === 'registrar') {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (userRole !== 'physicalStaff') return;
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      // Create preview URL for the image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreviews(prev => ({ ...prev, [name]: previewUrl }));
      }
    } else {
      const canEdit = isFieldEditable(userRole, name);
      if (!canEdit) return;
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const prepareDataForSubmission = (formData) => {
    const preparedData = { ...formData };

    // Convert string numbers to actual numbers for numeric fields
    const numericFields = [
      'totalCostOriginal', 'totalCostCurrent', 'awardedAmount',
      'progressAsOfPrevDecPercentage', 'quarter1TargetPercentage',
      'quarter2TargetPercentage', 'quarter3TargetPercentage',
      'quarter4TargetPercentage', 'yearEndProgressPercentage',
      'cumulativeProgressPercentageOfOverallTarget', 'allocationCurrentYear',
      'expenditureTarget', 'imprestRequested', 'imprestReceived',
      'actualExpenditure', 'billsInHand', 'priceEscalation',
      'cumulativeExpenditureAtYearEnd'
    ];

    numericFields.forEach(field => {
      if (preparedData[field] !== "" && preparedData[field] !== null && preparedData[field] !== undefined) {
        preparedData[field] = parseFloat(preparedData[field]) || 0;
      } else {
        delete preparedData[field];
      }
    });

    if (preparedData.revisedEndDate) {
      const d = new Date(preparedData.revisedEndDate);
      if (!isNaN(d.getTime())) {
        preparedData.revisedEndDate = d.toISOString();
      } else {
        delete preparedData.revisedEndDate;
      }
    } else {
      delete preparedData.revisedEndDate;
    }

    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === "" || preparedData[key] === null || preparedData[key] === undefined) {
        delete preparedData[key];
      }
    });

    return preparedData;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!form.projectId) {
      setError(t('selectAProject')); // Or a hardcoded string if translation key is missing
      setLoading(false);
      return;
    }

    try {
      const preparedData = prepareDataForSubmission(form);
      const formData = new FormData();

      Object.keys(preparedData).forEach(key => {
        if (key !== 'physicalProgressImage1' && key !== 'physicalProgressImage2' && key !== 'physicalProgressImage3') {
          formData.append(key, preparedData[key]);
        }
      });


      if (form.physicalProgressImage1 instanceof File) {
        formData.append('physicalProgressImage1', form.physicalProgressImage1);
      }
      if (form.physicalProgressImage2 instanceof File) {
        formData.append('physicalProgressImage2', form.physicalProgressImage2);
      }
      if (form.physicalProgressImage3 instanceof File) {
        formData.append('physicalProgressImage3', form.physicalProgressImage3);
      }

      // Add draft status
      formData.set('status', 'draft');

      const token = localStorage.getItem('token');
      let response;

      if (savedProgressId) {
        // Update existing draft
        response = await axios.patch(
          `http://localhost:5000/api/progress/${savedProgressId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` })
            },
          }
        );
      } else {
        // Create new draft
        response = await axios.post(
          "http://localhost:5000/api/progress",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` })
            },
          }
        );
        setSavedProgressId(response.data._id);
      }

      setSuccessMsg(`✅ Progress saved successfully!`);
      console.log("✅ Progress saved:", response.data);

      // Freeze the form for physical staff after save
      if (userRole === 'physicalStaff') {
        setIsEditing(false);
      } else if (userRole === 'financialStaff') {
        setIsFinancialEditing(false);
      }
    } catch (error) {
      console.error("❌ Error saving progress:", error);
      const serverMsg = error.response?.data?.error || (error.response?.data ? JSON.stringify(error.response.data) : null);
      if (serverMsg) {
        setError(`Failed to save: ${serverMsg}`);
      } else {
        setError(`Failed to save progress: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const preparedData = prepareDataForSubmission(form);

      // Create FormData for file uploads
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(preparedData).forEach(key => {
        if (key !== 'physicalProgressImage1' && key !== 'physicalProgressImage2' && key !== 'physicalProgressImage3') {
          formData.append(key, preparedData[key]);
        }
      });

      // Add image files if they exist
      // Add image files if they exist and are actual File objects
      if (form.physicalProgressImage1 instanceof File) {
        formData.append('physicalProgressImage1', form.physicalProgressImage1);
      }
      if (form.physicalProgressImage2 instanceof File) {
        formData.append('physicalProgressImage2', form.physicalProgressImage2);
      }
      if (form.physicalProgressImage3 instanceof File) {
        formData.append('physicalProgressImage3', form.physicalProgressImage3);
      }

      // Mark as submitted, not draft
      formData.set('status', 'submitted');

      const token = localStorage.getItem('token');
      let response;

      if (savedProgressId) {
        // Update existing progress but mark as submitted
        response = await axios.patch(
          `http://localhost:5000/api/progress/${savedProgressId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` })
            },
          }
        );
      } else {
        // Create new progress as submitted
        response = await axios.post(
          "http://localhost:5000/api/progress",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` })
            },
          }
        );
      }

      console.log("✅ Progress submitted successfully:", response.data);

      // Clean up all preview URLs
      Object.values(imagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setImagePreviews({
        physicalProgressImage1: null,
        physicalProgressImage2: null,
        physicalProgressImage3: null
      });

      if (userRole === 'financialStaff') {
        setIsFinancialEditing(false);
      }

      setSuccess(true);

      // Navigate to progress details page immediately
      navigate(`/progress-details/${response.data._id}`);

    } catch (error) {
      console.error("❌ Error submitting progress:", error);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Status:", error.response?.status);

      const serverMsg = error.response?.data?.error || (error.response?.data ? JSON.stringify(error.response.data) : null);
      if (serverMsg) {
        setError(`${t('failedToSubmit')} ${serverMsg}`);
      } else if (error.message && error.message.includes("Network Error")) {
        setError(t('networkError'));
      } else {
        setError(`${t('failedSubmitProgress')} ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function for image preview URLs
  // Cleanup function for preview URLs
  const cleanupPreviewUrl = (name) => {
    if (imagePreviews[name]) {
      URL.revokeObjectURL(imagePreviews[name]);
    }
  };

  // Cleanup all preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  // Reusable input field
  const renderInput = ({ label, name, type = "text", readOnly = false }) => {
    // Special handling for file inputs
    if (type === "file") {
      if (readOnly || !isFieldEditable(userRole, name)) {
        // Show only the image preview if it exists, otherwise a placeholder
        return (
          <div key={name} className="mb-4 w-full">
            <label className="block text-gray-700 font-medium mb-2">
              {label}
            </label>
            {imagePreviews[name] ? (
              <img
                src={imagePreviews[name]}
                alt={`Preview for ${label}`}
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 italic">
                No image uploaded
              </div>
            )}
          </div>
        );
      }
      return (
        <div key={name} className="mb-4 w-full">
          <label className="block text-gray-700 font-medium mb-2">
            {label}
          </label>
          <div className="space-y-2">
            <input
              type="file"
              name={name}
              onChange={handleChange}
              accept="image/*"
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 hover:shadow-md ${error && error.includes(label)
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
                }`}
            />
            {/* Image Preview */}
            {imagePreviews[name] && (
              <div className="relative group">
                <img
                  src={imagePreviews[name]}
                  alt={`Preview for ${label}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    cleanupPreviewUrl(name);
                    setImagePreviews(prev => ({ ...prev, [name]: null }));
                    setForm(prev => ({ ...prev, [name]: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Regular input fields
    return (
      <div key={name} className="mb-4 w-full">
        <label className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
        {readOnly ? (
          <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
            {form[name] || '—'}
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={`${t('enter')} ${label}`}
            min={type === "number" ? "0" : undefined}
            step={type === "number" ? "0.01" : undefined}
            className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 hover:shadow-md ${error && error.includes(label)
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              }`}
          />
        )}
      </div>
    );
  };

  // Project dropdown field
  const renderProjectDropdown = ({ label, name, readOnly = false }) => (
    <div key={name} className="mb-4 w-full">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      {readOnly ? (
        <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
          {filteredProjects.find(p => p._id === form[name])?.projectName || '—'}
        </div>
      ) : (
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 hover:shadow-md ${error && error.includes(label)
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
            }`}
        >
          <option value="">{t('selectAProject')}</option>
          {loadingProjects ? (
            <option disabled>{t('loadingProjects')}</option>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectName} - {project.location}
              </option>
            ))
          ) : (
            <option disabled>
              {userInstitution
                ? "No projects available for your institution"
                : "Loading your institution..."}
            </option>
          )}
        </select>
      )}
    </div>
  );

  const sections = [
    {
      title: t('basicInfo'),
      fields: [
        { label: t('project'), name: "projectId", type: "dropdown" },
        { label: t('progressName'), name: "progressName" },
        { label: t('mainObjective'), name: "mainObjective" },
        { label: t('location'), name: "location" },
        { label: t('totalCostOriginal'), name: "totalCostOriginal", type: "number" },
        { label: t('totalCostCurrent'), name: "totalCostCurrent", type: "number" },
        { label: t('awardedAmount'), name: "awardedAmount", type: "number" },
        { label: t('revisedEndDate'), name: "revisedEndDate", type: "date" },
        { label: t('fundingSource'), name: "fundingSource" },
      ],
    },
    {
      title: t('physicalProgress'),
      fields: [
        { label: t('overallTarget'), name: "overallTarget" },
        { label: t('progressAsOfPrevDecPercentage'), name: "progressAsOfPrevDecPercentage", type: "number" },
        { label: t('currentYearDescriptiveTarget'), name: "currentYearDescriptiveTarget" },
        { label: t('quarter1TargetPercentage'), name: "quarter1TargetPercentage", type: "number" },
        { label: t('quarter2TargetPercentage'), name: "quarter2TargetPercentage", type: "number" },
        { label: t('quarter3TargetPercentage'), name: "quarter3TargetPercentage", type: "number" },
        { label: t('quarter4TargetPercentage'), name: "quarter4TargetPercentage", type: "number" },
        { label: t('yearEndProgressDescription'), name: "yearEndProgressDescription" },
        { label: t('yearEndProgressPercentage'), name: "yearEndProgressPercentage", type: "number" },
        { label: t('cumulativeTargetAtYearEnd'), name: "cumulativeTargetAtYearEnd" },
        { label: t('cumulativeProgressDescriptionAtYearEnd'), name: "cumulativeProgressDescriptionAtYearEnd" },
        { label: t('cumulativeProgressPercentageOfOverallTarget'), name: "cumulativeProgressPercentageOfOverallTarget", type: "number" },
        { label: t('physicalProgressImage1'), name: "physicalProgressImage1", type: "file" },
        { label: t('physicalProgressImage2'), name: "physicalProgressImage2", type: "file" },
        { label: t('physicalProgressImage3'), name: "physicalProgressImage3", type: "file" },
        { label: t('physicalTargetFailureReasons'), name: "physicalTargetFailureReasons" },
        { label: t('contractors'), name: "contractors" },
        { label: t('consultants'), name: "consultants" },
      ],
    },
    {
      title: t('financialProgress'),
      fields: [
        { label: t('allocationCurrentYear'), name: "allocationCurrentYear", type: "number" },
        { label: t('expenditureTarget'), name: "expenditureTarget", type: "number" },
        { label: t('imprestRequested'), name: "imprestRequested", type: "number" },
        { label: t('imprestReceived'), name: "imprestReceived", type: "number" },
        { label: t('actualExpenditure'), name: "actualExpenditure", type: "number" },
        { label: t('billsInHand'), name: "billsInHand", type: "number" },
        { label: t('priceEscalation'), name: "priceEscalation", type: "number" },
        { label: t('cumulativeExpenditureAtYearEnd'), name: "cumulativeExpenditureAtYearEnd", type: "number" },
        { label: t('financialTargetFailureReasons'), name: "financialTargetFailureReasons" },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-2xl my-10">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
        >
          ✅ Progress submitted successfully! Redirecting...
        </motion.div>
      )}

      {/* Save Success Message */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 2 }}
          className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg"
        >
          {successMsg}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          ❌ {error}
        </motion.div>
      )}



      {/* Financial Staff: Select Draft Dropdown */}
      {userRole === 'financialStaff' && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <label className="block text-blue-800 font-bold mb-3 text-lg">
            🔍 Select Pending Progress (Physical Input Completed)
          </label>
          <select
            onChange={handleDraftSelect}
            defaultValue=""
            className="w-full p-4 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium"
          >
            <option value="" disabled>-- Select a Project to Update Financial Details --</option>
            {loadingDrafts ? (
              <option disabled>Loading pending drafts...</option>
            ) : drafts.length > 0 ? (
              drafts.map((draft) => (
                <option key={draft._id} value={draft._id}>
                  {draft.projectId?.projectName || 'Unknown Project'} (Progress: {draft.progressName})
                </option>
              ))
            ) : (
              <option disabled>No pending progress entries found for your institution.</option>
            )}
          </select>
        </div>
      )}

      {/* Registrar/Admin view: List of progress entries with filter */}
      {(userRole === 'registrar' || userRole === 'admin') && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {userRole === 'admin' ? 'All Project Progress Entries' : 'Submitted Project Progress'}
            </h3>
            <div className="flex items-center space-x-3">
              <label htmlFor="statusFilter" className="font-medium text-gray-700">Filter by Status:</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="draft">Review Pending (Draft)</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </div>

          {submittedProgress.length > 0 ? (
            <div className="space-y-4">
              {submittedProgress.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleDraftSelect({ target: { value: item._id } })}
                  className="p-4 bg-white rounded-lg border border-gray-200 shadow hover:shadow-md transition cursor-pointer hover:border-blue-400"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-blue-600">
                        {item.projectId?.projectName || 'Unnamed Project'}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        Progress: {item.progressName} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      {item.mainObjective && (
                        <p className="text-gray-700"><strong>Objective:</strong> {item.mainObjective}</p>
                      )}
                      <p className="text-gray-700 mt-1">
                        <strong>Status:</strong> <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${item.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    {/* Add View/Edit button if needed in future */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded border border-dashed border-gray-300">
              No progress entries found with status "{filterStatus}".
            </div>
          )}
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex items-center">
            {/* Step circle */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i === step
                ? "bg-blue-600 text-white shadow-lg"
                : i < step
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
                }`}
            >
              {i + 1}
            </div>
            {/* Label */}
            <span
              className={`ml-2 text-sm font-medium ${i === step ? "text-blue-600" : "text-gray-500"
                }`}
            >
              {s}
            </span>
            {/* Line connector */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-300 mx-2">
                <motion.div
                  className="h-0.5 bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Section */}
      <AnimatePresence mode="wait">
        <motion.form
          key={step}
          onSubmit={handleSubmit}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {sections[step].title}
          </h2>

          {/* Use PhysicalProgressSection for Physical Progress step */}
          {step === 1 ? (
            <PhysicalProgressSection
              form={form}
              onChange={handleChange}
              isEditing={isEditing && isFieldEditable(userRole, 'overallTarget')}
              t={t}
              imagePreviews={imagePreviews}
            />
          ) : step === 2 ? (
            <FinancialProgressSection
              form={form}
              onChange={handleChange}
              isEditing={isFinancialEditing}
              projectName={filteredProjects.find(p => p._id === form.projectId)?.projectName}
              userRole={userRole}
              onSave={handleSave}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections[step].fields.map((field) => {
                const canEdit = isFieldEditable(userRole, field.name);
                const readOnly = !canEdit && userRole !== undefined;
                return field.type === "dropdown"
                  ? renderProjectDropdown({ ...field, readOnly })
                  : renderInput({ ...field, readOnly });
              })}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0 || loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <div className="flex space-x-3">
              {/* Save button for physicalStaff and financialStaff */}
              {(userRole === 'physicalStaff' && (step === 0 || step === 1)) ||
                (userRole === 'financialStaff' && step === 2) ? (
                <>
                  {(!isEditing && userRole === 'physicalStaff') || (!isFinancialEditing && userRole === 'financialStaff') ? (
                    <button
                      type="button"
                      onClick={() => userRole === 'physicalStaff' ? setIsEditing(true) : setIsFinancialEditing(true)}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 shadow-md transition flex items-center"
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "💾 Save"
                      )}
                    </button>
                  )}
                </>
              ) : null}

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : userRole === 'registrar' ? (
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : success ? (
                    "✅ Submitted"
                  ) : (
                    "Submit Progress"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  title="Only registrar can submit"
                >
                  Submit (Registrar Only)
                </button>
              )}
            </div>
          </div>
        </motion.form>
      </AnimatePresence>


    </div>
  );
};

export default ProjectProgressForm;
