import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../../i18n";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProjectProgressReport from "../../components/ProjectProgressReport";
import "../../styles/report.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_URL = "http://localhost:5000/api";

const ProjectProgressDetails = () => {
  const { progressId } = useParams();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { t } = useTranslation();

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val) || 0;
    try {
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(num);
    } catch (e) {
      return `₨${num.toLocaleString()}`;
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/progress/${progressId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = res.data;
        setProgress(data);
        if (data.projectId && typeof data.projectId === "object") setProject(data.projectId);
      } catch (err) {
        console.error(err);
        setError("Failed to load progress details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [progressId]);

  const handleDelete = async () => {
    if (!window.confirm(t('confirmDelete'))) return;
    setActionInProgress(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/progress/${progressId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      navigate("/progress");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to delete.");
      setActionInProgress(false);
    }
  };

  const DetailItem = ({ label, value, type = "text" }) => {
    let display = value ?? <span className="text-gray-400 italic">Not provided</span>;
    if (type === "date" && value) display = new Date(value).toLocaleDateString();
    if (type === "currency" && value) display = formatCurrency(value);
    if (type === "percentage" && value !== undefined) display = `${value}%`;
    return (
      <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-gray-200">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{display}</dd>
      </div>
    );
  };

  const ImageGallery = ({ images = [] }) => {
    const has = images.some(Boolean);
    if (!has) return <div className="text-center py-8 bg-gray-50 rounded-lg"><p className="text-gray-500 italic">No progress images uploaded</p></div>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {images.map((img, idx) => (
          img ? (
            <div key={idx} className="relative group h-64">
              <div className="absolute inset-0 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <img
                  src={`${API_URL}/uploads/${img}`}
                  alt={`Progress ${idx + 1}`}
                  className="w-full h-full object-cover cursor-pointer transform transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setSelectedImage(img)}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">Physical Progress Image {idx + 1}</div>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </div>
    );
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
        <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
          <button className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2" onClick={onClose}>✕</button>
          <img src={`${API_URL}/uploads/${image}`} alt="Full" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'; }} />
        </div>
      </div>
    );
  };

  const sections = [
    {
      title: "Basic Info",
      fields: [
        { label: "Progress No", name: "progressNo" },
        { label: "Main Objective", name: "mainObjective" },
        { label: "Location", name: "location" },
        { label: "Total Cost (Original)", name: "totalCostOriginal", type: "currency" },
        { label: "Total Cost (Current)", name: "totalCostCurrent", type: "currency" },
        { label: "Awarded Amount", name: "awardedAmount", type: "currency" },
        { label: "Revised End Date", name: "revisedEndDate", type: "date" },
        { label: "Funding Source", name: "fundingSource" },
      ],
    },
    {
      title: "Physical Progress",
      fields: [
        { label: "Overall Target", name: "overallTarget" },
        { label: "Progress as of Previous Dec (%)", name: "progressAsOfPrevDecPercentage", type: "percentage" },
        { label: "Current Year Descriptive Target", name: "currentYearDescriptiveTarget" },
        { label: "Q1 Target (%)", name: "quarter1TargetPercentage", type: "percentage" },
        { label: "Q2 Target (%)", name: "quarter2TargetPercentage", type: "percentage" },
        { label: "Q3 Target (%)", name: "quarter3TargetPercentage", type: "percentage" },
        { label: "Q4 Target (%)", name: "quarter4TargetPercentage", type: "percentage" },
        { label: "Year End Progress (%)", name: "yearEndProgressPercentage", type: "percentage" },
        { label: "Year End Progress Description", name: "yearEndProgressDescription" },
        { label: "Cumulative Target at Year End", name: "cumulativeTargetAtYearEnd" },
        { label: "Cumulative Progress Description", name: "cumulativeProgressDescriptionAtYearEnd" },
        { label: "Cumulative Progress (% of Overall Target)", name: "cumulativeProgressPercentageOfOverallTarget", type: "percentage" },
        { label: "Reasons for Physical Target Failure", name: "physicalTargetFailureReasons" },
        { label: "Contractors", name: "contractors" },
        { label: "Consultants", name: "consultants" },
      ],
    },
    {
      title: "Financial Progress",
      fields: [
        { label: "Allocation for Current Year", name: "allocationCurrentYear", type: "currency" },
        { label: "Expenditure Target", name: "expenditureTarget", type: "currency" },
        { label: "Imprest Requested", name: "imprestRequested", type: "currency" },
        { label: "Imprest Received", name: "imprestReceived", type: "currency" },
        { label: "Actual Expenditure", name: "actualExpenditure", type: "currency" },
        { label: "Bills in Hand", name: "billsInHand", type: "currency" },
        { label: "Price Escalation", name: "priceEscalation", type: "currency" },
        { label: "Cumulative Expenditure at Year End", name: "cumulativeExpenditureAtYearEnd", type: "currency" },
        { label: "Reasons for Financial Target Failure", name: "financialTargetFailureReasons" },
      ],
    },
  ];

  const handleExportExcel = () => {
    if (!progress || !project) return;

    // Flatten data for Excel
    const excelData = [
      { Section: "REPORT SUMMARY", Field: "Project Name", Value: project.projectName },
      { Section: "REPORT SUMMARY", Field: "Institution", Value: project.institution },
      { Section: "REPORT SUMMARY", Field: "Location", Value: project.location },
      { Section: "REPORT SUMMARY", Field: "Report Period", Value: progress.month || progress.year ? `${progress.month || ''} ${progress.year || ''}` : "N/A" },
      { Section: "REPORT SUMMARY", Field: "Status", Value: progress.status },
      { Section: "", Field: "", Value: "" }, // Spacer
    ];

    sections.forEach(section => {
      excelData.push({ Section: section.title.toUpperCase(), Field: "", Value: "" });
      section.fields.forEach(field => {
        let val = progress[field.name];
        if (field.type === 'currency' && val) val = formatCurrency(val);
        if (field.type === 'date' && val) val = new Date(val).toLocaleDateString();
        if (field.type === 'percentage' && val !== undefined) val = `${val}%`;

        excelData.push({
          Section: "",
          Field: field.label,
          Value: val || 'N/A'
        });
      });
      excelData.push({ Section: "", Field: "", Value: "" }); // Spacer
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Progress Report");

    // Set column widths
    const wscols = [
      { wch: 20 }, // Section
      { wch: 40 }, // Field
      { wch: 50 }, // Value
    ];
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `${project.projectName}_Progress_Record.xlsx`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-lg">Loading Details...</span>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto p-8 my-10 text-center">
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/progress')} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="report-container max-w-6xl mx-auto p-4 sm:p-8">
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}

      {/* Header / Summary */}
      <div className="report-header p-6 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{t('progressReport')}</h1>
            {project && <p className="text-lg text-gray-600 mt-1">For Project: <span className="font-semibold">{project.projectName}</span> — <span className="text-sm text-gray-500">{project.location}</span></p>}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="report-card p-3 bg-white">
                <div className="text-sm text-gray-500">{t('reportPeriod')}</div>
                <div className="text-xl font-bold">
                  {progress?.month || progress?.year
                    ? `${progress?.month || ''} ${progress?.year || ''}`
                    : progress?.createdAt
                      ? new Date(progress.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
                      : '-'}
                </div>
              </div>
              <div className="report-card p-3 bg-white">
                <div className="text-sm text-gray-500">{t('physicalProgress')}</div>
                <div className="text-xl font-bold">{progress?.yearEndProgressPercentage ? `${progress.yearEndProgressPercentage}%` : '-'}</div>
              </div>
              <div className="report-card p-3 bg-white">
                <div className="text-sm text-gray-500">{t('financials')}</div>
                <div className="text-xl font-bold">{progress?.actualExpenditure ? formatCurrency(progress.actualExpenditure) : '-'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 bg-gray-800 text-white rounded">Print</button>
            <button onClick={() => navigate(`/update-progress/${progressId}`)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
            <button onClick={handleDelete} disabled={actionInProgress} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">{actionInProgress ? 'Deleting...' : 'Delete'}</button>
            {project && progress && (
              <PDFDownloadLink document={<ProjectProgressReport project={project} progress={progress} />} fileName={`${project.projectName}-Progress-Report-${progress.month}-${progress.year}.pdf`} className="mr-2 px-4 py-2 bg-green-600 text-white rounded">
                {({ loading }) => loading ? 'Preparing PDF...' : 'Download PDF'}
              </PDFDownloadLink>
            )}
            <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {sections.map((section, idx) => (
            <section key={idx} className="report-section p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">{section.title}</h2>

              {section.title === 'Physical Progress' && progress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Physical Progress Images</h3>
                  <ImageGallery images={[progress.physicalProgressImage1, progress.physicalProgressImage2, progress.physicalProgressImage3]} />
                </div>
              )}

              <dl>
                {section.fields.map((f) => <DetailItem key={f.name} label={f.label} value={progress[f.name]} type={f.type} />)}
              </dl>
            </section>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="report-section p-4">
            <div className="text-sm text-gray-500">{t('project')}</div>
            <div className="font-semibold text-lg">{project?.projectName || '-'}</div>
            <div className="text-xs text-gray-400">{project?.institution || ''}</div>
            <div className="mt-3 text-sm">
              <div><strong>{t('start')}:</strong> {project?.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</div>
              <div><strong>{t('end')}:</strong> {project?.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</div>
            </div>
          </div>

          <div className="report-section p-4">
            <h3 className="font-semibold mb-3">{t('milestones')}</h3>
            <div className="report-timeline">
              <div className="event">
                <div className="text-sm font-medium">{t('target')}: {progress?.overallTarget || 'N/A'}</div>
                <div className="text-xs text-gray-500">{progress?.yearEndProgressDescription || ''}</div>
              </div>
              <div className="event">
                <div className="text-sm font-medium">{t('yearEndProgress')}: {progress?.yearEndProgressPercentage ? `${progress.yearEndProgressPercentage}%` : 'N/A'}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectProgressDetails;