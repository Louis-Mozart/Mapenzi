import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-md mx-auto min-h-screen pb-20 relative">
      <Outlet />
    </div>
    <BottomNav />
  </div>
);
