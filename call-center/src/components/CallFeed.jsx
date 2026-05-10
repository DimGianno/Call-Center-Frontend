import { useState, useEffect } from "react";
import CallItem from "./CallItem";
import FilterModal from "./FilterModal";
import PaginationControls from "./PaginationControls";

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

  /* page handlers */
  const [currentPage, setCurrentPage] = useState("1");
  const [pageSize, setPageSize] = useState(10);

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

  /* sort and group calls by date */
  const sortedCalls = [...filteredCalls].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  /* paginate sorted calls */
  const totalPages = Math.max(1, Math.ceil(sortedCalls.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageCalls = sortedCalls.slice(startIndex, endIndex);

  const groupedCalls = currentPageCalls.reduce((groups, call) => {
    const dateKey = call.created_at.slice(0, 10);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(call);

    return groups;
  }, {});

  function formatDateHeader(dateKey) {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function handlePreviousPage() {
    setCurrentPage((currentPage) => {
      return Math.max(currentPage - 1, 1);
    });
  }

  function handleNextPage() {
    setCurrentPage((currentPage) => {
      return Math.min(currentPage + 1, totalPages);
    });
  }



  return (
      <section className="call-feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>{isActiveView ? "Active Calls" : "Archived Calls"}</h2>
            <p>
              {sortedCalls.length} of {calls.length} calls shown
            </p>
          </div>

          <div className="feed-actions">
            <label className="page-size-control">
              Show
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
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

        {/* top pagination controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />

        {/* call list */}
        {sortedCalls.length > 0 ? (
          Object.entries(groupedCalls).map(([dateKey, callsForDate]) => {
            return (
              <div className="call-date-group" key={dateKey}>
                <h3 className="date-group-title">{formatDateHeader(dateKey)}</h3>
                {callsForDate.map((call) => {
                  return (
                    <CallItem 
                      key={call.id} 
                      call={call} 
                      onSelectCall={onSelectCall} 
                      actionLabel={actionLabel}
                      onAction={actionHandler}
                    />
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>{calls.length === 0 ? "No calls available." : "No calls match the current filters."}</p>
          </div>
        )}


        {/* bottom pagination controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />

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


















