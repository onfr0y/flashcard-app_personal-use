import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    id: { type: String, required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    frontImage: { type: String, default: '' },
    backImage: { type: String, default: '' },
    srsData: {
        interval: { type: Number, default: 0 },
        ease: { type: Number, default: 2.5 },
        repetitions: { type: Number, default: 0 },
        dueDate: { type: Date, default: Date.now },
        state: { type: String, default: 'learning' },
        stepIndex: { type: Number, default: 0 }
    }
});

const deckSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    cards: [cardSchema],
    settings: {
        learningSteps: { type: [Number], default: [1, 10] },
        graduatingInterval: { type: Number, default: 1 },
        easyInterval: { type: Number, default: 4 }
    }
});

export default mongoose.model('Deck', deckSchema);
