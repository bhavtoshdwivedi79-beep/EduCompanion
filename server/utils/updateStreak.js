import User from "../models/User.js";

const updateStreak = async (userId) => {

    console.log("updateStreak Called");

    const user = await User.findById(userId);

    if (!user) return;

    console.log("User ID:", user._id);
    console.log("Current Streak:", user.streak);
    console.log("Last Active:", user.lastActive);

    const today = new Date();
    const lastActive = new Date(user.lastActive);

    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
        (today.getTime() - lastActive.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    console.log("==============");
    console.log("Today:", today);
    console.log("Last Active:", lastActive);
    console.log("Diff Days:", diffDays);
    console.log("Current Streak:", user.streak);

    if (diffDays === 1) {
        user.streak += 1;
    } else if (diffDays > 1) {
        user.streak = 1;
    }

    if (diffDays > 0) {
        user.lastActive = new Date();
        await user.save();

        console.log("Saved!");
        console.log("New Streak:", user.streak);
    }

    console.log("==============");
};

export default updateStreak;