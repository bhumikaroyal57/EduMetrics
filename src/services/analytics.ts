/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Subject, Mark, StudentSummary, SubjectSummary, SectionSummary, GradeRule, DistributionBucket } from '../types';

export const GRADE_RULES: GradeRule[] = [
  { min_percentage: 90, grade: 'A+', gpa: 4.0, description: 'Outstanding', color: 'text-emerald-700 bg-emerald-50' },
  { min_percentage: 80, grade: 'A', gpa: 3.7, description: 'Excellent', color: 'text-emerald-600 bg-emerald-50/70' },
  { min_percentage: 70, grade: 'B+', gpa: 3.3, description: 'Very Good', color: 'text-blue-700 bg-blue-50' },
  { min_percentage: 60, grade: 'B', gpa: 3.0, description: 'Good', color: 'text-sky-700 bg-sky-50' },
  { min_percentage: 50, grade: 'C', gpa: 2.0, description: 'Average', color: 'text-amber-700 bg-amber-50' },
  { min_percentage: 40, grade: 'D', gpa: 1.0, description: 'Marginal Pass', color: 'text-orange-700 bg-orange-50' },
  { min_percentage: 0, grade: 'F', gpa: 0.0, description: 'Fail / Needs Support', color: 'text-rose-700 bg-rose-50' },
];

export function getGradeDetails(percentage: number): GradeRule {
  const rounded = Math.round(percentage * 100) / 100;
  for (const rule of GRADE_RULES) {
    if (rounded >= rule.min_percentage) {
      return rule;
    }
  }
  return GRADE_RULES[GRADE_RULES.length - 1];
}

// ==========================================
// NumPy Mathematical & Statistical Primitives
// ==========================================

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  }
  return Math.round(sorted[mid] * 100) / 100;
}

export function calculateMin(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

export function calculateMax(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function calculateStdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

export function calculatePercentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 100) / 100;
}

// ==========================================
// Student Summaries & Aggregation Engine
// ==========================================

export function computeStudentSummaries(
  students: Student[],
  subjects: Subject[],
  marks: Mark[],
  selectedAssessment: string = 'All',
  selectedSection: string = 'All'
): StudentSummary[] {
  const filteredStudents = selectedSection === 'All' 
    ? students 
    : students.filter(s => s.section.toUpperCase() === selectedSection.toUpperCase());

  const subjectMap = new Map<number, Subject>(subjects.map(s => [s.subject_id, s]));

  // Calculate student metrics
  const summaries: StudentSummary[] = filteredStudents.map(student => {
    // Filter marks for student
    const studentMarks = marks.filter(m => {
      if (m.student_id !== student.student_id) return false;
      if (selectedAssessment !== 'All' && m.assessment.toLowerCase() !== selectedAssessment.toLowerCase()) {
        return false;
      }
      return true;
    });

    // If assessment is 'All', aggregate across assessments (average mark per subject) or sum
    // Let's organize marks by subject
    const subjectMarksRecord: Record<number, { sumObtained: number; count: number }> = {};
    studentMarks.forEach(m => {
      if (!subjectMarksRecord[m.subject_id]) {
        subjectMarksRecord[m.subject_id] = { sumObtained: 0, count: 0 };
      }
      subjectMarksRecord[m.subject_id].sumObtained += m.marks_obtained;
      subjectMarksRecord[m.subject_id].count += 1;
    });

    let totalObtained = 0;
    let totalMax = 0;
    const failedSubjects: StudentSummary['failed_subjects'] = [];
    const subjectDetailRecord: StudentSummary['subject_marks'] = {};

    subjects.forEach(subject => {
      const entry = subjectMarksRecord[subject.subject_id];
      if (entry && entry.count > 0) {
        // Average score for this subject across selected assessments
        const score = Math.round((entry.sumObtained / entry.count) * 10) / 10;
        const isPass = score >= subject.pass_marks;
        const pct = Math.round((score / subject.max_marks) * 1000) / 10;

        totalObtained += score;
        totalMax += subject.max_marks;

        subjectDetailRecord[subject.subject_id] = {
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          max_marks: subject.max_marks,
          pass_marks: subject.pass_marks,
          marks_obtained: score,
          is_pass: isPass,
          percentage: pct,
        };

        if (!isPass) {
          failedSubjects.push({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            marks: score,
            pass_marks: subject.pass_marks,
            deficit: Math.round((subject.pass_marks - score) * 10) / 10,
          });
        }
      }
    });

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    const gradeInfo = getGradeDetails(percentage);
    // Student passes if overall >= 40 AND 0 failed subjects
    const isPass = totalMax > 0 && percentage >= 40 && failedSubjects.length === 0;

    return {
      student_id: student.student_id,
      roll_no: student.roll_no,
      name: student.name,
      section: student.section,
      total_obtained: Math.round(totalObtained * 10) / 10,
      total_max: totalMax,
      percentage,
      grade: gradeInfo.grade,
      gpa: gradeInfo.gpa,
      grade_color: gradeInfo.color,
      is_pass: isPass,
      failed_subject_count: failedSubjects.length,
      failed_subjects: failedSubjects,
      subject_marks: subjectDetailRecord,
    };
  });

  // Calculate ranks
  // Overall class rank
  const sortedOverall = [...summaries].sort((a, b) => b.percentage - a.percentage);
  sortedOverall.forEach((item, index) => {
    item.rank_in_class = index + 1;
  });

  // Section rank
  const sectionGroups: Record<string, StudentSummary[]> = {};
  summaries.forEach(s => {
    if (!sectionGroups[s.section]) sectionGroups[s.section] = [];
    sectionGroups[s.section].push(s);
  });

  Object.values(sectionGroups).forEach(group => {
    group.sort((a, b) => b.percentage - a.percentage);
    group.forEach((item, index) => {
      item.rank_in_section = index + 1;
    });
  });

  return summaries;
}

