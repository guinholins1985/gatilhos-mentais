
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Gerador de Gatilhos Mentais
        </h1>
        <p className="text-slate-400 mt-1">Potencialize sua Copywriting com IA</p>
      </div>
    </header>
  );
};

export default Header;
