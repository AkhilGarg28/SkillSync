import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { Home, User, Edit, Sparkles, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/profile/edit', icon: Edit, label: 'Edit Profile' },
    { to: '/onboarding', icon: Sparkles, label: 'Onboarding Wizard' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-950/40 border-r border-slate-900/60 flex flex-col z-30 transform lg:transform-none transition-transform duration-300 lg:transition-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 px-4 py-6 space-y-1.5 select-none overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition duration-300 ${
                  isActive
                    ? 'bg-brand-600/10 border-brand-500/30 text-brand-300 shadow-md shadow-brand-500/5'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 hover:border-slate-900'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Footer User Panel */}
        {user && (
          <div className="p-4 border-t border-slate-900/60 bg-slate-950/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-slate-800">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                  Verified Swapper
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
