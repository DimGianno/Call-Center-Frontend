function FilterModal({ 
    draftFilters,
    onDraftFiltersChange,
    onReset,
    onClose,
    onConfirm,
 }) {
    const durationSliderMax = 500;
    const durationMin = draftFilters.durationMin === "" ? 0 : Number(draftFilters.durationMin);
    const durationMax = draftFilters.durationMax === "" ? durationSliderMax : Number(draftFilters.durationMax);
    const durationMinPercent = (durationMin / durationSliderMax) * 100;
    const durationMaxPercent = (durationMax / durationSliderMax) * 100;

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

    function handleDurationMinChange(value) {
        const nextMin = Math.min(Number(value), durationMax);

        onDraftFiltersChange({
        ...draftFilters,
        durationMin: nextMin === 0 ? "" : String(nextMin),
        });
    }

    function handleDurationMaxChange(value) {
        const nextMax = Math.max(Number(value), durationMin);

        onDraftFiltersChange({
        ...draftFilters,
        durationMax: nextMax === durationSliderMax ? "" : String(nextMax),
        });
    }

    function formatDurationLabel(value, isMaxValue = false) {
        if (isMaxValue && value === durationSliderMax) {
            return `${durationSliderMax}+ sec`;
        }

        return `${value} sec`;
    }

    return (
        <div className="modal-overlay">
            <div className="filter-modal">
                <div className="modal-header">
                    <h2>Filter Calls</h2>

                    <button 
                        className="close-button" 
                        onClick={onClose}
                        title="Close filter modal"
                        aria-label="Close filter modal"
                    >
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

                    <div className="range-filter-grid">
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

                <div className="filter-section">
                    <h3>Duration</h3>

                    <div className="duration-slider">
                        <div className="duration-slider-values">
                            <span>{formatDurationLabel(durationMin)}</span>
                            <span>{formatDurationLabel(durationMax, true)}</span>
                        </div>

                        <div 
                            className="duration-slider-track"
                            style={{
                                "--duration-min": `${durationMinPercent}%`,
                                "--duration-max": `${durationMaxPercent}%`,
                            }}
                        >
                            <input
                                type="range"
                                min="0"
                                max={durationSliderMax}
                                step="5"
                                value={durationMin}
                                aria-label="Minimum call duration in seconds"
                                onChange={(event) => handleDurationMinChange(event.target.value)}
                            />
                            <input
                                type="range"
                                min="0"
                                max={durationSliderMax}
                                step="5"
                                value={durationMax}
                                aria-label="Maximum call duration in seconds"
                                onChange={(event) => handleDurationMaxChange(event.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="filter-actions">
                    <button 
                        className="secondary-button" 
                        onClick={onReset}
                        title="Reset filters"
                        aria-label="Reset filters"
                    >
                        Reset filters
                    </button>
                    <button 
                        className="secondary-button" 
                        onClick={onClose}
                        title="Cancel"
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>

                    <button 
                        className="primary-button" 
                        onClick={onConfirm}
                        title="Confirm filters"
                        aria-label="Confirm filters"
                    >
                        Confirm filters
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterModal;
