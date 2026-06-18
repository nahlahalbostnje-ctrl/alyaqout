<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
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
use App\Http\Controllers\SuperAdmin\CountryController;
use App\Http\Controllers\Live\AgoraController;
use App\Http\Controllers\Student\LeagueController as StudentLeagueController;
use App\Http\Controllers\Student\EmergencyController as StudentEmergencyController;
use App\Http\Controllers\Student\ChatbotController as StudentChatbotController;
use App\Http\Controllers\Teacher\EmergencyController as TeacherEmergencyController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\LeagueController as AdminLeagueController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Admin\CMSController as AdminCMSController;
use App\Http\Controllers\Admin\SupervisorAssignmentController as AdminSupervisorAssignmentController;
use App\Http\Controllers\Admin\TeacherApprovalController as AdminTeacherApprovalController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — no token required
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

Route::post('leads', [LeadController::class, 'store']);
Route::get('settings/public', [AdminSettingsController::class, 'publicShow']);

// Landing Page public data
Route::prefix('public')->group(function () {
    Route::get('countries', [PublicController::class, 'countries']);
    Route::get('banners',   [PublicController::class, 'banners']);
    Route::get('faqs',      [PublicController::class, 'faqs']);
    Route::get('social',    [PublicController::class, 'social']);
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

    Route::get('users',                      [AdminUserController::class, 'index']);
    Route::post('users',                     [AdminUserController::class, 'store']);
    Route::patch('users/{user}/toggle',      [AdminUserController::class, 'toggle']);
    Route::delete('users/{user}',            [AdminUserController::class, 'destroy']);

    Route::get('live-classes',                         [AdminLiveClassController::class, 'index']);
    Route::post('live-classes',                        [AdminLiveClassController::class, 'store']);
    Route::put('live-classes/{liveClass}',             [AdminLiveClassController::class, 'update']);
    Route::patch('live-classes/{liveClass}/status',    [AdminLiveClassController::class, 'updateStatus']);
    Route::delete('live-classes/{liveClass}',          [AdminLiveClassController::class, 'destroy']);

    // Settings
    Route::get('settings',                             [AdminSettingsController::class, 'show']);
    Route::put('settings',                             [AdminSettingsController::class, 'update']);

    // Leagues
    Route::get('leagues',                              [AdminLeagueController::class, 'index']);
    Route::post('leagues',                             [AdminLeagueController::class, 'store']);
    Route::patch('leagues/{league}/status',            [AdminLeagueController::class, 'updateStatus']);
    Route::delete('leagues/{league}',                  [AdminLeagueController::class, 'destroy']);

    Route::get('packages',                    [AdminPackageController::class, 'index']);
    Route::post('packages',                   [AdminPackageController::class, 'store']);
    Route::put('packages/{package}',          [AdminPackageController::class, 'update']);
    Route::patch('packages/{package}/toggle', [AdminPackageController::class, 'toggle']);
    Route::delete('packages/{package}',       [AdminPackageController::class, 'destroy']);

    Route::get('courses',                   [AdminCourseController::class, 'index']);
    Route::post('courses',                  [AdminCourseController::class, 'store']);
    Route::put('courses/{course}',          [AdminCourseController::class, 'update']);
    Route::patch('courses/{course}/toggle', [AdminCourseController::class, 'toggle']);
    Route::delete('courses/{course}',       [AdminCourseController::class, 'destroy']);

    Route::get('subscriptions',                              [AdminSubscriptionController::class, 'index']);
    Route::post('subscriptions',                             [AdminSubscriptionController::class, 'store']);
    Route::patch('subscriptions/{subscription}/cancel',      [AdminSubscriptionController::class, 'cancel']);
    Route::get('users/{student}/subscriptions',              [AdminSubscriptionController::class, 'studentSubscriptions']);

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

    // Supervisor Assignment
    Route::get('supervisors',                                               [AdminSupervisorAssignmentController::class, 'supervisors']);
    Route::get('supervisors/{supervisor}/students',                         [AdminSupervisorAssignmentController::class, 'supervisorStudents']);
    Route::post('supervisors/{supervisor}/students',                        [AdminSupervisorAssignmentController::class, 'assign']);
    Route::delete('supervisors/{supervisor}/students/{studentId}',          [AdminSupervisorAssignmentController::class, 'unassign']);
    Route::get('supervisors/unassigned-students',                           [AdminSupervisorAssignmentController::class, 'unassignedStudents']);
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

    // Chatbot
    Route::post('chatbot',                          [StudentChatbotController::class, 'chat']);
});

/*
|--------------------------------------------------------------------------
| Teacher Routes — requires JWT + teacher role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'teacher'])->prefix('teacher')->group(function () {
    Route::get('dashboard',                          [TeacherHomeController::class, 'dashboard']);
    Route::get('courses',                            [TeacherHomeController::class, 'courses']);
    Route::get('live-classes',                       [TeacherHomeController::class, 'liveClasses']);
    Route::patch('live-classes/{liveClass}/status',  [TeacherHomeController::class, 'updateStatus']);

    // Exams
    Route::get('exams',                                       [TeacherExamController::class, 'index']);
    Route::post('exams',                                      [TeacherExamController::class, 'store']);
    Route::get('exams/{exam}',                                [TeacherExamController::class, 'show']);
    Route::delete('exams/{exam}',                             [TeacherExamController::class, 'destroy']);
    Route::get('exams/{exam}/submissions',                    [TeacherExamController::class, 'submissions']);
    Route::patch('exams/{exam}/submissions/{submission}/grade', [TeacherExamController::class, 'grade']);

    // Homework
    Route::get('homework',                                    [TeacherHomeworkController::class, 'index']);
    Route::post('homework',                                   [TeacherHomeworkController::class, 'store']);
    Route::delete('homework/{homework}',                      [TeacherHomeworkController::class, 'destroy']);
    Route::get('homework/{homework}/submissions',             [TeacherHomeworkController::class, 'submissions']);
    Route::patch('homework/{homework}/submissions/{submission}/grade', [TeacherHomeworkController::class, 'grade']);

    // Emergency
    Route::get('emergency',                         [TeacherEmergencyController::class, 'index']);
    Route::post('emergency/{id}/accept',            [TeacherEmergencyController::class, 'accept']);
    Route::post('emergency/{id}/resolve',           [TeacherEmergencyController::class, 'resolve']);
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
