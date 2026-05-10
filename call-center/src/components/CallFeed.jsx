import { useState, useEffect } from "react";
import CallItem from "./CallItem";
import FilterModal from "./FilterModal";
import PaginationControls from "./PaginationControls";
import { formatDateHeader } from "../utils/formatters";
import {
  defaultFilters,
  filterCalls,
  getActiveFilterCount,
  groupCallsByDate,
  paginateCalls,
  sortCallsNewestFirst,
} from "../utils/callUtils";



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
  const activeFilterCount = getActiveFilterCount(appliedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  /* page handlers */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredCalls = filterCalls(calls, appliedFilters);

  /* sort calls */
  const sortedCalls = sortCallsNewestFirst(filteredCalls);

  /* paginate sorted calls */
  const {totalPages, startIndex, endIndex, currentPageCalls } = paginateCalls(sortedCalls, currentPage, pageSize);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const visibleStart = sortedCalls.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(endIndex, sortedCalls.length);
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

  /* group calls for current page by date */
  const groupedCalls = groupCallsByDate(currentPageCalls);

  return (
      <section className="call-feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>{isActiveView ? "Active Calls" : "Archived Calls"}</h2>
            <p>
              {sortedCalls.length === 0
                ? "No calls to display."
                : `Showing ${visibleStart} <-> ${visibleEnd} of ${sortedCalls.length} ${hasActiveFilters ? `filtered calls (${calls.length} total)` : "calls"}`}
            </p>
          </div>

          <div className="feed-actions">
            <label className="page-size-control">
              Show
              <select
                value={pageSize}
                title="Select how many calls to show per page"
                aria-label="Select how many calls to show per page"
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
              className={hasActiveFilters ? "filter-button active" : "filter-button"}
              title="Open filters"
              aria-label="Open filters"
              onClick={() => {
                setDraftFilters(appliedFilters);
                setIsFilterModalOpen(true);
              }}
            >
               {hasActiveFilters ? `☰  (${activeFilterCount})` : "☰ "}
            </button>
            <button
              className="view-toggle"
              title={isActiveView ? "View archived calls" : "View active calls"}
              aria-label={isActiveView ? "View archived calls" : "View active calls"}
              onClick={() => {
                onCallViewChange(isActiveView ? "archived" : "active");
                setCurrentPage(1);
              }}
            >
              {isActiveView ? "View Archived Calls" : "View Active Calls"}
            </button>
            <button
              className="bulk-action-button"
              title={isActiveView ? "Archive all calls" : "Unarchive all calls"}
              aria-label={isActiveView ? "Archive all calls" : "Unarchive all calls"}
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
              setAppliedFilters(draftFilters);
              setCurrentPage(1);
              setIsFilterModalOpen(false);
            }}
          />
        )}
      </section>
  );
}

export default CallFeed;
