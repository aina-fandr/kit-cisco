import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        toast.success('Déconnexion réussie');
        navigate('/login');
    };

    const menuItems = [
        { path: '/', label: 'Tableau de bord', icon: '📊' },
        { path: '/etablissements', label: 'Établissements', icon: '🏫' },
        { path: '/kits', label: 'Kits scolaires', icon: '📦' },
        { path: '/distributions', label: 'Distributions', icon: '📋' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b flex items-center justify-between">
                    <h1 className={`${sidebarOpen ? 'block' : 'hidden'} text-xl font-bold text-blue-600`}>
                        KIT SCOLAIRE
                    </h1>
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>
                
                <nav className="flex-1 p-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                                location.pathname === item.path 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className={`${sidebarOpen ? 'block' : 'hidden'} font-medium`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
                
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user?.nom?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
                            <p className="font-semibold text-sm">{user?.nom || 'Utilisateur'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`w-full mt-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${sidebarOpen ? '' : 'flex justify-center'}`}
                    >
                        {sidebarOpen ? 'Déconnexion' : '🚪'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Tableau de bord'}
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {new Date().toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;