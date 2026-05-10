function FilterModal({ 
    draftFilters,
    onDraftFiltersChange,
    onReset,
    onClose,
    onConfirm,
 }) {
    function handleCallTypeChange(callType, checked) {
        onDraftFiltersChange({
        ...draftFilters,
        callTypes: {
            ...draftFilters.callTypes,
            [callType]: checked,
        },
        });
    }

    function handleDirectionChange(direction, checked) {
        onDraftFiltersChange({
        ...draftFilters,
        directions: {
            ...draftFilters.directions,
            [direction]: checked,
        },
        });
    }

    function handleDateChange(fieldName, value) {
        onDraftFiltersChange({
        ...draftFilters,
        [fieldName]: value,
        });
    }

    return (
        <div className="modal-overlay">
            <div className="filter-modal">
                <div className="modal-header">
                    <h2>Filter Calls</h2>

                    <button className="close-button" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="filter-section">
                    <h3>Call Type</h3>

                    <label className="filter-option">
                        <input 
                            type="checkbox"
                            checked={draftFilters.callTypes.answered}
                            onChange={(event) => handleCallTypeChange("answered", event.target.checked)}
                        />
                        Answered
                    </label>

                    <label className="filter-option">
                        <input 
                            type="checkbox"
                            checked={draftFilters.callTypes.missed}
                            onChange={(event) => handleCallTypeChange("missed", event.target.checked)}
                        />
                        Missed
                    </label>

                    <label className="filter-option">
                        <input 
                            type="checkbox"
                            checked={draftFilters.callTypes.voicemail}
                            onChange={(event) => handleCallTypeChange("voicemail", event.target.checked)}
                        />
                        Voicemail
                    </label>
                </div>

                <div className="filter-section">
                    <h3>Direction</h3>

                    <label className="filter-option">
                        <input 
                            type="checkbox"
                            checked={draftFilters.directions.inbound}
                            onChange={(event) => handleDirectionChange("inbound", event.target.checked)}
                        />
                        Inbound
                    </label>

                    <label className="filter-option">
                        <input 
                            type="checkbox"
                            checked={draftFilters.directions.outbound}
                            onChange={(event) => handleDirectionChange("outbound", event.target.checked)}
                        />
                        Outbound
                    </label>
                </div>

                <div className="filter-section">
                    <h3>Date Range</h3>

                    <div className="date-filter-grid">
                        <label>
                        From
                        <input 
                            type="date"
                            value={draftFilters.dateFrom}
                            onChange={(event) => handleDateChange("dateFrom", event.target.value)}
                        />
                        </label>

                        <label>
                        To
                        <input 
                            type="date"
                            value={draftFilters.dateTo}
                            onChange={(event) => handleDateChange("dateTo", event.target.value)}
                        />
                        </label>
                    </div>
                </div>

                <div className="filter-actions">
                    <button className="secondary-button" onClick={onReset}>
                        Reset filters
                    </button>
                    <button className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="primary-button" onClick={onConfirm}>
                        Confirm filters
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterModal;