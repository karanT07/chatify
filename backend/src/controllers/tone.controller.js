// backend/src/controllers/toneController.js
import Sentiment from "sentiment";
const sentiment = new Sentiment();

/**
 * POST /api/tone
 * body: { text: string }
 * response: { tone: 'positive'|'negative'|'neutral', score: number, suggestions: string[] }
 */
export const analyzeTone = (req, res) => {
    const { text } = req.body;
    if (typeof text !== 'string') return res.status(400).json({ error: 'text required' });

    const result = sentiment.analyze(text || '');
    // Basic mapping — tune thresholds as needed
    let tone = 'neutral';
    if (result.score > 2) tone = 'positive';
    else if (result.score < -2) tone = 'negative';

    // Simple, deterministic suggestions; you can later replace with LLM rephrases
    const suggestions = [];

    if (tone === 'negative') {
        suggestions.push('Try softening it: "I might suggest..." or "Perhaps we could..."');
        suggestions.push('Avoid absolute words (always/never) and use "maybe" or "sometimes".');
    } else if (tone === 'positive') {
        suggestions.push('Great tone! Shorten it if you want it more casual.');
    } else {
        suggestions.push('Neutral — if you want it friendlier, try adding a greeting or emoji.');
    }

    // small hints from result
    if (text.includes('!')) suggestions.push('Consider removing exclamation points to sound calmer.');
    if (result.words && result.words.length > 0 && result.positive && result.negative) {
        // noop — kept for future extension
    }

    res.json({ tone, score: result.score, suggestions });
};
