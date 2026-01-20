import React from 'react';

const API_URL = "http://localhost:5000/api";

const ProjectDetailsModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {project.projectName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* Top Banner / Basic Info */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            {project.projectImage || project.image ? (
                                <img
                                    src={`${API_URL}${project.projectImage || project.image}`}
                                    alt={project.projectName}
                                    className="w-full h-48 object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="text-4xl">🏗️</span>
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-2/3 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Institution" value={project.institution} />
                                <DetailItem label="Department" value={project.department} />
                                <DetailItem label="Dept. Type" value={project.departmentType} />
                                <DetailItem label="Category" value={project.departmentCategory} />
                                <DetailItem label="Location" value={project.location} />
                                <DetailItem label="Status" value={project.isDraft ? "Draft" : "Published"} badge={project.isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} />
                            </div>
                        </div>
                    </div>

                    <Section title="Financial & Timeline">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem label="Total Estimated Cost" value={`${project.tecCurrency || 'LKR'} ${project.tec ? project.tec.toLocaleString() : '0'}`} />
                            <DetailItem label="Awarded Amount" value={`${project.tecCurrency || 'LKR'} ${project.awardedAmount ? project.awardedAmount.toLocaleString() : '0'}`} />
                            <DetailItem label="Funding Source" value={project.fundingSource} />

                            <DetailItem label="Start Date" value={formatDate(project.startDate)} />
                            <DetailItem label="Est. End Date" value={formatDate(project.estimatedEndDate)} />
                            <DetailItem label="Duration" value={`${formatDate(project.durationStart)} - ${formatDate(project.durationEnd)}`} />
                        </div>
                    </Section>

                    {(project.projectExtended === 'Yes' || project.revisedDate) && (
                        <Section title="Extensions & Revisions">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {project.projectExtended === 'Yes' && (
                                    <>
                                        <DetailItem label="Extended" value="Yes" badge="bg-orange-100 text-orange-800" />
                                        <DetailItem label="Extended Date" value={formatDate(project.extendedDate)} />
                                        {project.extensionPDF && (
                                            <div className="col-span-full">
                                                <a href={`${API_URL}${project.extensionPDF}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                                    📄 View Extension PDF
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                                {project.revisedDate && <DetailItem label="Revised Date" value={formatDate(project.revisedDate)} />}
                            </div>
                        </Section>
                    )}

                    <Section title="Additional Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Responsible Dept" value={project.responsibleDept} />
                            <DetailItem label="Land Location" value={project.landLocation} />
                            <DetailItem label="Univeristy/Institute" value={project.institution} />
                            <DetailItem label="Capital Works" value={project.capitalWorks ? "Yes" : "No"} />
                        </div>
                    </Section>

                    {project.remarks && (
                        <Section title="Remarks">
                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                                {project.remarks}
                            </p>
                        </Section>
                    )}

                    {(project.projectPDF || project.cabinetPapersNo) && (
                        <Section title="Documents & Cabinet Info">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {project.projectPDF && (
                                    <a href={`${API_URL}${project.projectPDF}`} target="_blank" rel="noopener noreferrer" className="p-4 border rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-blue-700">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                                        <span className="font-semibold">Project Document</span>
                                    </a>
                                )}
                                <div className="space-y-2">
                                    <DetailItem label="Cabinet Papers No" value={project.cabinetPapersNo} />
                                    <DetailItem label="Cabinet Papers Date" value={formatDate(project.cabinetPapersDate)} />
                                    <DetailItem label="NPD Date" value={formatDate(project.npdDate)} />
                                </div>
                            </div>
                        </Section>
                    )}

                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem = ({ label, value, badge }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {badge ? (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
                {value}
            </span>
        ) : (
            <p className="text-gray-800 font-medium">{value || '-'}</p>
        )}
    </div>
);

const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
};

export default ProjectDetailsModal;
