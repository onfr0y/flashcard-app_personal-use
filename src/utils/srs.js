export const calculateNextReview = (card, rating, deckSettings = {}) => {
    // Ratings: 1: Again, 2: Hard, 3: Good, 4: Easy

    // Default settings if not provided
    const settings = {
        learningSteps: [1, 10], // minutes
        graduatingInterval: 1, // days
        easyInterval: 4, // days
        ...deckSettings
    };

    let { interval, ease, repetitions, state, stepIndex } = card.srsData || {
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        state: 'learning', // 'learning', 'graduated'
        stepIndex: 0
    };

    // Defaults
    if (!state) state = 'learning';
    if (stepIndex === undefined) stepIndex = 0;

    let nextInterval;
    let nextEase = ease;
    let nextRepetitions = repetitions;
    let nextState = state;
    let nextStepIndex = stepIndex;

    // Fuzz factor to prevent bunching (±5%)
    const fuzz = 1 + (Math.random() * 0.1 - 0.05);

    if (rating === 1) {
        // Again - Immediate repeat
        nextRepetitions = 0;
        nextState = 'learning';
        nextStepIndex = 0;
        nextInterval = 0; // Immediate
        // Decrease ease slightly for lapses
        nextEase = Math.max(1.3, ease - 0.2);
    } else if (rating === 2) {
        // Hard
        if (state === 'learning') {
            // Repeat current step
            nextInterval = settings.learningSteps[stepIndex] / (24 * 60);
            nextState = 'learning';
        } else {
            nextInterval = interval * 1.2; // 1.2x multiplier
            nextEase = Math.max(1.3, ease - 0.15);
        }
    } else if (rating === 3) {
        // Good
        if (state === 'learning') {
            if (stepIndex < settings.learningSteps.length - 1) {
                // Move to next step
                nextStepIndex++;
                nextInterval = settings.learningSteps[nextStepIndex] / (24 * 60);
                nextState = 'learning';
            } else {
                // Graduate
                nextState = 'graduated';
                nextInterval = settings.graduatingInterval;
            }
        } else {
            nextInterval = interval * ease;
        }
        nextRepetitions += 1;
    } else if (rating === 4) {
        // Easy
        if (state === 'learning') {
            // Graduate immediately
            nextState = 'graduated';
            nextInterval = settings.easyInterval;
        } else {
            nextInterval = interval * ease * 1.3; // Easy bonus
            nextEase += 0.15;
        }
        nextRepetitions += 1;
    }

    // Apply fuzz to intervals > 2 days
    if (nextInterval > 2) {
        nextInterval *= fuzz;
    }

    return {
        interval: nextInterval,
        ease: nextEase,
        repetitions: nextRepetitions,
        state: nextState,
        stepIndex: nextStepIndex,
        dueDate: new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString(),
    };
};
