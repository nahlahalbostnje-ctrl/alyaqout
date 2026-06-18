import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchMe } from './features/auth/authSlice';
import LoginPage                  from './pages/LoginPage';
import DashboardPage              from './pages/DashboardPage';
import AdminDashboardPage         from './pages/AdminDashboardPage';
import GradesPage                 from './pages/GradesPage';
import CategoriesPage             from './pages/CategoriesPage';
import CoursesPage                from './pages/CoursesPage';
import UsersPage                  from './pages/UsersPage';
import PackagesPage               from './pages/PackagesPage';
import LiveClassesPage            from './pages/LiveClassesPage';
import SubscriptionsPage          from './pages/SubscriptionsPage';
import AdminNotificationsPage     from './pages/AdminNotificationsPage';
import CourseContentPage          from './pages/CourseContentPage';
import StudentDashboardPage       from './pages/StudentDashboardPage';
import StudentCoursesPage         from './pages/StudentCoursesPage';
import StudentLiveClassesPage     from './pages/StudentLiveClassesPage';
import StudentCourseContentPage   from './pages/StudentCourseContentPage';
import StudentExamsPage           from './pages/StudentExamsPage';
import StudentHomeworkPage        from './pages/StudentHomeworkPage';
import StudentReportPage          from './pages/StudentReportPage';
import StudentPointsPage          from './pages/StudentPointsPage';
import StudentLeaguePage          from './pages/StudentLeaguePage';
import StudentStudyRoomPage       from './pages/StudentStudyRoomPage';
import SupervisorStudyRoomPage    from './pages/SupervisorStudyRoomPage';
import TeacherEmergencyPage       from './pages/TeacherEmergencyPage';
import AdminSettingsPage          from './pages/AdminSettingsPage';
import AdminLeaguePage            from './pages/AdminLeaguePage';
import AdminCouponsPage           from './pages/AdminCouponsPage';
import AdminBannersPage           from './pages/AdminBannersPage';
import AdminLeadsPage             from './pages/AdminLeadsPage';
import AdminCMSPage               from './pages/AdminCMSPage';
import AdminSupervisorAssignmentPage from './pages/AdminSupervisorAssignmentPage';
import AdminTeacherApprovalsPage    from './pages/AdminTeacherApprovalsPage';
import LiveRoomPage               from './pages/LiveRoomPage';
import TeacherDashboardPage       from './pages/TeacherDashboardPage';
import TeacherCoursesPage         from './pages/TeacherCoursesPage';
import TeacherLiveClassesPage     from './pages/TeacherLiveClassesPage';
import TeacherExamsPage           from './pages/TeacherExamsPage';
import TeacherHomeworkPage        from './pages/TeacherHomeworkPage';
import ParentDashboardPage        from './pages/ParentDashboardPage';
import ParentChildrenPage         from './pages/ParentChildrenPage';
import ParentReportPage           from './pages/ParentReportPage';
import SupervisorStudentsPage     from './pages/SupervisorStudentsPage';
import CountryAdminsPage          from './pages/CountryAdminsPage';
import SuperAdminProfilePage      from './pages/SuperAdminProfilePage';
import PrivateRoute               from './components/PrivateRoute';
import WhatsAppButton             from './components/WhatsAppButton';
import CookieConsent              from './components/CookieConsent';
import LandingPage                from './pages/LandingPage';
import GlobalCursor               from './components/GlobalCursor';

