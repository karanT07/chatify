// backend/src/controllers/toneController.llm.js
const DEFAULT_OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_GENERATE_PATH = '/api/generate';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2';

function buildPrompt(text) {
    return `
You are an assistant that MUST return ONLY valid JSON.
Analyze the following message and produce JSON with:
- "tone": "positive"|"neutral"|"negative"
- "score": number between -1 and 1
- "suggestions": array of up to 3 short improved rewrites (<=120 chars)

Message:
"""${text}"""
`.trim();
}

async function callOllama(prompt) {
    const url = `${DEFAULT_OLLAMA_HOST}${OLLAMA_GENERATE_PATH}`;
    const body = { model: MODEL_NAME, prompt, stream: false };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Ollama API error ${res.status}: ${txt}`);
    }

    // Try to parse common shapes
    const json = await res.json().catch(() => null);
    if (json) {
        if (json.response && typeof json.response === 'string') return json.response;
        if (json.output && Array.isArray(json.output)) {
            return json.output.map(o => (o.content?.[0]?.text ?? '')).join('');
        }
        return JSON.stringify(json);
    }

    return await res.text();
}

export const analyzeToneLLM = async (req, res) => {
    try {
        const { text } = req.body || {};
        if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text required' });

        const prompt = buildPrompt(text);
        const raw = await callOllama(prompt);

        // clean & parse JSON out of raw model output
        const clean = String(raw)
            .trim()
            .replace(/^[`'\s]*```json\s*/i, '')
            .replace(/```$/, '')
            .replace(/^["']/, '')
            .replace(/["']$/, '');

        let parsed = null;
        try { parsed = JSON.parse(clean); } catch (e) {
            const m = clean.match(/\{[\s\S]*\}/);
            if (m) {
                try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = null; }
            }
        }

        if (!parsed) {
            return res.json({
                tone: 'neutral',
                score: 0,
                suggestions: ['(LLM output unexpected) Try rephrasing politely.'],
                raw,
            });
        }

        const tone = parsed.tone ?? 'neutral';
        let score = Number(parsed.score ?? 0);
        if (Math.abs(score) > 1) score = Math.max(-1, Math.min(1, score / 100));
        const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [];

        return res.json({ tone, score, suggestions });
    } catch (err) {
        console.error('LLM tone error', err);
        return res.status(500).json({ error: 'LLM error', details: String(err) });
    }
};
