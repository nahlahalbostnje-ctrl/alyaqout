<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Http\Controllers\Admin\TeacherSubjectController as AdminTeacherSubjectController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\LiveClassController as AdminLiveClassController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\UnitController as AdminUnitController;
use App\Http\Controllers\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Admin\VideoController as AdminVideoController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Student\HomeController as StudentHomeController;
use App\Http\Controllers\Student\CourseContentController as StudentCourseContentController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use App\Http\Controllers\Student\GamificationController as StudentGamificationController;
use App\Http\Controllers\Student\HomeworkController as StudentHomeworkController;
use App\Http\Controllers\Teacher\HomeController as TeacherHomeController;
use App\Http\Controllers\Teacher\LiveClassController as TeacherLiveClassController;
use App\Http\Controllers\Teacher\CourseController as TeacherCourseController;
use App\Http\Controllers\Teacher\ExamController as TeacherExamController;
use App\Http\Controllers\Teacher\HomeworkController as TeacherHomeworkController;
use App\Http\Controllers\ParentPortal\HomeController as ParentHomeController;
use App\Http\Controllers\ParentPortal\ReportController as ParentReportController;
use App\Http\Controllers\Student\ReportController as StudentReportController;
use App\Http\Controllers\Supervisor\DashboardController as SupervisorDashboardController;
use App\Http\Controllers\Admin\PackageController as AdminPackageController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\GradeController as AdminGradeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\SuperAdmin\AdminController;
use App\Http\Controllers\SuperAdmin\BranchController as SuperAdminBranchController;
use App\Http\Controllers\SuperAdmin\CountryController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\UserController as SuperAdminUserController;
use App\Http\Controllers\SuperAdmin\ContentApprovalController as SuperAdminContentApprovalController;
use App\Http\Controllers\SuperAdmin\FaqController as SuperAdminFaqController;
use App\Http\Controllers\Admin\PersonalItemController as AdminPersonalItemController;
use App\Http\Controllers\Teacher\PersonalItemController as TeacherPersonalItemController;
use App\Http\Controllers\ParentPortal\PersonalItemController as ParentPersonalItemController;
use App\Http\Controllers\Supervisor\PersonalItemController as SupervisorPersonalItemController;
use App\Http\Controllers\Live\AgoraController;
use App\Http\Controllers\Student\LeagueController as StudentLeagueController;
use App\Http\Controllers\Student\EmergencyController as StudentEmergencyController;
use App\Http\Controllers\Student\ChatbotController as StudentChatbotController;
use App\Http\Controllers\ParentPortal\ChatbotController as ParentChatbotController;
use App\Http\Controllers\ParentPortal\BillingController as ParentBillingController;
use App\Http\Controllers\Admin\InstallmentController as AdminInstallmentController;
use App\Http\Controllers\ParentPortal\MessageController as ParentMessageController;
use App\Http\Controllers\ParentPortal\PackageController as ParentPackageController;
use App\Http\Controllers\Teacher\MessageController as TeacherMessageController;
use App\Http\Controllers\SuperAdmin\MessageController as SuperAdminMessageController;
use App\Http\Controllers\SuperAdmin\NotificationController as SuperAdminNotificationController;
use App\Http\Controllers\SuperAdmin\RoleController as SuperAdminRoleController;
use App\Http\Controllers\Supervisor\ChatbotController as SupervisorChatbotController;
use App\Http\Controllers\Teacher\ChatbotController as TeacherChatbotController;
use App\Http\Controllers\Teacher\EmergencyController as TeacherEmergencyController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\LeagueController as AdminLeagueController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Admin\CMSController as AdminCMSController;
use App\Http\Controllers\Admin\SupervisorAssignmentController as AdminSupervisorAssignmentController;
use App\Http\Controllers\Admin\TeacherApprovalController as AdminTeacherApprovalController;
use App\Http\Controllers\Admin\TeacherContentController as AdminTeacherContentController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\SuperAdmin\SecurityController;
use App\Http\Controllers\SuperAdmin\ImpersonationController;
use App\Http\Controllers\SuperAdmin\BillingController as SuperAdminBillingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — no token required
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:10,1');
    Route::post('verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:20,1');
});

Route::post('leads', [LeadController::class, 'store']);
Route::get('settings/public', [AdminSettingsController::class, 'publicShow']);

