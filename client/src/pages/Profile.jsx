import { useState } from "react";

import { useUser } from "../context/UserContext";

import "./Profile.css";

import toast from "react-hot-toast";

import {
    uploadAvatar,
    removeAvatar,
} from "../services/profileService";


function Profile() {

    const {
        user,
        fetchUser,
        loading,
    } = useUser();


    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);


    // ======================================================
    // UPLOAD AVATAR
    // ======================================================

    const handleUpload = async () => {

        if (!selectedFile) {

            toast.error(
                "Please select an image."
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "avatar",
            selectedFile
        );


        try {

            await uploadAvatar(
                formData
            );


            await fetchUser();


            setSelectedFile(null);


            toast.success(
                "Avatar updated successfully!"
            );


        } catch (error) {

            console.error(
                "Avatar upload error:",
                error?.response?.data ||
                error.message
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to upload avatar."
            );

        }

    };


    // ======================================================
    // REMOVE AVATAR
    // ======================================================

    const handleRemove = async () => {

        try {

            await removeAvatar();


            await fetchUser();


            toast.success(
                "Avatar removed."
            );


        } catch (error) {

            console.error(
                "Avatar remove error:",
                error?.response?.data ||
                error.message
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to remove avatar."
            );

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                style={{
                    color: "white",
                    padding: "30px",
                }}
            >

                <h2>
                    Loading profile...
                </h2>

            </div>

        );

    }


    // ======================================================
    // PROFILE NOT FOUND
    // ======================================================

    if (!user) {

        return (

            <div
                style={{
                    color: "white",
                    padding: "30px",
                }}
            >

                <h2>
                    Unable to load profile
                </h2>

                <p>
                    Please login again and try.
                </p>

            </div>

        );

    }


    // ======================================================
    // PROFILE PAGE
    // ======================================================

    return (

        <div className="profile-page">

            <div className="profile-card">


                <img
                    className="profile-avatar"
                    src={
                        user.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="avatar"
                />


                <div className="avatar-actions">

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setSelectedFile(
                                e.target.files?.[0] || null
                            )
                        }
                    />


                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                    >
                        📷 Upload Avatar
                    </button>


                    {user.avatar && (

                        <button
                            className="remove-btn"
                            onClick={handleRemove}
                        >
                            🗑 Remove Avatar
                        </button>

                    )}

                </div>


                <h1>
                    {user.name || "User"}
                </h1>


                <p>
                    {user.email || ""}
                </p>


                <div className="profile-info">


                    <div>

                        <h3>
                            Role
                        </h3>

                        <p>
                            {user.role || "Student"}
                        </p>

                    </div>


                    <div>

                        <h3>
                            Streak
                        </h3>

                        <p>
                            🔥 {user.streak || 0} Days
                        </p>

                    </div>


                    <div>

                        <h3>
                            Joined
                        </h3>

                        <p>

                            {user.createdAt
                                ? new Date(
                                    user.createdAt
                                ).toLocaleDateString()
                                : "Not available"
                            }

                        </p>

                    </div>


                </div>

            </div>

        </div>

    );

}


export default Profile;