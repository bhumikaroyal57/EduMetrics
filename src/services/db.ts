/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Subject, Mark } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'edumetrics_students_v1',
  SUBJECTS: 'edumetrics_subjects_v1',
  MARKS: 'edumetrics_marks_v1',
};

// Initial institutional sample data
const DEFAULT_STUDENTS: Student[] = [
  { student_id: 1, roll_no: 'A-101', name: 'Aisha Sharma', section: 'A', email: 'aisha.s@academy.edu' },
  { student_id: 2, roll_no: 'A-102', name: 'Marcus Vance', section: 'A', email: 'marcus.v@academy.edu' },
  { student_id: 3, roll_no: 'A-103', name: 'Chloe Chen', section: 'A', email: 'chloe.c@academy.edu' },
  { student_id: 4, roll_no: 'A-104', name: 'Liam Davies', section: 'A', email: 'liam.d@academy.edu' },
  { student_id: 5, roll_no: 'A-105', name: 'Sophia Rossi', section: 'A', email: 'sophia.r@academy.edu' },
  { student_id: 6, roll_no: 'A-106', name: 'Devin O\'Connor', section: 'A', email: 'devin.o@academy.edu' },
  { student_id: 7, roll_no: 'A-107', name: 'David Kim', section: 'A', email: 'david.k@academy.edu' },
  { student_id: 8, roll_no: 'A-108', name: 'Elena Rostova', section: 'A', email: 'elena.r@academy.edu' },

  { student_id: 9, roll_no: 'B-201', name: 'Priya Patel', section: 'B', email: 'priya.p@academy.edu' },
  { student_id: 10, roll_no: 'B-202', name: 'Julian Mercer', section: 'B', email: 'julian.m@academy.edu' },
  { student_id: 11, roll_no: 'B-203', name: 'Hannah Wright', section: 'B', email: 'hannah.w@academy.edu' },
  { student_id: 12, roll_no: 'B-204', name: 'Leo Torres', section: 'B', email: 'leo.t@academy.edu' },
  { student_id: 13, roll_no: 'B-205', name: 'Zoya Khan', section: 'B', email: 'zoya.k@academy.edu' },
  { student_id: 14, roll_no: 'B-206', name: 'Nathan Brooks', section: 'B', email: 'nathan.b@academy.edu' },
  { student_id: 15, roll_no: 'B-207', name: 'Nina Patel', section: 'B', email: 'nina.p@academy.edu' },
  { student_id: 16, roll_no: 'B-208', name: 'Oscar Lindqvist', section: 'B', email: 'oscar.l@academy.edu' },

  { student_id: 17, roll_no: 'C-301', name: 'Rohan Deshmukh', section: 'C', email: 'rohan.d@academy.edu' },
  { student_id: 18, roll_no: 'C-302', name: 'Maya Lin', section: 'C', email: 'maya.l@academy.edu' },
  { student_id: 19, roll_no: 'C-303', name: 'Ethan Harper', section: 'C', email: 'ethan.h@academy.edu' },
  { student_id: 20, roll_no: 'C-304', name: 'Amara Okafor', section: 'C', email: 'amara.o@academy.edu' },
  { student_id: 21, roll_no: 'C-305', name: 'Gabriel Santos', section: 'C', email: 'gabriel.s@academy.edu' },
  { student_id: 22, roll_no: 'C-306', name: 'Kavita Iyer', section: 'C', email: 'kavita.i@academy.edu' },
  { student_id: 23, roll_no: 'C-307', name: 'Lucas Meyer', section: 'C', email: 'lucas.m@academy.edu' },
  { student_id: 24, roll_no: 'C-308', name: 'Tariq Al-Mansoor', section: 'C', email: 'tariq.a@academy.edu' },
];

