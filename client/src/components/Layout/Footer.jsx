import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-950/40 border-t border-slate-900/60 py-4 px-6 text-center select-none">
      <p className="text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} SkillSync. All rights reserved. Swap Skills, Learn Together.
      </p>
    </footer>
  );
};

export default Footer;
