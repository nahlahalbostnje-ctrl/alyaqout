import { Navigate } from 'react-router-dom';

/** الصفحة الوهمية أُلغيت — الموافقات الحقيقية في /admin/approvals */
export default function AdminApprovalsPage() {
  return <Navigate to="/admin/approvals" replace />;
}
