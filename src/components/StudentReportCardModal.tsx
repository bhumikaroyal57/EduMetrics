/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentSummary, Subject } from '../types';
import { Printer, X, CheckCircle, AlertCircle, Award } from 'lucide-react';

interface StudentReportCardModalProps {
  summary: StudentSummary | null;
  subjects: Subject[];
  onClose: () => void;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  summary,
  subjects,
  onClose,
}) => {
  if (!summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const getRemarks = (percentage: number, isPass: boolean) => {
    if (!isPass) {
      return 'Requires focused academic intervention in deficient subjects. Schedule remedial counseling.';
    }
    if (percentage >= 90) return 'Exceptional performance. Exhibits mastery across all academic areas.';
    if (percentage >= 80) return 'Excellent academic work with strong analytical skills and consistent effort.';
    if (percentage >= 70) return 'Very good progress. Capable of higher distinctions with continuous engagement.';
    if (percentage >= 60) return 'Satisfactory performance. Advised to strengthen problem-solving practice.';
    return 'Meets minimum standard pass requirements. Needs reinforcement in core principles.';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold">Student Academic Performance Report</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        <div className="p-8 sm:p-10 space-y-6 bg-white text-slate-900">
          {/* Institutional Header */}
          <div className="text-center border-b border-slate-300 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              EduMetrics Academy of Sciences
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Affiliated Institutional Evaluation Board · Academic Year 2025–2026
            </p>
            <div className="mt-2 text-xs font-semibold tracking-wider text-slate-700 bg-slate-100 inline-block px-3 py-1 rounded">
              OFFICIAL TRANSCRIPT & PERFORMANCE REPORT
            </div>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{summary.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Roll Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{summary.roll_no}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Section</span>
              <span className="font-semibold text-slate-800 text-sm">Class Section {summary.section}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Class Rank</span>
              <span className="font-mono font-bold text-blue-700 text-sm">#{summary.rank_in_class} of 24</span>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subject-Wise Assessment Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Subject</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Max Marks</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Pass Marks</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Marks Obtained</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Percentage</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map(sub => {
                    const markDetail = summary.subject_marks[sub.subject_id];
                    const obtained = markDetail ? markDetail.marks_obtained : 0;
                    const isPass = markDetail ? markDetail.is_pass : false;
                    const pct = markDetail ? markDetail.percentage : 0;

                    return (
                      <tr key={sub.subject_id} className={!isPass ? 'bg-rose-50/50' : ''}>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {sub.subject_name}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-right tabular-nums">
                          {sub.max_marks}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-right tabular-nums">
                          {sub.pass_marks}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right tabular-nums">
                          {obtained}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 text-right tabular-nums">
                          {pct}%
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isPass ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100 font-bold'
                            }`}
                          >
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cumulative Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900 text-white rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Marks</span>
              <span className="font-mono text-lg font-bold tabular-nums">
                {summary.total_obtained} / {summary.total_max}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Aggregate Percentage</span>
              <span className="font-mono text-lg font-bold tabular-nums text-sky-400">
                {summary.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Grade & GPA</span>
              <span className="font-mono text-lg font-bold">
                {summary.grade} ({summary.gpa.toFixed(1)})
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Result Status</span>
              <span
                className={`text-sm font-bold flex items-center gap-1.5 mt-1 ${
                  summary.is_pass ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {summary.is_pass ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>PASSED</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>NEEDS SUPPORT</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Deficiency Warnings if Any */}
          {summary.failed_subject_count > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <span className="font-bold">Academic Notice: </span>
              Student scored below minimum passing criteria in {summary.failed_subject_count} subject(s):{' '}
              {summary.failed_subjects.map(f => `${f.subject_name} (${f.marks}/${f.pass_marks}, deficit: ${f.deficit})`).join('; ')}.
            </div>
          )}

          {/* Remarks & Signatures */}
          <div className="pt-2 border-t border-slate-200">
            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-700 block mb-1">Faculty Remarks:</span>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                "{getRemarks(summary.percentage, summary.is_pass)}"
              </p>
            </div>

            <div className="flex justify-between items-end pt-8 text-xs text-slate-500">
              <div className="text-center w-36 border-t border-slate-400 pt-1">
                Class Mentor
              </div>
              <div className="text-center w-36 border-t border-slate-400 pt-1">
                Academic Head
              </div>
              <div className="text-center w-36 border-t border-slate-400 pt-1">
                Dean of Examinations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
