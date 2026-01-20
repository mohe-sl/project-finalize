import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },

  // Department Information
  departmentType: { type: String, enum: ['Local', 'Foreign', 'Grant'], default: 'Local' },
  departmentCategory: { type: String, enum: ['GOSL', 'MOHE'] },
  institution: { type: String },
  department: { type: String },

  // Duration (Date Range)
  durationStart: { type: Date },
  durationEnd: { type: Date },

  // Financial Information
  tec: { type: Number },
  tecCurrency: { type: String, default: 'LKR' },
  awardedAmount: { type: Number },
  revisedDate: { type: Date },

  // Timeline
  startDate: { type: Date, required: true },
  estimatedEndDate: { type: Date, required: true },
  projectExtended: { type: String, enum: ['Yes', 'No'], default: 'No' },
  extendedDate: { type: Date },
  extensionPDF: { type: String },

  // Return Periods (Date Range)
  returnPeriodsStart: { type: Date },
  returnPeriodsEnd: { type: Date },

  // Funding & Location
  fundingSource: { type: String },
  capitalWorks: { type: Boolean, default: false },
  location: { type: String },
  landLocation: { type: String },
  responsibleDept: { type: String },

  // Media & Documents
  projectImage: { type: String },
  projectPDF: { type: String },

  // Cabinet Information
  npdDate: { type: Date },
  cabinetPapersNo: { type: String },
  cabinetPapersDate: { type: Date },

  // Remarks
  remarks: { type: String },

  // Legacy fields (keeping for compatibility)
  description: { type: String },
  budget: { type: Number },
  fundingScore: { type: Number },
  endDate: { type: Date },
  image: { type: String },

  // Draft status
  isDraft: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
