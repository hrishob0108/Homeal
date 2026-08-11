// src/pages/dashboard/DashboardLayout.jsx
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
  const [active, setActive] = useState('Dashboard');

  const navItems = ['Dashboard', 'Orders', 'Settings'];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-6">🍱 Craavyo</h1>
        <nav className="space-y-4">
          {navItems.map((item) => (
            <button
              key={item}
              className={`block w-full text-left px-3 py-2 rounded-lg ${
                active === item ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
