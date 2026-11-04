/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  student_id: number;
  roll_no: string;
  name: string;
  section: string;
  email?: string;
  enrolled_date?: string;
}

export interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  max_marks: number;
  pass_marks: number;
}

export interface Mark {
  mark_id: number;
  student_id: number;
  subject_id: number;
  assessment: string; // e.g., 'Midterm', 'Final', 'Quiz 1', 'Assignment'
  marks_obtained: number;
  date_recorded?: string;
}

export interface SubjectMarkDetail {
  subject_id: number;
  subject_name: string;
  max_marks: number;
  pass_marks: number;
  marks_obtained: number;
  is_pass: boolean;
  percentage: number;
}

export interface StudentSummary {
  student_id: number;
  roll_no: string;
  name: string;
  section: string;
  total_obtained: number;
  total_max: number;
  percentage: number;
  grade: string;
  gpa: number;
  grade_color: string;
  is_pass: boolean;
  failed_subject_count: number;
  failed_subjects: { subject_id: number; subject_name: string; marks: number; pass_marks: number; deficit: number }[];
  subject_marks: Record<number, SubjectMarkDetail>;
  rank_in_class?: number;
  rank_in_section?: number;
}

export interface SubjectSummary {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  max_marks: number;
  pass_marks: number;
  total_appeared: number;
  passed_count: number;
  failed_count: number;
  pass_percentage: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  std_dev: number;
  q1: number;
  q3: number;
  highest_scorer?: { name: string; roll_no: string; marks: number };
  lowest_scorer?: { name: string; roll_no: string; marks: number };
}

export interface SectionSummary {
  section: string;
  student_count: number;
  avg_percentage: number;
  passed_count: number;
  failed_count: number;
  pass_percentage: number;
  topper_name: string;
  topper_percentage: number;
}

export interface GradeRule {
  min_percentage: number;
  grade: string;
  gpa: number;
  description: string;
  color: string;
}

export interface DistributionBucket {
  rangeLabel: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export type ActiveTab = 'dashboard' | 'students' | 'subjects' | 'marks' | 'analytics' | 'toppers' | 'at-risk' | 'sql-console';
