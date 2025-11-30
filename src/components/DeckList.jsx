import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Plus, Trash2, Play, Settings, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import ScrambledText from './ScrambledText';

const DeckList = ({ onStudy, searchQuery = '' }) => {
    const { decks, addDeck, deleteDeck, addCard, updateDeckSettings, user } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');

    // Settings Modal State
    const [editingSettingsDeckId, setEditingSettingsDeckId] = useState(null);
    const [tempSettings, setTempSettings] = useState({ learningSteps: "1 10" });

    // Filter decks
    const filteredDecks = decks.filter(deck =>
        (deck.ownerId === user?.id || !deck.ownerId) &&
        deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Quick add card state (simplified for this view)
    const [addingCardTo, setAddingCardTo] = useState(null);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [frontImage, setFrontImage] = useState('');
    const [backImage, setBackImage] = useState('');

    const handleCreateDeck = (e) => {
        e.preventDefault();
        if (newDeckName.trim()) {
            addDeck(newDeckName);
            setNewDeckName('');
            setIsCreating(false);
        }
    };

    const openSettings = (deck) => {
        setEditingSettingsDeckId(deck.id);
        const steps = deck.settings?.learningSteps?.join(' ') || "1 10";
        setTempSettings({ learningSteps: steps });
    };

    const saveSettings = () => {
        if (editingSettingsDeckId) {
            const stepsArray = tempSettings.learningSteps.trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n > 0);
            updateDeckSettings(editingSettingsDeckId, {
                learningSteps: stepsArray.length > 0 ? stepsArray : [1, 10]
            });
            setEditingSettingsDeckId(null);
        }
    };

    const handlePaste = (e, type) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (type === 'front') setFrontImage(event.target.result);
                    else setBackImage(event.target.result);
                };
                reader.readAsDataURL(blob);
                e.preventDefault(); // Prevent pasting the file name
                break;
            }
        }
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        if (front.trim() && back.trim()) {
            addCard(addingCardTo, front, back, frontImage, backImage);
            setFront('');
            setBack('');
            setFrontImage('');
            setBackImage('');
            setAddingCardTo(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-center mb-12">
                <ScrambledText
                    radius={100}
                    duration={1.2}
                    speed={0.5}
                    scrambleChars="!<>-_\\/[]{}—=+*^?#________"
                    className="text-white text-6xl font-extrabold text-center"
                >
                    My Decks
                </ScrambledText>
            </div>

            <div className="dashboard-grid">
                {/* Create New Deck Card */}
                <ScrollReveal delay={0.1}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group h-full"
                        onClick={() => !isCreating && setIsCreating(true)}
                    >
                        {isCreating ? (
                            <form onSubmit={handleCreateDeck} className="w-full space-y-4" onClick={e => e.stopPropagation()}>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Deck Name"
                                    className="glass-input w-full bg-white"
                                    value={newDeckName}
                                    onChange={(e) => setNewDeckName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="glass-button flex-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200">Create</button>
                                    <button type="button" onClick={() => setIsCreating(false)} className="glass-button flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-gray-600" />
                                </div>
                                <span className="font-semibold text-xl text-gray-500 group-hover:text-gray-700">Create New Deck</span>
                            </>
                        )}
                    </motion.div>
                </ScrollReveal>

                {/* Existing Decks */}
                <AnimatePresence>
                    {filteredDecks.map((deck, index) => (
                        <ScrollReveal key={deck.id} delay={0.1 + (index * 0.05)}>
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5 }}
                                className="glass-panel p-6 flex flex-col relative group min-h-[200px] hover:shadow-xl transition-all duration-300 h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1 text-gray-800">{deck.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium">{deck.cards.length} cards</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openSettings(deck)}
                                            className="p-2 hover:bg-gray-100 rounded-full text-gray-300 hover:text-gray-600 transition-colors"
                                            title="Deck Settings"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteDeck(deck.id)}
                                            className="p-2 hover:bg-red-50 rounded-full text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1" />

                                {addingCardTo === deck.id ? (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleAddCard}
                                        className="space-y-3 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100"
                                    >
                                        <input
                                            placeholder="Front"
                                            className="glass-input w-full text-sm bg-white"
                                            value={front}
                                            onChange={e => setFront(e.target.value)}
                                        />
                                        <input
                                            placeholder="Back"
                                            className="glass-input w-full text-sm bg-white"
                                            value={back}
                                            onChange={e => setBack(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div
                                                className="glass-input h-20 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-white bg-white relative overflow-hidden"
                                                onPaste={(e) => handlePaste(e, 'front')}
                                                tabIndex={0}
                                            >
                                                {frontImage ? (
                                                    <img src={frontImage} alt="Front Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                                ) : "Paste Front (Ctrl+V)"}
                                            </div>
                                            <div
                                                className="glass-input h-20 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-white bg-white relative overflow-hidden"
                                                onPaste={(e) => handlePaste(e, 'back')}
                                                tabIndex={0}
                                            >
                                                {backImage ? (
                                                    <img src={backImage} alt="Back Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                                ) : "Paste Back (Ctrl+V)"}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="glass-button text-xs py-1 flex-1 bg-blue-50 text-blue-600 border-blue-200">Add</button>
                                            <button type="button" onClick={() => setAddingCardTo(null)} className="glass-button text-xs py-1 flex-1">Cancel</button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <div className="flex gap-3 mt-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
                                        <button
                                            onClick={() => onStudy(deck.id)}
                                            disabled={deck.cards.length === 0}
                                            className="glass-button flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 hover:text-white hover:shadow-lg border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Play className="w-4 h-4 fill-current" /> Study
                                        </button>
                                        <button
                                            onClick={() => setAddingCardTo(deck.id)}
                                            className="glass-button w-10 p-0 flex items-center justify-center"
                                            title="Add Card"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </AnimatePresence>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {editingSettingsDeckId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingSettingsDeckId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel p-6 w-full max-w-md bg-white shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Deck Settings</h2>
                                <button onClick={() => setEditingSettingsDeckId(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Learning Steps (minutes)</label>
                                    <input
                                        type="text"
                                        value={tempSettings.learningSteps}
                                        onChange={(e) => setTempSettings({ ...tempSettings, learningSteps: e.target.value })}
                                        className="glass-input w-full bg-gray-50"
                                        placeholder="e.g. 1 10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Space-separated list of steps in minutes (e.g., "1 10" means 1m then 10m).</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={saveSettings} className="glass-button flex-1 bg-gray-900 text-white hover:bg-gray-800">Save</button>
                                <button onClick={() => setEditingSettingsDeckId(null)} className="glass-button flex-1">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default DeckList;
