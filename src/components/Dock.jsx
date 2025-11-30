import React from 'react';
import { Home, Layers, BarChart2, Settings, LogOut } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const Dock = ({ activeTab, onTabChange }) => {
    const logout = useStore((state) => state.logout);

    const items = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'decks', icon: Layers, label: 'Decks' },
        { id: 'stats', icon: BarChart2, label: 'Stats' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-white/80 backdrop-blur-xl px-4 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 w-full">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`p-3 rounded-full transition-all duration-300 group relative flex flex-col items-center ${activeTab === item.id ? 'bg-gray-100 text-gray-900 shadow-inner' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}`}
                    >
                        <item.icon className={`w-6 h-6 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            {item.label}
                        </span>
                    </button>
                ))}

                <div className="w-px h-8 bg-gray-300 mx-2" />

                <button
                    onClick={logout}
                    className="p-3 rounded-full transition-all duration-300 group relative flex flex-col items-center hover:bg-red-50 text-gray-500 hover:text-red-600"
                >
                    <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute -top-10 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Dock;
