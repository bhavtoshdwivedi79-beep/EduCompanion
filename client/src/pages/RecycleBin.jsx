import "./RecycleBin.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getRecycleBin,
    restoreRecycleBinItem,
    permanentlyDeleteRecycleBinItem,
} from "../services/recycleBinService";

function RecycleBin() {

    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteItem, setDeleteItem] = useState(null);


    // ==================================================
    // FETCH RECYCLE BIN
    // ==================================================

    const fetchRecycleBin = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/recycle-bin",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Failed to fetch recycle bin"
                );

            }


            setItems(data.items || []);

        }
        catch (error) {

            console.error(
                "Recycle Bin Error:",
                error
            );

            toast.error(
                "Failed to load recycle bin"
            );

        }
        finally {

            setLoading(false);

        }

    };

    // ==================================================
    // RESTORE ITEM
    // ==================================================

    const handleRestore = async (type, id) => {

        try {

            await restoreRecycleBinItem(type, id);

            toast.success(
                `♻️ ${type} restored successfully`
            );

            await fetchRecycleBin();

        } catch (error) {

            console.error(
                "Restore Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to restore item"
            );

        }

    };

    // ==================================================
    // PERMANENTLY DELETE ITEM
    // ==================================================

    const handlePermanentDelete = async () => {

        if (!deleteItem) return;

        try {

            await permanentlyDeleteRecycleBinItem(
                deleteItem.type,
                deleteItem.id
            );

            toast.success(
                `❌ ${deleteItem.type} permanently deleted`
            );

            setDeleteItem(null);

            await fetchRecycleBin();

        } catch (error) {

            console.error(
                "Permanent Delete Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to permanently delete item"
            );

        }

    };


    // ==================================================
    // LOAD ON PAGE OPEN
    // ==================================================

    useEffect(() => {

        fetchRecycleBin();

    }, []);


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

        return new Date(date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );

    };

    // ==================================================
    // DAYS REMAINING
    // ==================================================

    const getDaysRemaining = (deletedAt) => {

        const deletedDate = new Date(deletedAt);

        const expiryDate = new Date(deletedDate);

        expiryDate.setDate(
            expiryDate.getDate() + 30
        );

        const now = new Date();

        const difference =
            expiryDate.getTime() - now.getTime();

        const daysRemaining = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

        return Math.max(0, daysRemaining);

    };

    // ==================================================
    // EMPTY / LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="recycle-bin-page">

                <div className="recycle-loading">

                    Loading Recycle Bin...

                </div>

            </div>

        );

    }


    return (

        <div className="recycle-bin-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="recycle-header">

                <div>

                    <h1>
                        🗑️ Recycle Bin
                    </h1>

                    <p>
                        Deleted notes, quizzes and flashcards
                        are stored here.
                    </p>

                </div>


                <div className="recycle-count">

                    {items.length}{" "}

                    {items.length === 1
                        ? "Item"
                        : "Items"}

                </div>

            </div>


            {/* ==================================================
                30 DAYS INFO
            ================================================== */}

            <div className="recycle-info">

                <span>⏳</span>

                <div>

                    <strong>
                        Items are kept for 30 days
                    </strong>

                    <p>
                        Items older than 30 days will be
                        permanently deleted automatically.
                    </p>

                </div>

            </div>


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {items.length === 0 ? (

                <div className="empty-recycle-bin">

                    <div className="empty-bin-icon">
                        🗑️
                    </div>

                    <h2>
                        Recycle Bin is Empty
                    </h2>

                    <p>
                        Deleted notes, quizzes and flashcards
                        will appear here.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>

            ) : (


                /* ==================================================
                   ITEMS
                ================================================== */

                <div className="recycle-grid">

                    {items.map((item) => (

                        <div
                            className="recycle-card"
                            key={`${item.type}-${item._id}`}
                        >


                            {/* TYPE */}

                            <div className="recycle-card-top">

                                <span className="recycle-type">

                                    {item.type === "note" && "📝"}

                                    {item.type === "quiz" && "❓"}

                                    {item.type === "flashcard" && "🃏"}

                                    {" "}

                                    {item.type}

                                </span>


                                <span className="deleted-badge">

                                    Deleted

                                </span>

                            </div>


                            {/* TITLE */}

                            <h2>

                                {item.topic ||
                                    item.title ||
                                    "Untitled Item"}

                            </h2>


                            {/* PREVIEW */}

                            {item.notes && (

                                <p className="recycle-preview">

                                    {item.notes.length > 180
                                        ? item.notes.substring(
                                            0,
                                            180
                                        ) + "..."
                                        : item.notes}

                                </p>

                            )}


                            {/* DELETE DATE */}

                            <div className="recycle-date">

                                🗓️ Deleted on:

                                <strong>
                                    {formatDate(item.deletedAt)}
                                </strong>

                                <span
                                    className={
                                        getDaysRemaining(item.deletedAt) <= 3
                                            ? "days-remaining urgent"
                                            : "days-remaining"
                                    }
                                >
                                    {getDaysRemaining(item.deletedAt) <= 3
                                        ? `⚠️ ${getDaysRemaining(item.deletedAt)} days remaining`
                                        : `⏳ ${getDaysRemaining(item.deletedAt)} days remaining`}
                                </span>

                            </div>


                            {/* ACTIONS */}

                            <div className="recycle-actions">

                                <button
                                    className="restore-btn"
                                    onClick={() =>
                                        handleRestore(
                                            item.type,
                                            item._id
                                        )
                                    }
                                >
                                    ♻️ Restore
                                </button>

                                <button
                                    className="permanent-delete-btn"
                                    onClick={() =>
                                        setDeleteItem({
                                            type: item.type,
                                            id: item._id,
                                            title:
                                                item.topic ||
                                                item.title ||
                                                "Untitled Item"
                                        })
                                    }
                                >
                                    ❌ Delete Permanently
                                </button>

                            </div>


                        </div>

                    ))}

                </div>

            )}

            {deleteItem && (

                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-modal-icon">
                            🗑️
                        </div>

                        <h2>
                            Permanently Delete?
                        </h2>

                        <p>
                            Are you sure you want to permanently delete
                            <strong> "{deleteItem.title}" </strong>?
                        </p>

                        <span className="delete-warning">
                            This action cannot be undone.
                        </span>

                        <div className="delete-modal-actions">

                            <button
                                className="cancel-delete-btn"
                                onClick={() => setDeleteItem(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-delete-btn"
                                onClick={handlePermanentDelete}
                            >
                                Delete Permanently
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default RecycleBin;