const DEFAULT_SUBJECTS: Subject[] = [
  { subject_id: 1, subject_name: 'Mathematics', subject_code: 'MATH101', max_marks: 100, pass_marks: 40 },
  { subject_id: 2, subject_name: 'Physics', subject_code: 'PHYS101', max_marks: 100, pass_marks: 40 },
  { subject_id: 3, subject_name: 'Chemistry', subject_code: 'CHEM101', max_marks: 100, pass_marks: 40 },
  { subject_id: 4, subject_name: 'Computer Science', subject_code: 'CS101', max_marks: 100, pass_marks: 40 },
  { subject_id: 5, subject_name: 'English Literature', subject_code: 'ENG101', max_marks: 100, pass_marks: 40 },
];

// Helper to generate marks: student_id -> { Math, Phys, Chem, CS, Eng }
const RAW_MARKS_DATA: Record<number, { midterm: number[]; final: number[] }> = {
  // Topper tier
  1: { midterm: [96, 92, 94, 98, 91], final: [98, 95, 96, 99, 93] }, // Aisha Sharma (Top #1)
  2: { midterm: [92, 95, 88, 96, 89], final: [95, 94, 90, 98, 90] }, // Marcus Vance (Top #2)
  9: { midterm: [94, 91, 92, 95, 87], final: [96, 93, 91, 97, 88] }, // Priya Patel (Top #3)
  17: { midterm: [90, 93, 89, 94, 86], final: [92, 95, 91, 96, 88] }, // Rohan Deshmukh (Section C Topper)

  // Strong performers (75 - 88)
  3: { midterm: [88, 85, 84, 90, 86], final: [90, 87, 86, 92, 88] }, // Chloe Chen
  4: { midterm: [78, 82, 80, 85, 76], final: [82, 84, 82, 88, 79] }, // Liam Davies
  5: { midterm: [82, 80, 85, 84, 88], final: [85, 83, 86, 87, 90] }, // Sophia Rossi
  8: { midterm: [86, 84, 88, 89, 82], final: [88, 86, 89, 91, 85] }, // Elena Rostova
  10: { midterm: [84, 81, 79, 88, 83], final: [86, 83, 82, 90, 85] }, // Julian Mercer
  11: { midterm: [76, 78, 82, 85, 80], final: [80, 81, 84, 86, 82] }, // Hannah Wright
  13: { midterm: [85, 82, 86, 88, 84], final: [87, 84, 88, 90, 86] }, // Zoya Khan
  19: { midterm: [80, 84, 78, 86, 82], final: [83, 86, 80, 88, 84] }, // Ethan Harper
  20: { midterm: [85, 87, 83, 89, 85], final: [88, 89, 85, 91, 87] }, // Amara Okafor
  22: { midterm: [81, 83, 85, 88, 86], final: [84, 85, 87, 90, 88] }, // Kavita Iyer
  24: { midterm: [79, 81, 78, 84, 80], final: [82, 83, 81, 86, 83] }, // Tariq Al-Mansoor

  // Average / steady performers (55 - 72)
  6: { midterm: [68, 65, 70, 72, 64], final: [71, 67, 72, 75, 68] }, // Devin O'Connor
  14: { midterm: [62, 64, 68, 71, 65], final: [65, 68, 70, 73, 67] }, // Nathan Brooks
  16: { midterm: [64, 62, 65, 68, 66], final: [67, 65, 67, 70, 69] }, // Oscar Lindqvist
  21: { midterm: [70, 68, 72, 74, 69], final: [73, 71, 74, 76, 72] }, // Gabriel Santos
  23: { midterm: [63, 66, 61, 70, 65], final: [66, 68, 64, 72, 68] }, // Lucas Meyer

  // Students Needing Academic Support / Borderline / Specific Subject Failures
  7: { midterm: [36, 62, 58, 65, 60], final: [38, 64, 60, 68, 62] }, // David Kim: Failed Math (36 & 38, pass 40)
  12: { midterm: [55, 48, 32, 60, 52], final: [58, 50, 35, 62, 54] }, // Leo Torres: Failed Chemistry (32 & 35, pass 40)
  15: { midterm: [58, 35, 52, 62, 50], final: [60, 38, 54, 65, 53] }, // Nina Patel: Failed Physics (35 & 38, pass 40)
  18: { midterm: [34, 38, 36, 45, 42], final: [36, 41, 38, 48, 45] }, // Maya Lin: Critical At-Risk (multiple failures in Math & Chem)
};

