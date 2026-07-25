import { useState } from "react";
import "./Calendar.css";

function Calendar({ calendarActivities = {} }) {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedActivities, setSelectedActivities] = useState(null);

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const firstDay = new Date(year, month, 1).getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    const prevMonth = () => {

        setCurrentDate(new Date(year, month - 1, 1));

    };

    const nextMonth = () => {

        setCurrentDate(new Date(year, month + 1, 1));

    };

    const cells = [];

    for (let i = 0; i < firstDay; i++) {

        cells.push(<div key={"empty" + i}></div>);

    }

    for (let day = 1; day <= totalDays; day++) {

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const activities = calendarActivities[dateKey] || {
            notes: [],
            chats: [],
            quizzes: [],
        };

        cells.push(

            <div
                key={day}
                className={isToday ? "day today" : "day"}
                onClick={() => {
                    setSelectedActivities({
                        date: dateKey,
                        ...activities,
                    });
                }}
            >

                <span className="date-number">
                    {day}
                </span>

                <div className="activity-dots">

                    {activities.notes.length > 0 && (
                        <span className="dot note"></span>
                    )}

                    {activities.chats.length > 0 && (
                        <span className="dot chat"></span>
                    )}

                    {activities.quizzes.length > 0 && (
                        <span className="dot quiz"></span>
                    )}

                </div>

            </div>

        );

    }

    return (

        <div className="calendar-card">

            <div className="calendar-header">

                <button onClick={prevMonth}>◀</button>

                <h2>

                    {monthNames[month]} {year}

                </h2>

                <button onClick={nextMonth}>▶</button>

            </div>

            <div className="weekdays">

                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>

            </div>

            <div className="calendar-grid">

                {cells}

            </div>

            {selectedActivities && (

                <div className="activity-popup">

                    <h3>
                        📅 {selectedActivities.date}
                    </h3>

                    <div>

                        <h4>📝 Notes</h4>

                        {
                            selectedActivities.notes.length > 0 ?

                                selectedActivities.notes.map((note, index) => (

                                    <p key={index}>
                                        • {note.topic}
                                    </p>

                                ))

                                :

                                <p>No Notes</p>

                        }

                    </div>

                    <div>

                        <h4>🤖 Chats</h4>

                        {
                            selectedActivities.chats.length > 0 ?

                                selectedActivities.chats.map((chat, index) => (

                                    <p key={index}>
                                        • {chat.question}
                                    </p>

                                ))

                                :

                                <p>No Chats</p>

                        }

                    </div>

                    <div>

                        <h4>❓ Quizzes</h4>

                        {
                            selectedActivities.quizzes.length > 0 ?

                                selectedActivities.quizzes.map((quiz, index) => (

                                    <p key={index}>
                                        • {quiz.topic}
                                        ({quiz.score}/{quiz.totalQuestions})
                                    </p>

                                ))

                                :

                                <p>No Quiz</p>

                        }

                    </div>

                    <button
                        onClick={() => setSelectedActivities(null)}
                    >
                        Close
                    </button>

                </div>

            )}

        </div>

    );

}

export default Calendar;