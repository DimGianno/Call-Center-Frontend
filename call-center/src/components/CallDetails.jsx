function CallDetails({ call, onClose }) {
    const formattedDate = new Date(call.created_at).toLocaleString("en-GB");
  
    return (             
        <div className="modal-overlay">
          <div className="call-details-modal">
            <div className="modal-header">
              <h2>Selected Call Info:</h2>
              <button 
                className="close-button"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <table className="details-table">
              <tbody>
                <tr>
                  <th><strong>Direction:</strong></th>
                  <td>{call.direction}</td>
                </tr>
                <tr>
                  <th><strong>From:</strong></th>
                  <td>{call.from}</td>
                </tr>
                <tr>
                  <th><strong>To:</strong></th>
                  <td>{call.to}</td>
                </tr>
                <tr>
                  <th><strong>Type:</strong></th>
                  <td>{call.call_type}</td>
                </tr>
                <tr>
                  <th><strong>Duration:</strong></th>
                  <td>{call.duration} seconds</td>
                </tr>
                <tr>
                  <th><strong>Date:</strong></th>
                  <td>{formattedDate}</td>
                </tr>
                <tr>
                  <th><strong>Notes:</strong></th>
                  <td>
                    {call.notes && call.notes.length > 0 ? (
                    <ul className="details-notes">
                      {call.notes.map((note) => (
                        <li key={note.id}>{note.content}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No notes available for this call.</span>
                  )}
                  </td>
                </tr>
              </tbody>
            </table>
 
          </div>
        </div>
    );
}

export default CallDetails;