function buildDefaultMarks(): Mark[] {
  const marks: Mark[] = [];
  let markId = 1;
  const subjects = [1, 2, 3, 4, 5];

  for (let sId = 1; sId <= 24; sId++) {
    const data = RAW_MARKS_DATA[sId];
    if (!data) continue;

    // Midterm
    subjects.forEach((subId, idx) => {
      marks.push({
        mark_id: markId++,
        student_id: sId,
        subject_id: subId,
        assessment: 'Midterm',
        marks_obtained: data.midterm[idx],
        date_recorded: '2026-03-15',
      });
    });

    // Final
    subjects.forEach((subId, idx) => {
      marks.push({
        mark_id: markId++,
        student_id: sId,
        subject_id: subId,
        assessment: 'Final',
        marks_obtained: data.final[idx],
        date_recorded: '2026-06-20',
      });
    });
  }

  return marks;
}

export class AcademicDatabase {
  private static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.warn(`Failed to read ${key} from localStorage`, e);
    }
    return defaultValue;
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to write ${key} to localStorage`, e);
    }
  }

  public static getStudents(): Student[] {
    const students = this.load<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    if (!students || students.length === 0) {
      this.save(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
      return DEFAULT_STUDENTS;
    }
    return students;
  }

  public static getSubjects(): Subject[] {
    const subjects = this.load<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    if (!subjects || subjects.length === 0) {
      this.save(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    return subjects;
  }

  public static getMarks(): Mark[] {
    const marks = this.load<Mark[]>(STORAGE_KEYS.MARKS, []);
    if (!marks || marks.length === 0) {
      const defaults = buildDefaultMarks();
      this.save(STORAGE_KEYS.MARKS, defaults);
      return defaults;
    }
    return marks;
  }

  public static validateMark(subjectId: number, marksObtained: number): { valid: boolean; error?: string } {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.subject_id === subjectId);
    if (!subject) {
      return { valid: false, error: `Subject ID ${subjectId} not found.` };
    }
    if (marksObtained < 0) {
      return { valid: false, error: `Marks cannot be negative (${marksObtained}). Permitted range is 0 to ${subject.max_marks}.` };
    }
    if (marksObtained > subject.max_marks) {
      return { valid: false, error: `Marks (${marksObtained}) exceed maximum permitted marks (${subject.max_marks}) for ${subject.subject_name}.` };
    }
    return { valid: true };
  }

  public static saveStudent(student: Omit<Student, 'student_id'> & { student_id?: number }): { success: boolean; student?: Student; error?: string } {
    const students = this.getStudents();
    
    // Check roll_no duplicate
    const existingRoll = students.find(s => s.roll_no.trim().toLowerCase() === student.roll_no.trim().toLowerCase() && s.student_id !== student.student_id);
    if (existingRoll) {
      return { success: false, error: `Roll Number '${student.roll_no}' already exists for student '${existingRoll.name}'.` };
    }

    if (student.student_id) {
      // Update
      const index = students.findIndex(s => s.student_id === student.student_id);
      if (index === -1) return { success: false, error: 'Student not found.' };
      const updated = { ...students[index], ...student } as Student;
      students[index] = updated;
      this.save(STORAGE_KEYS.STUDENTS, students);
      return { success: true, student: updated };
    } else {
      // Create new
      const nextId = students.length > 0 ? Math.max(...students.map(s => s.student_id)) + 1 : 1;
      const created: Student = {
        student_id: nextId,
        roll_no: student.roll_no.trim().toUpperCase(),
        name: student.name.trim(),
        section: student.section.trim().toUpperCase(),
        email: student.email?.trim() || `${student.roll_no.toLowerCase()}@academy.edu`,
        enrolled_date: new Date().toISOString().split('T')[0],
      };
      students.push(created);
      this.save(STORAGE_KEYS.STUDENTS, students);
      return { success: true, student: created };
    }
  }

  public static deleteStudent(studentId: number): { success: boolean; error?: string } {
    const students = this.getStudents();
    const filtered = students.filter(s => s.student_id !== studentId);
    if (filtered.length === students.length) {
      return { success: false, error: 'Student not found.' };
    }
    this.save(STORAGE_KEYS.STUDENTS, filtered);

    // Cascade delete marks for this student (referential integrity)
    const marks = this.getMarks().filter(m => m.student_id !== studentId);
    this.save(STORAGE_KEYS.MARKS, marks);

    return { success: true };
  }

  public static saveSubject(subject: Omit<Subject, 'subject_id'> & { subject_id?: number }): { success: boolean; subject?: Subject; error?: string } {
    if (subject.pass_marks > subject.max_marks) {
      return { success: false, error: `Pass marks (${subject.pass_marks}) cannot exceed maximum marks (${subject.max_marks}).` };
    }
    if (subject.max_marks <= 0) {
      return { success: false, error: 'Max marks must be greater than 0.' };
    }

    const subjects = this.getSubjects();
    if (subject.subject_id) {
      const idx = subjects.findIndex(s => s.subject_id === subject.subject_id);
      if (idx === -1) return { success: false, error: 'Subject not found.' };
      const updated = { ...subjects[idx], ...subject } as Subject;
      subjects[idx] = updated;
      this.save(STORAGE_KEYS.SUBJECTS, subjects);
      return { success: true, subject: updated };
    } else {
      const nextId = subjects.length > 0 ? Math.max(...subjects.map(s => s.subject_id)) + 1 : 1;
      const created: Subject = {
        ...subject,
        subject_id: nextId,
        subject_name: subject.subject_name.trim(),
      };
      subjects.push(created);
      this.save(STORAGE_KEYS.SUBJECTS, subjects);
      return { success: true, subject: created };
    }
  }

  public static deleteSubject(subjectId: number): { success: boolean; error?: string } {
    const subjects = this.getSubjects();
    const filtered = subjects.filter(s => s.subject_id !== subjectId);
    if (filtered.length === subjects.length) {
      return { success: false, error: 'Subject not found.' };
    }
    this.save(STORAGE_KEYS.SUBJECTS, filtered);

    // Cascade delete marks for this subject
    const marks = this.getMarks().filter(m => m.subject_id !== subjectId);
    this.save(STORAGE_KEYS.MARKS, marks);

    return { success: true };
  }

  public static saveMark(mark: Omit<Mark, 'mark_id'> & { mark_id?: number }): { success: boolean; mark?: Mark; error?: string } {
    // Validation constraint check
    const validation = this.validateMark(mark.subject_id, mark.marks_obtained);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const marks = this.getMarks();
    if (mark.mark_id) {
      const idx = marks.findIndex(m => m.mark_id === mark.mark_id);
      if (idx === -1) return { success: false, error: 'Mark record not found.' };
      const updated: Mark = { ...marks[idx], ...mark } as Mark;
      marks[idx] = updated;
      this.save(STORAGE_KEYS.MARKS, marks);
      return { success: true, mark: updated };
    } else {
      // Check if mark already exists for this student, subject, and assessment
      const existingIdx = marks.findIndex(
        m => m.student_id === mark.student_id && m.subject_id === mark.subject_id && m.assessment.toLowerCase() === mark.assessment.toLowerCase()
      );
      if (existingIdx !== -1) {
        // Update existing record
        marks[existingIdx].marks_obtained = mark.marks_obtained;
        marks[existingIdx].date_recorded = new Date().toISOString().split('T')[0];
        this.save(STORAGE_KEYS.MARKS, marks);
        return { success: true, mark: marks[existingIdx] };
      }

      const nextId = marks.length > 0 ? Math.max(...marks.map(m => m.mark_id)) + 1 : 1;
      const created: Mark = {
        ...mark,
        mark_id: nextId,
        date_recorded: new Date().toISOString().split('T')[0],
      };
      marks.push(created);
      this.save(STORAGE_KEYS.MARKS, marks);
      return { success: true, mark: created };
    }
  }

  public static deleteMark(markId: number): { success: boolean; error?: string } {
    const marks = this.getMarks();
    const filtered = marks.filter(m => m.mark_id !== markId);
    if (filtered.length === marks.length) {
      return { success: false, error: 'Mark record not found.' };
    }
    this.save(STORAGE_KEYS.MARKS, filtered);
    return { success: true };
  }

  public static resetToDefault(): void {
    this.save(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    this.save(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    this.save(STORAGE_KEYS.MARKS, buildDefaultMarks());
  }

  public static generateMySqlDump(): string {
    const students = this.getStudents();
    const subjects = this.getSubjects();
    const marks = this.getMarks();

    return `-- ========================================================
