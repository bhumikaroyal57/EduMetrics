/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Student, Subject, Mark, StudentSummary } from './types';
import { AcademicDatabase } from './services/db';
import { computeStudentSummaries } from './services/analytics';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentManager } from './components/StudentManager';
import { MarksManager } from './components/MarksManager';
import { SubjectsManager } from './components/SubjectsManager';
import { SubjectAnalyticsView } from './components/SubjectAnalyticsView';
import { AtRiskView } from './components/AtRiskView';
import { ToppersView } from './components/ToppersView';
import { SqlConsole } from './components/SqlConsoleModal';
import { StudentReportCardModal } from './components/StudentReportCardModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from database
  const refreshData = () => {
    const loadedStudents = AcademicDatabase.getStudents();
    const loadedSubjects = AcademicDatabase.getSubjects();
    const loadedMarks = AcademicDatabase.getMarks();
    setStudents(loadedStudents);
    setSubjects(loadedSubjects);
    setMarks(loadedMarks);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetData = () => {
    if (confirm('Reset entire database to the verified institutional test dataset? All custom edits will revert to default.')) {
      AcademicDatabase.resetToDefault();
      refreshData();
      showToast('Database successfully restored to institutional default data.');
    }
  };

  const handleExportSql = () => {
    const sql = AcademicDatabase.generateMySqlDump();
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edumetrics_mysql_dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    showToast('Downloaded MySQL schema and data dump (.sql)');
  };

  const handleOpenAddMark = () => {
    setActiveTab('marks');
  };

  const handleViewReportCard = (studentId: number) => {
    const allSummaries = computeStudentSummaries(students, subjects, marks, 'All', 'All');
    const summary = allSummaries.find(s => s.student_id === studentId);
    if (summary) {
      setSelectedStudentForReport(summary);
    }
  };

  // Precompute overall summaries for active views
  const currentSummaries = computeStudentSummaries(students, subjects, marks, 'All', 'All');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddMark={handleOpenAddMark}
        onResetData={handleResetData}
        onExportSql={handleExportSql}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            students={students}
            subjects={subjects}
            marks={marks}
            onNavigateTab={setActiveTab}
            onViewReportCard={handleViewReportCard}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onRefresh={refreshData}
            onViewReportCard={handleViewReportCard}
          />
        )}

        {activeTab === 'marks' && (
          <MarksManager
            students={students}
            subjects={subjects}
            marks={marks}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsManager
            subjects={subjects}
            marks={marks}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'analytics' && (
          <SubjectAnalyticsView
            subjects={subjects}
            marks={marks}
            students={students}
          />
        )}

        {activeTab === 'at-risk' && (
          <AtRiskView
            summaries={currentSummaries}
            subjects={subjects}
            onViewReportCard={handleViewReportCard}
          />
        )}

        {activeTab === 'toppers' && (
          <ToppersView
            summaries={currentSummaries}
            subjects={subjects}
            onViewReportCard={handleViewReportCard}
          />
        )}

        {activeTab === 'sql-console' && (
          <SqlConsole
            students={students}
            subjects={subjects}
            marks={marks}
          />
        )}
      </main>

      {/* Official Report Card Modal */}
      {selectedStudentForReport && (
        <StudentReportCardModal
          summary={selectedStudentForReport}
          subjects={subjects}
          onClose={() => setSelectedStudentForReport(null)}
        />
      )}

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
