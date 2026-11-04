/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentSummary, Subject } from '../types';
import { getStudentsAtRisk } from '../services/analytics';
import { AlertTriangle, Sliders, FileText, CheckCircle2, Download, ShieldAlert } from 'lucide-react';

interface AtRiskViewProps {
  summaries: StudentSummary[];
  subjects: Subject[];
  onViewReportCard: (studentId: number) => void;
}

export const AtRiskView: React.FC<AtRiskViewProps> = ({
  summaries,
  subjects,
  onViewReportCard,
}) => {
  const [threshold, setThreshold] = useState<number>(50);
  const [includeSubjectFailures, setIncludeSubjectFailures] = useState<boolean>(true);
  const [sectionFilter, setSectionFilter] = useState<string>('All');

  const filteredSummaries = sectionFilter === 'All'
    ? summaries
    : summaries.filter(s => s.section === sectionFilter);

  const atRiskStudents = getStudentsAtRisk(filteredSummaries, threshold, includeSubjectFailures);

  const handleExportList = () => {
    const headers = ['Roll No', 'Name', 'Section', 'Overall %', 'Grade', 'Severity', 'Failed Subjects Count', 'Deficiencies'];
    const rows = atRiskStudents.map(item => [
      item.student.roll_no,
      `"${item.student.name}"`,
      item.student.section,
      `${item.student.percentage}%`,
      item.student.grade,
      item.severity,
      item.student.failed_subject_count,
      `"${item.reason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `academic_support_at_risk_threshold_${threshold}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Support & At-Risk Diagnostic</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify low-performing students and specific subject deficiencies to deploy early remedial interventions.
          </p>
        </div>

        <button
          onClick={handleExportList}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Intervention List (CSV)</span>
        </button>
      </div>

      {/* Configurable Parameters Toolbar */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 border-b border-slate-100 pb-2">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span>Configurable Alert Thresholds & Criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Threshold Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700">Minimum Performance Benchmark:</span>
              <span className="font-mono font-bold text-rose-600 tabular-nums text-sm bg-rose-50 px-2 py-0.5 rounded">
                &lt; {threshold}%
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="75"
              step="5"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>35% (Marginal)</span>
              <span>50% (Standard)</span>
              <span>75% (Strict)</span>
            </div>
          </div>

          {/* Subject Failure Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeFailures"
              checked={includeSubjectFailures}
              onChange={e => setIncludeSubjectFailures(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="includeFailures" className="text-xs text-slate-700 cursor-pointer leading-tight">
              <span className="font-medium block">Flag individual subject failures</span>
              <span className="text-[11px] text-slate-500">Include students who failed &ge; 1 subject regardless of average %</span>
            </label>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Filter Section:</span>
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="All">All Sections (A, B, C)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Alert Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Students Requiring Support</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {atRiskStudents.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              of {filteredSummaries.length} ({filteredSummaries.length > 0 ? Math.round((atRiskStudents.length / filteredSummaries.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/20">
          <span className="text-xs text-rose-700 font-medium">Critical Intervention Required</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {atRiskStudents.filter(s => s.severity === 'Critical').length}
            </span>
            <span className="text-xs text-rose-600 font-mono">
              (&lt; 40% or &ge; 2 failed subjects)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/20">
          <span className="text-xs text-amber-800 font-medium">Moderate / Watchlist</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {atRiskStudents.filter(s => s.severity !== 'Critical').length}
            </span>
            <span className="text-xs text-amber-600 font-mono">
              (Single subject deficit or borderline)
            </span>
          </div>
        </div>
      </div>

      {/* Student Diagnostic Cards */}
      <div className="space-y-4">
        {atRiskStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No Students Below Threshold</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              All students meet or exceed the current benchmark threshold of {threshold}% with no subject failures.
            </p>
          </div>
        ) : (
          atRiskStudents.map(({ student, reason, severity, recommendations }) => (
            <div
              key={student.student_id}
              className={`p-5 bg-white rounded-xl border transition-all ${
                severity === 'Critical'
                  ? 'border-rose-300 shadow-xs'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      severity === 'Critical'
                        ? 'bg-rose-600'
                        : severity === 'Moderate'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{student.name}</span>
                      <span className="text-xs font-mono text-slate-500 font-semibold">{student.roll_no}</span>
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        Sec {student.section}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Aggregate Score:</span>
                    <span className="font-mono font-bold text-slate-900 ml-1.5 tabular-nums">
                      {student.percentage}% (Grade {student.grade})
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                      severity === 'Critical'
                        ? 'text-rose-700 bg-rose-100'
                        : severity === 'Moderate'
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-blue-800 bg-blue-100'
                    }`}
                  >
                    {severity.toUpperCase()}
                  </span>

                  <button
                    onClick={() => onViewReportCard(student.student_id)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    title="View Student Report Card"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="pt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Diagnostic Alert: </span>
                  <span className="text-slate-800 font-medium">{reason}</span>
                </div>

                {/* Specific Failed Subjects Chips */}
                {student.failed_subjects.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Deficient Subjects:</span>
                    {student.failed_subjects.map(f => (
                      <span
                        key={`fail-${student.student_id}-${f.subject_id}`}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        <span>{f.subject_name}</span>
                        <span className="font-normal text-rose-500">
                          ({f.marks} / {f.pass_marks}, deficit -{f.deficit})
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Remedial Recommendations */}
                <div className="pt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Recommended Interventions:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-xs">
                    {recommendations.map((rec, i) => (
                      <li key={`rec-${student.student_id}-${i}`}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
