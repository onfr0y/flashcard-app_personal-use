import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { calculateNextReview } from '../utils/srs';

export const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            decks: [],
            studyLog: [],

            login: (email, password) => set({
                user: {
                    name: 'Felix',
                    email: email,
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
                }
            }),
            logout: () => set({ user: null }),

            addDeck: (name) => set((state) => {
                const newDeck = {
                    id: uuidv4(),
                    name,
                    createdAt: new Date().toISOString(),
                    cards: [],
                    settings: {
                        learningSteps: [1, 10], // Default Anki steps
                        graduatingInterval: 1,
                        easyInterval: 4
                    }
                };
                return { decks: [...state.decks, newDeck] };
            }),

            updateDeckSettings: (deckId, settings) => set((state) => ({
                decks: state.decks.map(deck =>
                    deck.id === deckId ? { ...deck, settings: { ...deck.settings, ...settings } } : deck
                )
            })),

            deleteDeck: (id) => set((state) => ({
                decks: state.decks.filter((deck) => deck.id !== id)
            })),

            addCard: (deckId, front, back, frontImage, backImage) => set((state) => ({
                decks: state.decks.map((deck) => {
                    if (deck.id !== deckId) return deck;
                    const newCard = {
                        id: uuidv4(),
                        deckId,
                        front,
                        back,
                        frontImage,
                        backImage,
                        srsData: {
                            interval: 0,
                            ease: 2.5,
                            repetitions: 0,
                            dueDate: new Date().toISOString(),
                            state: 'learning',
                            stepIndex: 0
                        },
                    };
                    return { ...deck, cards: [...deck.cards, newCard] };
                }),
            })),

            deleteCard: (deckId, cardId) => set((state) => ({
                decks: state.decks.map((deck) => {
                    if (deck.id !== deckId) return deck;
                    return {
                        ...deck,
                        cards: deck.cards.filter((c) => c.id !== cardId)
                    };
                })
            })),

            recordReview: (deckId, cardId, rating) => set((state) => {
                const deck = state.decks.find(d => d.id === deckId);
                if (!deck) return state;

                const card = deck.cards.find(c => c.id === cardId);
                if (!card) return state;

                const srsResult = calculateNextReview(card, rating, deck.settings);

                // Update study log
                const today = new Date().toISOString().split('T')[0];
                const logEntryIndex = state.studyLog.findIndex(l => l.date === today);
                let newStudyLog = [...state.studyLog];

                if (logEntryIndex >= 0) {
                    newStudyLog[logEntryIndex].count += 1;
                } else {
                    newStudyLog.push({ date: today, count: 1 });
                }

                return {
                    decks: state.decks.map(d => {
                        if (d.id !== deckId) return d;
                        return {
                            ...d,
                            cards: d.cards.map(c => {
                                if (c.id !== cardId) return c;
                                return { ...c, srsData: { ...c.srsData, ...srsResult } };
                            })
                        };
                    }),
                    studyLog: newStudyLog
                };
            }),
        }),
        {
            name: 'flashcard-storage', // unique name
            partialize: (state) => ({ decks: state.decks, studyLog: state.studyLog, user: state.user }), // persist these fields
        }
    )
);
