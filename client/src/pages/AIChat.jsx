import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { sendMessage, getHistory } from "../services/chatService";

import {
    getConversations,
    createConversation,
    deleteConversation,
    renameConversation,
} from "../services/conversationService";

import "../components/AIChat/AIChat.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter";

import {
    oneDark
} from "react-syntax-highlighter/dist/esm/styles/prism";


function AIChat() {

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const [conversations, setConversations] = useState([]);

    const [currentConversation, setCurrentConversation] = useState(null);

    const [deleteConversationId, setDeleteConversationId] = useState(null);

    const [editingConversation, setEditingConversation] = useState(null);

    const [newTitle, setNewTitle] = useState("");

    // ================================
    // ATTACHMENT STATES
    // ================================

    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const [previewUrl, setPreviewUrl] = useState(null);

    const [showCamera, setShowCamera] = useState(false);

    const videoRef = useRef(null);

    const streamRef = useRef(null);

    const fileInputRef = useRef(null);

    const canvasRef = useRef(null);

    const chatEndRef = useRef(null);

    const navigate = useNavigate();


    // ================================
    // LOAD CONVERSATIONS
    // ================================

    useEffect(() => {

        loadConversations();

    }, []);


    // ================================
    // LOAD CURRENT CHAT HISTORY
    // ================================

    useEffect(() => {

        if (currentConversation) {

            loadHistory(currentConversation);

        }

    }, [currentConversation]);


    // ================================
    // AUTO SCROLL
    // ================================

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading]);


    // ================================
    // CLEANUP CAMERA
    // ================================

    useEffect(() => {

        return () => {

            if (streamRef.current) {

                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });

            }

        };

    }, []);


    // ================================
    // LOAD CONVERSATIONS
    // ================================

    const loadConversations = async () => {

        try {

            const res = await getConversations();

            if (res.data.success) {

                setConversations(res.data.conversations);

                if (res.data.conversations.length > 0) {

                    setCurrentConversation(
                        res.data.conversations[0]._id
                    );

                }

            }

        }

        catch (err) {

            console.log(err);

        }

    };


    // ================================
    // LOAD HISTORY
    // ================================

    const loadHistory = async (conversationId) => {

        try {

            const token = localStorage.getItem("token");

            const res = await getHistory(
                conversationId,
                token
            );

            if (res.data.success) {

                const chats = [];

                res.data.chats.forEach((chat) => {

                    // ==========================================
                    // USER MESSAGE
                    // ==========================================

                    chats.push({
                        sender: "user",
                        text: chat.question,

                        // Restore image/file from database
                        attachment: chat.imageUrl
                            ? {
                                name: chat.imageName || "Uploaded Image",
                                type: "image/*",
                                preview: chat.imageUrl,
                            }
                            : null,
                    });


                    // ==========================================
                    // AI RESPONSE
                    // ==========================================

                    chats.push({
                        sender: "bot",
                        text: chat.answer,
                    });

                });


                // ==========================================
                // EMPTY CHAT
                // ==========================================

                if (chats.length === 0) {

                    chats.push({
                        sender: "bot",
                        text:
                            "Hello 👋 Ask me anything about your studies.",
                    });

                }


                setMessages(chats);

            }

        } catch (err) {

            console.log(
                "Failed to load chat history:",
                err
            );

        }

    };


    // ==================================================
    // ATTACHMENT MENU
    // ==================================================

    const toggleAttachmentMenu = () => {

        setShowAttachmentMenu(prev => !prev);

    };


    // ==================================================
    // OPEN FILE PICKER
    // ==================================================

    const openFilePicker = () => {

        fileInputRef.current?.click();

        setShowAttachmentMenu(false);

    };


    // ==================================================
    // FILE SELECTED
    // ==================================================

    const handleFileChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;


        // Maximum frontend file size for now
        // Backend/RAG limits will be handled later.

        const maxSize = 100 * 1024 * 1024;

        if (file.size > maxSize) {

            toast.error(
                "File is too large. Maximum size is 100 MB."
            );

            e.target.value = "";

            return;

        }


        setSelectedFile(file);


        // Create preview only for images

        if (file.type.startsWith("image/")) {

            const url = URL.createObjectURL(file);

            setPreviewUrl(url);

        }

        else {

            setPreviewUrl(null);

        }


        e.target.value = "";

    };


    // ==================================================
    // REMOVE ATTACHMENT
    // ==================================================

    const removeAttachment = () => {

        if (previewUrl) {

            URL.revokeObjectURL(previewUrl);

        }

        setSelectedFile(null);

        setPreviewUrl(null);

    };


    // ==================================================
    // OPEN CAMERA
    // ==================================================

    const openCamera = async () => {

        setShowAttachmentMenu(false);

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

            streamRef.current = stream;

            setShowCamera(true);

            // Wait for camera modal to render

            setTimeout(() => {

                if (videoRef.current) {

                    videoRef.current.srcObject = stream;

                }

            }, 100);

        }

        catch (error) {

            console.log(error);

            toast.error(
                "Camera permission denied or camera is unavailable."
            );

        }

    };


    // ==================================================
    // CAPTURE PHOTO
    // ==================================================

    const capturePhoto = () => {

        const video = videoRef.current;

        const canvas = canvasRef.current;

        if (!video || !canvas) return;


        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;


        const context = canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob((blob) => {

            if (!blob) return;


            const file = new File(
                [blob],
                `camera-${Date.now()}.jpg`,
                {
                    type: "image/jpeg",
                }
            );


            const url = URL.createObjectURL(blob);


            setSelectedFile(file);

            setPreviewUrl(url);

            closeCamera();


            toast.success("Photo captured!");

        }, "image/jpeg", 0.9);

    };


    // ==================================================
    // CLOSE CAMERA
    // ==================================================

    const closeCamera = () => {

        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(track => track.stop());

            streamRef.current = null;

        }

        setShowCamera(false);

    };


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    const handleSend = async () => {

        if (loading) return;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            input.trim() === "" &&
            !selectedFile
        ) {
            return;
        }


        let question = input.trim();


        // If only image is sent
        if (
            selectedFile &&
            question === ""
        ) {

            question = `📎 ${selectedFile.name}`;

        }


        // ==========================================
        // SAVE CURRENT FILE INFO
        // ==========================================

        const fileBeingSent = selectedFile;
        const localPreview = previewUrl;


        // ==========================================
        // TEMPORARY USER MESSAGE
        // ==========================================

        setMessages((prev) => [

            ...prev,

            {
                sender: "user",
                text: question,

                attachment: fileBeingSent
                    ? {
                        name: fileBeingSent.name,
                        type: fileBeingSent.type,
                        preview: localPreview,
                    }
                    : null,
            },

        ]);


        // Clear input
        setInput("");

        setLoading(true);


        try {

            // ==========================================
            // SEND TO BACKEND
            // ==========================================

            const res = await sendMessage(
                question,
                currentConversation,
                fileBeingSent
            );


            // ==========================================
            // IMPORTANT:
            // Replace temporary blob URL
            // with Cloudinary permanent URL
            // ==========================================

            if (
                fileBeingSent &&
                res.data.imageUrl
            ) {

                setMessages((prev) => {

                    const updated = [...prev];


                    // Find the last user message
                    // and replace its temporary preview

                    for (
                        let i = updated.length - 1;
                        i >= 0;
                        i--
                    ) {

                        if (
                            updated[i].sender === "user"
                        ) {

                            updated[i] = {

                                ...updated[i],

                                attachment: {

                                    name:
                                        res.data.imageName ||
                                        fileBeingSent.name,

                                    type:
                                        fileBeingSent.type,

                                    preview:
                                        res.data.imageUrl,

                                },

                            };

                            break;

                        }

                    }


                    return updated;

                });

            }


            // ==========================================
            // REFRESH CONVERSATION LIST
            // ==========================================

            await loadConversations();


            // ==========================================
            // AI RESPONSE
            // ==========================================

            setMessages((prev) => [

                ...prev,

                {
                    sender: "bot",
                    text: res.data.reply,
                },

            ]);


        } catch (err) {

            console.log(
                "AI Chat Error:",
                err
            );


            setMessages((prev) => [

                ...prev,

                {
                    sender: "bot",
                    text:
                        "❌ Failed to connect.",
                },

            ]);

        }


        setLoading(false);


        // ==========================================
        // REMOVE SELECTED FILE
        // ==========================================

        removeAttachment();

    };


    // ==================================================
    // NEW CHAT
    // ==================================================

    const handleNewChat = async () => {

        try {

            const res = await createConversation();

            if (res.data.success) {

                await loadConversations();

                setCurrentConversation(
                    res.data.conversation._id
                );

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


    // ==================================================
    // DELETE CONVERSATION
    // ==================================================

    const handleDeleteConversation = async () => {

        try {

            await deleteConversation(
                deleteConversationId
            );

            setDeleteConversationId(null);

            await loadConversations();

            setMessages([
                {
                    sender: "bot",
                    text: "Hello 👋 Ask me anything about your studies.",
                },
            ]);

            setCurrentConversation(null);

            toast.success("Conversation deleted!");

        }

        catch (err) {

            console.log(err);

            toast.error(
                "Failed to delete conversation"
            );

        }

    };


    // ==================================================
    // RENAME CONVERSATION
    // ==================================================

    const handleRenameConversation = async () => {

        if (!newTitle.trim()) {

            toast.error(
                "Title cannot be empty"
            );

            return;

        }


        try {

            await renameConversation(
                editingConversation,
                newTitle
            );

            toast.success(
                "Conversation renamed!"
            );

            setEditingConversation(null);

            setNewTitle("");

            await loadConversations();

        }

        catch (err) {

            console.log(err);

            toast.error(
                "Rename failed"
            );

        }

    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="ai-chat-layout">

            <Toaster position="top-right" />


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside className="ai-sidebar">

                <h2>
                    EduCompanion
                </h2>


                <button
                    className="ai-new-chat-btn"
                    onClick={handleNewChat}
                >
                    + New Chat
                </button>


                <div className="ai-history-list">

                    <p>
                        Previous Chats
                    </p>


                    {conversations.map((conv) => (

                        <div

                            key={conv._id}

                            className={

                                currentConversation === conv._id

                                    ? "ai-history-item active"

                                    : "ai-history-item"

                            }

                        >

                            {

                                editingConversation === conv._id

                                    ?

                                    <>

                                        <input

                                            className="rename-input"

                                            value={newTitle}

                                            onChange={(e) =>
                                                setNewTitle(
                                                    e.target.value
                                                )
                                            }

                                            autoFocus

                                            onKeyDown={(e) => {

                                                if (
                                                    e.key === "Enter"
                                                ) {

                                                    handleRenameConversation();

                                                }

                                            }}

                                        />


                                        <button

                                            className="save-btn"

                                            onClick={
                                                handleRenameConversation
                                            }

                                        >
                                            ✔
                                        </button>

                                    </>

                                    :

                                    <>

                                        <span

                                            className="conversation-title"

                                            onClick={() =>
                                                setCurrentConversation(
                                                    conv._id
                                                )
                                            }

                                        >

                                            {conv.title}

                                        </span>


                                        <div
                                            className="conversation-actions"
                                        >

                                            <button

                                                className="conversation-edit"

                                                onClick={() => {

                                                    setEditingConversation(
                                                        conv._id
                                                    );

                                                    setNewTitle(
                                                        conv.title
                                                    );

                                                }}

                                            >
                                                ✏️
                                            </button>


                                            <button

                                                className="conversation-delete"

                                                onClick={() =>
                                                    setDeleteConversationId(
                                                        conv._id
                                                    )
                                                }

                                            >
                                                🗑
                                            </button>

                                        </div>

                                    </>

                            }

                        </div>

                    ))}

                </div>


                <button

                    className="ai-logout-btn"

                    onClick={() => {

                        localStorage.removeItem(
                            "token"
                        );

                        navigate("/login");

                    }}

                >
                    Logout
                </button>

            </aside>


            {/* ==========================================
                CHAT PAGE
            ========================================== */}

            <div className="ai-chat-page">


                <div className="ai-chat-header">

                    🤖 EduCompanion AI

                </div>


                <div className="ai-chat-box">


                    {messages.map((msg, index) => (

                        <div

                            key={index}

                            className={
                                msg.sender === "bot"
                                    ? "ai-bot-msg"
                                    : "ai-user-msg"
                            }

                        >


                            {/* USER ATTACHMENT */}

                            {msg.sender === "user" &&
                                msg.attachment && (

                                    <div className="message-attachment">

                                        {msg.attachment.type?.startsWith(
                                            "image/"
                                        ) ? (

                                            <img
                                                src={
                                                    msg.attachment.preview
                                                }
                                                alt="attachment"
                                                className="message-image-preview"
                                            />

                                        ) : (

                                            <div className="message-file-preview">

                                                📄

                                                <span>
                                                    {
                                                        msg.attachment.name
                                                    }
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                )}


                            {msg.sender === "bot" ? (

                                <>

                                    <button

                                        className="ai-copy-btn"

                                        onClick={() => {

                                            navigator.clipboard.writeText(
                                                msg.text
                                            );

                                            toast.success(
                                                "Copied!"
                                            );

                                        }}

                                    >
                                        📋
                                    </button>


                                    <ReactMarkdown

                                        remarkPlugins={[
                                            remarkGfm
                                        ]}

                                        components={{

                                            code({
                                                children,
                                                className
                                            }) {

                                                const match =
                                                    /language-(\w+)/
                                                        .exec(
                                                            className || ""
                                                        );


                                                return match ? (

                                                    <SyntaxHighlighter

                                                        language={
                                                            match[1]
                                                        }

                                                        style={
                                                            oneDark
                                                        }

                                                    >

                                                        {
                                                            String(
                                                                children
                                                            ).replace(
                                                                /\n$/,
                                                                ""
                                                            )
                                                        }

                                                    </SyntaxHighlighter>

                                                ) : (

                                                    <code
                                                        className={
                                                            className
                                                        }
                                                    >
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


                {/* ==========================================
                    ATTACHMENT PREVIEW
                ========================================== */}

                {selectedFile && (

                    <div className="attachment-preview-bar">


                        <div className="attachment-preview-content">


                            {previewUrl ? (

                                <img

                                    src={previewUrl}

                                    alt="selected"

                                    className="attachment-preview-image"

                                />

                            ) : (

                                <div className="attachment-file-icon">
                                    📄
                                </div>

                            )}


                            <div className="attachment-file-info">

                                <strong>
                                    {selectedFile.name}
                                </strong>

                                <small>
                                    {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                    ).toFixed(2)}{" "}
                                    MB
                                </small>

                            </div>


                            <button

                                className="remove-attachment-btn"

                                onClick={
                                    removeAttachment
                                }

                            >
                                ✕
                            </button>

                        </div>

                    </div>

                )}


                {/* ==========================================
                    CHAT INPUT
                ========================================== */}

                <div className="ai-chat-input">


                    {/* PLUS BUTTON */}

                    <button

                        className="attachment-plus-btn"

                        onClick={
                            toggleAttachmentMenu
                        }

                        type="button"

                    >
                        +
                    </button>


                    {/* ATTACHMENT MENU */}

                    {showAttachmentMenu && (

                        <div className="attachment-menu">


                            <button

                                type="button"

                                onClick={
                                    openFilePicker
                                }

                            >

                                <span>
                                    📎
                                </span>

                                <div>

                                    <strong>
                                        Upload File / Photo
                                    </strong>

                                    <small>
                                        PDF, images and files
                                    </small>

                                </div>

                            </button>


                            <button

                                type="button"

                                onClick={
                                    openCamera
                                }

                            >

                                <span>
                                    📷
                                </span>

                                <div>

                                    <strong>
                                        Take Photo
                                    </strong>

                                    <small>
                                        Use your camera
                                    </small>

                                </div>

                            </button>


                        </div>

                    )}


                    {/* HIDDEN FILE INPUT */}

                    <input

                        ref={fileInputRef}

                        type="file"

                        hidden

                        accept="
                            image/*
                            ,.pdf
                            ,.doc
                            ,.docx
                            ,.txt
                            ,.csv
                            ,.ppt
                            ,.pptx
                        "

                        onChange={
                            handleFileChange
                        }

                    />


                    <textarea

                        value={input}

                        rows={1}

                        placeholder="Ask anything..."

                        onChange={(e) => {

                            setInput(
                                e.target.value
                            );

                            e.target.style.height =
                                "auto";

                            e.target.style.height =
                                e.target.scrollHeight +
                                "px";

                        }}

                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                handleSend();

                            }

                        }}

                    />


                    <button
                        onClick={handleSend}
                    >
                        Send
                    </button>

                </div>


            </div>


            {/* ==========================================
                CAMERA MODAL
            ========================================== */}

            {showCamera && (

                <div className="camera-overlay">


                    <div className="camera-modal">


                        <div className="camera-header">

                            <h2>
                                Take a Photo
                            </h2>


                            <button
                                onClick={closeCamera}
                            >
                                ✕
                            </button>

                        </div>


                        <div className="camera-view">

                            <video

                                ref={videoRef}

                                autoPlay

                                playsInline

                            />

                        </div>


                        <div className="camera-actions">


                            <button

                                className="camera-cancel-btn"

                                onClick={
                                    closeCamera
                                }

                            >
                                Cancel
                            </button>


                            <button

                                className="camera-capture-btn"

                                onClick={
                                    capturePhoto
                                }

                            >
                                📸 Capture
                            </button>


                        </div>


                    </div>

                </div>

            )}


            {/* Hidden canvas */}

            <canvas
                ref={canvasRef}
                style={{
                    display: "none"
                }}
            />


            {/* ==========================================
                DELETE MODAL
            ========================================== */}

            {
                deleteConversationId && (

                    <div

                        className="delete-overlay"

                        onClick={() =>
                            setDeleteConversationId(
                                null
                            )
                        }

                    >

                        <div

                            className="delete-modal"

                            onClick={(e) =>
                                e.stopPropagation()
                            }

                        >

                            <h2>
                                Delete Conversation?
                            </h2>


                            <p>

                                This conversation and
                                all its messages will be
                                permanently deleted.

                            </p>


                            <div
                                className="delete-actions"
                            >

                                <button

                                    className="cancel-btn"

                                    onClick={() =>
                                        setDeleteConversationId(
                                            null
                                        )
                                    }

                                >
                                    Cancel
                                </button>


                                <button

                                    className="confirm-btn"

                                    onClick={
                                        handleDeleteConversation
                                    }

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


export default AIChat;