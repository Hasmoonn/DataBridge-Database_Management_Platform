import { useNavigate } from 'react-router-dom';
import { Plus, Play, Search, FileText } from 'lucide-react';

const actions = [
  {
    icon: Plus,
    label: 'New Connection',
    description: 'Add a database',
    to: '/connections/new',
    color: '#fca311',
    bg: 'rgba(252,163,17,0.1)',
  },
  {
    icon: Play,
    label: 'Start Transfer',
    description: 'Move data now',
    to: '/transfers/new',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
  },
  {
    icon: Search,
    label: 'Explore Data',
    description: 'Browse schemas',
    to: '/explorer',
    color: '#7dd3fc',
    bg: 'rgba(125,211,252,0.1)',
  },
  {
    icon: FileText,
    label: 'View Logs',
    description: 'Check activity',
    to: '/monitoring',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-white/8 hover:border-[#fca311]/30 hover:bg-[#fca311]/5 transition-all duration-200 group text-center"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: action.bg }}
              >
                <Icon size={18} style={{ color: action.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {action.label}
                </p>
                <p className="text-xs text-[#e5e5e5]/40 mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;