/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Subject, Mark, StudentSummary, ActiveTab } from '../types';
import {
  computeStudentSummaries,
  computeSubjectSummaries,
  computeSectionSummaries,
  computeMarksDistribution,
  getToppers,
  getStudentsAtRisk,
} from '../services/analytics';
import {
  SubjectAveragesBarChart,
  SubjectPassRateBarChart,
  MarksDistributionHistogram,
  SectionComparisonChart,
} from './Charts';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  GraduationCap,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';

interface DashboardOverviewProps {
  students: Student[];
  subjects: Subject[];
  marks: Mark[];
  onNavigateTab: (tab: ActiveTab) => void;
  onViewReportCard: (studentId: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  subjects,
  marks,
  onNavigateTab,
  onViewReportCard,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Compute analytics
  const studentSummaries = computeStudentSummaries(
    students,
    subjects,
    marks,
    selectedAssessment,
    selectedSection
  );

  const subjectSummaries = computeSubjectSummaries(
    subjects,
    marks,
    students,
    selectedAssessment,
    selectedSection
  );

  const sectionSummaries = computeSectionSummaries(studentSummaries);

  const allMarkValues = marks
    .filter(m => {
      if (selectedAssessment !== 'All' && m.assessment.toLowerCase() !== selectedAssessment.toLowerCase()) return false;
      if (selectedSection !== 'All') {
        const student = students.find(s => s.student_id === m.student_id);
        if (!student || student.section.toUpperCase() !== selectedSection.toUpperCase()) return false;
      }
      return true;
    })
    .map(m => m.marks_obtained);

  const distributionBuckets = computeMarksDistribution(allMarkValues);
  const toppers = getToppers(studentSummaries, 3);
  const atRiskList = getStudentsAtRisk(studentSummaries, 50, true);

  // Overall Class KPI Metrics
  const totalStudentsCount = studentSummaries.length;
  const passedStudentsCount = studentSummaries.filter(s => s.is_pass).length;
  const overallPassRate = totalStudentsCount > 0 ? Math.round((passedStudentsCount / totalStudentsCount) * 1000) / 10 : 0;
  const classAvgPercentage = totalStudentsCount > 0
    ? Math.round((studentSummaries.reduce((a, s) => a + s.percentage, 0) / totalStudentsCount) * 10) / 10
    : 0;
  const topStudent = toppers[0];

  return (
    <div className="space-y-6">
      {/* Viewport Header & Global Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Academic Performance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional overview of student evaluation, marks distribution, and subject outcomes.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 pl-2">Assessment:</span>
            <select
              value={selectedAssessment}
              onChange={e => setSelectedAssessment(e.target.value)}
              className="text-xs border-0 bg-slate-50 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-0 cursor-pointer"
            >
              <option value="All">All Exams (Midterm + Final)</option>
              <option value="Midterm">Midterm Exam Only</option>
              <option value="Final">Final Exam Only</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200"></div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Section:</span>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="text-xs border-0 bg-slate-50 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-0 cursor-pointer"
            >
              <option value="All">All Sections (A, B, C)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Enrolled */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Students Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalStudentsCount}
            </div>
            <span className="text-[11px] text-slate-500">
              Active in academic roster
            </span>
          </div>
        </div>

        {/* Card 2: Class Average */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Class Average</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
              {classAvgPercentage}%
            </div>
            <span className="text-[11px] text-slate-500">
              Mean score across subjects
            </span>
          </div>
        </div>

        {/* Card 3: Pass Rate */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Overall Pass Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {overallPassRate}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {passedStudentsCount} passed of {totalStudentsCount}
            </span>
          </div>
        </div>

        {/* Card 4: Top Achiever */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Class Valedictorian</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 truncate">
            <div className="text-base font-bold text-slate-900 truncate">
              {topStudent ? topStudent.name : 'N/A'}
            </div>
            <span className="text-[11px] font-mono text-amber-700 font-semibold tabular-nums">
              {topStudent ? `${topStudent.percentage}% (${topStudent.grade})` : '—'}
            </span>
          </div>
        </div>

        {/* Card 5: Students At-Risk */}
        <div
          onClick={() => onNavigateTab('at-risk')}
          className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-colors ${
            atRiskList.length > 0
              ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold">Academic Support</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {atRiskList.length}
            </div>
            <span className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
              <span>View diagnostics</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Averages */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject-Wise Performance (Mean vs Median)</h2>
              <p className="text-xs text-slate-500">Comparing central tendencies with the 40-mark pass benchmark.</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <SubjectAveragesBarChart data={subjectSummaries} />
        </div>

        {/* Subject Pass Percentages */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject Pass Percentages (%)</h2>
              <p className="text-xs text-slate-500">Proportion of students satisfying passing threshold per discipline.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Benchmark: 100%</span>
          </div>
          <SubjectPassRateBarChart data={subjectSummaries} />
        </div>
      </div>

      {/* Secondary Charts: Score Distribution & Section Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marks Histogram */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs lg:col-span-1">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">Marks Distribution</h2>
            <p className="text-xs text-slate-500">Distribution histogram of all individual assessment marks.</p>
          </div>
          <MarksDistributionHistogram data={distributionBuckets} />
        </div>

        {/* Section Comparison */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900">Class Section Summaries (A vs B vs C)</h2>
            <p className="text-xs text-slate-500">Comparative average percentage, pass rate, and section toppers.</p>
          </div>
          <SectionComparisonChart data={sectionSummaries} />
        </div>
      </div>

      {/* Bottom Quick Look: Toppers & At-Risk Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Achievers */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Top Performing Achievers</h3>
            </div>
            <button
              onClick={() => onNavigateTab('toppers')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
            >
              View All Toppers &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {toppers.map((student, idx) => (
              <div key={student.student_id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {student.roll_no} · Sec {student.section}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                    {student.percentage}%
                  </span>
                  <button
                    onClick={() => onViewReportCard(student.student_id)}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Academic Support Notice */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Students Needing Academic Support</h3>
            </div>
            <button
              onClick={() => onNavigateTab('at-risk')}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer"
            >
              Open Support Console &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {atRiskList.slice(0, 3).map(({ student, reason, severity }) => (
              <div key={student.student_id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{student.name}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded text-rose-700 bg-rose-50">
                      {severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {reason}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-mono font-bold text-xs text-rose-700 tabular-nums">
                    {student.percentage}%
                  </span>
                  <button
                    onClick={() => onViewReportCard(student.student_id)}
                    className="text-xs text-slate-600 hover:text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
