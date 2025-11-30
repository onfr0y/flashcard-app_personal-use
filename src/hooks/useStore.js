import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { calculateNextReview } from '../utils/srs';

export const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            users: [], // Store registered users: { id, username, password, avatar }
            decks: [],
            studyLog: [],

            signup: (username, password) => {
                const state = get();
                if (state.users.some(u => u.username === username)) {
                    throw new Error('Username already exists');
                }
                const newUser = {
                    id: uuidv4(),
                    username,
                    password, // In a real app, hash this!
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                };
                set({
                    users: [...state.users, newUser],
                    user: newUser
                });
            },

            login: (username, password) => {
                const state = get();
                const user = state.users.find(u => u.username === username && u.password === password);
                if (user) {
                    set({ user });
                } else {
                    throw new Error('Invalid username or password');
                }
            },

            logout: () => set({ user: null }),

            addDeck: (name) => set((state) => {
                if (!state.user) return state;
                const newDeck = {
                    id: uuidv4(),
                    ownerId: state.user.id,
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
                // Filter logs for current user if needed, but for now global log is fine or we can add userId to log
                // Ideally studyLog should also be filtered by user, but let's keep it simple for now or link it.
                // Better: link study log to user.

                // Let's make studyLog user-specific in the future or now?
                // For now, let's just keep it simple. If we want per-user stats, we need to change studyLog structure.
                // Let's assume studyLog is global for this device for now, or filter by user in Heatmap.
                // To do it right: add userId to studyLog entries or separate logs.
                // Given the scope, let's just stick to decks for now.

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
            partialize: (state) => ({
                decks: state.decks,
                studyLog: state.studyLog,
                users: state.users, // Persist users
                // Do NOT persist 'user' (current session) to force login on refresh? 
                // Or persist it for convenience? Let's persist it for convenience.
                user: state.user
            }),
        }
    )
);