export default function App() {
  const dispatch   = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem('yaqoot_token'));

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe()).finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <GlobalCursor />
      <WhatsAppButton />
      <CookieConsent />
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Super Admin */}
        <Route path="/dashboard" element={
          <PrivateRoute roles={['super_admin']}><DashboardPage /></PrivateRoute>
        } />
        <Route path="/dashboard/countries/:countryId/admins" element={
          <PrivateRoute roles={['super_admin']}><CountryAdminsPage /></PrivateRoute>
        } />
        <Route path="/super-admin/profile" element={
          <PrivateRoute roles={['super_admin']}><SuperAdminProfilePage /></PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute roles={['admin']}><AdminDashboardPage /></PrivateRoute>
        } />
        <Route path="/admin/grades" element={
          <PrivateRoute roles={['admin']}><GradesPage /></PrivateRoute>
        } />
        <Route path="/admin/categories" element={
          <PrivateRoute roles={['admin']}><CategoriesPage /></PrivateRoute>
        } />
        <Route path="/admin/courses" element={
          <PrivateRoute roles={['admin']}><CoursesPage /></PrivateRoute>
        } />
        <Route path="/admin/courses/:courseId/content" element={
          <PrivateRoute roles={['admin']}><CourseContentPage /></PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>
        } />
        <Route path="/admin/packages" element={
          <PrivateRoute roles={['admin']}><PackagesPage /></PrivateRoute>
        } />
        <Route path="/admin/subscriptions" element={
          <PrivateRoute roles={['admin']}><SubscriptionsPage /></PrivateRoute>
        } />
        <Route path="/admin/notifications" element={
          <PrivateRoute roles={['admin']}><AdminNotificationsPage /></PrivateRoute>
        } />
        <Route path="/admin/live-classes" element={
          <PrivateRoute roles={['admin']}><LiveClassesPage /></PrivateRoute>
        } />
        <Route path="/admin/leagues" element={
          <PrivateRoute roles={['admin']}><AdminLeaguePage /></PrivateRoute>
        } />
        <Route path="/admin/coupons" element={
          <PrivateRoute roles={['admin']}><AdminCouponsPage /></PrivateRoute>
        } />
        <Route path="/admin/banners" element={
          <PrivateRoute roles={['admin']}><AdminBannersPage /></PrivateRoute>
        } />
        <Route path="/admin/leads" element={
          <PrivateRoute roles={['admin']}><AdminLeadsPage /></PrivateRoute>
        } />
        <Route path="/admin/cms" element={
          <PrivateRoute roles={['admin']}><AdminCMSPage /></PrivateRoute>
        } />
        <Route path="/admin/supervisors" element={
          <PrivateRoute roles={['admin']}><AdminSupervisorAssignmentPage /></PrivateRoute>
        } />
        <Route path="/admin/approvals" element={
          <PrivateRoute roles={['admin']}><AdminTeacherApprovalsPage /></PrivateRoute>
        } />
        <Route path="/admin/settings" element={
          <PrivateRoute roles={['admin']}><AdminSettingsPage /></PrivateRoute>
        } />

        {/* Student */}
        <Route path="/student/dashboard" element={
          <PrivateRoute roles={['student']}><StudentDashboardPage /></PrivateRoute>
        } />
        <Route path="/student/courses" element={
          <PrivateRoute roles={['student']}><StudentCoursesPage /></PrivateRoute>
        } />
        <Route path="/student/courses/:courseId/content" element={
          <PrivateRoute roles={['student']}><StudentCourseContentPage /></PrivateRoute>
        } />
        <Route path="/student/live-classes" element={
          <PrivateRoute roles={['student']}><StudentLiveClassesPage /></PrivateRoute>
        } />
        <Route path="/student/exams" element={
          <PrivateRoute roles={['student']}><StudentExamsPage /></PrivateRoute>
        } />
        <Route path="/student/homework" element={
          <PrivateRoute roles={['student']}><StudentHomeworkPage /></PrivateRoute>
        } />
        <Route path="/student/report" element={
          <PrivateRoute roles={['student']}><StudentReportPage /></PrivateRoute>
        } />
        <Route path="/student/points" element={
          <PrivateRoute roles={['student']}><StudentPointsPage /></PrivateRoute>
        } />
        <Route path="/student/league" element={
          <PrivateRoute roles={['student']}><StudentLeaguePage /></PrivateRoute>
        } />
        <Route path="/student/study-room" element={
          <PrivateRoute roles={['student']}><StudentStudyRoomPage /></PrivateRoute>
        } />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={
          <PrivateRoute roles={['teacher']}><TeacherDashboardPage /></PrivateRoute>
        } />
        <Route path="/teacher/courses" element={
          <PrivateRoute roles={['teacher']}><TeacherCoursesPage /></PrivateRoute>
        } />
        <Route path="/teacher/live-classes" element={
          <PrivateRoute roles={['teacher']}><TeacherLiveClassesPage /></PrivateRoute>
        } />
        <Route path="/teacher/exams" element={
          <PrivateRoute roles={['teacher']}><TeacherExamsPage /></PrivateRoute>
        } />
        <Route path="/teacher/homework" element={
          <PrivateRoute roles={['teacher']}><TeacherHomeworkPage /></PrivateRoute>
        } />
        <Route path="/teacher/emergency" element={
          <PrivateRoute roles={['teacher']}><TeacherEmergencyPage /></PrivateRoute>
        } />

        {/* Parent */}
        <Route path="/parent/dashboard" element={
          <PrivateRoute roles={['parent']}><ParentDashboardPage /></PrivateRoute>
        } />
        <Route path="/parent/children" element={
          <PrivateRoute roles={['parent']}><ParentChildrenPage /></PrivateRoute>
        } />
        <Route path="/parent/children/:studentId/report" element={
          <PrivateRoute roles={['parent']}><ParentReportPage /></PrivateRoute>
        } />

        {/* Supervisor */}
        <Route path="/supervisor/dashboard" element={
          <PrivateRoute roles={['supervisor']}><SupervisorStudentsPage /></PrivateRoute>
        } />
        <Route path="/supervisor/students" element={
          <PrivateRoute roles={['supervisor']}><SupervisorStudentsPage /></PrivateRoute>
        } />
        <Route path="/supervisor/study-room" element={
          <PrivateRoute roles={['supervisor']}><SupervisorStudyRoomPage /></PrivateRoute>
        } />

        {/* Live Room — accessible to teacher, student, and admin (observer) */}
        <Route path="/live/:channel" element={
          <PrivateRoute roles={['teacher', 'student', 'admin']}><LiveRoomPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
