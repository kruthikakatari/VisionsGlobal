import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Loader2, CalendarDays, Clock, FileText, Users, ArrowLeft } from 'lucide-react';

import StudentList      from './features/students/StudentList';
import StudentProfile   from './features/students/StudentProfile';
import AddEditStudent   from './features/students/AddEditStudent';
import EducatorProfile  from './features/educators/EducatorProfile';
import AssignedStudents from './features/educators/AssignedStudents';
import SessionLogger    from './features/educators/SessionLogger';
import { AssessmentPage } from './pages/AssessmentPage.jsx';

import { ensureAuth, getCurrentUser } from './api/auth';
import * as studentApi from './api/student';
import * as educatorApi from './api/educator';

// Member 3's pages (Content Library, Assignments, AI Assistant, Parent,
// Leadership) and the temporary student login. These live in their own
// features/ folders (content, assignments, parent, leadership, auth) which
// don't overlap with Member 1's features/ folders (students, educators).
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import LeadershipDashboard from './pages/LeadershipDashboard.jsx';
import { StudentLoginForm, LoginForm } from './features/auth/index.js';

// Fallback demo students if offline
const FALLBACK_STUDENTS = [
  {
    _id: 'demo-1',
    personal: { name: 'Aarav Kumar',  age: 14, gender: 'Male',   grade: '9th', preferredLanguage: 'Tamil' },
    academic: { school: 'Govt Higher Secondary',          currentLevel: 'Intermediate', enrollmentStatus: 'Active',    enrollmentDate: '2023-06-01' },
    familyBackground: { parentGuardianName: 'Suresh K', householdInformation: 'Joint family', parentOccupation: 'Farmer', familyIncomeRange: '₹10,000–₹25,000', numberOfFamilyMembers: 6, educationBackground: 'First generation learner', otherSupportFactors: '' },
    location: { district: 'Madurai', cluster: 'North', villageArea: 'Othakadai' },
  },
  {
    _id: 'demo-2',
    personal: { name: 'Kavya S',      age: 12, gender: 'Female', grade: '7th', preferredLanguage: 'Tamil' },
    academic: { school: 'Panchayat Union Middle School', currentLevel: 'Beginner',      enrollmentStatus: 'Active',    enrollmentDate: '2023-06-05' },
    familyBackground: { parentGuardianName: 'Selvam S', householdInformation: 'Single parent', parentOccupation: 'Daily wage worker', familyIncomeRange: 'Below ₹10,000', numberOfFamilyMembers: 3, educationBackground: '', otherSupportFactors: 'Requires transport support' },
    location: { district: 'Madurai', cluster: 'North', villageArea: 'Melur' },
  }
];

