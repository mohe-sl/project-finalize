import mongoose from "mongoose";

const projectProgressSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  progressName: String,
  mainObjective: String,
  location: String,
  totalCostOriginal: Number,
  totalCostCurrent: Number,
  awardedAmount: Number,
  revisedEndDate: Date,
  fundingSource: String,

  // Physical progress - Enhanced for government-style format
  overallTarget: String,
  progressAsOfPrevDecPercentage: Number,

  // Target Year/Month Selection
  targetYear: { type: Number, default: () => new Date().getFullYear() },
  targetMonth: String,
  progressDate: Date,

  currentYearDescriptiveTarget: String,
  quarter1TargetPercentage: Number,
  quarter2TargetPercentage: Number,
  quarter3TargetPercentage: Number,
  quarter4TargetPercentage: Number,
  yearEndProgressDescription: String,
  yearEndProgressPercentage: Number,
  cumulativeTargetAtYearEnd: String,
  cumulativeProgressDescriptionAtYearEnd: String,
  cumulativeProgressPercentageOfOverallTarget: Number,
  physicalProgressImage1: String,
  physicalProgressImage2: String,
  physicalProgressImage3: String,
  physicalTargetFailureReasons: String,
  contractors: String,
  consultants: String,


  // Financial progress
  allocationCurrentYear: Number,
  expenditureTarget: Number,
  imprestRequested: Number,
  imprestReceived: Number,
  actualExpenditure: Number,
  billsInHand: Number,
  priceEscalation: Number,
  cumulativeExpenditureAtYearEnd: Number,
  financialTargetFailureReasons: String,

  // Status tracking
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
}, { timestamps: true });

export default mongoose.model("ProjectProgress", projectProgressSchema);
