import User from "../models/User.js";

const updateStreak = async (userId) => {

    const user = await User.findById(userId);

    if (!user) return;

    const today = new Date();

    const lastActive = new Date(user.lastActive);

    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
        (today - lastActive) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {

        user.streak += 1;

    } else if (diffDays > 1) {

        user.streak = 1;

    }

    if (diffDays !== 0) {
        user.lastActive = new Date();
        await user.save();
    }

};

export default updateStreak;