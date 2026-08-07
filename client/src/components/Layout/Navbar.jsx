import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { Menu, LogOut, User, Edit, Sparkles, ChevronDown } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 px-4 md:px-6 h-16 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-900 p-2 rounded-lg lg:hidden transition"
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Sparkles size={16} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300 font-extrabold font-serif">
            SkillSync
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-900 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold border border-slate-800">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <span className="hidden md:block text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown size={14} className="text-slate-400 animate-pulse" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-slate-900/60 mb-1">
                    <p className="text-xs text-slate-400 font-semibold truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-brand-600 transition"
                  >
                    <User size={14} />
                    My Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-brand-600 transition"
                  >
                    <Edit size={14} />
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white">
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
