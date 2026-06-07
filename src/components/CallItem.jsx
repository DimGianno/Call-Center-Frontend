import { formatCallTime } from "../utils/formatters";

function CallItem({ call, onSelectCall, actionLabel, onAction }) {
  const formattedTime = formatCallTime(call.created_at);
  const isInbound = call.direction === "inbound";

  return (
    <div className="call-card" onClick={() => onSelectCall(call.id)}>
      <div className="call-meta">
        <div className={isInbound ? "direction inbound" : "direction outbound"}>
          {isInbound ? "↙ Inbound" : "↘ Outbound"}
        </div>
        <span className={`call-type ${call.call_type}`}>{call.call_type}</span>
      </div>

      <div className="call-route">
        <span>{call.from}</span>
        <span className="arrow">→</span>
        <span>{call.to}</span>
      </div>

      <div className="call-time">
        <div>{formattedTime}</div>
        <div>{call.duration} sec</div>
      </div>

      <button
        className="archive-button"
        title={`${actionLabel} this call`}
        aria-label={`${actionLabel} this call`}
        onClick={(event) => {
          event.stopPropagation();
          onAction(call.id);
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default CallItem;
