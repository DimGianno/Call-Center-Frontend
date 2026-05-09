import CallItem from './CallItem'

function CallFeed({ calls, onSelectCall, onArchiveCall }) {
    return (
        <section className="call-feed">
          <h2>Call Feed</h2>
          {calls.length > 0 ? (
            calls.map((call) => {
              return (
                <CallItem 
                  key={call.id} 
                  call={call} 
                  onSelectCall={onSelectCall} 
                  onArchiveCall={onArchiveCall}
                />
              );
            })
          ) : (
            <div className="empty-state">
              <p>No active calls to display.</p>
            </div>
          )}
        </section>
    );
}

export default CallFeed;


















