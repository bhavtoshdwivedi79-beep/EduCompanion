import User from "../models/User.js";

const updateStreak = async (userId) => {

    const user = await User.findById(userId);

    if (!user) return;

    const today = new Date();
    const lastActive = new Date(user.lastActive);

    // sirf date compare hogi
    today.setHours(0,0,0,0);
    lastActive.setHours(0,0,0,0);

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
    }
    else if (diffDays > 1) {
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