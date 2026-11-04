/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SubjectSummary, Subject, Student, Mark } from '../types';
import { computeSubjectSummaries } from '../services/analytics';
import { SubjectAveragesBarChart, SubjectPassRateBarChart } from './Charts';
import { Code, Copy, Check, BarChart3, Table as TableIcon } from 'lucide-react';

interface SubjectAnalyticsViewProps {
  subjects: Subject[];
  marks: Mark[];
  students: Student[];
}

export const SubjectAnalyticsView: React.FC<SubjectAnalyticsViewProps> = ({
  subjects,
  marks,
  students,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'charts' | 'python'>('table');
  const [copiedCode, setCopiedCode] = useState(false);

  const subjectSummaries = computeSubjectSummaries(
    subjects,
    marks,
    students,
    selectedAssessment,
    selectedSection
  );

  const pythonCodeSnippet = `# ========================================================
# Python Pandas & NumPy Academic Analytics Implementation
# ========================================================
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 1. Load data from MySQL database
# engine = create_engine('mysql+pymysql://user:pass@host/edumetrics')
# df_marks = pd.read_sql("SELECT * FROM marks", engine)
# df_subjects = pd.read_sql("SELECT * FROM subjects", engine)
# df_students = pd.read_sql("SELECT * FROM students", engine)

# 2. Merge tables
df = df_marks.merge(df_students, on='student_id').merge(df_subjects, on='subject_id')

# 3. Filter criteria (Assessment: '${selectedAssessment}', Section: '${selectedSection}')
if '${selectedAssessment}' != 'All':
    df = df[df['assessment'] == '${selectedAssessment}']
if '${selectedSection}' != 'All':
    df = df[df['section'] == '${selectedSection}']

# 4. GroupBy Subject Aggregations (Pandas & NumPy)
subject_summary = df.groupby(['subject_id', 'subject_name', 'max_marks', 'pass_marks']).agg(
    total_appeared=('marks_obtained', 'count'),
    mean_score=('marks_obtained', np.mean),
    median_score=('marks_obtained', np.median),
    min_score=('marks_obtained', np.min),
    max_score=('marks_obtained', np.max),
    std_dev=('marks_obtained', lambda x: np.std(x, ddof=0)),
    passed_count=('marks_obtained', lambda x: (x >= 40).sum()),
    failed_count=('marks_obtained', lambda x: (x < 40).sum())
).reset_index()

subject_summary['pass_percentage'] = np.round(
    (subject_summary['passed_count'] / subject_summary['total_appeared']) * 100, 2
)

# 5. Matplotlib Plotting
fig, ax1 = plt.subplots(figsize=(10, 6))
bars = ax1.bar(subject_summary['subject_name'], subject_summary['mean_score'], color='royalblue', label='Mean')
ax1.axhline(40, color='red', linestyle='--', label='Pass Mark (40)')
ax1.set_ylabel('Average Marks')
ax1.set_title('Subject-wise Academic Performance')
ax1.legend()
plt.tight_layout()
plt.show()
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subject-Wise Performance Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical aggregation using Pandas GroupBy and NumPy mathematical primitives.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Summary Table</span>
          </button>
          <button
            onClick={() => setActiveSubTab('charts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'charts' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Charts</span>
          </button>
          <button
            onClick={() => setActiveSubTab('python')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'python' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python/Pandas Logic</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Assessment:</span>
            <select
              value={selectedAssessment}
              onChange={e => setSelectedAssessment(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="All">All Assessments (Combined)</option>
              <option value="Midterm">Midterm Examination</option>
              <option value="Final">Final Examination</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Class Section:</span>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="All">All Sections (A, B, C)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          N = {subjectSummaries.reduce((acc, s) => acc + s.total_appeared, 0)} total evaluated scores
        </div>
      </div>

      {/* View 1: Summary Table */}
      {activeSubTab === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Max / Pass</th>
                  <th className="py-3 px-4 text-center">Appeared</th>
                  <th className="py-3 px-4 text-center">Pass / Fail</th>
                  <th className="py-3 px-4 text-right">Pass Rate</th>
                  <th className="py-3 px-4 text-right">Mean (&mu;)</th>
                  <th className="py-3 px-4 text-right">Median</th>
                  <th className="py-3 px-4 text-right">Min - Max</th>
                  <th className="py-3 px-4 text-right">Std Dev (&sigma;)</th>
                  <th className="py-3 px-4">Top Scorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectSummaries.map(sub => {
                  const isHighPass = sub.pass_percentage >= 85;
                  const isLowPass = sub.pass_percentage < 75;

                  return (
                    <tr key={sub.subject_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{sub.subject_name}</div>
                        <span className="text-[10px] font-mono text-slate-400">{sub.subject_code}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600 tabular-nums">
                        {sub.max_marks} / <span className="text-rose-600 font-medium">{sub.pass_marks}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-800">
                        {sub.total_appeared}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span className="text-emerald-700 font-medium">{sub.passed_count}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className={sub.failed_count > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                          {sub.failed_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            isHighPass
                              ? 'text-emerald-700 bg-emerald-50'
                              : isLowPass
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          {sub.pass_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {sub.mean}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-purple-700 tabular-nums font-medium">
                        {sub.median}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {sub.min} &ndash; {sub.max}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        &plusmn;{sub.std_dev}
                      </td>
                      <td className="py-3 px-4">
                        {sub.highest_scorer ? (
                          <div className="text-xs">
                            <span className="font-medium text-slate-800">{sub.highest_scorer.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-1">
                              ({sub.highest_scorer.marks} marks)
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
            <span>
              All aggregations dynamically recalculated using NumPy equivalents (ddof=0 for population standard deviation).
            </span>
            <span className="font-mono text-[11px] text-slate-600">
              IQR range: Q1 (25th percentile) to Q3 (75th percentile)
            </span>
          </div>
        </div>
      )}

      {/* View 2: Charts */}
      {activeSubTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">Subject Averages (Mean vs Median)</h3>
              <p className="text-xs text-slate-500">
                Visualizing central tendency with a dashed benchmark line at the pass mark threshold (40).
              </p>
            </div>
            <SubjectAveragesBarChart data={subjectSummaries} />
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">Subject Pass Rates (%)</h3>
              <p className="text-xs text-slate-500">
                Percentage of students passing each subject (marks &ge; pass_marks).
              </p>
            </div>
            <SubjectPassRateBarChart data={subjectSummaries} />
          </div>
        </div>
      )}

      {/* View 3: Python/Pandas Script */}
      {activeSubTab === 'python' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 text-white p-5 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400">analysis_pipeline.py</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Executable Python script using Pandas GroupBy and NumPy statistical functions.
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed p-2">
            {pythonCodeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
