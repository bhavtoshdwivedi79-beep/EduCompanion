import { useState } from "react";
import { useUser } from "../context/UserContext";
import "./Profile.css";
import toast from "react-hot-toast";
import {
    uploadAvatar,
    removeAvatar,
} from "../services/profileService";

function Profile() {

    const { user, setUser, fetchUser } = useUser();

    const [selectedFile, setSelectedFile] = useState(null);

    const handleUpload = async () => {

        if (!selectedFile) {

            toast.error("Please select an image.");

            return;

        }

        const formData = new FormData();

        formData.append("avatar", selectedFile);

        try {

            const { data } = await uploadAvatar(formData);

            await fetchUser();

            setSelectedFile(null);

            toast.success("Avatar updated successfully!");

        } catch (error) {

            console.log(error);

            toast.error("Failed to upload avatar.");

        }

    };

    const handleRemove = async () => {

        try {

            await removeAvatar();

            await fetchUser();

            toast.success("Avatar removed.");

        } catch (error) {

            console.log(error);

            toast.error("Failed to remove avatar.");

        }

    };

    if (!user) {

        return <h2 style={{ color: "white", padding: "30px" }}>Loading...</h2>;

    }

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
                        onChange={(e) => setSelectedFile(e.target.files[0])}
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

                <h1>{user.name}</h1>

                <p>{user.email}</p>

                <div className="profile-info">

                    <div>

                        <h3>Role</h3>

                        <p>{user.role}</p>

                    </div>

                    <div>

                        <h3>Streak</h3>

                        <p>🔥 {user.streak} Days</p>

                    </div>

                    <div>

                        <h3>Joined</h3>

                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Profile;