// Landing Page public data
Route::prefix('public')->group(function () {
    Route::get('countries', [PublicController::class, 'countries']);
    Route::get('banners',   [PublicController::class, 'banners']);
    Route::get('faqs',      [PublicController::class, 'faqs']);
    Route::get('social',    [PublicController::class, 'social']);
    Route::get('stats',     [PublicController::class, 'stats']);
});

/*
|--------------------------------------------------------------------------
| Auth Routes — protected (token required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->prefix('auth')->group(function () {
    Route::get('me',             [AuthController::class, 'me']);
    Route::put('profile',        [AuthController::class, 'updateProfile']);
    Route::post('logout',        [AuthController::class, 'logout']);
    Route::post('refresh',       [AuthController::class, 'refresh']);
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes — requires JWT + super_admin role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'super_admin'])->prefix('super-admin')->group(function () {
    Route::get('dashboard/stats', [SuperAdminDashboardController::class, 'stats']);

    Route::get('countries', [CountryController::class, 'index']);
    Route::post('countries', [CountryController::class, 'store']);
    Route::get('countries/{country}', [CountryController::class, 'show']);
    Route::put('countries/{country}', [CountryController::class, 'update']);
    Route::patch('countries/{country}/toggle', [CountryController::class, 'toggle']);
    Route::delete('countries/{country}',       [CountryController::class, 'destroy']);

    Route::get('countries/{country}/admins',                    [AdminController::class, 'index']);
    Route::post('countries/{country}/admins',                   [AdminController::class, 'store']);
    Route::put('countries/{country}/admins/{admin}',            [AdminController::class, 'update']);
    Route::patch('countries/{country}/admins/{admin}/toggle',   [AdminController::class, 'toggle']);
    Route::delete('countries/{country}/admins/{admin}',         [AdminController::class, 'destroy']);

    // Branches (country-level branches of the platform)
    Route::get('branches',                          [SuperAdminBranchController::class, 'index']);
    Route::post('branches',                         [SuperAdminBranchController::class, 'store']);
    Route::put('branches/{branch}',                 [SuperAdminBranchController::class, 'update']);
    Route::patch('branches/{branch}/toggle',        [SuperAdminBranchController::class, 'toggle']);
    Route::delete('branches/{branch}',              [SuperAdminBranchController::class, 'destroy']);

    // Platform users (teachers, supervisors, students, parents) — cross-country
    Route::get('users',                    [SuperAdminUserController::class, 'index']);
    Route::post('users',                   [SuperAdminUserController::class, 'store']);
    Route::put('users/{user}',             [SuperAdminUserController::class, 'update']);
    Route::patch('users/{user}/toggle',   [SuperAdminUserController::class, 'toggle']);
    Route::delete('users/{user}',         [SuperAdminUserController::class, 'destroy']);

    // Content approvals (exams + homeworks) — cross-country
    Route::get('approvals',                              [SuperAdminContentApprovalController::class, 'index']);
    Route::patch('approvals/courses/{course}',            [SuperAdminContentApprovalController::class, 'decideCourse']);
    Route::patch('approvals/exams/{exam}',                [SuperAdminContentApprovalController::class, 'decideExam']);
    Route::patch('approvals/homeworks/{homework}',        [SuperAdminContentApprovalController::class, 'decideHomework']);
    Route::patch('approvals/live-classes/{liveClass}',    [SuperAdminContentApprovalController::class, 'decideLiveClass']);

    // Security center
    Route::get('security/login-attempts',   [SecurityController::class, 'loginAttempts']);

    // Activity / audit log — platform-wide for super admin
    Route::get('activity-log',              [AuditLogController::class, 'index']);

    // Billing / invoices — subscriptions across countries
    Route::get('billing',                   [SuperAdminBillingController::class, 'index']);

    // Platform FAQs (landing) — Super Admin only
    Route::get('faqs',                      [SuperAdminFaqController::class, 'index']);
    Route::post('faqs',                     [SuperAdminFaqController::class, 'store']);
    Route::put('faqs/{faq}',                [SuperAdminFaqController::class, 'update']);
    Route::patch('faqs/{faq}/toggle',       [SuperAdminFaqController::class, 'toggle']);
    Route::delete('faqs/{faq}',             [SuperAdminFaqController::class, 'destroy']);

    // Impersonation
    Route::post('impersonate/{user}',       [ImpersonationController::class, 'impersonate']);

    // Messages oversight — يشوف كل محادثات كل الدول (قراءة فقط)
    Route::get('messages',                  [SuperAdminMessageController::class, 'index']);
    Route::get('messages/{conversation}',   [SuperAdminMessageController::class, 'show']);

    // Notifications — بث عبر أي دولة
    Route::get('notifications/history',     [SuperAdminNotificationController::class, 'history']);
    Route::post('notifications/broadcast',  [SuperAdminNotificationController::class, 'broadcast']);

    // Roles & permissions (overrides على الصلاحيات الافتراضية — للعرض والتتبع فقط، لا تُطبَّق بعد على الـ middleware)
    Route::get('roles/permissions',         [SuperAdminRoleController::class, 'index']);
    Route::put('roles/permissions',         [SuperAdminRoleController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes — requires JWT + admin role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

    Route::get('grades',                  [AdminGradeController::class, 'index']);
    Route::post('grades',                 [AdminGradeController::class, 'store']);
    Route::put('grades/{grade}',          [AdminGradeController::class, 'update']);
    Route::patch('grades/{grade}/toggle', [AdminGradeController::class, 'toggle']);
    Route::delete('grades/{grade}',       [AdminGradeController::class, 'destroy']);

    Route::get('categories',                      [AdminCategoryController::class, 'index']);
    Route::post('categories',                     [AdminCategoryController::class, 'store']);
    Route::put('categories/{category}',           [AdminCategoryController::class, 'update']);
    Route::patch('categories/{category}/toggle',  [AdminCategoryController::class, 'toggle']);
    Route::delete('categories/{category}',        [AdminCategoryController::class, 'destroy']);

    Route::get('subjects',                        [AdminSubjectController::class, 'index']);
    Route::post('subjects',                       [AdminSubjectController::class, 'store']);
    Route::put('subjects/{subject}',              [AdminSubjectController::class, 'update']);
    Route::put('subjects/{subject}/grades',       [AdminSubjectController::class, 'syncGrades']);
    Route::patch('subjects/{subject}/toggle',     [AdminSubjectController::class, 'toggle']);
    Route::delete('subjects/{subject}',           [AdminSubjectController::class, 'destroy']);

    Route::get('teachers/{teacher}/subjects',     [AdminTeacherSubjectController::class, 'show']);
    Route::put('teachers/{teacher}/subjects',     [AdminTeacherSubjectController::class, 'sync']);

    Route::get('users',                      [AdminUserController::class, 'index']);
    Route::post('users',                     [AdminUserController::class, 'store']);
    Route::put('users/{user}',               [AdminUserController::class, 'update']);
    Route::patch('users/{user}/toggle',      [AdminUserController::class, 'toggle']);
    Route::patch('users/{user}/role',        [AdminUserController::class, 'changeRole']);
    Route::patch('users/{user}/unlink-parent', [AdminUserController::class, 'unlinkParent']);
    Route::delete('users/{user}',            [AdminUserController::class, 'destroy']);

    Route::get('live-classes',                         [AdminLiveClassController::class, 'index']);
    Route::post('live-classes',                        [AdminLiveClassController::class, 'store']);
    Route::put('live-classes/{liveClass}',             [AdminLiveClassController::class, 'update']);
    Route::patch('live-classes/{liveClass}/status',    [AdminLiveClassController::class, 'updateStatus']);
    Route::patch('live-classes/{liveClass}/archive',   [AdminLiveClassController::class, 'archive']);
    Route::delete('live-classes/{liveClass}',          [AdminLiveClassController::class, 'destroy']);

    Route::get('teacher-content/homeworks',                              [AdminTeacherContentController::class, 'homeworks']);
    Route::patch('teacher-content/homeworks/{homework}/archive',        [AdminTeacherContentController::class, 'archiveHomework']);
    Route::delete('teacher-content/homeworks/{homework}',               [AdminTeacherContentController::class, 'destroyHomework']);
    Route::get('teacher-content/exams',                                  [AdminTeacherContentController::class, 'exams']);
    Route::patch('teacher-content/exams/{exam}/archive',                 [AdminTeacherContentController::class, 'archiveExam']);
    Route::delete('teacher-content/exams/{exam}',                        [AdminTeacherContentController::class, 'destroyExam']);

    // Settings
    Route::get('settings',                             [AdminSettingsController::class, 'show']);
    Route::put('settings',                             [AdminSettingsController::class, 'update']);

    // Leagues
    Route::get('leagues',                              [AdminLeagueController::class, 'index']);
    Route::post('leagues',                             [AdminLeagueController::class, 'store']);
    Route::put('leagues/{league}',                     [AdminLeagueController::class, 'update']);
    Route::patch('leagues/{league}/status',            [AdminLeagueController::class, 'updateStatus']);
    Route::delete('leagues/{league}',                  [AdminLeagueController::class, 'destroy']);

    Route::get('packages',                    [AdminPackageController::class, 'index']);
    Route::post('packages',                   [AdminPackageController::class, 'store']);
    Route::put('packages/{package}',          [AdminPackageController::class, 'update']);
    Route::patch('packages/{package}/toggle', [AdminPackageController::class, 'toggle']);
    Route::delete('packages/{package}',       [AdminPackageController::class, 'destroy']);

    Route::get('courses',                   [AdminCourseController::class, 'index']);
    Route::get('courses/{course}/dossier',  [AdminCourseController::class, 'dossier']);
    Route::post('courses',                  [AdminCourseController::class, 'store']);
    Route::put('courses/{course}',          [AdminCourseController::class, 'update']);
    Route::patch('courses/{course}/toggle', [AdminCourseController::class, 'toggle']);
    Route::delete('courses/{course}',       [AdminCourseController::class, 'destroy']);

    Route::get('subscriptions',                              [AdminSubscriptionController::class, 'index']);
    Route::post('subscriptions',                             [AdminSubscriptionController::class, 'store']);
    Route::patch('subscriptions/{subscription}/cancel',      [AdminSubscriptionController::class, 'cancel']);
    Route::patch('subscriptions/{subscription}/activate',    [AdminSubscriptionController::class, 'activate']);
    Route::get('users/{student}/subscriptions',              [AdminSubscriptionController::class, 'studentSubscriptions']);

    // Installments (تقسيط الدفعات)
    Route::get('subscriptions/{subscription}/installments',              [AdminInstallmentController::class, 'index']);
    Route::post('subscriptions/{subscription}/installments',             [AdminInstallmentController::class, 'store']);
    Route::post('subscriptions/{subscription}/installments/{installment}/mark-paid', [AdminInstallmentController::class, 'markPaid']);

    Route::post('notifications/broadcast',   [AdminNotificationController::class, 'broadcast']);
    Route::get('notifications/history',      [AdminNotificationController::class, 'history']);

    // Course Content
    Route::get('courses/{course}/units',              [AdminUnitController::class, 'index']);
    Route::post('courses/{course}/units',             [AdminUnitController::class, 'store']);
    Route::put('courses/{course}/units/{unit}',       [AdminUnitController::class, 'update']);
    Route::delete('courses/{course}/units/{unit}',    [AdminUnitController::class, 'destroy']);

    Route::get('units/{unit}/lessons',                [AdminLessonController::class, 'index']);
    Route::post('units/{unit}/lessons',               [AdminLessonController::class, 'store']);
    Route::put('units/{unit}/lessons/{lesson}',       [AdminLessonController::class, 'update']);
    Route::delete('units/{unit}/lessons/{lesson}',    [AdminLessonController::class, 'destroy']);

    Route::get('lessons/{lesson}/videos',             [AdminVideoController::class, 'index']);
    Route::post('lessons/{lesson}/videos',            [AdminVideoController::class, 'store']);
    Route::put('lessons/{lesson}/videos/{video}',     [AdminVideoController::class, 'update']);
    Route::delete('lessons/{lesson}/videos/{video}',  [AdminVideoController::class, 'destroy']);

    // Coupons
    Route::get('coupons',                            [AdminCouponController::class, 'index']);
    Route::post('coupons',                           [AdminCouponController::class, 'store']);
    Route::put('coupons/{coupon}',                   [AdminCouponController::class, 'update']);
    Route::patch('coupons/{coupon}/toggle',          [AdminCouponController::class, 'toggle']);
    Route::delete('coupons/{coupon}',                [AdminCouponController::class, 'destroy']);
    Route::post('coupons/validate',                  [AdminCouponController::class, 'validate']);

    // Banners
    Route::get('banners',                            [AdminBannerController::class, 'index']);
    Route::post('banners',                           [AdminBannerController::class, 'store']);
    Route::put('banners/{banner}',                   [AdminBannerController::class, 'update']);
    Route::patch('banners/{banner}/toggle',          [AdminBannerController::class, 'toggle']);
    Route::delete('banners/{banner}',                [AdminBannerController::class, 'destroy']);

    // Leads
    Route::get('leads',                              [AdminLeadController::class, 'index']);
    Route::patch('leads/{lead}/status',              [AdminLeadController::class, 'updateStatus']);

    // CMS — Pages
    Route::get('cms/pages',                          [AdminCMSController::class, 'pageIndex']);
    Route::get('cms/pages/{slug}',                   [AdminCMSController::class, 'pageShow']);
    Route::put('cms/pages/{slug}',                   [AdminCMSController::class, 'pageUpsert']);

    // CMS — FAQs
    Route::get('cms/faqs',                           [AdminCMSController::class, 'faqIndex']);
    Route::post('cms/faqs',                          [AdminCMSController::class, 'faqStore']);
    Route::put('cms/faqs/{faq}',                     [AdminCMSController::class, 'faqUpdate']);
    Route::delete('cms/faqs/{faq}',                  [AdminCMSController::class, 'faqDestroy']);

    // CMS — Social Links
    Route::get('cms/social',                         [AdminCMSController::class, 'socialIndex']);
    Route::post('cms/social',                        [AdminCMSController::class, 'socialUpsert']);
    Route::delete('cms/social/{socialLink}',         [AdminCMSController::class, 'socialDestroy']);

    // Teacher Approval Workflow
    Route::get('approvals/exams',                                           [AdminTeacherApprovalController::class, 'pendingExams']);
    Route::patch('approvals/exams/{exam}',                                  [AdminTeacherApprovalController::class, 'approveExam']);
    Route::get('approvals/homeworks',                                       [AdminTeacherApprovalController::class, 'pendingHomeworks']);
    Route::patch('approvals/homeworks/{homework}',                          [AdminTeacherApprovalController::class, 'approveHomework']);
    Route::get('approvals/live-classes',                                    [AdminTeacherApprovalController::class, 'pendingLiveClasses']);
    Route::patch('approvals/live-classes/{liveClass}',                      [AdminTeacherApprovalController::class, 'approveLiveClass']);
    Route::get('approvals/courses',                                         [AdminTeacherApprovalController::class, 'pendingCourses']);
    Route::patch('approvals/courses/{course}',                              [AdminTeacherApprovalController::class, 'approveCourse']);

    // Supervisor Assignment
    Route::get('supervisors',                                               [AdminSupervisorAssignmentController::class, 'supervisors']);
    Route::get('supervisors/{supervisor}/students',                         [AdminSupervisorAssignmentController::class, 'supervisorStudents']);
    Route::post('supervisors/{supervisor}/students',                        [AdminSupervisorAssignmentController::class, 'assign']);
    Route::delete('supervisors/{supervisor}/students/{studentId}',          [AdminSupervisorAssignmentController::class, 'unassign']);
    Route::get('supervisors/unassigned-students',                           [AdminSupervisorAssignmentController::class, 'unassignedStudents']);

    // Personal items (admin)
    Route::get('my-items',                                                  [AdminPersonalItemController::class, 'index']);
    Route::post('my-items',                                                 [AdminPersonalItemController::class, 'store']);
    Route::put('my-items/{item}',                                           [AdminPersonalItemController::class, 'update']);
    Route::delete('my-items/{item}',                                        [AdminPersonalItemController::class, 'destroy']);

    // Cities — scoped to admin's country
    Route::get('cities',            [CityController::class, 'index']);
    Route::post('cities',           [CityController::class, 'store']);
    Route::put('cities/{city}',     [CityController::class, 'update']);
    Route::delete('cities/{city}',  [CityController::class, 'destroy']);

    // Audit log
    Route::get('audit-log',         [AuditLogController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Shared Routes — accessible to any authenticated user (any role)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Notification Routes — shared for all authenticated users
|--------------------------------------------------------------------------
*/
// Public cities list for dropdowns — any authenticated user
Route::middleware('auth:api')->get('cities', [CityController::class, 'publicList']);

