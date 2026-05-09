function CallItem({ call, onSelectCall, onArchiveCall }) {
  const formattedDate = new Date(call.created_at).toLocaleString()
  const isInbound = call.direction === "inbound";


    return (
      <div className="call-card" onClick={() => onSelectCall(call.id)}>
        <div className="call-meta">
          <div className={isInbound ? "direction inbound" : "direction outbound"}>
            {isInbound ? "↙ Inbound" : "↘ Outbound"}
          </div>
          <span className={`call-type ${call.call_type}`}>
            {call.call_type}
          </span>
        </div>

        <div className="call-route">
          <span>{call.from}</span>
          <span className="arrow">→</span>
          <span>{call.to}</span>
        </div>

        <div className="call-time">
          <div>{formattedDate}</div>
          <div>{call.duration} sec</div>
        </div>

        <button
          className="archive-button"
          onClick={(event) => {
            event.stopPropagation();
            onArchiveCall(call.id);
          }}
        >
          Archive
        </button>
      </div>
  );
}

export default CallItem;
