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
  searchCallsByPhoneNumber,
  sortCallsNewestFirst,
} from "../utils/callUtils";

const pageSizeOptions = [5, 10, 25, 50];

function CallFeed({
  calls,
  callView,
  onCallViewChange,
  onSelectCall,
  onArchiveCall,
  onUnarchiveCall,
  onArchiveAll,
  onUnarchiveAll,
  onResetCalls,
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

  /* search calls */
  const [searchTerm, setSearchTerm] = useState("");
  const searchedCalls = searchCallsByPhoneNumber(calls, searchTerm);

  /* filter calls */
  const filteredCalls = filterCalls(searchedCalls, appliedFilters);

  /* sort calls */
  const sortedCalls = sortCallsNewestFirst(filteredCalls);

  /* paginate sorted calls */
  const { totalPages, startIndex, endIndex, currentPageCalls } = paginateCalls(
    sortedCalls,
    currentPage,
    pageSize,
  );
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
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
        <div className="feed-actions">
          <label
            className={searchTerm.trim() !== "" ? "search-control has-value" : "search-control"}
            title="Search calls by phone number"
          >
            <span className="search-icon">🔎</span>

            <input
              type="search"
              value={searchTerm}
              placeholder="Phone number..."
              aria-label="Search calls by phone number"
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <div
            className="page-size-control"
            role="group"
            aria-label="Select how many calls to show per page"
            title="Select how many calls to show per page"
          >
            <span className="page-size-icon">📄</span>

            <div className="page-size-segments">
              {pageSizeOptions.map((pageSizeOption) => {
                return (
                  <button
                    key={pageSizeOption}
                    className={
                      pageSize === pageSizeOption
                        ? "page-size-segment is-active"
                        : "page-size-segment"
                    }
                    type="button"
                    aria-label={`Show ${pageSizeOption} calls per page`}
                    aria-pressed={pageSize === pageSizeOption}
                    onClick={() => {
                      setPageSize(pageSizeOption);
                      setCurrentPage(1);
                    }}
                  >
                    {pageSizeOption}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            className="icon-action-button"
            title="Open filters"
            aria-label="Open filters"
            onClick={() => {
              setDraftFilters(appliedFilters);
              setIsFilterModalOpen(true);
            }}
          >
            <span className="icon-action-emoji">
              {hasActiveFilters ? `☰ (${activeFilterCount})` : "☰"}
            </span>
            <span className="icon-action-label">
              {hasActiveFilters ? `Filters (${activeFilterCount})` : "Filters"}
            </span>
          </button>
          <button
            className="icon-action-button"
            title={isActiveView ? "View archived calls" : "View active calls"}
            aria-label={isActiveView ? "View archived calls" : "View active calls"}
            onClick={() => {
              onCallViewChange(isActiveView ? "archived" : "active");
              setCurrentPage(1);
            }}
          >
            <span className="icon-action-emoji">🗂️</span>
            <span className="icon-action-label">
              {isActiveView ? "View Archived" : "View Active"}
            </span>
          </button>
          <button
            className="icon-action-button"
            title={isActiveView ? "Archive all calls" : "Unarchive all calls"}
            aria-label={isActiveView ? "Archive all calls" : "Unarchive all calls"}
            onClick={bulkActionHandler}
            disabled={calls.length === 0}
          >
            <span className="icon-action-emoji">🗄️</span>
            <span className="icon-action-label">
              {isActiveView ? "Archive All" : "Unarchive All"}
            </span>
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
          <p>
            {calls.length === 0
              ? "No calls available."
              : "No calls match the current search or filters."}
          </p>
        </div>
      )}

      {/* bottom pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      <div className="feed-footer">
        <button
          className="icon-action-button reset-data-button"
          title="Reset calls to sample data"
          aria-label="Reset calls to sample data"
          onClick={onResetCalls}
        >
          <span className="icon-action-emoji">↺</span>
          <span className="icon-action-label">Reset Data</span>
        </button>
      </div>

      {isFilterModalOpen && (
        <FilterModal
          draftFilters={draftFilters}
          onDraftFiltersChange={setDraftFilters}
          onReset={() => setDraftFilters(defaultFilters)}
          onClose={() => setIsFilterModalOpen(false)}
          onConfirm={() => {
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
