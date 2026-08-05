import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { sendMessage, getHistory } from "../services/chatService";
import {
    getConversations,
    createConversation,
} from "../services/conversationService";
import "../components/AIChat/AIChat.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function AIChat() {

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const [conversations, setConversations] = useState([]);

    const [currentConversation, setCurrentConversation] = useState(null);

    const chatEndRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {

        loadConversations();

    }, []);

    useEffect(() => {

        if (currentConversation) {

            loadHistory(currentConversation);

        }

    }, [currentConversation]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    const loadConversations = async () => {

        try {

            const res = await getConversations();

            if (res.data.success) {

                setConversations(res.data.conversations);

                if (res.data.conversations.length > 0) {

                    setCurrentConversation(res.data.conversations[0]._id);

                }

            }

        }

        catch (err) {

            console.log(err);

        }

    };

    const loadHistory = async (conversationId) => {

        try {

            const token = localStorage.getItem("token");

            const res = await getHistory(conversationId, token);

            if (res.data.success) {

                const chats = [];

                res.data.chats.forEach(chat => {

                    chats.push({
                        sender: "user",
                        text: chat.question,
                    });

                    chats.push({
                        sender: "bot",
                        text: chat.answer,
                    });

                });

                if (chats.length === 0) {

                    chats.push({
                        sender: "bot",
                        text: "Hello 👋 Ask me anything about your studies.",
                    });

                }

                setMessages(chats);

            }

        } catch (err) {

            console.log(err);

        }

    };

    const handleSend = async () => {

        if (loading || input.trim() === "") return;

        const question = input;

        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: question,
            },
        ]);

        setInput("");

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const res = await sendMessage(
                question,
                currentConversation
            );

            await loadConversations();

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: res.data.reply,
                },
            ]);

        } catch (err) {

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: "❌ Failed to connect.",
                },
            ]);

        }

        setLoading(false);

    };

    const handleNewChat = async () => {

        try {

            const res = await createConversation();

            if (res.data.success) {

                await loadConversations();

                setCurrentConversation(res.data.conversation._id);

                setMessages([
                    {
                        sender: "bot",
                        text: "Hello 👋 Ask me anything about your studies.",
                    },
                ]);

            }

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="ai-chat-layout">
            <Toaster position="top-right" />

            <aside className="ai-sidebar">

                <h2>EduCompanion</h2>

                <button
                    className="ai-new-chat-btn"
                    onClick={handleNewChat}
                >
                    + New Chat
                </button>

                <div className="ai-history-list">

                    <p>Previous Chats</p>

                    {conversations.map((conv) => (

                        <div
                            key={conv._id}
                            className={
                                currentConversation === conv._id
                                    ? "ai-history-item active"
                                    : "ai-history-item"
                            }
                            onClick={() => setCurrentConversation(conv._id)}
                        >
                            {conv.title}
                        </div>

                    ))}

                </div>

                <button
                    className="ai-logout-btn"
                    onClick={() => {

                        localStorage.removeItem("token");

                        navigate("/login");

                    }}
                >
                    Logout
                </button>

            </aside>

            <div className="ai-chat-page">

                <div className="ai-chat-header">
                    🤖 EduCompanion AI
                </div>

                <div className="ai-chat-box">

                    {messages.map((msg, index) => (

                        <div
                            key={index}
                            className={msg.sender === "bot" ? "ai-bot-msg" : "ai-user-msg"}
                        >

                            {msg.sender === "bot" ? (

                                <>

                                    <button
                                        className="ai-copy-btn"
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.text);
                                            toast.success("Copied!");
                                        }}
                                    >
                                        📋
                                    </button>

                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ children, className }) {

                                                const match = /language-(\w+)/.exec(className || "");

                                                return match ? (

                                                    <SyntaxHighlighter
                                                        language={match[1]}
                                                        style={oneDark}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>

                                                ) : (

                                                    <code className={className}>
                                                        {children}
                                                    </code>

                                                );

                                            },
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>

                                </>

                            ) : (

                                msg.text

                            )}

                        </div>

                    ))}

                    {loading && (

                        <div className="ai-bot-msg loading">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    )}

                    <div ref={chatEndRef}></div>

                </div>

                <div className="ai-chat-input">

                    <textarea
                        value={input}
                        rows={1}
                        placeholder="Ask anything..."
                        onChange={(e) => {
                            setInput(e.target.value);

                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <button onClick={handleSend}>
                        Send
                    </button>

                </div>

            </div>

        </div>

    );

}

export default AIChat;