// ==========================================
// Pandas GroupBy Subject Summary
// Equivalent to: df.groupby('subject_name').agg(...)
// ==========================================

export function computeSubjectSummaries(
  subjects: Subject[],
  marks: Mark[],
  students: Student[],
  selectedAssessment: string = 'All',
  selectedSection: string = 'All'
): SubjectSummary[] {
  const studentMap = new Map(students.map(s => [s.student_id, s]));

  return subjects.map(subject => {
    // Filter marks for this subject
    const subjectMarks = marks.filter(m => {
      if (m.subject_id !== subject.subject_id) return false;
      if (selectedAssessment !== 'All' && m.assessment.toLowerCase() !== selectedAssessment.toLowerCase()) {
        return false;
      }
      if (selectedSection !== 'All') {
        const student = studentMap.get(m.student_id);
        if (!student || student.section.toUpperCase() !== selectedSection.toUpperCase()) {
          return false;
        }
      }
      return true;
    });

    const values = subjectMarks.map(m => m.marks_obtained);
    const passed = subjectMarks.filter(m => m.marks_obtained >= subject.pass_marks);
    const failed = subjectMarks.filter(m => m.marks_obtained < subject.pass_marks);

    // Identify highest and lowest scorer
    let highestScorer: SubjectSummary['highest_scorer'] = undefined;
    let lowestScorer: SubjectSummary['lowest_scorer'] = undefined;

    if (subjectMarks.length > 0) {
      const sorted = [...subjectMarks].sort((a, b) => b.marks_obtained - a.marks_obtained);
      const topMark = sorted[0];
      const lowMark = sorted[sorted.length - 1];
      const topStudent = studentMap.get(topMark.student_id);
      const lowStudent = studentMap.get(lowMark.student_id);

      if (topStudent) {
        highestScorer = { name: topStudent.name, roll_no: topStudent.roll_no, marks: topMark.marks_obtained };
      }
      if (lowStudent) {
        lowestScorer = { name: lowStudent.name, roll_no: lowStudent.roll_no, marks: lowMark.marks_obtained };
      }
    }

    const passPct = values.length > 0 ? Math.round((passed.length / values.length) * 1000) / 10 : 0;

    return {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      max_marks: subject.max_marks,
      pass_marks: subject.pass_marks,
      total_appeared: values.length,
      passed_count: passed.length,
      failed_count: failed.length,
      pass_percentage: passPct,
      mean: calculateMean(values),
      median: calculateMedian(values),
      min: calculateMin(values),
      max: calculateMax(values),
      std_dev: calculateStdDev(values),
      q1: calculatePercentile(values, 25),
      q3: calculatePercentile(values, 75),
      highest_scorer: highestScorer,
      lowest_scorer: lowestScorer,
    };
  });
}

// ==========================================
// Pandas GroupBy Section Summary
// Equivalent to: df.groupby('section').agg(...)
// ==========================================

