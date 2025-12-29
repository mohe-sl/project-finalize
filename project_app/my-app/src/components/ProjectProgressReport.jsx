import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register custom font
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: '2pt solid #1e3a8a',
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  summaryCard: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1pt solid #e2e8f0',
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '0.5pt solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 10,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  fullWidthItem: {
    width: '100%',
    marginBottom: 10,
  },
  imageSection: {
    marginTop: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
  },
  progressImage: {
    width: '32%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  imageLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '0.5pt solid #e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#94a3b8',
  },
});

const API_BASE = "http://localhost:5000";

const DetailField = ({ label, value, fullWidth = false }) => (
  <View style={fullWidth ? styles.fullWidthItem : styles.gridItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const ProjectProgressReport = ({ project, progress }) => {
  const formatLKR = (val) => {
    if (val === null || val === undefined || val === '') return 'LKR 0';
    return `LKR ${Number(val).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Fallback for month/year if not provided in progress object
  const reportDate = progress.createdAt ? new Date(progress.createdAt) : new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const reportMonth = progress.month || months[reportDate.getMonth()];
  const reportYear = progress.year || reportDate.getFullYear();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Project Progress Report</Text>
          <Text style={styles.subtitle}>{project.projectName}</Text>
          <Text style={styles.subtitle}>{project.institution} | {project.location}</Text>
          <Text style={[styles.subtitle, { fontSize: 10, marginTop: 5 }]}>
            Report Generated on: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Report Period</Text>
            <Text style={styles.summaryValue}>{reportMonth} {reportYear}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Physical Progress</Text>
            <Text style={styles.summaryValue}>{progress.yearEndProgressPercentage || 0}%</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Actual Expenditure</Text>
            <Text style={styles.summaryValue}>{formatLKR(progress.actualExpenditure)}</Text>
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.grid}>
            <DetailField label="Progress No" value={progress.progressNo} />
            <DetailField label="Location" value={progress.location} />
            <DetailField label="Main Objective" value={progress.mainObjective} fullWidth />
            <DetailField label="Total Cost (Original)" value={formatLKR(progress.totalCostOriginal)} />
            <DetailField label="Total Cost (Current)" value={formatLKR(progress.totalCostCurrent)} />
            <DetailField label="Awarded Amount" value={formatLKR(progress.awardedAmount)} />
            <DetailField label="Revised End Date" value={formatDate(progress.revisedEndDate)} />
            <DetailField label="Funding Source" value={progress.fundingSource} />
          </View>
        </View>

        {/* Physical Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Progress</Text>
          <View style={styles.grid}>
            <DetailField label="Overall Target" value={progress.overallTarget} />
            <DetailField label="Current Year Target" value={progress.currentYearDescriptiveTarget} />
            <DetailField label="Q1 (%)" value={progress.quarter1TargetPercentage ? `${progress.quarter1TargetPercentage}%` : '0%'} />
            <DetailField label="Q2 (%)" value={progress.quarter2TargetPercentage ? `${progress.quarter2TargetPercentage}%` : '0%'} />
            <DetailField label="Q3 (%)" value={progress.quarter3TargetPercentage ? `${progress.quarter3TargetPercentage}%` : '0%'} />
            <DetailField label="Q4 (%)" value={progress.quarter4TargetPercentage ? `${progress.quarter4TargetPercentage}%` : '0%'} />
            <DetailField label="Year End Progress Description" value={progress.yearEndProgressDescription} fullWidth />
            <DetailField label="Contractors" value={progress.contractors} />
            <DetailField label="Consultants" value={progress.consultants} />
          </View>

          {/* Images */}
          {(progress.physicalProgressImage1 || progress.physicalProgressImage2 || progress.physicalProgressImage3) && (
            <View style={styles.imageSection}>
              <Text style={[styles.label, { marginBottom: 8 }]}>Progress Documentation (Images)</Text>
              <View style={styles.imageRow}>
                {progress.physicalProgressImage1 && (
                  <View style={{ width: '32%' }}>
                    <Image src={`${API_BASE}/api/uploads/${progress.physicalProgressImage1}`} style={styles.progressImage} />
                    <Text style={styles.imageLabel}>Image 1</Text>
                  </View>
                )}
                {progress.physicalProgressImage2 && (
                  <View style={{ width: '32%' }}>
                    <Image src={`${API_BASE}/api/uploads/${progress.physicalProgressImage2}`} style={styles.progressImage} />
                    <Text style={styles.imageLabel}>Image 2</Text>
                  </View>
                )}
                {progress.physicalProgressImage3 && (
                  <View style={{ width: '32%' }}>
                    <Image src={`${API_BASE}/api/uploads/${progress.physicalProgressImage3}`} style={styles.progressImage} />
                    <Text style={styles.imageLabel}>Image 3</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Financial Progress Section */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Financial Progress</Text>
          <View style={styles.grid}>
            <DetailField label="Allocation (Current Year)" value={formatLKR(progress.allocationCurrentYear)} />
            <DetailField label="Expenditure Target" value={formatLKR(progress.expenditureTarget)} />
            <DetailField label="Imprest Requested" value={formatLKR(progress.imprestRequested)} />
            <DetailField label="Imprest Received" value={formatLKR(progress.imprestReceived)} />
            <DetailField label="Actual Expenditure" value={formatLKR(progress.actualExpenditure)} />
            <DetailField label="Bills in Hand" value={formatLKR(progress.billsInHand)} />
            <DetailField label="Price Escalation" value={formatLKR(progress.priceEscalation)} />
            <DetailField label="Cumulative Expenditure" value={formatLKR(progress.cumulativeExpenditureAtYearEnd)} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Ministry of Higher Education - Project Monitoring System
          </Text>
          <Text style={styles.footerText}>
            This is an official progress report for {project.projectName}
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ProjectProgressReport;