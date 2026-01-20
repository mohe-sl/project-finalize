import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../../i18n";

const API_URL = "http://localhost:5000/api";

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const [form, setForm] = useState({
    projectName: "",
    departmentType: "Local",
    departmentCategory: "GOSL",
    institution: "",
    durationStart: "",
    durationEnd: "",
    tec: "",
    tecCurrency: "LKR",
    awardedAmount: "",
    revisedDate: "",
    department: "",
    startDate: "",
    estimatedEndDate: "",
    projectExtended: "No",
    extendedDate: "",
    extensionPDF: null,
    returnPeriodsStart: "",
    returnPeriodsEnd: "",
    fundingSource: "",
    capitalWorks: false,
    location: "",
    landLocation: "",
    responsibleDept: "",
    projectImage: null,
    projectPDF: null,
    npdDate: "",
    cabinetPapersNo: "",
    cabinetPapersDate: "",
    remarks: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [extensionPdfPreview, setExtensionPdfPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (files) {
      const file = files[0];
      setForm({ ...form, [name]: file });

      if (name === "projectImage") {
        setImagePreview(URL.createObjectURL(file));
      } else if (name === "projectPDF") {
        setPdfPreview(file.name);
      } else if (name === "extensionPDF") {
        setExtensionPdfPreview(file.name);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm({ ...form, [fieldName]: file });

      if (fieldName === "projectImage") {
        setImagePreview(URL.createObjectURL(file));
      } else if (fieldName === "projectPDF") {
        setPdfPreview(file.name);
      }
    }
  };

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
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : "",
        estimatedEndDate: projectData.estimatedEndDate ? new Date(projectData.estimatedEndDate).toISOString().split('T')[0] : "",
        extendedDate: projectData.extendedDate ? new Date(projectData.extendedDate).toISOString().split('T')[0] : "",
        revisedDate: projectData.revisedDate ? new Date(projectData.revisedDate).toISOString().split('T')[0] : "",
        npdDate: projectData.npdDate ? new Date(projectData.npdDate).toISOString().split('T')[0] : "",
        cabinetPapersDate: projectData.cabinetPapersDate ? new Date(projectData.cabinetPapersDate).toISOString().split('T')[0] : "",
        durationStart: projectData.durationStart ? new Date(projectData.durationStart).toISOString().split('T')[0] : "",
        durationEnd: projectData.durationEnd ? new Date(projectData.durationEnd).toISOString().split('T')[0] : "",
        returnPeriodsStart: projectData.returnPeriodsStart ? new Date(projectData.returnPeriodsStart).toISOString().split('T')[0] : "",
        returnPeriodsEnd: projectData.returnPeriodsEnd ? new Date(projectData.returnPeriodsEnd).toISOString().split('T')[0] : "",
      });
      if (projectData.projectImage) {
        setImagePreview(`${API_URL}${projectData.projectImage}`);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(t('failedFetchProject') || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (key === 'isDraft') return; // Skip isDraft here, appended manually below
        if (form[key] !== null && form[key] !== "") {
          if (key === 'projectImage' || key === 'projectPDF' || key === 'extensionPDF') {
            if (form[key] instanceof File) {
              formData.append(key, form[key]);
            }
          } else {
            formData.append(key, form[key]);
          }
        }
      });

      formData.append('isDraft', isDraft);

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      if (id) {
        await axios.put(`${API_URL}/projects/${id}`, formData, config);
        navigate("/projects", {
          state: { message: t('projectUpdatedSuccess') || "Project updated successfully" }
        });
      } else {
        await axios.post(`${API_URL}/projects`, formData, config);
        navigate("/projects", {
          state: { message: isDraft ? "Draft saved successfully" : (t('projectCreatedSuccess') || "Project created successfully") }
        });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      setError(error.response?.data?.error || t('errorSavingProject') || "Error saving project");
      setLoading(false);
    }
  };

  const universities = [
    "University of Colombo",
    "University of Peradeniya",
    "University of Sri Jayewardenepura",
    "University of Kelaniya",
    "University of Moratuwa",
    "University of Jaffna",
    "University of Ruhuna",
    "Eastern University, Sri Lanka",
    "South Eastern University of Sri Lanka",
    "Rajarata University of Sri Lanka",
    "Sabaragamuwa University of Sri Lanka",
    "Wayamba University of Sri Lanka",
    "Uva Wellassa University",
    "University of the Visual & Performing Arts",
    "Open University of Sri Lanka",
    "Buddhist and Pali University of Sri Lanka",
    "Bhiksu University of Sri Lanka",
    "University of Vocational Technology (UNIVOTEC)",
  ];

  const currencies = [
    { value: "LKR", label: "LKR - Sri Lankan Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "SGD", label: "SGD - Singapore Dollar" },
    { value: "AED", label: "AED - UAE Dirham" },
    { value: "SAR", label: "SAR - Saudi Riyal" },
    { value: "KWD", label: "KWD - Kuwaiti Dinar" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {id ? "Edit Project" : "New Project"}
          </h1>
          <p className="text-gray-500 text-sm">
            Dashboard &gt; Projects &gt; {id ? "Edit Project" : "New Project"}
          </p>
        </div>

        <form>
          {loading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Project Information Section */}
          <Section title="Project Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Project Name"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                required
              />

              {/* Department Type Radio Buttons */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Department Type
                </label>
                <div className="flex gap-4">
                  <RadioButton
                    label="Local"
                    name="departmentType"
                    value="Local"
                    checked={form.departmentType === "Local"}
                    onChange={handleChange}
                  />
                  <RadioButton
                    label="Foreign"
                    name="departmentType"
                    value="Foreign"
                    checked={form.departmentType === "Foreign"}
                    onChange={handleChange}
                  />
                  <RadioButton
                    label="Grant"
                    name="departmentType"
                    value="Grant"
                    checked={form.departmentType === "Grant"}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Conditional Department Category Dropdown */}
              {(form.departmentType === "Local" || form.departmentType === "Foreign" || form.departmentType === "Grant") && (
                <SelectField
                  label={`${form.departmentType}`}
                  name="departmentCategory"
                  value={form.departmentCategory}
                  onChange={handleChange}
                  options={[
                    { value: "GOSL", label: "GOSL" },
                    { value: "MOHE", label: "MOHE" },
                  ]}
                />
              )}

              {/* Institution Dropdown */}
              {(form.departmentType === "Local" || form.departmentType === "Foreign" || form.departmentType === "Grant") && (
                <SelectField
                  label="Institution"
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  options={universities.map(uni => ({ value: uni, label: uni }))}
                  placeholder="Select Institution"
                />
              )}

              <DateRangeField
                label="Duration"
                nameStart="durationStart"
                nameEnd="durationEnd"
                valueStart={form.durationStart}
                valueEnd={form.durationEnd}
                onChange={handleChange}
              />

              {/* TEC with inline currency selector */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">TEC</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="tec"
                    value={form.tec}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter TEC"
                  />
                  <select
                    name="tecCurrency"
                    value={form.tecCurrency}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {currencies.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Awarded Amount with inline currency selector */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">AWARDED AMOUNT</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="awardedAmount"
                    value={form.awardedAmount}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter AWARDED AMOUNT"
                  />
                  <select
                    name="tecCurrency"
                    value={form.tecCurrency}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  >
                    {currencies.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <InputField
                label="Revised Date"
                name="revisedDate"
                type="date"
                value={form.revisedDate}
                onChange={handleChange}
              />

              <InputField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Project Timeline Section */}
          <Section title="Project Timeline">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Start Date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />

              <InputField
                label="Estimated End Date"
                name="estimatedEndDate"
                type="date"
                value={form.estimatedEndDate}
                onChange={handleChange}
                required
              />

              {/* Project Extended Radio */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Project Extended?
                </label>
                <div className="flex gap-4">
                  <RadioButton
                    label="Yes"
                    name="projectExtended"
                    value="Yes"
                    checked={form.projectExtended === "Yes"}
                    onChange={handleChange}
                  />
                  <RadioButton
                    label="No"
                    name="projectExtended"
                    value="No"
                    checked={form.projectExtended === "No"}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {form.projectExtended === "Yes" && (
                <>
                  <InputField
                    label="Extended Date"
                    name="extendedDate"
                    type="date"
                    value={form.extendedDate}
                    onChange={handleChange}
                  />

                  <FileUploadField
                    label="Extension PDF"
                    name="extensionPDF"
                    accept=".pdf"
                    onChange={handleChange}
                    fileName={extensionPdfPreview}
                  />
                </>
              )}

              <DateRangeField
                label="Return Periods"
                nameStart="returnPeriodsStart"
                nameEnd="returnPeriodsEnd"
                valueStart={form.returnPeriodsStart}
                valueEnd={form.returnPeriodsEnd}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Funding & Location Section */}
          <Section title="Funding & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Funding Source"
                name="fundingSource"
                value={form.fundingSource}
                onChange={handleChange}
              />

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Capital Works
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="capitalWorks"
                      checked={form.capitalWorks}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                </div>
              </div>

              <InputField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
              />

              <InputField
                label="Land Location"
                name="landLocation"
                value={form.landLocation}
                onChange={handleChange}
              />

              <InputField
                label="Responsible Department"
                name="responsibleDept"
                value={form.responsibleDept}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Media & Documents Section */}
          <Section title="Media & Documents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Image */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Project Image
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "projectImage")}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
                >
                  <input
                    type="file"
                    name="projectImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id="projectImageUpload"
                  />
                  <label htmlFor="projectImageUpload" className="cursor-pointer text-center w-full">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Drag & Drop Image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Project PDF */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Project PDF
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "projectPDF")}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
                >
                  <input
                    type="file"
                    name="projectPDF"
                    accept=".pdf"
                    onChange={handleChange}
                    className="hidden"
                    id="projectPDFUpload"
                  />
                  <label htmlFor="projectPDFUpload" className="cursor-pointer text-center w-full">
                    {pdfPreview ? (
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-700 truncate w-full">{pdfPreview}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Drag & Drop PDF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </Section>

          {/* Cabinet Information Section */}
          <Section title="Cabinet Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="NPD Date"
                name="npdDate"
                type="date"
                value={form.npdDate}
                onChange={handleChange}
              />

              <InputField
                label="Cabinet Papers No"
                name="cabinetPapersNo"
                value={form.cabinetPapersNo}
                onChange={handleChange}
              />

              <InputField
                label="Cabinet Papers Date"
                name="cabinetPapersDate"
                type="date"
                value={form.cabinetPapersDate}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Remarks Section */}
          <Section title="Remarks">
            <TextareaField
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={4}
            />
          </Section>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-8 py-3 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm font-semibold transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-8 py-3 rounded-lg text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 shadow-sm font-semibold transition-all"
            >
              Save Draft
            </button>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="px-8 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md font-semibold transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Section Component
const Section = ({ title, children }) => (
  <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
      {title}
    </h2>
    {children}
  </div>
);

// Input Field Component
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Textarea Field Component
const TextareaField = ({ label, name, value, onChange, placeholder, rows, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Date Range Field Component
const DateRangeField = ({ label, nameStart, nameEnd, valueStart, valueEnd, onChange, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      <input
        type="date"
        name={nameStart}
        value={valueStart}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Start Date"
      />
      <input
        type="date"
        name={nameEnd}
        value={valueEnd}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="End Date"
      />
    </div>
  </div>
);

// Select Field Component
const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Radio Button Component
const RadioButton = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <span className="ml-2 text-gray-700">{label}</span>
  </label>
);

// File Upload Field Component
const FileUploadField = ({ label, name, accept, onChange, fileName }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
        className="hidden"
        id={`${name}Upload`}
      />
      <label
        htmlFor={`${name}Upload`}
        className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
      >
        Choose File
      </label>
      <span className="text-sm text-gray-600">
        {fileName || "No file chosen"}
      </span>
    </div>
  </div>
);

export default ProjectForm;
