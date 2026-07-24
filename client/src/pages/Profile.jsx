import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const { data } = await axios.get(
                    "http://localhost:5000/api/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(data.profile);

            } catch (error) {

                console.log(error);

            }

        };

        fetchProfile();

    }, []);

    if (!user) {

        return <h2 style={{ color: "white", padding: "30px" }}>Loading...</h2>;

    }

    return (

        <div className="profile-page">

            <div className="profile-card">

                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="avatar"
                />

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