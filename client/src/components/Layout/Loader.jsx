import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center select-none">
      <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
      <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse font-serif">
        Loading SkillSync...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>;
};

export default Loader;
