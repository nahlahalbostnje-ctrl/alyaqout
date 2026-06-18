import type { ReactNode } from 'react';
import AppLayout, { Icons } from './AppLayout';

const navItems = [
  { to: '/dashboard',         label: 'الدول',          icon: Icons.globe, end: true },
  { to: '/super-admin/profile', label: 'الملف الشخصي', icon: Icons.users },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout navItems={navItems} roleLabel="السوبر أدمن">
      {children}
    </AppLayout>
  );
}
