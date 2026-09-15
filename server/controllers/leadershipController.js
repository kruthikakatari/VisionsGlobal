import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';

const AT_RISK_THRESHOLD = 50;

// GET /api/leadership/analytics (leadership only)
//
// Built entirely from Assignment/Submission data (P3's own tables), since
// Member 2's Assessment/Progress models (real assessment-based learning
// gaps, official performance scores) live on an unmerged branch. This is
// a reasonable proxy, not a duplicate of their scoring logic:
//   - totalStudents: distinct students who appear in assignedTo — only
//     students with at least one assignment are counted (no Student
//     collection to query directly yet)
//   - "improving": first-half vs second-half average grade per student,
//     a simple trend heuristic — not P2's real progress analysis
//   - "learning gaps": topics where a student scored below the at-risk
//     threshold, aggregated across students — not P2's assessment-based
//     gap detection
export async function getAnalytics(req, res) {
  try {
    const [submissions, assignments] = await Promise.all([
      Submission.find({ grade: { $ne: null } })
        .sort({ submittedAt: 1 })
        .populate('assignment', 'topic subject title'),
      Assignment.find().select('assignedTo'),
    ]);

    const studentIds = new Set();
    assignments.forEach((a) => a.assignedTo.forEach((id) => studentIds.add(String(id))));
    const totalStudents = studentIds.size;

    const byStudent = new Map();
    for (const s of submissions) {
      const key = String(s.student);
      if (!byStudent.has(key)) byStudent.set(key, []);
      byStudent.get(key).push(s);
    }

    let sumGrades = 0;
    let gradeCount = 0;
    let studentsImproving = 0;
    let studentsAtRisk = 0;
    const studentsRequiringSupport = [];
    const gapCounts = new Map();

    for (const [studentId, subs] of byStudent) {
      const grades = subs.map((s) => s.grade);
      sumGrades += grades.reduce((a, b) => a + b, 0);
      gradeCount += grades.length;

      const avg = grades.reduce((a, b) => a + b, 0) / grades.length;

      if (avg < AT_RISK_THRESHOLD) {
        studentsAtRisk += 1;
        studentsRequiringSupport.push({ studentId, averageGrade: Math.round(avg) });
      }

      if (grades.length >= 2) {
        const mid = Math.floor(grades.length / 2);
        const firstHalfAvg = grades.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
        const secondHalfAvg = grades.slice(mid).reduce((a, b) => a + b, 0) / (grades.length - mid);
        if (secondHalfAvg > firstHalfAvg) studentsImproving += 1;
      }

      subs
        .filter((s) => s.grade < AT_RISK_THRESHOLD)
        .forEach((s) => {
          const topic = s.assignment?.topic || s.assignment?.subject || s.assignment?.title;
          if (topic) gapCounts.set(topic, (gapCounts.get(topic) || 0) + 1);
        });
    }

    const averagePerformance = gradeCount > 0 ? Math.round(sumGrades / gradeCount) : null;

    const commonLearningGaps = [...gapCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, studentCount]) => ({ topic, studentCount }));

    res.json({
      totalStudents,
      averagePerformance,
      studentsImproving,
      studentsAtRisk,
      commonLearningGaps,
      studentsRequiringSupport,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leadership analytics', error: err.message });
  }
}
