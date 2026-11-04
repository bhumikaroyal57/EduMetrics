/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentSummary, Subject } from '../types';
import { getToppers } from '../services/analytics';
import { Trophy, Medal, Award, Star, FileText } from 'lucide-react';

interface ToppersViewProps {
  summaries: StudentSummary[];
  subjects: Subject[];
  onViewReportCard: (studentId: number) => void;
}

export const ToppersView: React.FC<ToppersViewProps> = ({
  summaries,
  subjects,
  onViewReportCard,
}) => {
  const [sectionFilter, setSectionFilter] = useState('All');

  const filteredSummaries = sectionFilter === 'All'
    ? summaries
    : summaries.filter(s => s.section === sectionFilter);

  const toppers = getToppers(filteredSummaries, 10);
  const top1 = toppers[0];
  const top2 = toppers[1];
  const top3 = toppers[2];
  const restToppers = toppers.slice(3);

  const getTopSubjectForStudent = (summary: StudentSummary) => {
    let topName = 'N/A';
    let topScore = -1;
    Object.values(summary.subject_marks).forEach(sub => {
      if (sub.marks_obtained > topScore) {
        topScore = sub.marks_obtained;
        topName = `${sub.subject_name} (${sub.marks_obtained}/${sub.max_marks})`;
      }
    });
    return topName;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Honors & Toppers Leaderboard</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked student achievers evaluated across all core subject assessments.
          </p>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          {['All', 'A', 'B', 'C'].map(sec => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                sectionFilter === sec
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec === 'All' ? 'All Sections' : `Sec ${sec}`}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {toppers.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 (Silver) */}
          {top2 && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative order-2 md:order-1">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-sm border border-slate-300">
                  #2
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
                  SILVER DISTINCTION
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{top2.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                  <span>{top2.roll_no}</span>
                  <span>·</span>
                  <span>Sec {top2.section}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aggregate Score:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{top2.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Marks:</span>
                    <span className="font-mono text-slate-700 tabular-nums">{top2.total_obtained} / {top2.total_max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Top Subject:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{getTopSubjectForStudent(top2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onViewReportCard(top2.student_id)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Performance Report</span>
              </button>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top1 && (
            <div className="p-6 bg-gradient-to-b from-amber-50/70 to-white rounded-xl border-2 border-amber-300 shadow-sm flex flex-col justify-between relative order-1 md:order-2 md:-translate-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 font-mono font-extrabold flex items-center justify-center text-base shadow-xs">
                  #1
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-600" />
                  <span>GOLD VALEDICTORIAN</span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{top1.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-0.5">
                  <span className="font-bold">{top1.roll_no}</span>
                  <span>·</span>
                  <span>Class Section {top1.section}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-600 font-medium">Aggregate Percentage:</span>
                    <span className="font-mono text-xl font-extrabold text-amber-700 tabular-nums">{top1.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cumulative Marks:</span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">{top1.total_obtained} / {top1.total_max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overall Grade:</span>
                    <span className="font-bold text-emerald-700 font-mono">{top1.grade} ({top1.gpa.toFixed(1)} GPA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Best Subject:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">{getTopSubjectForStudent(top1)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onViewReportCard(top1.student_id)}
                className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Academic Transcript</span>
              </button>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3 && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative order-3">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-mono font-bold flex items-center justify-center text-sm border border-amber-200">
                  #3
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  BRONZE DISTINCTION
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{top3.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                  <span>{top3.roll_no}</span>
                  <span>·</span>
                  <span>Sec {top3.section}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aggregate Score:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{top3.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Marks:</span>
                    <span className="font-mono text-slate-700 tabular-nums">{top3.total_obtained} / {top3.total_max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Top Subject:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{getTopSubjectForStudent(top3)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onViewReportCard(top3.student_id)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Performance Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table (Ranks 1 to 10) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Top 10 Ranked Academic Achievers
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Sorted by Total Percentage Descending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4 text-center">Rank</th>
                <th className="py-2.5 px-4">Roll No</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Section</th>
                <th className="py-2.5 px-4 text-right">Total Marks</th>
                <th className="py-2.5 px-4 text-right">Percentage</th>
                <th className="py-2.5 px-4 text-center">Grade</th>
                <th className="py-2.5 px-4">Strongest Subject</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {toppers.map((student, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                      {rank === 1 && <span className="text-amber-600 font-extrabold">#1</span>}
                      {rank === 2 && <span className="text-slate-600 font-extrabold">#2</span>}
                      {rank === 3 && <span className="text-amber-800 font-extrabold">#3</span>}
                      {rank > 3 && <span className="text-slate-400">#{rank}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {student.roll_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      Sec {student.section}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {student.total_obtained} / {student.total_max}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-blue-700 text-sm">
                      {student.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded text-xs text-emerald-800 bg-emerald-50">
                        {student.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {getTopSubjectForStudent(student)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewReportCard(student.student_id)}
                        className="text-slate-600 hover:text-blue-600 font-medium text-xs hover:underline cursor-pointer"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
