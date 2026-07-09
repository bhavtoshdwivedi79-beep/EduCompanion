import { useState } from "react";
import "./FAQ.css";

function FAQ() {

    const faqs = [

        {
            question: "Is EduCompanion free to use?",
            answer: "Yes! You can use the basic features for free. Premium AI features will be available in future."
        },

        {
            question: "Can AI generate notes for any subject?",
            answer: "Absolutely! EduCompanion can generate notes for almost any academic topic."
        },

        {
            question: "Does it create quizzes automatically?",
            answer: "Yes. AI generates quizzes based on your uploaded topic or notes."
        },

        {
            question: "Can I track my study progress?",
            answer: "Yes. Your dashboard will include analytics and progress tracking."
        }

    ];

    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {

        if (activeIndex === index) {

            setActiveIndex(null);

        }

        else {

            setActiveIndex(index);

        }

    };

    return (

        <section className="faq">

            <h2>Frequently Asked Questions</h2>

            <p className="faq-subtitle">
                Everything you need to know about EduCompanion.
            </p>

            <div className="faq-container">

                {faqs.map((faq, index) => (

                    <div
                        className={`faq-item ${activeIndex === index ? "active" : ""}`}
                        key={index}
                        onClick={() => toggleFAQ(index)}
                    >

                        <div className="faq-question">

                            <h3>{faq.question}</h3>

                            <span>
                                {activeIndex === index ? "−" : "+"}
                            </span>

                        </div>

                        {

                            activeIndex === index && (

                                <p className="faq-answer">

                                    {faq.answer}

                                </p>

                            )

                        }

                    </div>

                ))}

            </div>

        </section>

    );

}

export default FAQ;