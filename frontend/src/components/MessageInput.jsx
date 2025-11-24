import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import useTone from "../hooks/useTone"; // new import

function MessageInput() {
    const { playRandomKeyStrokeSound } = useKeyboardSound();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);
    const inputRef = useRef(null); // for focus when applying suggestion

    const { sendMessage, isSoundEnabled } = useChatStore();

    // useTone hook returns { tone, score, suggestions } or null
    const tone = useTone(text);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        if (isSoundEnabled) playRandomKeyStrokeSound();

        sendMessage({
            text: text.trim(),
            image: imagePreview,
        });

        // reset composer state
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const applySuggestion = (suggestion) => {
        // set the suggestion as draft and focus input so user can edit/send
        setText(suggestion);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div className="p-4 border-t border-slate-700/50">
            {imagePreview && (
                <div className="max-w-3xl mx-auto mb-3 flex items-center">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                            type="button"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex flex-col space-y-2">
                <div className="w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            isSoundEnabled && playRandomKeyStrokeSound();
                        }}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
                        placeholder="Type your message..."
                    />
                </div>

                {/* Tone UI (non-intrusive) */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-h-[42px]">
                        {tone ? (
                            <div className="text-sm text-slate-200">
                                <span className="font-semibold">Tone:</span>{" "}
                                <span style={{ textTransform: "capitalize" }}>{tone.tone}</span>{" "}
                                <span className="text-slate-400">({Number(tone.score).toFixed(2)})</span>

                                {/* suggestions */}
                                {tone.suggestions && tone.suggestions.length > 0 && (
                                    <div className="mt-2">
                                        {tone.suggestions.slice(0, 2).map((sugg, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="text-xs text-slate-300">{sugg}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => applySuggestion(sugg)}
                                                    className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">Tone: —</div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${imagePreview ? "text-cyan-500" : ""
                                }`}
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        <button
                            type="submit"
                            disabled={!text.trim() && !imagePreview}
                            className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
export default MessageInput;