-- EduMetrics Academic Records & Analytics MySQL Dump
-- Generated: ${new Date().toISOString()}
-- Database Engine: MySQL 8.0+ / MariaDB
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table structure for table \`students\`
-- --------------------------------------------------------
CREATE TABLE \`students\` (
  \`student_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`roll_no\` VARCHAR(20) NOT NULL UNIQUE,
  \`name\` VARCHAR(100) NOT NULL,
  \`section\` VARCHAR(10) NOT NULL,
  \`email\` VARCHAR(150),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table \`subjects\`
-- --------------------------------------------------------
CREATE TABLE \`subjects\` (
  \`subject_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`subject_name\` VARCHAR(100) NOT NULL,
  \`subject_code\` VARCHAR(20),
  \`max_marks\` INT NOT NULL DEFAULT 100,
  \`pass_marks\` INT NOT NULL DEFAULT 40,
  CONSTRAINT \`chk_pass_marks\` CHECK (\`pass_marks\` <= \`max_marks\` AND \`pass_marks\` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table \`marks\`
-- --------------------------------------------------------
CREATE TABLE \`marks\` (
  \`mark_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_id\` INT NOT NULL,
  \`subject_id\` INT NOT NULL,
  \`assessment\` VARCHAR(50) NOT NULL,
  \`marks_obtained\` DECIMAL(5,2) NOT NULL,
  \`date_recorded\` DATE DEFAULT (CURRENT_DATE),
  CONSTRAINT \`chk_marks_non_negative\` CHECK (\`marks_obtained\` >= 0),
  CONSTRAINT \`fk_marks_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`student_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_marks_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`subject_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY \`uniq_student_subject_assessment\` (\`student_id\`, \`subject_id\`, \`assessment\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping data for table \`students\`
-- --------------------------------------------------------
INSERT INTO \`students\` (\`student_id\`, \`roll_no\`, \`name\`, \`section\`, \`email\`) VALUES
${students.map(s => `(${s.student_id}, '${s.roll_no}', '${s.name.replace(/'/g, "''")}', '${s.section}', '${s.email || ''}')`).join(',\n')};

