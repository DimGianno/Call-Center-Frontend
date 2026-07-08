import { useState, useEffect, useMemo } from "react";
import type { Call, CallFilters, CallView, TutorialEventId, TutorialTargetId } from "../types";
import CallItem from "./CallItem";
import FilterModal from "./FilterModal";
import PaginationControls from "./PaginationControls";
import { formatDateHeader } from "../utils/formatters";
import {
  defaultFilters,
  filterCalls,
  getActiveFilterCount,
  getAvailableCallDates,
  groupCallsByDate,
  paginateCalls,
  searchCallsByPhoneNumber,
  sortCallsNewestFirst,
} from "../utils/callUtils";

const pageSizeOptions = [5, 10, 25, 50];

interface CallFeedProps {
  activeTutorialTarget: TutorialTargetId | null;
  calls: Call[];
  callView: CallView;
  showSeedGuidance: boolean;
  onCallViewChange: (callView: CallView) => void;
  onSelectCall: (callId: string) => void | Promise<void>;
  onArchiveCall: (callId: string) => Promise<boolean>;
  onUnarchiveCall: (callId: string) => Promise<boolean>;
  onArchiveAll: () => void;
  onUnarchiveAll: () => void;
  onResetCalls: () => void;
  onTutorialEvent?: (eventId: TutorialEventId) => void;
}

function CallFeed({
  activeTutorialTarget,
  calls,
  callView,
  showSeedGuidance,
  onCallViewChange,
  onSelectCall,
  onArchiveCall,
  onUnarchiveCall,
  onArchiveAll,
  onUnarchiveAll,
  onResetCalls,
  onTutorialEvent,
}: CallFeedProps) {
  const isActiveView = callView === "active";

  /* Determine action label and handler based on current view */
  const actionLabel = isActiveView ? "Archive" : "Unarchive";
  const actionHandler = isActiveView ? onArchiveCall : onUnarchiveCall;

  /* archive all / unarchive all handlers */
  const bulkActionHandler = isActiveView ? onArchiveAll : onUnarchiveAll;

  /* filter */
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CallFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<CallFilters>(defaultFilters);
  const activeFilterCount = getActiveFilterCount(appliedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  /* page handlers */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* search calls */
  const [searchTerm, setSearchTerm] = useState("");
  const searchedCalls = useMemo(() => {
    return searchCallsByPhoneNumber(calls, searchTerm);
  }, [calls, searchTerm]);
  const availableCallDates = useMemo(() => {
    return getAvailableCallDates(searchedCalls);
  }, [searchedCalls]);

  /* filter calls */
  const filteredCalls = filterCalls(searchedCalls, appliedFilters);

  /* sort calls */
  const sortedCalls = sortCallsNewestFirst(filteredCalls);

  /* paginate sorted calls */
  const { totalPages, currentPageCalls } = paginateCalls(sortedCalls, currentPage, pageSize);
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

  function handleCloseFilters() {
    setIsFilterModalOpen(false);
    onTutorialEvent?.("filters-closed");
  }

  /* group calls for current page by date */
  const groupedCalls = groupCallsByDate(currentPageCalls);
  const tutorialCallCardId = currentPageCalls[0]?.id;

  return (
    <section
      className="call-feed"
      data-tutorial-active={activeTutorialTarget === "call-feed" ? "true" : undefined}
    >
      <div className="feed-header">
        <div className="feed-actions">
          <label
            className={searchTerm.trim() !== "" ? "search-control has-value" : "search-control"}
            title="Search calls by phone number"
            data-tutorial-active={activeTutorialTarget === "search-control" ? "true" : undefined}
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
                if (event.target.value.trim() !== "") {
                  onTutorialEvent?.("search-typed");
                }
              }}
            />
          </label>
          <div
            className="page-size-control"
            role="group"
            aria-label="Select how many calls to show per page"
            title="Select how many calls to show per page"
            data-tutorial-active={activeTutorialTarget === "page-size-control" ? "true" : undefined}
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
                      onTutorialEvent?.("page-size-changed");
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
            data-tutorial-active={activeTutorialTarget === "filters-button" ? "true" : undefined}
            onClick={() => {
              setDraftFilters(appliedFilters);
              setIsFilterModalOpen(true);
              onTutorialEvent?.("filters-opened");
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
            data-tutorial-active={
              activeTutorialTarget === "view-toggle-button" ? "true" : undefined
            }
            onClick={() => {
              onCallViewChange(isActiveView ? "archived" : "active");
              setCurrentPage(1);
              onTutorialEvent?.("archived-view-opened");
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
            data-tutorial-active={
              activeTutorialTarget === "bulk-action-button" ? "true" : undefined
            }
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
        isTutorialActive={activeTutorialTarget === "pagination-controls"}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      {/* call list */}
      {sortedCalls.length > 0 ? (
        <div
          className="call-date-groups"
          data-tutorial-active={activeTutorialTarget === "call-date-groups" ? "true" : undefined}
        >
          {Object.entries(groupedCalls).map(([dateKey, callsForDate]) => {
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
                      isTutorialActive={
                        activeTutorialTarget === "call-card" && call.id === tutorialCallCardId
                      }
                      onAction={actionHandler}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : showSeedGuidance ? (
        <div
          className="empty-state seed-calls-state"
          data-tutorial-active={activeTutorialTarget === "seed-calls" ? "true" : undefined}
        >
          <h2>Get started with sample calls</h2>
          <p>
            Your account has no call records yet. Select <strong>Seed sample calls</strong>, then
            confirm to populate the dashboard with demo call data.
          </p>
          <button className="primary-button seed-calls-button" type="button" onClick={onResetCalls}>
            <span aria-hidden="true">↺</span>
            <span>Seed sample calls</span>
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {calls.length === 0
              ? `No ${isActiveView ? "active" : "archived"} calls available.`
              : "No calls match the current search or filters."}
          </p>
        </div>
      )}

      {/* bottom pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        isTutorialActive={activeTutorialTarget === "pagination-controls"}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      {!showSeedGuidance && (
        <div className="feed-footer">
          <button
            className="icon-action-button reset-data-button"
            title="Reset calls to sample data"
            aria-label="Reset calls to sample data"
            data-tutorial-active={activeTutorialTarget === "reset-data-button" ? "true" : undefined}
            onClick={onResetCalls}
          >
            <span className="icon-action-emoji">↺</span>
            <span className="icon-action-label">Reset Data</span>
          </button>
        </div>
      )}

      {isFilterModalOpen && (
        <FilterModal
          draftFilters={draftFilters}
          availableCallDates={availableCallDates}
          activeTutorialTarget={activeTutorialTarget}
          onDraftFiltersChange={setDraftFilters}
          onReset={() => setDraftFilters(defaultFilters)}
          onClose={handleCloseFilters}
          onConfirm={() => {
            setAppliedFilters(draftFilters);
            setCurrentPage(1);
            handleCloseFilters();
          }}
        />
      )}
    </section>
  );
}

export default CallFeed;
