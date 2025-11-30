import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            decks: [],
            isLoading: false, // Add loading state
            studyLog: [],

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
                get().fetchStudyLogs();
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
                get().fetchStudyLogs();
            },

            logout: () => set({ user: null, token: null, decks: [] }),

            fetchDecks: async () => {
                const { token } = get();
                if (!token) return;
                set({ isLoading: true }); // Start loading
                try {
                    const res = await fetch(`${API_URL}/decks`, {
                        headers: { 'x-auth-token': token }
                    });
                    const data = await res.json();
                    if (res.ok) set({ decks: data });
                } catch (err) {
                    console.error('Failed to fetch decks', err);
                } finally {
                    set({ isLoading: false }); // Stop loading
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

            fetchStudyLogs: async () => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks/stats/logs`, {
                        headers: { 'x-auth-token': token }
                    });
                    const data = await res.json();
                    if (res.ok) set({ studyLog: data });
                } catch (err) {
                    console.error('Failed to fetch study logs', err);
                }
            },

            recordReview: async (deckId, cardId, rating) => {
                const { token } = get();
                if (!token) return;
                try {
                    const res = await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}/review`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ rating })
                    });

                    const updatedDeck = await res.json();

                    if (res.ok) {
                        // Update deck in store
                        set((state) => ({
                            decks: state.decks.map(d => d.id === deckId ? updatedDeck : d)
                        }));
                        // Refresh logs to update heatmap
                        get().fetchStudyLogs();
                    }
                } catch (err) {
                    console.error('Failed to record review', err);
                }
            },
        }),
        {
            name: 'flashcard-storage',
            partialize: (state) => ({ token: state.token, user: state.user }), // Only persist auth
        }
    )
);
