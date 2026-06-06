import { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/connections': 'Connections',
  '/explorer': 'Data Explorer',
  '/transfers': 'Transfers',
  '/transfer-history': 'Transfer History',
  '/transfers/history': 'Transfer History',
  '/monitoring': 'Monitoring',
  '/settings': 'Settings',
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'DataFlow';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 sm:h-16 bg-[#14213d] border-b border-white/8 flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0 z-10 gap-2">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <h1 className="text-base sm:text-lg font-semibold text-[var(--color-brand-gold)] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search connections, tables, transfers..."
            className="w-full pl-9 pr-16 py-2 rounded-lg text-sm bg-black/40 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-[#fca311]/50 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-white/30 bg-white/5 border border-white/10 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#fca311] rounded-full" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-white/8 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-[#fca311]/20 border border-[#fca311]/30 flex items-center justify-center">
              <span className="text-[#fca311] font-semibold text-xs">
                {getInitials(user?.username || user?.email)}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-white/80 max-w-[100px] truncate">
              {user?.username || 'User'}
            </span>
            <ChevronDown
              size={14}
              className={clsx(
                'text-white/40 transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#14213d] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-[#e5e5e5]/50 truncate">
                    {user?.email}
                  </p>
                </div>
                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e5e5e5]/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User size={15} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e5e5e5]/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                  <div className="mx-3 my-1 border-t border-white/8" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#ef4444]/70 hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;