export function computeSectionSummaries(
  studentSummaries: StudentSummary[]
): SectionSummary[] {
  const sections = Array.from(new Set(studentSummaries.map(s => s.section))).sort();

  return sections.map(section => {
    const list = studentSummaries.filter(s => s.section === section);
    const passed = list.filter(s => s.is_pass);
    const failed = list.filter(s => !s.is_pass);
    const avgPct = list.length > 0 ? calculateMean(list.map(s => s.percentage)) : 0;
    const passPct = list.length > 0 ? Math.round((passed.length / list.length) * 1000) / 10 : 0;

    const sortedByScore = [...list].sort((a, b) => b.percentage - a.percentage);
    const topper = sortedByScore[0];

    return {
      section,
      student_count: list.length,
      avg_percentage: avgPct,
      passed_count: passed.length,
      failed_count: failed.length,
      pass_percentage: passPct,
      topper_name: topper?.name || 'N/A',
      topper_percentage: topper?.percentage || 0,
    };
  });
}

// ==========================================
// Toppers & At-Risk Filters
// ==========================================

export function getToppers(summaries: StudentSummary[], count: number = 5): StudentSummary[] {
  return [...summaries]
    .filter(s => s.is_pass)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, count);
}

export function getStudentsAtRisk(
  summaries: StudentSummary[],
  thresholdPercentage: number = 50,
  includeSubjectFailures: boolean = true
): {
  student: StudentSummary;
  reason: string;
  severity: 'Critical' | 'Moderate' | 'Watchlist';
  recommendations: string[];
}[] {
  const atRiskList: {
    student: StudentSummary;
    reason: string;
    severity: 'Critical' | 'Moderate' | 'Watchlist';
    recommendations: string[];
  }[] = [];

  summaries.forEach(s => {
    const isBelowThreshold = s.percentage < thresholdPercentage;
    const hasFailedSubjects = s.failed_subject_count > 0;

    if (isBelowThreshold || (includeSubjectFailures && hasFailedSubjects)) {
      let severity: 'Critical' | 'Moderate' | 'Watchlist' = 'Watchlist';
      const reasons: string[] = [];
      const recs: string[] = [];

      if (s.percentage < 40 || s.failed_subject_count >= 2) {
        severity = 'Critical';
      } else if (s.failed_subject_count === 1 || s.percentage < 50) {
        severity = 'Moderate';
      }

      if (hasFailedSubjects) {
        const failedNames = s.failed_subjects.map(f => `${f.subject_name} (${f.marks}/${f.pass_marks})`).join(', ');
        reasons.push(`Fell below pass mark in ${s.failed_subject_count} subject(s): ${failedNames}`);
        recs.push(`Assign remedial tutoring sessions and review worksheets for ${s.failed_subjects.map(f => f.subject_name).join(', ')}.`);
        recs.push(`Schedule re-assessment or makeup evaluation once foundational gaps are addressed.`);
      }

      if (isBelowThreshold) {
        reasons.push(`Overall percentage (${s.percentage}%) is below configured benchmark threshold of ${thresholdPercentage}%.`);
        recs.push(`Conduct 1-on-1 academic mentoring session to review study schedule and exam preparation strategy.`);
      }

      if (recs.length === 0) {
        recs.push('Monitor upcoming quizzes and periodic homework submissions.');
      }

      atRiskList.push({
        student: s,
        reason: reasons.join(' · '),
        severity,
        recommendations: recs,
      });
    }
  });

  // Sort: Critical first, then by percentage ascending (lowest first)
  const severityOrder = { Critical: 0, Moderate: 1, Watchlist: 2 };
  return atRiskList.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.student.percentage - b.student.percentage;
  });
}

// ==========================================
// Marks Distribution Histogram
// ==========================================


export function computeMarksDistribution(values: number[]): DistributionBucket[] {
  const buckets: DistributionBucket[] = [
    { rangeLabel: '0 - 39 (Fail)', min: 0, max: 39.99, count: 0, percentage: 0 },
    { rangeLabel: '40 - 59 (Pass/Avg)', min: 40, max: 59.99, count: 0, percentage: 0 },
    { rangeLabel: '60 - 74 (Good)', min: 60, max: 74.99, count: 0, percentage: 0 },
    { rangeLabel: '75 - 89 (Distinction)', min: 75, max: 89.99, count: 0, percentage: 0 },
    { rangeLabel: '90 - 100 (Excellence)', min: 90, max: 100, count: 0, percentage: 0 },
  ];

  if (values.length === 0) return buckets;

  values.forEach(v => {
    for (const b of buckets) {
      if (v >= b.min && v <= b.max) {
        b.count += 1;
        break;
      }
    }
  });

  buckets.forEach(b => {
    b.percentage = Math.round((b.count / values.length) * 1000) / 10;
  });

  return buckets;
}
