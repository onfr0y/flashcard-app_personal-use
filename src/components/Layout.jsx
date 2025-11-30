import React from 'react';
import Dock from './Dock';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, activeTab, onTabChange }) => {
    const { user } = useStore();

    return (
        <div className="min-h-screen flex flex-col text-gray-800 overflow-hidden relative">
            {/* User Profile - Absolute Positioned */}
            <div className="absolute top-6 left-6 z-20 pointer-events-auto flex items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-md p-2 rounded-full flex items-center gap-2 px-4 shadow-sm border border-gray-200/50"
                >
                    <div className="w-8 h-8 rounded-full bg-orange-100 overflow-hidden border border-orange-200">
                        <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'Guest'}</span>
                </motion.div>
            </div>

            <main className="flex-1 w-full h-screen p-4 md:p-12 flex flex-col items-center justify-center relative z-10">
                <div className="w-full max-w-7xl h-full flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            <Dock activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
};

export default Layout;
