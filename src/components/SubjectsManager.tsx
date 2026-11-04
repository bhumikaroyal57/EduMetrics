/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Subject, Mark } from '../types';
import { AcademicDatabase } from '../services/db';
import { BookOpen, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface SubjectsManagerProps {
  subjects: Subject[];
  marks: Mark[];
  onRefresh: () => void;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  marks,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_code: '',
    max_marks: '100',
    pass_marks: '40',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ subject_name: '', subject_code: '', max_marks: '100', pass_marks: '40' });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code || '',
      max_marks: subject.max_marks.toString(),
      pass_marks: subject.pass_marks.toString(),
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const max = parseInt(formData.max_marks, 10);
    const pass = parseInt(formData.pass_marks, 10);

    if (isNaN(max) || max <= 0) {
      setErrorMsg('Max marks must be a positive integer.');
      return;
    }
    if (isNaN(pass) || pass <= 0) {
      setErrorMsg('Pass marks must be a positive integer.');
      return;
    }
    if (pass > max) {
      setErrorMsg(`Pass marks (${pass}) cannot exceed max marks (${max}).`);
      return;
    }

    const res = AcademicDatabase.saveSubject({
      subject_id: editingSubject ? editingSubject.subject_id : undefined,
      subject_name: formData.subject_name.trim(),
      subject_code: formData.subject_code.trim() || undefined,
      max_marks: max,
      pass_marks: pass,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save subject.');
      return;
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: number) => {
    if (confirm('Deleting this subject will remove all its recorded exam marks from the database. Proceed?')) {
      AcademicDatabase.deleteSubject(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curriculum Subjects Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Table: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">subjects(subject_id, subject_name, max_marks, pass_marks)</code>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Subject ID</th>
              <th className="py-3 px-4">Subject Name</th>
              <th className="py-3 px-4">Course Code</th>
              <th className="py-3 px-4 text-right">Max Marks</th>
              <th className="py-3 px-4 text-right">Pass Marks</th>
              <th className="py-3 px-4 text-right">Recorded Marks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map(sub => {
              const count = marks.filter(m => m.subject_id === sub.subject_id).length;
              return (
                <tr key={sub.subject_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                    #{sub.subject_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {sub.subject_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {sub.subject_code || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                    {sub.max_marks}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                    {sub.pass_marks}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {count} evaluations
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.subject_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingSubject ? 'Edit Subject Rules' : 'Add New Subject'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure subject evaluation parameters and pass criteria.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.subject_name}
                  onChange={e => setFormData({ ...formData, subject_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject / Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS201"
                  value={formData.subject_code}
                  onChange={e => setFormData({ ...formData, subject_code: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_marks}
                    onChange={e => setFormData({ ...formData, max_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pass Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.pass_marks}
                    onChange={e => setFormData({ ...formData, pass_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
