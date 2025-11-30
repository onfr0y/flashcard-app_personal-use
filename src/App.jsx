import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import DeckList from './components/DeckList';
import StudySession from './components/StudySession';
import Heatmap from './components/Heatmap';
import Stats from './components/Stats';
import Login from './components/Login';
import { useStore } from './hooks/useStore';

function App() {
    const { user, fetchDecks } = useStore();
    const [activeTab, setActiveTab] = useState('home');
    const [studyDeckId, setStudyDeckId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDecks();
        }
    }, [user, fetchDecks]);

    if (!user) {
        return <Login />;
    }

    const handleStudy = (deckId) => {
        setStudyDeckId(deckId);
    };

    const handleBackToDecks = () => {
        setStudyDeckId(null);
    };

    const renderContent = () => {
        if (studyDeckId) {
            return <StudySession deckId={studyDeckId} onBack={handleBackToDecks} />;
        }

        switch (activeTab) {
            case 'home':
            case 'decks':
                return <DeckList onStudy={handleStudy} />;
            case 'stats':
                return <Stats />;
            case 'settings':
                return (
                    <div className="glass-panel p-8 max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-4">Settings</h2>
                        <p className="text-white/60">Settings configuration will be available in a future update.</p>
                    </div>
                );
            default:
                return <DeckList onStudy={handleStudy} />;
        }
    };

    return (
        <ToastProvider>
            <div className="min-h-screen text-white selection:bg-white/20">
                {!user && <Login />}
                <div className={!user ? 'pointer-events-none' : ''}>
                    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                        {renderContent()}
                    </Layout>
                </div>
            </div>
        </ToastProvider>
    );
}

export default App;