function NavBar({ isOffline }) {
  const loc = useLocation();
  const links = [
    { to: '/',              label: 'Students' },
    { to: '/educator',      label: 'Educator' },
    { to: '/assessments',   label: 'Assessments' },
    { to: '/dashboard',     label: 'Content & Assignments' },
    { to: '/parent',        label: 'Parent' },
    { to: '/leadership',    label: 'Leadership' },
    { to: '/student-login', label: 'Student / Parent Login' },
    { to: '/login',         label: 'Educator / Leadership Login' },
  ];
  return (
    <header className="sticky top-0 z-20 bg-indigo-700 text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Visions Learn</span>
          {isOffline ? (
            <span className="flex items-center gap-1 text-xs bg-amber-500/20 border border-amber-300/40 text-amber-200 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" /> Online
            </span>
          )}
        </div>
        <nav className="flex gap-1 flex-wrap justify-end">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                loc.pathname === to
                  ? 'bg-white text-indigo-700'
                  : 'text-indigo-200 hover:bg-indigo-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ── Students View Manager ───────────────────────────────────────────────────
function StudentsPage({ isOffline, setIsOffline }) {
  const [view, setView]         = useState('list'); // list | profile | add | edit
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      await ensureAuth();
      const data = await studentApi.getStudents();
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        // If DB is empty, set empty array
        setStudents(data || []);
      }
      setIsOffline(false);
    } catch (err) {
      console.warn('Failed to load students online, using local cache:', err);
      setIsOffline(true);
      setStudents(FALLBACK_STUDENTS);
    } finally {
      setLoading(false);
    }
  }, [setIsOffline]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Sanitize form data: coerce numeric string fields to Number before sending to API
  const sanitizeStudentData = (formData) => ({
    ...formData,
    personal: {
      ...formData.personal,
      age: formData.personal.age !== '' ? Number(formData.personal.age) : undefined,
    },
    familyBackground: {
      ...formData.familyBackground,
      numberOfFamilyMembers:
        formData.familyBackground.numberOfFamilyMembers !== ''
          ? Number(formData.familyBackground.numberOfFamilyMembers)
          : undefined,
    },
  });

  const handleSaveNew = async (formData) => {
    try {
      await ensureAuth();
      const sanitized = sanitizeStudentData(formData);
      const res = await studentApi.createStudent(sanitized);
      // res now has { student, credentials } from the updated API
      if (res?.student) {
        setStudents((prev) => [res.student, ...prev]);
      }
      setIsOffline(false);
      // Return credentials so AddEditStudent can show the credential card.
      // We do NOT navigate away yet — the user needs to see/copy the credentials first.
      return { credentials: res?.credentials || null };
    } catch (err) {
      console.error('Failed to save student to DB:', err);
      alert(`Failed to save student: ${err.message}`);
    }
  };


  const handleSaveEdit = async (formData) => {
    try {
      await ensureAuth();
      const updated = await studentApi.updateStudent(selected._id, formData);
      const resStudent = updated || { ...selected, ...formData };
      setStudents((prev) => prev.map((s) => (s._id === resStudent._id ? resStudent : s)));
      setSelected(resStudent);
      setIsOffline(false);
      setView('profile');
    } catch (err) {
      console.warn('Network error updating student:', err);
      setIsOffline(true);
      const updated = { ...selected, ...formData };
      setStudents((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      setSelected(updated);
      setView('profile');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-gray-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-base font-medium">Connecting to Visions database…</p>
      </div>
    );
  }

  if (view === 'profile' && selected) {
    return (
      <StudentProfile
        student={selected}
        isOffline={isOffline}
        onBack={() => setView('list')}
        onEdit={(s) => { setSelected(s); setView('edit'); }}
      />
    );
  }

  if (view === 'add') {
    return (
      <AddEditStudent
        onCancel={() => setView('list')}
        onSave={handleSaveNew}
      />
    );
  }

  if (view === 'edit' && selected) {
    return (
      <AddEditStudent
        student={selected}
        onCancel={() => setView('profile')}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <StudentList
      students={students}
      isOffline={isOffline}
      onSelectStudent={(s) => { setSelected(s); setView('profile'); }}
      onAddStudent={() => setView('add')}
    />
  );
}

// ── Educator View Manager ───────────────────────────────────────────────────
function EducatorPage({ isOffline, setIsOffline }) {
  const [view, setView]         = useState('profile'); // profile | students | session | history
  const [educator, setEducator] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchEducator = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureAuth();
      if (user?._id) {
        const eduData = await educatorApi.getEducator(user._id);
        setEducator(eduData);
        if (eduData?.sessions) {
          setSessions(eduData.sessions);
        }
      }
      setIsOffline(false);
    } catch (err) {
      console.warn('Using fallback educator profile:', err);
      setIsOffline(true);
      setEducator({
        _id: 'e1',
        user: { name: 'Priya Rajan', email: 'priya.educator@visionslearn.org', role: 'educator' },
        assignedClusters: ['North', 'Central'],
        assignedStudents: FALLBACK_STUDENTS,
        sessions: [],
      });
    } finally {
      setLoading(false);
    }
  }, [setIsOffline]);

  useEffect(() => {
    fetchEducator();
  }, [fetchEducator]);

  const handleSaveSession = async (sessionData) => {
    try {
      if (educator?._id) {
        const created = await educatorApi.createSession(educator._id, sessionData);
        if (created) {
          setSessions((prev) => [created, ...prev]);
        }
      }
      setIsOffline(false);
      setView('profile');
    } catch (err) {
      console.warn('Network error saving session, saving locally:', err);
      setIsOffline(true);
      const mockSession = { ...sessionData, _id: 'sess-' + Date.now() };
      setSessions((prev) => [mockSession, ...prev]);
      setView('profile');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-gray-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-base font-medium">Loading educator profile…</p>
      </div>
    );
  }

  const assigned = educator?.assignedStudents || [];

  if (view === 'students') {
    return (
      <AssignedStudents
        students={assigned}
        onBack={() => setView('profile')}
        onSelectStudent={(s) => console.log('Selected student:', s)}
      />
    );
  }

  if (view === 'session') {
    return (
      <SessionLogger
        assignedStudents={assigned}
        onBack={() => setView('profile')}
        onSave={handleSaveSession}
      />
    );
  }

  if (view === 'history') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('profile')}
            className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          Session History ({sessions.length})
        </h1>
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 p-6">
            <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-lg font-medium text-gray-700">No sessions logged yet.</p>
            <p className="text-sm text-gray-400 mt-1">Logged sessions will appear here with attendance & notes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((sess, idx) => (
              <div key={sess._id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-gray-900 text-lg">{sess.topic}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {sess.durationMinutes} mins
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Date: {sess.date ? new Date(sess.date).toLocaleDateString('en-IN') : 'N/A'}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {sess.studentsAttended?.length ?? 0} students attended
                  </span>
                </div>
                {sess.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mt-1 border border-gray-100 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{sess.notes}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <EducatorProfile
      educator={educator}
      onViewStudents={() => setView('students')}
      onLogSession={() => setView('session')}
      onViewSessions={() => setView('history')}
    />
  );
}

// ── Member 3's routes ────────────────────────────────────────────────────────
// /dashboard hosts Content Library + Assignments + AI Assistant in one page
// (EducatorDashboard.jsx); its children already branch their UI by role
// (educator vs student) internally, same pattern as StudentsPage/EducatorPage
// above, so it just needs a session to exist. ensureAuth() auto-provisions
// the demo educator if nothing is logged in yet, but leaves an existing
// session (e.g. a student who used /student-login) untouched.
function DashboardRoute() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAuth().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-gray-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-base font-medium">Loading dashboard…</p>
      </div>
    );
  }

  return <EducatorDashboard />;
}

// /parent and /leadership deliberately do NOT call ensureAuth(): there's no
// real parent/leadership login screen yet (only the demo educator is
// auto-provisioned), so auto-logging in as an educator here would be wrong.
// Visiting these routes without a parent/leadership session shows the
// backend's 401/403 message via each page's existing error handling.
function StudentLoginPage() {
  const navigate = useNavigate();
  return <StudentLoginForm onLoggedIn={() => navigate('/dashboard')} />;
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <NavBar isOffline={isOffline} />
        <main className="flex-1 py-4">
          <Routes>
            <Route path="/"              element={<StudentsPage  isOffline={isOffline} setIsOffline={setIsOffline} />} />
            <Route path="/educator"      element={<EducatorPage  isOffline={isOffline} setIsOffline={setIsOffline} />} />
            <Route path="/assessments"   element={<AssessmentPage />} />
            <Route path="/dashboard"     element={<DashboardRoute />} />
            <Route path="/parent"        element={<ParentDashboard />} />
            <Route path="/leadership"    element={<LeadershipDashboard />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route path="/login"         element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
