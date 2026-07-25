import "./LogoutModal.css";

function LogoutModal({ isOpen, onClose, onConfirm }) {

    if (!isOpen) return null;

    return (

        <div className="logout-overlay">

            <div className="logout-modal">

                <h2>🚪 Logout</h2>

                <p>
                    Are you sure you want to logout from EduCompanion?
                </p>

                <div className="logout-actions">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="confirm-btn"
                        onClick={onConfirm}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    );

}

export default LogoutModal;