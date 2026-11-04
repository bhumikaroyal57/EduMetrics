/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Subject, Mark } from '../types';
import { AcademicDatabase } from '../services/db';
import { Plus, Edit2, Trash2, Search, Filter, AlertTriangle, Check, Layers, AlertCircle } from 'lucide-react';

interface MarksManagerProps {
  students: Student[];
  subjects: Subject[];
  marks: Mark[];
  onRefresh: () => void;
}

export const MarksManager: React.FC<MarksManagerProps> = ({
  students,
  subjects,
  marks,
  onRefresh,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);

  // Single Form State
  const [singleForm, setSingleForm] = useState({
    student_id: students[0]?.student_id || 1,
    subject_id: subjects[0]?.subject_id || 1,
    assessment: 'Midterm',
    marks_obtained: '',
  });
  const [singleError, setSingleError] = useState<string | null>(null);

  // Batch Form State
  const [batchSubjectId, setBatchSubjectId] = useState<number>(subjects[0]?.subject_id || 1);
  const [batchAssessment, setBatchAssessment] = useState<string>('Final');
  const [batchSection, setBatchSection] = useState<string>('A');
  const [batchMarks, setBatchMarks] = useState<Record<number, string>>({});
  const [batchErrors, setBatchErrors] = useState<Record<number, string>>({});

  const studentMap = new Map(students.map(s => [s.student_id, s]));
  const subjectMap = new Map(subjects.map(s => [s.subject_id, s]));

  // Filter marks
  const filteredMarks = marks.filter(m => {
    const student = studentMap.get(m.student_id);
    const subject = subjectMap.get(m.subject_id);
    if (!student || !subject) return false;

    if (selectedAssessment !== 'All' && m.assessment.toLowerCase() !== selectedAssessment.toLowerCase()) {
      return false;
    }
    if (selectedSubject !== 'All' && m.subject_id !== Number(selectedSubject)) {
      return false;
    }
    if (selectedSection !== 'All' && student.section.toUpperCase() !== selectedSection.toUpperCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchRoll = student.roll_no.toLowerCase().includes(q);
      const matchSub = subject.subject_name.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchSub) return false;
    }
    return true;
  });

  const handleOpenAddSingle = () => {
    setEditingMark(null);
    setSingleForm({
      student_id: students[0]?.student_id || 1,
      subject_id: subjects[0]?.subject_id || 1,
      assessment: 'Final',
      marks_obtained: '',
    });
    setSingleError(null);
    setIsSingleModalOpen(true);
  };

  const handleOpenEdit = (mark: Mark) => {
    setEditingMark(mark);
    setSingleForm({
      student_id: mark.student_id,
      subject_id: mark.subject_id,
      assessment: mark.assessment,
      marks_obtained: mark.marks_obtained.toString(),
    });
    setSingleError(null);
    setIsSingleModalOpen(true);
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);

    const score = parseFloat(singleForm.marks_obtained);
    if (isNaN(score)) {
      setSingleError('Please enter a valid numeric mark.');
      return;
    }

    const currentSub = subjectMap.get(singleForm.subject_id);
    if (score < 0) {
      setSingleError(`Invalid mark: Marks cannot be negative (${score}). Minimum permitted mark is 0.`);
      return;
    }
    if (currentSub && score > currentSub.max_marks) {
      setSingleError(`Invalid mark: ${score} exceeds maximum allowed marks of ${currentSub.max_marks} for ${currentSub.subject_name}.`);
      return;
    }

    const res = AcademicDatabase.saveMark({
      mark_id: editingMark ? editingMark.mark_id : undefined,
      student_id: singleForm.student_id,
      subject_id: singleForm.subject_id,
      assessment: singleForm.assessment,
      marks_obtained: score,
    });

    if (!res.success) {
      setSingleError(res.error || 'Failed to save marks record.');
      return;
    }

    setIsSingleModalOpen(false);
    onRefresh();
  };

  const handleDeleteMark = (id: number) => {
    if (confirm('Are you sure you want to delete this mark entry?')) {
      AcademicDatabase.deleteMark(id);
      onRefresh();
    }
  };

  // Open Batch Entry Modal
  const handleOpenBatch = () => {
    const targetStudents = students.filter(
      s => batchSection === 'All' || s.section.toUpperCase() === batchSection.toUpperCase()
    );
    const initialMarks: Record<number, string> = {};
    targetStudents.forEach(st => {
      const existing = marks.find(
        m => m.student_id === st.student_id && m.subject_id === batchSubjectId && m.assessment.toLowerCase() === batchAssessment.toLowerCase()
      );
      initialMarks[st.student_id] = existing ? existing.marks_obtained.toString() : '';
    });
    setBatchMarks(initialMarks);
    setBatchErrors({});
    setIsBatchModalOpen(true);
  };

  const handleBatchSectionChange = (newSec: string) => {
    setBatchSection(newSec);
    const targetStudents = students.filter(
      s => newSec === 'All' || s.section.toUpperCase() === newSec.toUpperCase()
    );
    const initialMarks: Record<number, string> = {};
    targetStudents.forEach(st => {
      const existing = marks.find(
        m => m.student_id === st.student_id && m.subject_id === batchSubjectId && m.assessment.toLowerCase() === batchAssessment.toLowerCase()
      );
      initialMarks[st.student_id] = existing ? existing.marks_obtained.toString() : '';
    });
    setBatchMarks(initialMarks);
    setBatchErrors({});
  };

  const handleBatchInputChange = (studentId: number, val: string) => {
    setBatchMarks(prev => ({ ...prev, [studentId]: val }));

    const subject = subjectMap.get(batchSubjectId);
    if (!subject) return;

    if (val.trim() === '') {
      setBatchErrors(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      return;
    }

    const num = parseFloat(val);
    if (isNaN(num)) {
      setBatchErrors(prev => ({ ...prev, [studentId]: 'Must be a number' }));
    } else if (num < 0) {
      setBatchErrors(prev => ({ ...prev, [studentId]: 'Cannot be < 0' }));
    } else if (num > subject.max_marks) {
      setBatchErrors(prev => ({ ...prev, [studentId]: `Max is ${subject.max_marks}` }));
    } else {
      setBatchErrors(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }
  };

  const handleSaveBatch = () => {
    // Check if any errors
    const errorKeys = Object.keys(batchErrors);
    if (errorKeys.length > 0) {
      alert('Please fix the highlighted invalid marks before saving.');
      return;
    }

    const subject = subjectMap.get(batchSubjectId);
    if (!subject) return;

    let savedCount = 0;
    for (const [studentIdStr, val] of Object.entries(batchMarks)) {
      if (val.trim() === '') continue;
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > subject.max_marks) continue;

      AcademicDatabase.saveMark({
        student_id: Number(studentIdStr),
        subject_id: batchSubjectId,
        assessment: batchAssessment,
        marks_obtained: num,
      });
      savedCount++;
    }

    setIsBatchModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assessment Marks Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">marks(mark_id, student_id, subject_id, assessment, marks_obtained)</code>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenBatch}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Batch Class Entry</span>
          </button>
          <button
            onClick={handleOpenAddSingle}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Mark</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        {/* Assessment Filter */}
        <div>
          <select
            value={selectedAssessment}
            onChange={e => setSelectedAssessment(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          >
            <option value="All">All Assessments (Midterm & Final)</option>
            <option value="Midterm">Midterm Examination</option>
            <option value="Final">Final Examination</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          >
            <option value="All">All Subjects (Aggregate)</option>
            {subjects.map(s => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.subject_name} (Max {s.max_marks})
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          >
            <option value="All">All Sections (A, B, C)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assessment</th>
                <th className="py-3 px-4 text-right">Score / Max</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No marks match the current filters.
                  </td>
                </tr>
              ) : (
                filteredMarks.map(m => {
                  const student = studentMap.get(m.student_id);
                  const subject = subjectMap.get(m.subject_id);
                  const isPass = subject ? m.marks_obtained >= subject.pass_marks : false;

                  return (
                    <tr key={m.mark_id} className={`hover:bg-slate-50/80 transition-colors ${!isPass ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        #{m.mark_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student?.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{student?.roll_no}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        Sec {student?.section}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {subject?.subject_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-700">
                          {m.assessment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span className={isPass ? 'text-slate-900' : 'text-rose-600'}>
                          {m.marks_obtained}
                        </span>
                        <span className="text-slate-400 font-normal"> / {subject?.max_marks}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isPass
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50 font-bold'
                          }`}
                        >
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Mark"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMark(m.mark_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Mark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total mark entries displayed: <strong className="text-slate-800">{filteredMarks.length}</strong>
          </span>
          <span className="text-[11px] font-mono">
            Check constraint: <code className="bg-slate-200 px-1 py-0.5 rounded">0 &le; marks_obtained &le; max_marks</code>
          </span>
        </div>
      </div>

      {/* Single Mark Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingMark ? 'Edit Assessment Mark' : 'Record Student Mark'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter evaluated marks. Values outside the permitted range [0, Max Marks] will be strictly rejected.
            </p>

            {singleError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Student *
                </label>
                <select
                  disabled={!!editingMark}
                  value={singleForm.student_id}
                  onChange={e => setSingleForm({ ...singleForm, student_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                >
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.roll_no} - {s.name} (Sec {s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    disabled={!!editingMark}
                    value={singleForm.subject_id}
                    onChange={e => setSingleForm({ ...singleForm, subject_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  >
                    {subjects.map(sub => (
                      <option key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_name} (Max {sub.max_marks})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assessment Period *
                  </label>
                  <select
                    disabled={!!editingMark}
                    value={singleForm.assessment}
                    onChange={e => setSingleForm({ ...singleForm, assessment: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  >
                    <option value="Midterm">Midterm Examination</option>
                    <option value="Final">Final Examination</option>
                    <option value="Unit Test 1">Unit Test 1</option>
                    <option value="Quiz">Pop Quiz</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Marks Obtained *
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Permitted: 0 to {subjectMap.get(singleForm.subject_id)?.max_marks || 100}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 85.5"
                  value={singleForm.marks_obtained}
                  onChange={e => setSingleForm({ ...singleForm, marks_obtained: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {editingMark ? 'Update Mark' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Marks Entry Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Batch Marks Entry Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly input or update marks for all students in a section for a specific assessment.
              </p>
            </div>

            {/* Batch Controls */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Subject</label>
                <select
                  value={batchSubjectId}
                  onChange={e => {
                    setBatchSubjectId(Number(e.target.value));
                    handleBatchSectionChange(batchSection);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name} (Max {s.max_marks})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Assessment</label>
                <select
                  value={batchAssessment}
                  onChange={e => {
                    setBatchAssessment(e.target.value);
                    handleBatchSectionChange(batchSection);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Final">Final Exam</option>
                  <option value="Midterm">Midterm Exam</option>
                  <option value="Unit Test 1">Unit Test 1</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Section</label>
                <select
                  value={batchSection}
                  onChange={e => handleBatchSectionChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="All">All Sections</option>
                </select>
              </div>
            </div>

            {/* Students Input Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3 text-right">
                      Marks Obtained (Max {subjectMap.get(batchSubjectId)?.max_marks})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter(s => batchSection === 'All' || s.section.toUpperCase() === batchSection.toUpperCase())
                    .map(st => {
                      const error = batchErrors[st.student_id];
                      return (
                        <tr key={st.student_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {st.roll_no}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {st.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500">
                            Sec {st.section}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <input
                                type="number"
                                step="0.5"
                                placeholder="—"
                                value={batchMarks[st.student_id] ?? ''}
                                onChange={e => handleBatchInputChange(st.student_id, e.target.value)}
                                className={`w-24 px-2 py-1 text-xs font-mono font-bold text-right border rounded-md focus:outline-none ${
                                  error
                                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                                    : 'border-slate-300 focus:border-slate-900'
                                }`}
                              />
                              {error && (
                                <span className="text-[10px] text-rose-600 whitespace-nowrap">
                                  {error}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Invalid entries outside [0, {subjectMap.get(batchSubjectId)?.max_marks}] will block submission.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBatch}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save All Marks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
