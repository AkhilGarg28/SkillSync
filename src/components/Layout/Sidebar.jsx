import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, User, Compass, Users, MessageSquare, MessageCircle, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links = [
    ...(user?.role === 'admin'
      ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin Control Center', isAdmin: true }]
      : []),
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/matches', icon: Compass, label: 'Explore Matches' },
    { to: '/tracker', icon: Users, label: 'My Matches' },
    { to: '/sessions', icon: Calendar, label: 'My Sessions' },
    { to: '/chat', icon: MessageSquare, label: 'In-App Chat' },
    { to: '/forum', icon: MessageCircle, label: 'Community Forum' },
    { to: '/onboarding', icon: Sparkles, label: 'Onboarding Step' },
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

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-950/40 border-r border-slate-900/60 flex flex-col z-30 transform lg:transform-none transition-transform duration-300 lg:transition-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 px-4 py-6 space-y-2 select-none overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/profile' || link.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition duration-300 ${
                  link.isAdmin
                    ? isActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    : isActive
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

        {/* Footer Card */}
        {user && (
          <div className="p-4 border-t border-slate-900/60 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-slate-800">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">
                  SkillSync Peer
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
