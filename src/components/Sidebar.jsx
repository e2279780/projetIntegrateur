import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faBookOpen, faHeart, faCog } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const links = [
    { to: "/dashboard", icon: faChartLine, label: "Vue d'ensemble" },
    { to: "/inventory", icon: faBookOpen, label: "Ma Bibliothèque" },
    { to: "#", icon: faHeart, label: "Favoris" },
    { to: "/profile", icon: faCog, label: "Paramètres" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-72px)] hidden md:block p-6">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`
            }
          >
            <FontAwesomeIcon icon={link.icon} className="w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}