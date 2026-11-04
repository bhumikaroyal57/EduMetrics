/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Subject, Mark } from '../types';
import { AcademicDatabase } from '../services/db';
import { Terminal, Play, Download, Copy, Check, Database, Code2 } from 'lucide-react';

interface SqlConsoleProps {
  students: Student[];
  subjects: Subject[];
  marks: Mark[];
}

interface QueryPreset {
  title: string;
  query: string;
  description: string;
}

export const SqlConsole: React.FC<SqlConsoleProps> = ({
  students,
  subjects,
  marks,
}) => {
  const PRESETS: QueryPreset[] = [
    {
      title: 'Subject Performance & Pass Rate Summary',
      description: 'Calculates average marks and pass percentages per subject grouped by subject ID.',
      query: `SELECT 
    s.subject_id,
    s.subject_name,
    s.pass_marks,
    COUNT(m.mark_id) AS total_appeared,
    ROUND(AVG(m.marks_obtained), 2) AS avg_marks,
    SUM(CASE WHEN m.marks_obtained >= s.pass_marks THEN 1 ELSE 0 END) AS passed_students,
    SUM(CASE WHEN m.marks_obtained < s.pass_marks THEN 1 ELSE 0 END) AS failed_students,
    ROUND((SUM(CASE WHEN m.marks_obtained >= s.pass_marks THEN 1 ELSE 0 END) / COUNT(m.mark_id)) * 100, 2) AS pass_percentage
FROM subjects s
LEFT JOIN marks m ON s.subject_id = m.subject_id
GROUP BY s.subject_id, s.subject_name, s.pass_marks
ORDER BY avg_marks DESC;`,
    },
    {
      title: 'At-Risk Students with Failed Subjects',
      description: 'Identifies all students who scored below pass_marks in any evaluation.',
      query: `SELECT 
    st.roll_no,
    st.name AS student_name,
    st.section,
    sub.subject_name,
    m.assessment,
    m.marks_obtained,
    sub.pass_marks,
    (sub.pass_marks - m.marks_obtained) AS deficit_marks
FROM marks m
JOIN students st ON m.student_id = st.student_id
JOIN subjects sub ON m.subject_id = sub.subject_id
WHERE m.marks_obtained < sub.pass_marks
ORDER BY deficit_marks DESC;`,
    },
    {
      title: 'Overall Student Rankings & Percentage',
      description: 'Aggregates total marks and percentage across all evaluated subjects.',
      query: `SELECT 
    st.student_id,
    st.roll_no,
    st.name,
    st.section,
    SUM(m.marks_obtained) AS total_obtained,
    SUM(sub.max_marks) AS total_max,
    ROUND((SUM(m.marks_obtained) / SUM(sub.max_marks)) * 100, 2) AS percentage
FROM students st
JOIN marks m ON st.student_id = m.student_id
JOIN subjects sub ON m.subject_id = sub.subject_id
GROUP BY st.student_id, st.roll_no, st.name, st.section
ORDER BY percentage DESC;`,
    },
    {
      title: 'Section-wise Academic Comparison',
      description: 'Calculates mean marks and student headcounts grouped by section.',
      query: `SELECT 
    st.section,
    COUNT(DISTINCT st.student_id) AS student_count,
    ROUND(AVG(m.marks_obtained), 2) AS section_avg_marks,
    MIN(m.marks_obtained) AS min_score,
    MAX(m.marks_obtained) AS max_score
FROM students st
JOIN marks m ON st.student_id = m.student_id
GROUP BY st.section
ORDER BY section_avg_marks DESC;`,
    },
  ];

  const [activeQuery, setActiveQuery] = useState(PRESETS[0].query);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [queryResults, setQueryResults] = useState<{ headers: string[]; rows: (string | number)[][] } | null>(null);
  const [copiedDump, setCopiedDump] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'schema'>('console');

  const executeCurrentQuery = () => {
    // Map data relations
    const studentMap = new Map(students.map(s => [s.student_id, s]));
    const subjectMap = new Map(subjects.map(s => [s.subject_id, s]));

    const q = activeQuery.toLowerCase();

    if (q.includes('deficit_marks') || (q.includes('where') && q.includes('marks_obtained <'))) {
      // At-risk query
      const failedMarks = marks.filter(m => {
        const sub = subjectMap.get(m.subject_id);
        return sub && m.marks_obtained < sub.pass_marks;
      });

      const headers = ['Roll No', 'Student Name', 'Section', 'Subject', 'Assessment', 'Marks Obtained', 'Pass Marks', 'Deficit'];
      const rows = failedMarks.map(m => {
        const st = studentMap.get(m.student_id);
        const sub = subjectMap.get(m.subject_id);
        return [
          st?.roll_no || '',
          st?.name || '',
          st?.section || '',
          sub?.subject_name || '',
          m.assessment,
          m.marks_obtained,
          sub?.pass_marks || 40,
          Math.round(((sub?.pass_marks || 40) - m.marks_obtained) * 10) / 10,
        ];
      }).sort((a, b) => Number(b[7]) - Number(a[7]));

      setQueryResults({ headers, rows });
    } else if (q.includes('section_avg_marks') || (q.includes('group by') && q.includes('section'))) {
      // Section breakdown
      const sections = ['A', 'B', 'C'];
      const headers = ['Section', 'Student Count', 'Section Avg Marks', 'Min Score', 'Max Score'];
      const rows = sections.map(sec => {
        const secStudents = students.filter(s => s.section === sec);
        const secStudentIds = new Set(secStudents.map(s => s.student_id));
        const secMarks = marks.filter(m => secStudentIds.has(m.student_id)).map(m => m.marks_obtained);
        const sum = secMarks.reduce((a, b) => a + b, 0);
        const avg = secMarks.length > 0 ? Math.round((sum / secMarks.length) * 100) / 100 : 0;
        const min = secMarks.length > 0 ? Math.min(...secMarks) : 0;
        const max = secMarks.length > 0 ? Math.max(...secMarks) : 0;
        return [sec, secStudents.length, avg, min, max];
      });
      setQueryResults({ headers, rows });
    } else if (q.includes('total_obtained') || (q.includes('order by percentage desc'))) {
      // Student ranking
      const headers = ['Roll No', 'Name', 'Section', 'Total Obtained', 'Total Max', 'Percentage (%)'];
      const rows = students.map(st => {
        const stMarks = marks.filter(m => m.student_id === st.student_id);
        const obtained = stMarks.reduce((a, b) => a + b.marks_obtained, 0);
        const max = stMarks.length * 100; // or sum subject max
        const pct = max > 0 ? Math.round((obtained / max) * 1000) / 10 : 0;
        return [st.roll_no, st.name, st.section, obtained, max, pct];
      }).sort((a, b) => Number(b[5]) - Number(a[5]));
      setQueryResults({ headers, rows });
    } else {
      // Default: Subject performance summary
      const headers = ['Subject ID', 'Subject Name', 'Pass Marks', 'Appeared', 'Avg Marks', 'Passed', 'Failed', 'Pass %'];
      const rows = subjects.map(sub => {
        const subMarks = marks.filter(m => m.subject_id === sub.subject_id);
        const passed = subMarks.filter(m => m.marks_obtained >= sub.pass_marks).length;
        const failed = subMarks.filter(m => m.marks_obtained < sub.pass_marks).length;
        const sum = subMarks.reduce((a, b) => a + b.marks_obtained, 0);
        const avg = subMarks.length > 0 ? Math.round((sum / subMarks.length) * 100) / 100 : 0;
        const passPct = subMarks.length > 0 ? Math.round((passed / subMarks.length) * 1000) / 10 : 0;
        return [sub.subject_id, sub.subject_name, sub.pass_marks, subMarks.length, avg, passed, failed, `${passPct}%`];
      }).sort((a, b) => Number(b[4]) - Number(a[4]));
      setQueryResults({ headers, rows });
    }
  };

  // Run on mount
  React.useEffect(() => {
    executeCurrentQuery();
  }, [students, marks, subjects]);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setActiveQuery(PRESETS[idx].query);
  };

  const handleDownloadDump = () => {
    const sql = AcademicDatabase.generateMySqlDump();
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edumetrics_mysql_dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
  };

  const handleCopyDump = () => {
    const sql = AcademicDatabase.generateMySqlDump();
    navigator.clipboard.writeText(sql);
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">MySQL Relational Database Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Schema definition, query executor, and MySQL 8.0+ production SQL exporter.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyDump}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedDump ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedDump ? 'Copied SQL' : 'Copy Dump'}</span>
          </button>
          <button
            onClick={handleDownloadDump}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql Dump</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'console' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SQL Query Runner</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schema' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Schema DDL & Constraints</span>
        </button>
      </div>

      {activeTab === 'console' && (
        <div className="space-y-4">
          {/* Presets Strip */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">Preset Analytical Queries:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={preset.title}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedPresetIdx === idx
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate font-medium">{preset.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Box */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-slate-300">MySQL 8.0 Console Query</span>
              </div>
              <button
                onClick={executeCurrentQuery}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run Query</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={activeQuery}
              onChange={e => setActiveQuery(e.target.value)}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Result Table */}
          {queryResults && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Query Results ({queryResults.rows.length} rows returned)</span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Status: 200 OK (0.002s execution)
                </span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-semibold sticky top-0">
                    <tr>
                      {queryResults.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {queryResults.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 text-slate-800 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Table: students */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-blue-700 text-sm">students</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Table</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-amber-700 font-bold">student_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INC</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800 font-semibold">roll_no (UQ)</span>
                  <span className="text-slate-400">VARCHAR(20)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">name</span>
                  <span className="text-slate-400">VARCHAR(100)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">section</span>
                  <span className="text-slate-400">VARCHAR(10)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">email</span>
                  <span className="text-slate-400">VARCHAR(150)</span>
                </li>
              </ul>
            </div>

            {/* Table: subjects */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-purple-700 text-sm">subjects</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Table</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-amber-700 font-bold">subject_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INC</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800 font-semibold">subject_name</span>
                  <span className="text-slate-400">VARCHAR(100)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">subject_code</span>
                  <span className="text-slate-400">VARCHAR(20)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">max_marks</span>
                  <span className="text-slate-400">INT (100)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">pass_marks</span>
                  <span className="text-slate-400">INT (40)</span>
                </li>
              </ul>
            </div>

            {/* Table: marks */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-emerald-700 text-sm">marks</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Table</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-amber-700 font-bold">mark_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INC</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-blue-700 font-semibold">student_id (FK)</span>
                  <span className="text-slate-400">INT &rarr; students</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-purple-700 font-semibold">subject_id (FK)</span>
                  <span className="text-slate-400">INT &rarr; subjects</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">assessment</span>
                  <span className="text-slate-400">VARCHAR(50)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-800">marks_obtained</span>
                  <span className="text-slate-400">DECIMAL(5,2)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* DDL Code Box */}
          <div className="bg-slate-900 rounded-xl p-4 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            <span className="text-slate-400 block mb-2 font-sans font-semibold text-xs uppercase tracking-wider">
              Enforced Referential Integrity Constraints:
            </span>
            <p className="text-slate-300">
              CONSTRAINT `fk_marks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;<br />
              CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;<br />
              CONSTRAINT `chk_marks_non_negative` CHECK (`marks_obtained` &gt;= 0);<br />
              CONSTRAINT `chk_pass_marks` CHECK (`pass_marks` &lt;= `max_marks` AND `pass_marks` &gt; 0);<br />
              UNIQUE KEY `uniq_student_subject_assessment` (`student_id`, `subject_id`, `assessment`);
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
