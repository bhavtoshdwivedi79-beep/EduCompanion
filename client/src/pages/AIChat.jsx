import "../components/AIChat/AIChat.css";

function AIChat() {

    return (

        <div className="chat-page">

            <div className="chat-header">

                🤖 AI Study Assistant

            </div>

            <div className="chat-box">

                <div className="bot-msg">
                    Hello 👋
                    <br />
                    Ask me anything about your studies.
                </div>

            </div>

            <div className="chat-input">

                <input
                    type="text"
                    placeholder="Ask your question..."
                />

                <button>
                    Send
                </button>

            </div>

        </div>

    );

}

export default AIChat;