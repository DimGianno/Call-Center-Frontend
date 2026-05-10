import CallItem from './CallItem'

function CallFeed({ 
  calls,
  callView,
  onCallViewChange,
  onSelectCall,
  onArchiveCall,
  onUnarchiveCall,
  onArchiveAll,
  onUnarchiveAll
}) {
  const isActiveView = callView === "active";

  const actionLabel = isActiveView ? "Archive" : "Unarchive";
  const actionHandler = isActiveView ? onArchiveCall : onUnarchiveCall;
  
  const bulkActionLabel = isActiveView ? "Archive All" : "Unarchive All";
  const bulkActionHandler = isActiveView ? onArchiveAll : onUnarchiveAll;

  return (
      <section className="call-feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>{isActiveView ? "Active Calls" : "Archived Calls"}</h2>
            <p>{calls.length} calls shown</p>
          </div>

          <div className="feed-actions">
            <button
              className="view-toggle"
              onClick={() => {
                onCallViewChange(isActiveView ? "archived" : "active");
              }}
            >
              {isActiveView ? "View Archived Calls" : "View Active Calls"}
            </button>
            <button
              className="bulk-action-button"
              onClick={bulkActionHandler}
              disabled={calls.length === 0}
            >
              {bulkActionLabel}
            </button>
          </div>
        </div>


        {calls.length > 0 ? (
          calls.map((call) => {
            return (
              <CallItem 
                key={call.id} 
                call={call} 
                onSelectCall={onSelectCall} 
                actionLabel={actionLabel}
                onAction={actionHandler}
              />
            );
          })
        ) : (
          <div className="empty-state">
            <p>{isActiveView ? "No active calls." : "No archived calls."}</p>
          </div>
        )}
      </section>
  );
}

export default CallFeed;


















