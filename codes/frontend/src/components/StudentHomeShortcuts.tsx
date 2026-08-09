import RoleHomeIconGrid from './RoleHomeIconGrid';
import {
  STUDENT_PRIMARY_NAV,
  STUDENT_SECONDARY_NAV,
} from '../features/student/studentNav';

/** شبكة أيقونات واحدةة لكل وجهات الطالب — بدون «المزيد». */
export default function StudentHomeShortcuts() {
  return (
    <RoleHomeIconGrid
      title="الخدمات"
      items={[...STUDENT_PRIMARY_NAV, ...STUDENT_SECONDARY_NAV]}
    />
  );
}
