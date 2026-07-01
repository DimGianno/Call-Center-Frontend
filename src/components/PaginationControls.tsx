interface PaginationControlsProps {
  currentPage: number;
  isTutorialActive?: boolean;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

function PaginationControls({
  currentPage,
  isTutorialActive = false,
  totalPages,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className="pagination-controls"
      data-tutorial-active={isTutorialActive ? "true" : undefined}
    >
      <button
        className="pagination-button"
        title="Go to previous page"
        aria-label="Go to previous page"
        onClick={onPreviousPage}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span className="pagination-status">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="pagination-button"
        title="Go to next page"
        aria-label="Go to next page"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;
