import type { ReactNode } from 'react';
import AppLayout, { Icons } from './AppLayout';

const navItems = [
  { to: '/admin/dashboard',     label: 'الرئيسية',          icon: Icons.home,          end: true },
  { to: '/admin/grades',        label: 'الصفوف الدراسية',   icon: Icons.graduationCap  },
  { to: '/admin/categories',    label: 'المواد الدراسية',    icon: Icons.grid           },
  { to: '/admin/courses',       label: 'الدورات',            icon: Icons.play           },
  { to: '/admin/users',         label: 'المستخدمون',         icon: Icons.users          },
  { to: '/admin/packages',      label: 'الباقات',            icon: Icons.package        },
  { to: '/admin/subscriptions', label: 'الاشتراكات',         icon: Icons.creditCard     },
  { to: '/admin/live-classes',  label: 'الحصص المباشرة',    icon: Icons.video          },
  { to: '/admin/coupons',       label: 'الكوبونات',          icon: Icons.tag            },
  { to: '/admin/banners',       label: 'البانرات',           icon: Icons.image          },
  { to: '/admin/leads',         label: 'العملاء المحتملون', icon: Icons.userPlus       },
  { to: '/admin/cms',           label: 'إدارة المحتوى',      icon: Icons.fileText       },
  { to: '/admin/supervisors',   label: 'المشرفون',            icon: Icons.users          },
  { to: '/admin/approvals',     label: 'موافقات المعلمين',   icon: Icons.clipboard      },
  { to: '/admin/notifications', label: 'الإشعارات',          icon: Icons.bell           },
  { to: '/admin/leagues',       label: 'دوري ياقوت',          icon: Icons.trophy         },
  { to: '/admin/settings',      label: 'الإعدادات',           icon: Icons.settings       },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout navItems={navItems} roleLabel="لوحة الإدارة">
      {children}
    </AppLayout>
  );
}
