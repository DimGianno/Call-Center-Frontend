function PaginationControls({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-controls">
      <button
        className="pagination-button"
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
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;