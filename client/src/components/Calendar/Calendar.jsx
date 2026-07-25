import { useState } from "react";
import "./Calendar.css";

function Calendar({ calendarActivities = {} }) {

    const [currentDate, setCurrentDate] = useState(new Date());

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

        const activities = calendarActivities[dateKey] || [];

        cells.push(

            <div
                key={day}
                className={isToday ? "day today" : "day"}
            >

                <span className="date-number">
                    {day}
                </span>

                <div className="activity-dots">

                    {activities.includes("note") && (
                        <span className="dot note"></span>
                    )}

                    {activities.includes("chat") && (
                        <span className="dot chat"></span>
                    )}

                    {activities.includes("quiz") && (
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

        </div>

    );

}

export default Calendar;