Route::middleware('auth:api')->prefix('notifications')->group(function () {
    Route::get('/',                              [NotificationController::class, 'index']);
    Route::get('unread-count',                   [NotificationController::class, 'unreadCount']);
    Route::patch('{notification}/read',          [NotificationController::class, 'markRead']);
    Route::post('mark-all-read',                 [NotificationController::class, 'markAllRead']);
});

/*
|--------------------------------------------------------------------------
| Student Routes — requires JWT + student role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'student'])->prefix('student')->group(function () {
    Route::get('dashboard',      [StudentHomeController::class, 'dashboard']);
    Route::get('courses',        [StudentHomeController::class, 'courses']);
    Route::get('live-classes',   [StudentHomeController::class, 'liveClasses']);
    Route::get('subscriptions',  [StudentHomeController::class, 'mySubscriptions']);

    // Course Content
    Route::get('courses/{course}/content',          [StudentCourseContentController::class, 'courseUnits']);
    Route::get('videos/{video}/watch',              [StudentCourseContentController::class, 'watchVideo']);
    Route::post('videos/{video}/complete',          [StudentCourseContentController::class, 'markComplete']);

    // Exams
    Route::get('exams',                             [StudentExamController::class, 'index']);
    Route::get('exams/{exam}',                      [StudentExamController::class, 'show']);
    Route::post('exams/{exam}/submit',              [StudentExamController::class, 'submit']);

    // Homework
    Route::get('homework',                          [StudentHomeworkController::class, 'index']);
    Route::post('homework/{homework}/submit',       [StudentHomeworkController::class, 'submit']);

    // Report
    Route::get('report',                            [StudentReportController::class, 'myReport']);

    // Gamification
    Route::get('points',                            [StudentGamificationController::class, 'myPoints']);
    Route::get('leaderboard',                       [StudentGamificationController::class, 'leaderboard']);

    // Leagues
    Route::get('leagues',                           [StudentLeagueController::class, 'index']);
    Route::post('leagues/{league}/join',            [StudentLeagueController::class, 'join']);
    Route::get('leagues/{league}',                  [StudentLeagueController::class, 'show']);

    // Emergency
    Route::post('emergency',                        [StudentEmergencyController::class, 'request']);
    Route::get('emergency',                         [StudentEmergencyController::class, 'myRequests']);

    // Chatbot (student)
    Route::post('chatbot',                          [StudentChatbotController::class, 'chat']);

});

/*
|--------------------------------------------------------------------------
| Teacher Routes — requires JWT + teacher role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'teacher'])->prefix('teacher')->group(function () {
    Route::get('dashboard',                          [TeacherHomeController::class, 'dashboard']);
    Route::get('me/subjects',                        [TeacherHomeController::class, 'mySubjects']);
    Route::get('courses',                            [TeacherHomeController::class, 'courses']);
    Route::post('courses',                           [TeacherCourseController::class, 'store']);
    Route::get('live-classes',                       [TeacherHomeController::class, 'liveClasses']);
    Route::post('live-classes',                      [TeacherLiveClassController::class, 'store']);
    Route::put('live-classes/{liveClass}',           [TeacherLiveClassController::class, 'update']);
    Route::patch('live-classes/{liveClass}/archive', [TeacherLiveClassController::class, 'archive']);
    Route::patch('live-classes/{liveClass}/status',  [TeacherHomeController::class, 'updateStatus']);

    // Exams
    Route::get('exams',                                       [TeacherExamController::class, 'index']);
    Route::post('exams',                                      [TeacherExamController::class, 'store']);
    Route::put('exams/{exam}',                                [TeacherExamController::class, 'update']);
    Route::patch('exams/{exam}/archive',                      [TeacherExamController::class, 'archive']);
    Route::get('exams/{exam}',                                [TeacherExamController::class, 'show']);
    Route::get('exams/{exam}/submissions',                    [TeacherExamController::class, 'submissions']);
    Route::patch('exams/{exam}/submissions/{submission}/grade', [TeacherExamController::class, 'grade']);

    // Homework
    Route::get('homework',                                    [TeacherHomeworkController::class, 'index']);
    Route::post('homework',                                   [TeacherHomeworkController::class, 'store']);
    Route::put('homework/{homework}',                         [TeacherHomeworkController::class, 'update']);
    Route::patch('homework/{homework}/archive',               [TeacherHomeworkController::class, 'archive']);
    Route::get('homework/{homework}/submissions',             [TeacherHomeworkController::class, 'submissions']);
    Route::patch('homework/{homework}/submissions/{submission}/grade', [TeacherHomeworkController::class, 'grade']);

    // Emergency
    Route::get('emergency',                         [TeacherEmergencyController::class, 'index']);
    Route::post('emergency/{id}/accept',            [TeacherEmergencyController::class, 'accept']);
    Route::post('emergency/{id}/resolve',           [TeacherEmergencyController::class, 'resolve']);

    // Chatbot (teacher)
    Route::post('chatbot',                          [TeacherChatbotController::class, 'chat']);

    // Personal items (teacher)
    Route::get('my-items',                          [TeacherPersonalItemController::class, 'index']);
    Route::post('my-items',                         [TeacherPersonalItemController::class, 'store']);
    Route::put('my-items/{item}',                   [TeacherPersonalItemController::class, 'update']);
    Route::delete('my-items/{item}',                [TeacherPersonalItemController::class, 'destroy']);

    // Messages (teacher ↔ parent)
    Route::get('messages',                          [TeacherMessageController::class, 'index']);
    Route::get('messages/{conversation}',           [TeacherMessageController::class, 'show']);
    Route::post('messages/{conversation}',          [TeacherMessageController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Parent Routes — requires JWT + parent role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'parent'])->prefix('parent')->group(function () {
    Route::get('dashboard',                          [ParentHomeController::class, 'dashboard']);
    Route::get('children',                           [ParentHomeController::class, 'listChildren']);
    Route::get('children/{student}/live-classes',    [ParentHomeController::class, 'childLiveClasses']);
    Route::get('children/{student}/report',          [ParentReportController::class, 'childReport']);
    Route::get('children/{student}/report/pdf',      [ParentReportController::class, 'downloadPdf']);
    Route::post('children/{student}/report/whatsapp', [ParentReportController::class, 'sendPdfViaWhatsapp']);

    // Billing / installments (parent)
    Route::get('billing/installments',               [ParentBillingController::class, 'installments']);
    Route::get('packages',                           [ParentPackageController::class, 'index']);
    Route::get('subscriptions',                      [ParentPackageController::class, 'subscriptions']);
    Route::post('subscriptions/request',             [ParentPackageController::class, 'requestSubscription']);

    // Messages (parent ↔ teacher)
    Route::get('children/{student}/teachers',        [ParentMessageController::class, 'teachersForChild']);
    Route::get('messages',                           [ParentMessageController::class, 'index']);
    Route::post('messages/start',                    [ParentMessageController::class, 'start']);
    Route::get('messages/{conversation}',            [ParentMessageController::class, 'show']);
    Route::post('messages/{conversation}',           [ParentMessageController::class, 'store']);

    // Chatbot (parent)
    Route::post('chatbot',                           [ParentChatbotController::class, 'chat']);

    // Personal items (parent)
    Route::get('my-items',                           [ParentPersonalItemController::class, 'index']);
    Route::post('my-items',                          [ParentPersonalItemController::class, 'store']);
    Route::put('my-items/{item}',                    [ParentPersonalItemController::class, 'update']);
    Route::delete('my-items/{item}',                 [ParentPersonalItemController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Supervisor Routes — requires JWT + supervisor role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'supervisor'])->prefix('supervisor')->group(function () {
    Route::get('students',                           [SupervisorDashboardController::class, 'students']);
    Route::post('students',                          [SupervisorDashboardController::class, 'assignStudent']);
    Route::delete('students/{studentId}',            [SupervisorDashboardController::class, 'removeStudent']);
    Route::get('students/{studentId}/performance',   [SupervisorDashboardController::class, 'studentPerformance']);
    Route::post('attendance',                        [SupervisorDashboardController::class, 'recordAttendance']);

    // Chatbot (supervisor)
    Route::post('chatbot',                           [SupervisorChatbotController::class, 'chat']);

    // Personal items (supervisor)
    Route::get('my-items',                           [SupervisorPersonalItemController::class, 'index']);
    Route::post('my-items',                          [SupervisorPersonalItemController::class, 'store']);
    Route::put('my-items/{item}',                    [SupervisorPersonalItemController::class, 'update']);
    Route::delete('my-items/{item}',                 [SupervisorPersonalItemController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Live Streaming Routes — Agora.io (any authenticated user)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->prefix('live')->group(function () {
    Route::post('token',                [AgoraController::class, 'token']);
    Route::post('{classId}/start',      [AgoraController::class, 'start']);
    Route::post('{classId}/end',        [AgoraController::class, 'end']);
    Route::post('{classId}/attend',     [AgoraController::class, 'attend']);
    Route::get('{classId}/participants',[AgoraController::class, 'participants']);
});
