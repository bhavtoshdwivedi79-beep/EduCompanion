import { sendMessage } from "../services/chatService";
import { useState, useEffect, useRef } from "react";
import "../components/AIChat/AIChat.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function AIChat() {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello 👋 Ask me anything about your studies."
        }
    ]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading]);

    const handleSend = async () => {

        if (loading || input.trim() === "") return;

        const userMessage = {
            sender: "user",
            text: input,
        };

        setMessages((prev) => [...prev, userMessage]);

        const question = input;

        setInput("");

        setLoading(true);

        try {

            const res = await sendMessage(question, messages);

            const botReply = {
                sender: "bot",
                text: res.data.reply,
            };

            setMessages((prev) => [...prev, botReply]);

        } catch (error) {

            console.error(error);

            const botReply = {
                sender: "bot",
                text: "❌ Failed to connect with AI Assistant.",
            };

            setMessages((prev) => [...prev, botReply]);

        }

        setLoading(false);

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

                        {msg.sender === "bot" ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || "");

                                        return match ? (
                                            <SyntaxHighlighter
                                                style={oneDark}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, "")}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}

                    </div>

                ))}

                {loading && (

                    <div className="bot-msg">

                        🤖 Thinking...

                    </div>

                )}

                <div ref={chatEndRef}></div>

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