import React, { useState } from 'react';
import Layout from './components/Layout';
import DeckList from './components/DeckList';
import StudySession from './components/StudySession';
import Heatmap from './components/Heatmap';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [studyDeckId, setStudyDeckId] = useState(null);

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
                return (
                    <div className="w-full max-w-4xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold mb-6">Your Progress</h2>
                        <Heatmap />
                        <div className="glass-panel p-6">
                            <h3 className="text-xl font-bold mb-4">Statistics</h3>
                            <p className="text-white/60">More detailed statistics coming soon...</p>
                        </div>
                    </div>
                );
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
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </Layout>
    );
}

export default App;
