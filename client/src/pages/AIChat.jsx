import { useState } from "react";
import "../components/AIChat/AIChat.css";

function AIChat() {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello 👋 Ask me anything about your studies."
        }
    ]);

    const [input, setInput] = useState("");

    const handleSend = () => {

        if (input.trim() === "") return;

        const userMessage = {
            sender: "user",
            text: input,
        };

        setMessages((prev) => [...prev, userMessage]);

        setInput("");

        setTimeout(() => {

            const botReply = {
                sender: "bot",
                text: "🤖 Gemini AI integration is coming soon. This is a demo reply.",
            };

            setMessages((prev) => [...prev, botReply]);

        }, 1000);

    };

    return (

        <div className="chat-page">

            <div className="chat-header">

                🤖 AI Study Assistant

            </div>

            <div className="chat-box">

                {messages.map((msg, index) => (

                    <div
                        key={index}
                        className={msg.sender === "bot" ? "bot-msg" : "user-msg"}
                    >

                        {msg.text}

                    </div>

                ))}

            </div>

            <div className="chat-input">

                <input
                    type="text"
                    placeholder="Ask your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                />

                <button onClick={handleSend}>
                    Send
                </button>

            </div>

        </div>

    );

}

export default AIChat;