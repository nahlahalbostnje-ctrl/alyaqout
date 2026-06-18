import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function PrivateRoute({ children, roles }: Props) {
  const { token, user } = useAppSelector((s) => s.auth);

  if (token && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl font-medium">جاري التحميل...</div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (!user)  return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