-- --------------------------------------------------------
-- Dumping data for table \`subjects\`
-- --------------------------------------------------------
INSERT INTO \`subjects\` (\`subject_id\`, \`subject_name\`, \`subject_code\`, \`max_marks\`, \`pass_marks\`) VALUES
${subjects.map(s => `(${s.subject_id}, '${s.subject_name.replace(/'/g, "''")}', '${s.subject_code || ''}', ${s.max_marks}, ${s.pass_marks})`).join(',\n')};

-- --------------------------------------------------------
-- Dumping data for table \`marks\`
-- --------------------------------------------------------
INSERT INTO \`marks\` (\`mark_id\`, \`student_id\`, \`subject_id\`, \`assessment\`, \`marks_obtained\`, \`date_recorded\`) VALUES
${marks.map(m => `(${m.mark_id}, ${m.student_id}, ${m.subject_id}, '${m.assessment}', ${m.marks_obtained}, '${m.date_recorded || '2026-06-20'}')`).join(',\n')};

-- ========================================================
-- Useful Analytical Views in MySQL
-- ========================================================

-- Subject-wise Summary View
CREATE OR REPLACE VIEW \`view_subject_summary\` AS
SELECT 
    s.subject_id,
    s.subject_name,
    s.max_marks,
    s.pass_marks,
    COUNT(m.mark_id) AS total_appeared,
    SUM(CASE WHEN m.marks_obtained >= s.pass_marks THEN 1 ELSE 0 END) AS passed_count,
    SUM(CASE WHEN m.marks_obtained < s.pass_marks THEN 1 ELSE 0 END) AS failed_count,
    ROUND((SUM(CASE WHEN m.marks_obtained >= s.pass_marks THEN 1 ELSE 0 END) / COUNT(m.mark_id)) * 100, 2) AS pass_percentage,
    ROUND(AVG(m.marks_obtained), 2) AS avg_marks,
    MIN(m.marks_obtained) AS min_marks,
    MAX(m.marks_obtained) AS max_marks_obtained
FROM \`subjects\` s
LEFT JOIN \`marks\` m ON s.subject_id = m.subject_id
GROUP BY s.subject_id, s.subject_name, s.max_marks, s.pass_marks;

-- Student Overall Performance View
CREATE OR REPLACE VIEW \`view_student_performance\` AS
SELECT 
    st.student_id,
    st.roll_no,
    st.name,
    st.section,
    m.assessment,
    SUM(m.marks_obtained) AS total_marks_obtained,
    SUM(sub.max_marks) AS total_max_marks,
    ROUND((SUM(m.marks_obtained) / SUM(sub.max_marks)) * 100, 2) AS percentage,
    SUM(CASE WHEN m.marks_obtained < sub.pass_marks THEN 1 ELSE 0 END) AS failed_subjects_count
FROM \`students\` st
JOIN \`marks\` m ON st.student_id = m.student_id
JOIN \`subjects\` sub ON m.subject_id = sub.subject_id
GROUP BY st.student_id, st.roll_no, st.name, st.section, m.assessment;
`;
  }

  public static exportAsCsv(): string {
    const students = this.getStudents();
    const subjects = this.getSubjects();
    const marks = this.getMarks();

    const studentMap = new Map(students.map(s => [s.student_id, s]));
    const subjectMap = new Map(subjects.map(s => [s.subject_id, s]));

    const header = ['Mark ID', 'Roll No', 'Student Name', 'Section', 'Subject', 'Assessment', 'Marks Obtained', 'Max Marks', 'Pass Marks', 'Status', 'Date'];
    const rows = marks.map(m => {
      const student = studentMap.get(m.student_id);
      const subject = subjectMap.get(m.subject_id);
      const isPass = subject ? m.marks_obtained >= subject.pass_marks : false;
      return [
        m.mark_id,
        student?.roll_no || '',
        `"${student?.name || ''}"`,
        student?.section || '',
        `"${subject?.subject_name || ''}"`,
        m.assessment,
        m.marks_obtained,
        subject?.max_marks || 100,
        subject?.pass_marks || 40,
        isPass ? 'PASS' : 'FAIL',
        m.date_recorded || '',
      ].join(',');
    });

    return [header.join(','), ...rows].join('\n');
  }
}
