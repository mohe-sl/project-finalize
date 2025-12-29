import { useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    login: 'Login',
    logout: 'Logout',
    addNewProject: 'Add New Project',
    edit: 'Edit',
    delete: 'Delete',
    projectDashboardTitle: 'Projects Dashboard',
    projectNewDashboardTitle: 'Project New Dashboard',
    profile: 'Profile',
    viewDetails: 'View Details',
    save: 'Save',
    cancel: 'Cancel',
    print: 'Print',
    downloadPdf: 'Download PDF',
    progressReport: 'Progress Report',
    reportPeriod: 'Report Period',
    physicalProgress: 'Physical Progress',
    financials: 'Financials',
    project: 'Project',
    milestones: 'Milestones',
    start: 'Start',
    end: 'End',
    target: 'Target',
    yearEndProgress: 'Year-End Progress',
    confirmDelete: 'Are you sure you want to delete this item?'
    ,
    // Project form specific
    editProject: 'Edit Project',
    newProject: 'New Project',
    failedFetchProject: 'Failed to fetch project details. Please try again.',
    failedDeleteProject: 'Failed to delete project. Please try again.',
    projectDeletedSuccess: 'Project deleted successfully',
    projectUpdatedSuccess: 'Project updated successfully',
    projectCreatedSuccess: 'Project created successfully',
    errorSavingProject: 'Error saving project. Please try again.',
    projectName: 'Project Name',
    description: 'Description',
    initialBudget: 'Initial Budget ($)',
    department: 'Department',
    startDate: 'Start Date',
    estimatedEndDate: 'Estimated End Date',
    institution: 'Institution',
    fundingScore: 'Funding Score',
    location: 'Location',
    projectImage: 'Project Image',
    dragDropOr: 'Drag & drop or',
    browse: 'browse',
    submitProject: 'Submit Project',
    updateProject: 'Update Project',
    deleteProject: 'Delete Project',
    confirmDeleteProject: 'Are you sure you want to delete this project?',
    enterProjectName: 'Enter project name',
    enterProjectDescription: 'Enter project description',
    enterBudget: 'Enter budget',
    enterDepartment: 'Enter department',
    enterInstitution: 'Enter institution name',
    enterFundingScore: 'Enter funding score',
    enterLocation: 'Enter project location'
    ,
    // Project progress form keys
    basicInfo: 'Basic Info',
    physicalProgress: 'Physical Progress',
    financialProgress: 'Financial Progress',
    progressSubmittedSuccess: 'Progress submitted successfully! Redirecting...',
    selectAProject: 'Select a project',
    loadingProjects: 'Loading projects...',
    back: 'Back',
    next: 'Next',
    submitProgress: 'Submit Progress',
    submitting: 'Submitting...',
    submitted: '✅ Submitted',
    enter: 'Enter',
    failedToSubmit: 'Failed to submit:',
    networkError: 'Network error. Please make sure the server is running on http://localhost:5000',
    failedSubmitProgress: 'Failed to submit progress:' ,
    // Field labels
    progressNo: 'Progress No',
    mainObjective: 'Main Objective',
    totalCostOriginal: 'Total Cost (Original)',
    totalCostCurrent: 'Total Cost (Current)',
    awardedAmount: 'Awarded Amount',
    revisedEndDate: 'Revised End Date',
    fundingSource: 'Funding Source',
    overallTarget: 'Overall Target',
    progressAsOfPrevDecPercentage: 'Progress as of Previous Dec (%)',
    currentYearDescriptiveTarget: 'Current Year Descriptive Target',
    quarter1TargetPercentage: 'Quarter 1 Target (%)',
    quarter2TargetPercentage: 'Quarter 2 Target (%)',
    quarter3TargetPercentage: 'Quarter 3 Target (%)',
    quarter4TargetPercentage: 'Quarter 4 Target (%)',
    yearEndProgressDescription: 'Year End Progress Description',
    yearEndProgressPercentage: 'Year End Progress (%)',
    cumulativeTargetAtYearEnd: 'Cumulative Target at Year End',
    cumulativeProgressDescriptionAtYearEnd: 'Cumulative Progress Description at Year End',
    cumulativeProgressPercentageOfOverallTarget: 'Cumulative Progress (% of Overall Target)',
    physicalProgressImage1: 'Physical Progress Image 1',
    physicalProgressImage2: 'Physical Progress Image 2',
    physicalProgressImage3: 'Physical Progress Image 3',
    physicalTargetFailureReasons: 'Reasons for Not Achieving Physical Targets',
    contractors: 'Contractors',
    consultants: 'Consultants',
    allocationCurrentYear: 'Allocation for Current Year',
    expenditureTarget: 'Expenditure Target',
    imprestRequested: 'Imprest Requested',
    imprestReceived: 'Imprest Received',
    actualExpenditure: 'Actual Expenditure',
    billsInHand: 'Bills in Hand',
    priceEscalation: 'Price Escalation',
    cumulativeExpenditureAtYearEnd: 'Cumulative Expenditure at Year End',
    financialTargetFailureReasons: 'Reasons for Not Achieving Financial Targets'
  },
  si: {
    login: 'පිවිසෙන්න',
    logout: 'පිට වන්න',
    addNewProject: 'නව ව්‍යාපෘතිය එක් කරන්න',
    edit: 'සකස් කරන්න',
    delete: 'මකන්න',
    projectDashboardTitle: 'ව්‍යාපෘති පුවරුව',
    projectNewDashboardTitle: 'නව ව්‍යාපෘති පුවරුව',
    profile: 'පැතිකඩ',
    viewDetails: 'විස්තර බලන්න',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    print: 'මුද්‍රණය',
    downloadPdf: 'PDF බාගන්න',
    progressReport: 'ප්‍රගති වාර්තාව',
    reportPeriod: 'වාර්තා කාලය',
    physicalProgress: 'භෞතික ප්‍රගති',
    financials: 'මුද්‍රණ / මූල්‍ය',
    project: 'ව්‍යාපෘතිය',
    milestones: 'සඳහන් ලක්ෂ්‍ය',
    start: 'ආරම්භය',
    end: 'අවසානය',
    target: 'ඉලක්කය',
    yearEndProgress: 'වසර අවසාන ප්‍රගතිය',
    confirmDelete: 'ඔබ මෙම අයිතමය මකලාදීමට අවශ්‍යද?'
    ,
    // Project form specific
    editProject: 'ව්‍යාපෘතිය සංස්කරණය',
    newProject: 'නව ව්‍යාපෘතිය',
    failedFetchProject: 'ව්‍යාපෘති විස්තර ලබා ගැනීමට බැරිය. නැවත උත්සාහ කරන්න.',
    failedDeleteProject: 'ව්‍යාපෘතිය මකීමට බැරිය. නැවත උත්සාහ කරන්න.',
    projectDeletedSuccess: 'ව්‍යාපෘතිය සාර්ථකව මකන ලදි',
    projectUpdatedSuccess: 'ව්‍යාපෘතිය සාර්ථකව යාවත්කාලීන කරන ලදි',
    projectCreatedSuccess: 'ව්‍යාපෘතිය සාර්ථකව නිර්මාණය කරන ලදි',
    errorSavingProject: 'ව්‍යාපෘතිය සුරක්ෂිත කිරීමේ දෝෂයක්. නැවත උත්සාහ කරන්න.',
    projectName: 'ව්‍යාපෘති නාමය',
    description: 'විස්තරය',
    initialBudget: 'ආරම්භක බජට් ($)',
    department: 'අංශය',
    startDate: 'ආරම්භ දිනය',
    estimatedEndDate: 'අනුමාන අවසන් දිනය',
    institution: 'ආයතනය',
    fundingScore: 'මූල්‍ය ලකුණු',
    location: 'ස්ථානය',
    projectImage: 'ව්‍යාපෘති රූපය',
    dragDropOr: 'ඇද විහිදුනහොත් හෝ',
    browse: 'බ්‍රවුස් කරන්න',
    submitProject: 'ව්‍යාපෘතිය සාදන්න',
    updateProject: 'ව්‍යාපෘතිය යාවත්කාලීන කරන්න',
    deleteProject: 'ව්‍යාපෘතිය මකන්න',
    confirmDeleteProject: 'ඔබ මෙම ව්‍යාපෘතිය මකනු යුතුද?',
    enterProjectName: 'ව්‍යාපෘති නාමය ඇතුළත් කරන්න',
    enterProjectDescription: 'ව්‍යාපෘති විස්තර ඇතුළත් කරන්න',
    enterBudget: 'බජට් ඇතුළත් කරන්න',
    enterDepartment: 'අංශය ඇතුළත් කරන්න',
    enterInstitution: 'ආයතනයේ නම ඇතුළත් කරන්න',
    enterFundingScore: 'මූල්‍ය ලකුණු ඇතුළත් කරන්න',
    enterLocation: 'ස්ථානය ඇතුළත් කරන්න'
    ,
    // Project progress form keys
    basicInfo: 'මූලික තොරතුරු',
    physicalProgress: 'භෞතික ප්‍රගති',
    financialProgress: 'මූල්‍ය ප්‍රගති',
    progressSubmittedSuccess: 'ප්‍රගති සාර්ථකව ඉදිරිපත් කරන ලදි! නැවත යවනවා...',
    selectAProject: 'ව්‍යාපෘතියක් තෝරන්න',
    loadingProjects: 'ව්‍යාපෘති බාගත වෙමින්...',
    back: 'පසු',
    next: 'ඊළඟ',
    submitProgress: 'ප්‍රගති ඉදිරිපත් කරන්න',
    submitting: 'ඉදිරිපත් වෙමින්...',
    submitted: '✅ ඉදිරිපත් කරන ලදි',
    enter: 'ඇතුළු කරන්න',
    failedToSubmit: 'ඉදිරිපත් කිරීමට බැරිය:',
    networkError: 'ජාල දෝෂයක්. කරුණාකර සේවාදායකය http://localhost:5000 මත ක්‍රියාත්මක බව විශ්වාස කරන්න',
    failedSubmitProgress: 'ප්‍රගති ඉදිරිපත් කිරීම අසාර්ථකයි:',
    // Field labels
    progressNo: 'ප්‍රගති අංකය',
    mainObjective: 'ප්‍රධාන අරමුණ',
    totalCostOriginal: 'මුළු වියදම් (මුල්)',
    totalCostCurrent: 'මුළු වියදම් (වත්මන්)',
    awardedAmount: 'පිරිනැමූ මුදල',
    revisedEndDate: 'ලේඛිත අවසන් දිනය',
    fundingSource: 'මූල්‍ය සම්පත්',
    overallTarget: 'සමස්ත ඉලක්කය',
    progressAsOfPrevDecPercentage: 'පෙර දෙසැම්බර් අනුව ප්‍රගතිය (%)',
    currentYearDescriptiveTarget: 'වත්මන් වසරේ විස්තරාත්මක ඉලක්කය',
    quarter1TargetPercentage: '1ක වත්මන් ඉලක්කය (%)',
    quarter2TargetPercentage: '2ක වත්මන් ඉලක්කය (%)',
    quarter3TargetPercentage: '3ක වත්මන් ඉලක්කය (%)',
    quarter4TargetPercentage: '4ක වත්මන් ඉලක්කය (%)',
    yearEndProgressDescription: 'වසර අවසාන ප්‍රගති විස්තරය',
    yearEndProgressPercentage: 'වසර අවසාන ප්‍රගතිය (%)',
    cumulativeTargetAtYearEnd: 'වසර අවසාන එකතුව ඉලක්කය',
    cumulativeProgressDescriptionAtYearEnd: 'වසර අවසාන එකතුව ප්‍රගති විස්තරය',
    cumulativeProgressPercentageOfOverallTarget: 'සමස්ත ඉලක්කයට අනුව එකතුව ප්‍රගතිය (%)',
    physicalProgressImage1: 'භෞතික ප්‍රගති රූප 1',
    physicalProgressImage2: 'භෞතික ප්‍රගති රූප 2',
    physicalProgressImage3: 'භෞතික ප්‍රගති රූප 3',
    physicalTargetFailureReasons: 'භෞතික ඉලක්ක නොසපුරාලීමේ හේතු',
    contractors: 'කොන්ත්‍රැක්ටර්',
    consultants: 'උපදේශක',
    allocationCurrentYear: 'වත්මන් වසරේ කැපකිරීම්',
    expenditureTarget: 'වියදම් ඉලක්කය',
    imprestRequested: 'උපදෙස් ඉල්ලූ මුදල්',
    imprestReceived: 'ලබාගත් උපදෙස්',
    actualExpenditure: 'සැබෑ වියදම',
    billsInHand: 'අත්හත් බිල්පත්',
    priceEscalation: 'මිල ඉහළ යාම',
    cumulativeExpenditureAtYearEnd: 'වසර අවසාන එකතුව වියදම',
    financialTargetFailureReasons: 'මූල්‍ය ඉලක්ක නොසපුරාලීමේ හේතු'
  }
};

const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'lang';

export function getStoredLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v || DEFAULT_LANG;
  } catch (e) {
    return DEFAULT_LANG;
  }
}

export function setStoredLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    // Notify other components in the same window that language changed
    try {
      window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
    } catch (e) {
      // ignore in non-browser environments
    }
  } catch (e) {}
}

export function t(key, lang) {
  const language = lang || getStoredLang();
  return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS[DEFAULT_LANG][key] || key;
}

// React hook for components
export function useTranslation() {
  const [lang, setLang] = useState(getStoredLang());

  // Persist changes and notify others
  useEffect(() => {
    try {
      setStoredLang(lang);
    } catch (e) {}
  }, [lang]);

  // Listen for language changes dispatched elsewhere in the same window
  useEffect(() => {
    const handler = (e) => {
      const newLang = (e && e.detail && e.detail.lang) || getStoredLang();
      if (newLang && newLang !== lang) setLang(newLang);
    };
    window.addEventListener('langChange', handler);
    return () => window.removeEventListener('langChange', handler);
  }, [lang]);

  const translate = (key) => t(key, lang);
  return { lang, setLang, t: translate };
}

export default { t, getStoredLang, setStoredLang, useTranslation };
