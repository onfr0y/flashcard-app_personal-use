import express from 'express';
import auth from '../middleware/auth.js';
import Deck from '../models/Deck.js';
import StudyLog from '../models/StudyLog.js';
import { calculateNextReview } from '../utils/srs.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all decks for user
router.get('/', auth, async (req, res) => {
    try {
        const decks = await Deck.find({ owner: req.user.id });
        res.json(decks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Create new deck
router.post('/', auth, async (req, res) => {
    const { name } = req.body;
    try {
        const newDeck = new Deck({
            id: uuidv4(),
            owner: req.user.id,
            name,
            cards: []
        });

        const deck = await newDeck.save();
        res.json(deck);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Delete deck
router.delete('/:id', auth, async (req, res) => {
    try {
        const deck = await Deck.findOne({ id: req.params.id });
        if (!deck) return res.status(404).json({ msg: 'Deck not found' });

        // Check user
        if (deck.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Deck.findOneAndDelete({ id: req.params.id });
        res.json({ msg: 'Deck removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Add card
router.post('/:id/cards', auth, async (req, res) => {
    const { front, back, frontImage, backImage } = req.body;
    try {
        const deck = await Deck.findOne({ id: req.params.id });
        if (!deck) return res.status(404).json({ msg: 'Deck not found' });
        if (deck.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const newCard = {
            id: uuidv4(),
            front,
            back,
            frontImage,
            backImage,
            srsData: {
                interval: 0,
                ease: 2.5,
                repetitions: 0,
                dueDate: new Date(),
                state: 'learning',
                stepIndex: 0
            }
        };

        deck.cards.push(newCard);
        await deck.save();
        res.json(deck);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Update deck settings
router.put('/:id/settings', auth, async (req, res) => {
    const { settings } = req.body;
    try {
        const deck = await Deck.findOne({ id: req.params.id });
        if (!deck) return res.status(404).json({ msg: 'Deck not found' });
        if (deck.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        deck.settings = { ...deck.settings, ...settings };
        await deck.save();
        res.json(deck);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Record review
router.post('/:id/cards/:cardId/review', auth, async (req, res) => {
    const { rating } = req.body;
    try {
        const deck = await Deck.findOne({ id: req.params.id });
        if (!deck) return res.status(404).json({ msg: 'Deck not found' });
        if (deck.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const card = deck.cards.find(c => c.id === req.params.cardId);
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        // Calculate next review
        const srsResult = calculateNextReview(card, rating, deck.settings);

        // Update card
        card.srsData = { ...card.srsData, ...srsResult };

        // Update deck
        await deck.save();

        // Update Study Log
        const today = new Date().toISOString().split('T')[0];
        await StudyLog.findOneAndUpdate(
            { userId: req.user.id, date: today },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        res.json(deck);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get study logs
router.get('/stats/logs', auth, async (req, res) => {
    try {
        const logs = await StudyLog.find({ userId: req.user.id }).sort({ date: 1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
