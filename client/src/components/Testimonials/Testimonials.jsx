import "./Testimonials.css";

function Testimonials() {

    const reviews = [

        {
            name: "Rahul Sharma",
            role: "B.Tech Student",
            review:
                "EduCompanion made my exam preparation much easier. The AI Notes and Quiz features saved me hours of study time.",
        },

        {
            name: "Priya Verma",
            role: "Computer Science Student",
            review:
                "The Study Planner helped me stay consistent every day. It feels like having a personal mentor.",
        },

        {
            name: "Aman Singh",
            role: "Engineering Student",
            review:
                "The AI Doubt Solver explains concepts clearly. I now understand topics much faster than before.",
        },

    ];

    return (

        <section className="testimonials" data-aos="fade-up">

            <h2>What Students Say</h2>

            <p className="testimonial-subtitle">
                Thousands of students are learning smarter with EduCompanion.
            </p>

            <div className="testimonial-grid">

                {reviews.map((review, index) => (

                    <div className="testimonial-card" key={index}>

                        <div className="stars">
                            ⭐⭐⭐⭐⭐
                        </div>

                        <p className="review">
                            "{review.review}"
                        </p>

                        <div className="profile">

                            <div className="avatar">
                                {review.name.charAt(0)}
                            </div>

                            <div>

                                <h3>{review.name}</h3>

                                <span>{review.role}</span>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

}

export default Testimonials;