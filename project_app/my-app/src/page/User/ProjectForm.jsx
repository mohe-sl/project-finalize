import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../../i18n";

const API_URL = "http://localhost:5000/api";

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing projects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    budget: "",
    department: "",
    fundingScore: "",
    startDate: "",
    endDate: "",
    location: "",
    institution: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Fetch project data if in edit mode
  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const projectData = response.data;
      setForm({
        ...projectData,
        startDate: new Date(projectData.startDate).toISOString().split('T')[0],
        endDate: new Date(projectData.endDate).toISOString().split('T')[0],
      });
      if (projectData.image) {
        setPreview(`${API_URL}${projectData.image}`);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(t('failedFetchProject'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      navigate("/projects", { 
        state: { message: t('projectDeletedSuccess') }
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(t('failedDeleteProject'));
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      // Append all form fields to FormData
      Object.keys(form).forEach(key => {
        if (key === 'image' && form[key]) {
          formData.append('image', form[key]);
        } else if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      if (id) {
        // Update existing project
        await axios.put(`${API_URL}/projects/${id}`, formData, config);
        navigate("/projects", {
          state: { message: t('projectUpdatedSuccess') }
        });
      } else {
        // Create new project
        await axios.post(`${API_URL}/projects`, formData, config);
        navigate("/projects", {
          state: { message: t('projectCreatedSuccess') }
        });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      setError(error.response?.data?.error || t('errorSavingProject'));
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-10 border border-gray-300 relative"
      >
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-10 text-center text-blue-900">
          🏢 {id ? t('editProject') : t('newProject')}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            <InputField
              label={t('projectName')}
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              placeholder={t('enterProjectName')}
              required
            />
            <TextareaField
              label={t('description')}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t('enterProjectDescription')}
              rows={12}
              required
            />
            <InputField
              label={t('initialBudget')}
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              placeholder={t('enterBudget')}
              required
            />
            <InputField
              label={t('department')}
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder={t('enterDepartment')}
              required
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <InputField
              label={t('startDate')}
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />
            <InputField
              label={t('estimatedEndDate')}
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {t('institution')}
              </label>
              <select
                name="institution"
                value={form.institution}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Institution</option>
                <option value="University of Colombo">University of Colombo</option>
                <option value="University of Peradeniya">University of Peradeniya</option>
                <option value="University of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                <option value="University of Kelaniya">University of Kelaniya</option>
                <option value="University of Moratuwa">University of Moratuwa</option>
                <option value="University of Jaffna">University of Jaffna</option>
                <option value="University of Ruhuna">University of Ruhuna</option>
                <option value="Eastern University, Sri Lanka">Eastern University, Sri Lanka</option>
                <option value="South Eastern University of Sri Lanka">South Eastern University of Sri Lanka</option>
                <option value="Rajarata University of Sri Lanka">Rajarata University of Sri Lanka</option>
                <option value="Sabaragamuwa University of Sri Lanka">Sabaragamuwa University of Sri Lanka</option>
                <option value="Wayamba University of Sri Lanka">Wayamba University of Sri Lanka</option>
                <option value="Uva Wellassa University">Uva Wellassa University</option>
                <option value="University of the Visual & Performing Arts">University of the Visual & Performing Arts</option>
                <option value="Buddhist and Pali University of Sri Lanka">Buddhist and Pali University of Sri Lanka</option>
                <option value="Bhiksu University of Sri Lanka">Bhiksu University of Sri Lanka</option>
                <option value="Gampaha Wickramarachchi University of Indigenous Medicine">Gampaha Wickramarachchi University of Indigenous Medicine</option>
                <option value="University of Vavuniya">University of Vavuniya</option>
              </select>
            </div>
            <InputField
              label={t('fundingScore')}
              name="fundingScore"
              type="number"
              value={form.fundingScore}
              onChange={handleChange}
              placeholder={t('enterFundingScore')}
              required
            />
            <InputField
              label={t('location')}
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder={t('enterLocation')}
              required
            />

            {/* Drag & Drop Image */}
            <div className="flex flex-col items-center justify-center mt-4">
              <label className="block text-blue-900 mb-2 font-semibold">{t('projectImage')}</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 w-full
                  ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-gray-50"}`}
              >
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="cursor-pointer text-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-lg shadow-md border border-gray-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a2 2 0 01-2-2v-2h8v2a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {t('dragDropOr')} {" "}
                        <span className="text-blue-700 font-semibold">{t('browse')}</span>
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-white bg-blue-700 hover:bg-blue-800 shadow-md font-semibold transition-transform transform hover:scale-105"
          >
            {id ? t('updateProject') : t('submitProject')}
          </button>
          
          {id && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('confirmDeleteProject'))) {
                  handleDelete();
                }
              }}
              className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-md font-semibold transition-transform transform hover:scale-105"
              >
              {t('deleteProject')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Input Field Component
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-blue-900 mb-1 font-semibold">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
  </div>
);

// Textarea Field Component
const TextareaField = ({ label, name, value, onChange, placeholder, rows, required }) => (
  <div>
    <label className="block text-blue-900 mb-1 font-semibold">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
  </div>
);

export default ProjectForm;
