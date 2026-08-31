import "./RecycleBin.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function RecycleBin() {

    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);


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

                                    {formatDate(
                                        item.deletedAt
                                    )}

                                </strong>

                            </div>


                            {/* ACTIONS */}

                            <div className="recycle-actions">

                                <button
                                    className="restore-btn"
                                    disabled
                                >
                                    ♻️ Restore
                                </button>

                                <button
                                    className="permanent-delete-btn"
                                    disabled
                                >
                                    ❌ Delete Permanently
                                </button>

                            </div>


                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}


export default RecycleBin;