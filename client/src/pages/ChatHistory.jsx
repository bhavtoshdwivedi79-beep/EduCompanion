import "./ChatHistory.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast, { Toaster } from "react-hot-toast";

import { useEffect, useState } from "react";
import { getChatHistory, deleteChat } from "../services/chatService";

function ChatHistory() {

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [deleteChatId, setDeleteChatId] = useState(null);

    const fetchChats = async () => {
        try {
            const data = await getChatHistory();
            setChats(data.data.chats);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const handleDelete = async () => {

        try {

            await deleteChat(deleteChatId);

            toast.success("Chat deleted successfully!");

            setDeleteChatId(null);

            fetchChats();

        } catch (error) {

            toast.error("Failed to delete chat.");

            console.log(error);

        }

    };

    return (

        <div className="chat-history-page">
            <Toaster position="top-right" />

            <h1>🤖 AI Chat History</h1>

            {
                chats.length === 0 ? (

                    <h3 className="empty-chat">No chat history found.</h3>

                ) : (
                    <div className="chat-grid">

                        {chats.map((chat) => (

                            <div
                                key={chat._id}
                                className="chat-card"
                            >

                                <h3>❓ {chat.question}</h3>

                                <p>
                                    {chat.answer.substring(0, 180)}...
                                </p>

                                <small>
                                    {new Date(chat.createdAt).toLocaleString()}
                                </small>

                                <br /><br />

                                <div className="chat-buttons">

                                    <button
                                        className="view-btn"
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        👁 View
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => setDeleteChatId(chat._id)}
                                    >
                                        🗑 Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )
            }

            {selectedChat && (

                <div
                    className="modal-overlay"
                    onClick={() => setSelectedChat(null)}
                >

                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">

                            <h2>
                                💬 Conversation
                            </h2>

                            <p>
                                Review your previous AI discussion
                            </p>

                            <button
                                className="close-btn"
                                onClick={() => setSelectedChat(null)}
                            >
                                ✖
                            </button>

                        </div>

                        <div className="conversation-status">

                            <span>
                                🤖 AI Assistant
                            </span>

                        </div>

                        <div className="conversation-container">

                            <div className="message user-message">

                                <div className="avatar user-avatar">
                                    BD
                                </div>

                                <div className="message-content">

                                    <h4>You</h4>

                                    <p>
                                        {selectedChat.question}
                                    </p>

                                </div>

                            </div>

                            <div className="message ai-message">

                                <div className="avatar ai-avatar">
                                    EC
                                </div>

                                <div className="message-content">

                                    <h4>EduCompanion AI</h4>

                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedChat.answer}
                                    </ReactMarkdown>

                                </div>

                            </div>

                            <button
                                className="copy-btn"
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedChat.answer);
                                    toast.success("Copied!");
                                }}
                            >
                                📋 Copy
                            </button>

                        </div>

                        <p className="chat-date">
                            Last Updated
                            <br />
                            📅 {new Date(selectedChat.createdAt).toLocaleString()}
                        </p>

                    </div>

                </div>

            )}

            {
                deleteChatId && (

                    <div
                        className="delete-overlay"
                        onClick={() => setDeleteChatId(null)}
                    >

                        <div
                            className="delete-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <h2>🗑 Delete Chat?</h2>

                            <p>
                                Are you sure you want to delete this conversation?
                                <br />
                                This action cannot be undone.
                            </p>

                            <div className="delete-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={() => setDeleteChatId(null)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="confirm-btn"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );
}

export default ChatHistory;