import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Search,
  ArrowLeftRight,
  History,
  Activity,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConnections } from '../../hooks/useConnections';
import clsx from 'clsx';
import logo from "../../assets/logo.png";

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    label: 'Connections',
    icon: Database,
    to: '/connections',
    badgeKey: 'connections',
  },
  {
    label: 'Data Explorer',
    icon: Search,
    to: '/explorer',
  },
  {
    label: 'Transfers',
    icon: ArrowLeftRight,
    to: '/transfers',
    badgeKey: 'transfers',
  },
  {
    label: 'Transfer History',
    icon: History,
    to: '/transfer-history',
  },
  {
    label: 'Monitoring',
    icon: Activity,
    to: '/monitoring',
  },
  {
    label: 'Settings',
    icon: Settings,
    to: '/settings',
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { connections } = useConnections();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getBadgeCount = (badgeKey) => {
    if (badgeKey === 'connections') return connections?.length || 0;
    return 0;
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-[#14213d] border-r border-white/8',
          'flex flex-col z-30 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo + Close */}
        <div className="py-4 px-1 sm:px-2 flex items-center justify-between border-b border-white/8">
          <div className="flex items-center">
            <img
              src={logo}
              alt="DATABRIDGE Logo"
              className="object-contain flex-shrink-0 h-10 sm:h-12 w-auto max-w-[180px]"
            />
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                style={{ animationDelay: `${index * 30}ms` }}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg',
                    'text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-[#fca311]/8 text-white border-l-[3px] border-[#fca311] pl-[calc(0.75rem-3px)]'
                      : 'text-[#e5e5e5]/70 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="flex-shrink-0" />
                  {item.label}
                </div>
                {badgeCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[#fca311]/15 text-[#fca311]">
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/8" />

        {/* Bottom Actions */}
        <div className="px-3 py-4 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#ef4444]/70 hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-all duration-150"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;