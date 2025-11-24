// frontend/src/hooks/useTone.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function useTone(text, { debounceMs = 600 } = {}) {
    const [toneData, setToneData] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!text || text.trim() === "") {
            setToneData(null);
            return;
        }

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            try {
                const res = await axios.post("/api/tone-llm", { text });
                setToneData(res.data);
            } catch (err) {
                console.error("Tone API error:", err);
                setToneData(null);
            }
        }, debounceMs);

        return () => clearTimeout(timerRef.current);
    }, [text, debounceMs]);

    return toneData;
}
