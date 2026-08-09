import type { ReactNode } from 'react';
import AppLayout, { Icons, type NavGroup } from './AppLayout';

const navGroups: NavGroup[] = [
  {
    id: 'home',
    label: '',
    alwaysOpen: true,
    items: [
      { to: '/admin/dashboard', label: 'الرئيسية', icon: Icons.home, end: true },
    ],
  },
  {
    id: 'education',
    label: 'التعليم',
    items: [
      { to: '/admin/grades', label: 'الصفوف الدراسية', icon: Icons.graduationCap },
      { to: '/admin/subjects', label: 'المواد', icon: Icons.grid },
      { to: '/admin/courses', label: 'الدورات', icon: Icons.play },
      { to: '/admin/live-classes', label: 'الحصص المباشرة', icon: Icons.video },
      { to: '/admin/review-videos', label: 'فيديوهات المراجعة', icon: Icons.video },
      { to: '/admin/library', label: 'مكتبة الياقوت', icon: Icons.fileText },
      { to: '/admin/talents', label: 'حاضنة المواهب', icon: Icons.graduationCap },
      { to: '/admin/parent-academy', label: 'أكاديمية الآباء', icon: Icons.fileText },
      { to: '/admin/leagues', label: 'دوري ياقوت', icon: Icons.trophy },
    ],
  },
  {
    id: 'people',
    label: 'المستخدمون',
    items: [
      { to: '/admin/users', label: 'المستخدمون', icon: Icons.users },
      { to: '/admin/teacher-management', label: 'إدارة المعلمين', icon: Icons.users },
      { to: '/admin/approvals', label: 'موافقات المعلمين', icon: Icons.clipboard },
      { to: '/admin/supervisors', label: 'المشرفون', icon: Icons.users },
      { to: '/admin/counseling', label: 'طلبات الإرشاد', icon: Icons.clipboard },
      { to: '/admin/leads', label: 'العملاء المحتملون', icon: Icons.userPlus },
    ],
  },
  {
    id: 'finance',
    label: 'المالية',
    items: [
      { to: '/admin/packages', label: 'الباقات', icon: Icons.package },
      { to: '/admin/subscriptions', label: 'الاشتراكات', icon: Icons.creditCard },
      { to: '/admin/course-purchases', label: 'شراء المساقات', icon: Icons.tag },
      { to: '/admin/coupons', label: 'الكوبونات', icon: Icons.tag },
    ],
  },
  {
    id: 'content',
    label: 'المحتوى والتسويق',
    items: [
      { to: '/admin/cms', label: 'إدارة المحتوى', icon: Icons.fileText },
      { to: '/admin/teacher-content', label: 'محتوى المعلمين', icon: Icons.fileText },
      { to: '/admin/banners', label: 'البانرات', icon: Icons.image },
    ],
  },
  {
    id: 'ops',
    label: 'العمليات والأدوات',
    items: [
      { to: '/admin/approval-requests', label: 'مركز الموافقات', icon: Icons.clipboard },
      { to: '/admin/notifications', label: 'الإشعارات', icon: Icons.bell },
      { to: '/admin/cities', label: 'المدن', icon: Icons.home },
      { to: '/admin/analytics', label: 'التحليلات وتقييم AI', icon: Icons.chart },
      { to: '/admin/audit-log', label: 'سجل العمليات', icon: Icons.clipboard },
      { to: '/admin/my-items', label: 'مهامي ومذكراتي', icon: Icons.clipboard },
      { to: '/admin/settings', label: 'الإعدادات', icon: Icons.settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout navGroups={navGroups} roleLabel="لوحة الإدارة">
      {children}
    </AppLayout>
  );
}
