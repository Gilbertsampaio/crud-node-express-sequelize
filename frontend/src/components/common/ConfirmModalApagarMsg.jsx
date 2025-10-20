import './ConfirmModalApagarMsg.css';

export default function ConfirmModalApagarMsg({ show, title, all, onConfirmAll, onConfirmMe, onCancel }) {
    if (!show) return null;

    return (
        <div className="modal-overlay-msg">
            <div className="modal-content-msg">
                <h3>{title}</h3>
                <div className={`modal-buttons-msg ${ all ? '' : 'single'}`}>
                    {all && (
                        <button className="confirm-btn" onClick={onConfirmAll}>Apagar para todos</button>
                    )}
                    <button className="confirm-btn" onClick={onConfirmMe}>Apagar para mim</button>
                    <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}