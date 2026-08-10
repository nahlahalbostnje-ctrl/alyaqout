import { Navigate } from 'react-router-dom';

/** نقطة دخول أيقونة «دوري وتحديات» → تبويب الدوري */
export default function ParentActivityHubPage() {
  return <Navigate to="/parent/league" replace />;
}
