import { useState } from "react"
import CallItem from './CallItem'
import FilterModal from "./FilterModal"

const defaultFilters = {
  callTypes: {
    answered: true,
    missed: true,
    voicemail: true,
  },
  directions: {
    inbound: true,
    outbound: true,
  },
  dateFrom: "",
  dateTo: "",
};

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

  /* Determine action label and handler based on current view */
  const actionLabel = isActiveView ? "Archive" : "Unarchive";
  const actionHandler = isActiveView ? onArchiveCall : onUnarchiveCall;
  
  /* archive all / unarchive all handlers */
  const bulkActionLabel = isActiveView ? "Archive All" : "Unarchive All";
  const bulkActionHandler = isActiveView ? onArchiveAll : onUnarchiveAll;

  /* filter */
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  const filteredCalls = calls.filter((call) => {
    const matchesCallType = appliedFilters.callTypes[call.call_type];
    const matchesDirection = appliedFilters.directions[call.direction];

    const callDate = call.created_at.slice(0, 10);

    const matchesDateFrom =
      appliedFilters.dateFrom === "" || callDate >= appliedFilters.dateFrom;

    const matchesDateTo =
      appliedFilters.dateTo === "" || callDate <= appliedFilters.dateTo;

    return (
      matchesCallType &&
      matchesDirection &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  return (
      <section className="call-feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>{isActiveView ? "Active Calls" : "Archived Calls"}</h2>
            <p>{filteredCalls.length} of {calls.length} calls shown</p>
          </div>

          <div className="feed-actions">
            <button
              className="filter-button"
              onClick={() => {
                setDraftFilters(appliedFilters);
                setIsFilterModalOpen(true);
              }}
            >
              ☰ 
            </button>
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


        {filteredCalls.length > 0 ? (
          filteredCalls.map((call) => {
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
            <p>{calls.length === 0 ? "No calls available." : "No calls match the current filters."}</p>
          </div>
        )}

        {isFilterModalOpen && (
          <FilterModal
            draftFilters={draftFilters}
            onDraftFiltersChange={setDraftFilters}
            onReset={() => setDraftFilters(defaultFilters)}
            onClose={() => setIsFilterModalOpen(false)}
            onConfirm={() =>{
              console.log("Confirm clicked");
              console.log(draftFilters);
              setAppliedFilters(draftFilters);
              setIsFilterModalOpen(false);
            }}
          />
        )}
      </section>
  );
}

export default CallFeed;


















