import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateNextReview } from '../utils/srs';

const API_URL = 'http://localhost:5001/api';

export const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            decks: [],
            studyLog: [], // Still local for now or we can fetch it if we add an endpoint

            signup: async (username, password) => {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Signup failed');
                set({ user: data.user, token: data.token });
                get().fetchDecks();
            },

            login: async (username, password) => {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Login failed');
                set({ user: data.user, token: data.token });
                get().fetchDecks();
            },

            logout: () => set({ user: null, token: null, decks: [] }),

            fetchDecks: async () => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks`, {
                        headers: { 'x-auth-token': token }
                    });
                    const data = await res.json();
                    if (res.ok) set({ decks: data });
                } catch (err) {
                    console.error('Failed to fetch decks', err);
                }
            },

            addDeck: async (name) => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ name })
                    });
                    const newDeck = await res.json();
                    if (res.ok) {
                        set((state) => ({ decks: [...state.decks, newDeck] }));
                    }
                } catch (err) {
                    console.error('Failed to add deck', err);
                }
            },

            updateDeckSettings: async (deckId, settings) => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks/${deckId}/settings`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ settings })
                    });
                    const updatedDeck = await res.json();
                    if (res.ok) {
                        set((state) => ({
                            decks: state.decks.map(d => d.id === deckId ? updatedDeck : d)
                        }));
                    }
                } catch (err) {
                    console.error('Failed to update settings', err);
                }
            },

            deleteDeck: async (id) => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks/${id}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token }
                    });
                    if (res.ok) {
                        set((state) => ({
                            decks: state.decks.filter((deck) => deck.id !== id)
                        }));
                    }
                } catch (err) {
                    console.error('Failed to delete deck', err);
                }
            },

            addCard: async (deckId, front, back, frontImage, backImage) => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks/${deckId}/cards`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ front, back, frontImage, backImage })
                    });
                    const updatedDeck = await res.json();
                    if (res.ok) {
                        set((state) => ({
                            decks: state.decks.map(d => d.id === deckId ? updatedDeck : d)
                        }));
                    }
                } catch (err) {
                    console.error('Failed to add card', err);
                }
            },

            deleteCard: (deckId, cardId) => {
                console.warn("Delete card not implemented in backend yet");
            },

            recordReview: (deckId, cardId, rating) => set((state) => {
                const deck = state.decks.find(d => d.id === deckId);
                if (!deck) return state;

                const card = deck.cards.find(c => c.id === cardId);
                if (!card) return state;

                const srsResult = calculateNextReview(card, rating, deck.settings);

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
                    })
                };
            }),
        }),
        {
            name: 'flashcard-storage',
            partialize: (state) => ({ token: state.token, user: state.user }), // Only persist auth
        }
    )
);
