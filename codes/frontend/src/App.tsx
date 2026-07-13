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
import SupervisorAssignmentsPage  from './pages/SupervisorAssignmentsPage';
import SupervisorQuizMonitoringPage from './pages/SupervisorQuizMonitoringPage';
import SupervisorPerformancePage  from './pages/SupervisorPerformancePage';
import SupervisorCounselingPage   from './pages/SupervisorCounselingPage';
import SupervisorChatPage         from './pages/SupervisorChatPage';
import SupervisorSettingsPage     from './pages/SupervisorSettingsPage';
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
import TeacherMobileApp           from './pages/TeacherMobileApp';
import TeacherCoursesPage         from './pages/TeacherCoursesPage';
import TeacherLiveClassesPage     from './pages/TeacherLiveClassesPage';
import TeacherExamsPage           from './pages/TeacherExamsPage';
import TeacherHomeworkPage        from './pages/TeacherHomeworkPage';
import ParentDashboardPage        from './pages/ParentDashboardPage';
import ParentChildrenPage         from './pages/ParentChildrenPage';
import ParentReportPage           from './pages/ParentReportPage';
import ParentAcademicProgressPage from './pages/ParentAcademicProgressPage';
import ParentAttendancePage       from './pages/ParentAttendancePage';
import ParentCommunicationPage    from './pages/ParentCommunicationPage';
import ParentNotificationsPage    from './pages/ParentNotificationsPage';
import ParentCounselingPage       from './pages/ParentCounselingPage';
import ParentBillingPage          from './pages/ParentBillingPage';
import ParentLeaguePage           from './pages/ParentLeaguePage';
import ParentAcademyPage          from './pages/ParentAcademyPage';
import ParentAchievementsPage     from './pages/ParentAchievementsPage';
import ParentReportsPage          from './pages/ParentReportsPage';
import ParentAIAssistantPage      from './pages/ParentAIAssistantPage';
import ParentSettingsPage         from './pages/ParentSettingsPage';
import SupervisorStudentsPage     from './pages/SupervisorStudentsPage';
import SupervisorAIAssistantPage  from './pages/SupervisorAIAssistantPage';
import CountryAdminsPage          from './pages/CountryAdminsPage';
import SuperAdminProfilePage      from './pages/SuperAdminProfilePage';
import SAAnalyticsPage            from './pages/SAAnalyticsPage';
import SASchoolsPage              from './pages/SASchoolsPage';
import SACountriesPage            from './pages/SACountriesPage';
import SAStaffPage                from './pages/SAStaffPage';
import SAStudentsPage             from './pages/SAStudentsPage';
import SAContentApprovalsPage     from './pages/SAContentApprovalsPage';
import SABillingPage              from './pages/SABillingPage';
import SAPlansPage                from './pages/SAPlansPage';
import SAReportsPage              from './pages/SAReportsPage';
import SANotificationsPage        from './pages/SANotificationsPage';
import SASettingsPage             from './pages/SASettingsPage';
import SARolesPage                from './pages/SARolesPage';
import SAActivityLogPage          from './pages/SAActivityLogPage';
import SAMessagesPage              from './pages/SAMessagesPage';
import SASupportPage              from './pages/SASupportPage';
import SADevCenterPage            from './pages/SADevCenterPage';
import AdminPersonalItemsPage     from './pages/AdminPersonalItemsPage';
import TeacherPersonalItemsPage   from './pages/TeacherPersonalItemsPage';
import ParentPersonalItemsPage    from './pages/ParentPersonalItemsPage';
import SupervisorPersonalItemsPage from './pages/SupervisorPersonalItemsPage';
import StudentEmergencyPage       from './pages/StudentEmergencyPage';
import StudentPeerLeaguePage      from './pages/StudentPeerLeaguePage';
import StudentStudy24Page         from './pages/StudentStudy24Page';
import StudentMessagesPage        from './pages/StudentMessagesPage';
import StudentTeacherContactPage  from './pages/StudentTeacherContactPage';
import TeacherAttendancePage      from './pages/TeacherAttendancePage';
import AdminApprovalsPage         from './pages/AdminApprovalsPage';
import AdminAnalyticsPage         from './pages/AdminAnalyticsPage';
import AdminTeacherManagementPage from './pages/AdminTeacherManagementPage';
import AdminCitiesPage            from './pages/AdminCitiesPage';
import AdminAuditLogPage          from './pages/AdminAuditLogPage';
import SuperAdminSecurityPage     from './pages/SuperAdminSecurityPage';
import TeacherSchedulePage        from './pages/TeacherSchedulePage';
import StudentReviewVideosPage    from './pages/StudentReviewVideosPage';
import StudentLibraryPage         from './pages/StudentLibraryPage';
import StudentTalentsPage         from './pages/StudentTalentsPage';
import StudentStudyBuddyPage      from './pages/StudentStudyBuddyPage';
import StudentCounselorPage       from './pages/StudentCounselorPage';
import StudentTimeCapsulePage     from './pages/StudentTimeCapsulePage';
import StudentChallengesPage      from './pages/StudentChallengesPage';
import StudentNotificationsPage   from './pages/StudentNotificationsPage';
import PrivateRoute               from './components/PrivateRoute';
import WhatsAppButton             from './components/WhatsAppButton';
import CookieConsent              from './components/CookieConsent';
import LandingPage                from './pages/LandingPage';

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
  }, [dispatch]);

  if (initializing) return null;

  return (
    <BrowserRouter>
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
        <Route path="/dashboard/analytics" element={
          <PrivateRoute roles={['super_admin']}><SAAnalyticsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/schools" element={
          <PrivateRoute roles={['super_admin']}><SASchoolsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/countries" element={
          <PrivateRoute roles={['super_admin']}><SACountriesPage /></PrivateRoute>
        } />
        <Route path="/dashboard/staff" element={
          <PrivateRoute roles={['super_admin']}><SAStaffPage /></PrivateRoute>
        } />
        <Route path="/dashboard/students" element={
          <PrivateRoute roles={['super_admin']}><SAStudentsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/content-approvals" element={
          <PrivateRoute roles={['super_admin']}><SAContentApprovalsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/billing" element={
          <PrivateRoute roles={['super_admin']}><SABillingPage /></PrivateRoute>
        } />
        <Route path="/dashboard/plans" element={
          <PrivateRoute roles={['super_admin']}><SAPlansPage /></PrivateRoute>
        } />
        <Route path="/dashboard/reports" element={
          <PrivateRoute roles={['super_admin']}><SAReportsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/notifications" element={
          <PrivateRoute roles={['super_admin']}><SANotificationsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/settings" element={
          <PrivateRoute roles={['super_admin']}><SASettingsPage /></PrivateRoute>
        } />
        <Route path="/dashboard/roles" element={
          <PrivateRoute roles={['super_admin']}><SARolesPage /></PrivateRoute>
        } />
        <Route path="/dashboard/activity-log" element={
          <PrivateRoute roles={['super_admin']}><SAActivityLogPage /></PrivateRoute>
        } />
        <Route path="/dashboard/messages" element={
          <PrivateRoute roles={['super_admin']}><SAMessagesPage /></PrivateRoute>
        } />
        <Route path="/dashboard/support" element={
          <PrivateRoute roles={['super_admin']}><SASupportPage /></PrivateRoute>
        } />
        <Route path="/dashboard/dev-center" element={
          <PrivateRoute roles={['super_admin']}><SADevCenterPage /></PrivateRoute>
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
        <Route path="/admin/my-items" element={
          <PrivateRoute roles={['admin']}><AdminPersonalItemsPage /></PrivateRoute>
        } />
        <Route path="/admin/approval-requests" element={
          <PrivateRoute roles={['admin']}><AdminApprovalsPage /></PrivateRoute>
        } />
        <Route path="/admin/teacher-management" element={
          <PrivateRoute roles={['admin']}><AdminTeacherManagementPage /></PrivateRoute>
        } />
        <Route path="/admin/analytics" element={
          <PrivateRoute roles={['admin']}><AdminAnalyticsPage /></PrivateRoute>
        } />
        <Route path="/admin/cities" element={
          <PrivateRoute roles={['admin']}><AdminCitiesPage /></PrivateRoute>
        } />
        <Route path="/admin/audit-log" element={
          <PrivateRoute roles={['admin']}><AdminAuditLogPage /></PrivateRoute>
        } />

        {/* Super Admin Security */}
        <Route path="/super-admin/security" element={
          <PrivateRoute roles={['super_admin']}><SuperAdminSecurityPage /></PrivateRoute>
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
        <Route path="/student/emergency" element={
          <PrivateRoute roles={['student']}><StudentEmergencyPage /></PrivateRoute>
        } />
        <Route path="/student/peer-league" element={
          <PrivateRoute roles={['student']}><StudentPeerLeaguePage /></PrivateRoute>
        } />
        <Route path="/student/study-24" element={
          <PrivateRoute roles={['student']}><StudentStudy24Page /></PrivateRoute>
        } />
        <Route path="/student/messages" element={
          <PrivateRoute roles={['student']}><StudentMessagesPage /></PrivateRoute>
        } />
        <Route path="/student/teacher-contact" element={
          <PrivateRoute roles={['student']}><StudentTeacherContactPage /></PrivateRoute>
        } />
        <Route path="/student/library" element={
          <PrivateRoute roles={['student']}><StudentLibraryPage /></PrivateRoute>
        } />
        <Route path="/student/talents" element={
          <PrivateRoute roles={['student']}><StudentTalentsPage /></PrivateRoute>
        } />
        <Route path="/student/study-buddy" element={
          <PrivateRoute roles={['student']}><StudentStudyBuddyPage /></PrivateRoute>
        } />
        <Route path="/student/counselor" element={
          <PrivateRoute roles={['student']}><StudentCounselorPage /></PrivateRoute>
        } />
        <Route path="/student/time-capsule" element={
          <PrivateRoute roles={['student']}><StudentTimeCapsulePage /></PrivateRoute>
        } />
        <Route path="/student/challenges" element={
          <PrivateRoute roles={['student']}><StudentChallengesPage /></PrivateRoute>
        } />
        <Route path="/student/notifications" element={
          <PrivateRoute roles={['student']}><StudentNotificationsPage /></PrivateRoute>
        } />
        <Route path="/student/review-videos" element={
          <PrivateRoute roles={['student']}><StudentReviewVideosPage /></PrivateRoute>
        } />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={
          <PrivateRoute roles={['teacher']}><TeacherMobileApp /></PrivateRoute>
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
        <Route path="/teacher/my-items" element={
          <PrivateRoute roles={['teacher']}><TeacherPersonalItemsPage /></PrivateRoute>
        } />
        <Route path="/teacher/attendance" element={
          <PrivateRoute roles={['teacher']}><TeacherAttendancePage /></PrivateRoute>
        } />
        <Route path="/teacher/schedule" element={
          <PrivateRoute roles={['teacher']}><TeacherSchedulePage /></PrivateRoute>
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

        <Route path="/parent/academic-progress" element={
          <PrivateRoute roles={['parent']}><ParentAcademicProgressPage /></PrivateRoute>
        } />
        <Route path="/parent/attendance" element={
          <PrivateRoute roles={['parent']}><ParentAttendancePage /></PrivateRoute>
        } />
        <Route path="/parent/communication" element={
          <PrivateRoute roles={['parent']}><ParentCommunicationPage /></PrivateRoute>
        } />
        <Route path="/parent/notifications" element={
          <PrivateRoute roles={['parent']}><ParentNotificationsPage /></PrivateRoute>
        } />
        <Route path="/parent/counseling" element={
          <PrivateRoute roles={['parent']}><ParentCounselingPage /></PrivateRoute>
        } />
        <Route path="/parent/billing" element={
          <PrivateRoute roles={['parent']}><ParentBillingPage /></PrivateRoute>
        } />
        <Route path="/parent/league" element={
          <PrivateRoute roles={['parent']}><ParentLeaguePage /></PrivateRoute>
        } />
        <Route path="/parent/academy" element={
          <PrivateRoute roles={['parent']}><ParentAcademyPage /></PrivateRoute>
        } />
        <Route path="/parent/achievements" element={
          <PrivateRoute roles={['parent']}><ParentAchievementsPage /></PrivateRoute>
        } />
        <Route path="/parent/reports" element={
          <PrivateRoute roles={['parent']}><ParentReportsPage /></PrivateRoute>
        } />
        <Route path="/parent/ai-assistant" element={
          <PrivateRoute roles={['parent']}><ParentAIAssistantPage /></PrivateRoute>
        } />
        <Route path="/parent/settings" element={
          <PrivateRoute roles={['parent']}><ParentSettingsPage /></PrivateRoute>
        } />
        <Route path="/parent/my-items" element={
          <PrivateRoute roles={['parent']}><ParentPersonalItemsPage /></PrivateRoute>
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
        <Route path="/supervisor/assignments-rooms" element={
          <PrivateRoute roles={['supervisor']}><SupervisorAssignmentsPage /></PrivateRoute>
        } />
        <Route path="/supervisor/quiz-monitoring" element={
          <PrivateRoute roles={['supervisor']}><SupervisorQuizMonitoringPage /></PrivateRoute>
        } />
        <Route path="/supervisor/performance-tracking" element={
          <PrivateRoute roles={['supervisor']}><SupervisorPerformancePage /></PrivateRoute>
        } />
        <Route path="/supervisor/counseling-sessions" element={
          <PrivateRoute roles={['supervisor']}><SupervisorCounselingPage /></PrivateRoute>
        } />
        <Route path="/supervisor/chat-center" element={
          <PrivateRoute roles={['supervisor']}><SupervisorChatPage /></PrivateRoute>
        } />
        <Route path="/supervisor/ai-assistant" element={
          <PrivateRoute roles={['supervisor']}><SupervisorAIAssistantPage /></PrivateRoute>
        } />
        <Route path="/supervisor/settings" element={
          <PrivateRoute roles={['supervisor']}><SupervisorSettingsPage /></PrivateRoute>
        } />
        <Route path="/supervisor/my-items" element={
          <PrivateRoute roles={['supervisor']}><SupervisorPersonalItemsPage /></PrivateRoute>
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
