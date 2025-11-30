import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { ArrowLeft, RotateCw, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const StudySession = ({ deckId, onBack }) => {
    const { decks, recordReview } = useStore();
    const deck = decks.find(d => d.id === deckId);

    const [isFlipped, setIsFlipped] = useState(false);

    // Session Queue: Array of card IDs
    const [queue, setQueue] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize queue with due cards
    useEffect(() => {
        if (deck && !isInitialized) {
            const now = new Date();
            const due = deck.cards.filter(card => {
                const dueDate = new Date(card.srsData.dueDate);
                return dueDate <= now;
            }).sort((a, b) => new Date(a.srsData.dueDate) - new Date(b.srsData.dueDate));

            setQueue(due.map(c => c.id));
            setIsInitialized(true);
        }
    }, [deck, isInitialized]);

    const currentCardId = queue[0];
    const currentCard = deck?.cards.find(c => c.id === currentCardId);
    const isFinished = isInitialized && queue.length === 0;

    const handleRate = (rating) => {
        if (!currentCard) return;

        recordReview(deckId, currentCard.id, rating);
        setIsFlipped(false);

        setQueue(prev => {
            const remaining = prev.slice(1); // Remove current
            if (rating === 1) {
                // Again: Re-queue at the end
                return [...remaining, currentCard.id];
            }
            // Hard/Good/Easy: Done for this session
            return remaining;
        });
    };

    if (!deck) return <div>Deck not found</div>;

    return (
        <div className="max-w-2xl mx-auto w-full">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Decks
            </button>

            <AnimatePresence mode="wait">
                {isFinished ? (
                    <motion.div
                        key="finished"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">All Done!</h2>
                        <p className="text-gray-500 text-lg">You've reviewed all cards due for now.</p>
                        <button onClick={onBack} className="mt-8 glass-button bg-gray-900 text-white hover:bg-gray-800 hover:text-white">
                            Return Home
                        </button>
                    </motion.div>
                ) : currentCard ? (
                    <motion.div
                        key={currentCard.id} // Key by ID to trigger animation on change
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span>Queue: {queue.length}</span>
                            <span>Due: {new Date(currentCard.srsData.dueDate).toLocaleDateString()}</span>
                        </div>

                        <div
                            className="perspective-1000 w-full h-[400px] cursor-pointer group"
                            onClick={() => !isFlipped && setIsFlipped(true)}
                        >
                            <motion.div
                                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {/* Front */}
                                <div className="absolute w-full h-full backface-hidden glass-panel flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-white shadow-xl">
                                    {currentCard.frontImage && (
                                        <img src={currentCard.frontImage} alt="Front" className="max-h-40 mb-4 rounded-lg object-contain" />
                                    )}
                                    <h3 className="text-3xl font-medium text-gray-900">{currentCard.front}</h3>
                                    <p className="absolute bottom-4 text-sm text-gray-400">Tap to flip</p>
                                </div>

                                {/* Back */}
                                <div className="absolute w-full h-full backface-hidden glass-panel flex flex-col items-center justify-center p-8 text-center rotate-y-180 bg-gray-50 border-2 border-white shadow-xl">
                                    {currentCard.backImage && (
                                        <img src={currentCard.backImage} alt="Back" className="max-h-40 mb-4 rounded-lg object-contain" />
                                    )}
                                    <h3 className="text-3xl font-medium text-gray-900">{currentCard.back}</h3>
                                </div>
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {isFlipped ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                                >
                                    <button onClick={() => handleRate(1)} className="glass-button bg-red-50 text-red-600 hover:bg-red-100 border-red-200 flex-col gap-0 py-2">
                                        <div className="text-sm font-bold">Again</div>
                                        <div className="text-xs opacity-60">Now</div>
                                    </button>
                                    <button onClick={() => handleRate(2)} className="glass-button bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200 flex-col gap-0 py-2">
                                        <div className="text-sm font-bold">Hard</div>
                                        <div className="text-xs opacity-60">6m</div>
                                    </button>
                                    <button onClick={() => handleRate(3)} className="glass-button bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 flex-col gap-0 py-2">
                                        <div className="text-sm font-bold">Good</div>
                                        <div className="text-xs opacity-60">1d</div>
                                    </button>
                                    <button onClick={() => handleRate(4)} className="glass-button bg-green-50 text-green-600 hover:bg-green-100 border-green-200 flex-col gap-0 py-2">
                                        <div className="text-sm font-bold">Easy</div>
                                        <div className="text-xs opacity-60">4d</div>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[58px] flex items-center justify-center text-gray-400 italic"
                                >
                                    Tap card to see answer
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudySession;
