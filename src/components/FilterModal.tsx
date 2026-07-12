import { useEffect, useMemo, useState, type CSSProperties } from "react";
import DatePicker from "react-datepicker";
import type { CallDirection, CallFilters, CallType, TutorialTargetId } from "../types";
import { dateKeyToLocalDate, localDateToDateKey, type AvailableCallDate } from "../utils/callUtils";
import { formatDateHeader } from "../utils/formatters";
import Modal from "./Modal";

interface FilterModalProps {
  draftFilters: CallFilters;
  availableCallDates: AvailableCallDate[];
  activeTutorialTarget: TutorialTargetId | null;
  onDraftFiltersChange: (filters: CallFilters) => void;
  onReset: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

type DurationSliderStyle = CSSProperties & {
  "--duration-min": string;
  "--duration-max": string;
};

type FilterSectionKey = "callType" | "direction" | "dateRange" | "duration";

function FilterModal({
  draftFilters,
  availableCallDates,
  activeTutorialTarget,
  onDraftFiltersChange,
  onReset,
  onClose,
  onConfirm,
}: FilterModalProps) {
  const durationSliderMax = 500;
  const durationMin = draftFilters.durationMin === "" ? 0 : Number(draftFilters.durationMin);
  const durationMax =
    draftFilters.durationMax === "" ? durationSliderMax : Number(draftFilters.durationMax);
  const durationMinPercent = (durationMin / durationSliderMax) * 100;
  const durationMaxPercent = (durationMax / durationSliderMax) * 100;
  const [isSelectingRangeEnd, setIsSelectingRangeEnd] = useState(false);
  const [openSections, setOpenSections] = useState<Record<FilterSectionKey, boolean>>({
    callType: false,
    direction: false,
    dateRange: false,
    duration: false,
  });
  const selectedStartDate = dateKeyToLocalDate(draftFilters.dateFrom);
  const selectedEndDate = dateKeyToLocalDate(draftFilters.dateTo);
  const calendarEndDate = isSelectingRangeEnd ? null : selectedEndDate;
  const availableDateSet = useMemo(() => {
    return new Set(availableCallDates.map((callDate) => callDate.value));
  }, [availableCallDates]);
  const availableDateObjects = useMemo(() => {
    return availableCallDates
      .map((callDate) => dateKeyToLocalDate(callDate.value))
      .filter((date): date is Date => date !== null);
  }, [availableCallDates]);
  const minAvailableDate =
    availableCallDates.length > 0
      ? dateKeyToLocalDate(availableCallDates[availableCallDates.length - 1].value)
      : null;
  const maxAvailableDate =
    availableCallDates.length > 0 ? dateKeyToLocalDate(availableCallDates[0].value) : null;

  useEffect(() => {
    const hasNoDateRange = draftFilters.dateFrom === "" && draftFilters.dateTo === "";
    const hasCompleteMultiDayRange =
      draftFilters.dateFrom !== "" &&
      draftFilters.dateTo !== "" &&
      draftFilters.dateFrom !== draftFilters.dateTo;

    if (hasNoDateRange || hasCompleteMultiDayRange) {
      setIsSelectingRangeEnd(false);
    }
  }, [draftFilters.dateFrom, draftFilters.dateTo]);

  function toggleFilterSection(sectionKey: FilterSectionKey) {
    setOpenSections((currentSections) => {
      return {
        ...currentSections,
        [sectionKey]: !currentSections[sectionKey],
      };
    });
  }

  function handleCallTypeChange(callType: CallType, checked: boolean) {
    onDraftFiltersChange({
      ...draftFilters,
      callTypes: {
        ...draftFilters.callTypes,
        [callType]: checked,
      },
    });
  }

  function handleDirectionChange(direction: CallDirection, checked: boolean) {
    onDraftFiltersChange({
      ...draftFilters,
      directions: {
        ...draftFilters.directions,
        [direction]: checked,
      },
    });
  }

  function handleDateRangeChange(dates: [Date | null, Date | null]) {
    const [startDate, endDate] = dates;

    if (!startDate) {
      handleClearDateRange();
      return;
    }

    const nextDateFrom = localDateToDateKey(startDate);

    if (!endDate) {
      if (isSelectingRangeEnd && draftFilters.dateFrom !== "") {
        const normalizedDateFrom =
          nextDateFrom <= draftFilters.dateFrom ? nextDateFrom : draftFilters.dateFrom;
        const normalizedDateTo =
          nextDateFrom <= draftFilters.dateFrom ? draftFilters.dateFrom : nextDateFrom;

        setIsSelectingRangeEnd(false);

        onDraftFiltersChange({
          ...draftFilters,
          dateFrom: normalizedDateFrom,
          dateTo: normalizedDateTo,
        });
        return;
      }

      setIsSelectingRangeEnd(true);

      onDraftFiltersChange({
        ...draftFilters,
        dateFrom: nextDateFrom,
        dateTo: nextDateFrom,
      });
      return;
    }

    const nextDateTo = localDateToDateKey(endDate);
    const normalizedDateFrom = nextDateFrom <= nextDateTo ? nextDateFrom : nextDateTo;
    const normalizedDateTo = nextDateFrom <= nextDateTo ? nextDateTo : nextDateFrom;

    setIsSelectingRangeEnd(false);

    onDraftFiltersChange({
      ...draftFilters,
      dateFrom: normalizedDateFrom,
      dateTo: normalizedDateTo,
    });
  }

  function handleClearDateRange() {
    setIsSelectingRangeEnd(false);

    onDraftFiltersChange({
      ...draftFilters,
      dateFrom: "",
      dateTo: "",
    });
  }

  function handleDurationMinChange(value: string) {
    const nextMin = Math.min(Number(value), durationMax);

    onDraftFiltersChange({
      ...draftFilters,
      durationMin: nextMin === 0 ? "" : String(nextMin),
    });
  }

  function handleDurationMaxChange(value: string) {
    const nextMax = Math.max(Number(value), durationMin);

    onDraftFiltersChange({
      ...draftFilters,
      durationMax: nextMax === durationSliderMax ? "" : String(nextMax),
    });
  }

  function formatDurationLabel(value: number, isMaxValue = false) {
    if (isMaxValue && value === durationSliderMax) {
      return `${durationSliderMax}+ sec`;
    }

    return `${value} sec`;
  }

  function isDateSelectable(date: Date) {
    return availableDateSet.has(localDateToDateKey(date));
  }

  function formatSelectedDate(dateValue: string) {
    return (
      availableCallDates.find((callDate) => callDate.value === dateValue)?.label ??
      formatDateHeader(dateValue)
    );
  }

  function getDateRangeLabel() {
    if (draftFilters.dateFrom === "" && draftFilters.dateTo === "") {
      return "Any date";
    }

    if (draftFilters.dateFrom !== "" && draftFilters.dateFrom === draftFilters.dateTo) {
      return formatSelectedDate(draftFilters.dateFrom);
    }

    if (draftFilters.dateFrom !== "" && draftFilters.dateTo !== "") {
      return `${formatSelectedDate(draftFilters.dateFrom)} to ${formatSelectedDate(
        draftFilters.dateTo,
      )}`;
    }

    if (draftFilters.dateFrom !== "") {
      return `From ${formatSelectedDate(draftFilters.dateFrom)}`;
    }

    return `Until ${formatSelectedDate(draftFilters.dateTo)}`;
  }

  const hasSelectedDateRange = draftFilters.dateFrom !== "" || draftFilters.dateTo !== "";

  return (
    <Modal
      className="filter-modal"
      isTutorialActive={activeTutorialTarget === "filter-modal"}
      labelledBy="filter-modal-title"
    >
      <div className="modal-header">
        <h2 id="filter-modal-title">Filter Calls</h2>

        <button
          className="close-button"
          onClick={onClose}
          title="Close filter modal"
          aria-label="Close filter modal"
          data-tutorial-active={activeTutorialTarget === "filter-close-button" ? "true" : undefined}
        >
          Close
        </button>
      </div>

      <div className="filter-section">
        <h3>
          <button
            className="filter-section-toggle"
            type="button"
            aria-expanded={openSections.callType}
            aria-controls="filter-section-call-type"
            onClick={() => toggleFilterSection("callType")}
          >
            <span>Call Type</span>
            <span aria-hidden="true" className="filter-section-chevron">
              {openSections.callType ? "−" : "+"}
            </span>
          </button>
        </h3>

        <div
          id="filter-section-call-type"
          className="filter-section-body"
          hidden={!openSections.callType}
        >
          <div className="filter-option-row">
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
        </div>
      </div>

      <div className="filter-section">
        <h3>
          <button
            className="filter-section-toggle"
            type="button"
            aria-expanded={openSections.direction}
            aria-controls="filter-section-direction"
            onClick={() => toggleFilterSection("direction")}
          >
            <span>Direction</span>
            <span aria-hidden="true" className="filter-section-chevron">
              {openSections.direction ? "−" : "+"}
            </span>
          </button>
        </h3>

        <div
          id="filter-section-direction"
          className="filter-section-body"
          hidden={!openSections.direction}
        >
          <div className="filter-option-row">
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
        </div>
      </div>

      <div className="filter-section">
        <h3>
          <button
            className="filter-section-toggle"
            type="button"
            aria-expanded={openSections.dateRange}
            aria-controls="filter-section-date-range"
            onClick={() => toggleFilterSection("dateRange")}
          >
            <span>Date Range</span>
            <span aria-hidden="true" className="filter-section-chevron">
              {openSections.dateRange ? "−" : "+"}
            </span>
          </button>
        </h3>

        <div
          id="filter-section-date-range"
          className="filter-section-body"
          hidden={!openSections.dateRange}
        >
          <div className="date-range-picker">
            <div className="date-range-summary" aria-live="polite">
              <span>Selected range</span>
              <strong>{getDateRangeLabel()}</strong>
            </div>

            {availableCallDates.length > 0 ? (
              <div className="date-calendar-shell" aria-label="Dates with calls">
                <DatePicker
                  inline
                  selectsRange
                  selected={selectedStartDate}
                  startDate={selectedStartDate}
                  endDate={calendarEndDate}
                  openToDate={selectedStartDate ?? maxAvailableDate ?? undefined}
                  minDate={minAvailableDate ?? undefined}
                  maxDate={maxAvailableDate ?? undefined}
                  includeDates={availableDateObjects}
                  filterDate={isDateSelectable}
                  highlightDates={availableDateObjects}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  shouldCloseOnSelect={false}
                  calendarClassName="date-range-calendar"
                  onChange={handleDateRangeChange}
                />
              </div>
            ) : (
              <p className="date-range-empty">No call dates available.</p>
            )}

            <button
              className="secondary-button date-range-clear-button"
              type="button"
              disabled={!hasSelectedDateRange}
              onClick={handleClearDateRange}
            >
              Clear date range
            </button>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>
          <button
            className="filter-section-toggle"
            type="button"
            aria-expanded={openSections.duration}
            aria-controls="filter-section-duration"
            onClick={() => toggleFilterSection("duration")}
          >
            <span>Duration</span>
            <span aria-hidden="true" className="filter-section-chevron">
              {openSections.duration ? "−" : "+"}
            </span>
          </button>
        </h3>

        <div
          id="filter-section-duration"
          className="filter-section-body"
          hidden={!openSections.duration}
        >
          <div className="duration-slider">
            <div className="duration-slider-values">
              <span>{formatDurationLabel(durationMin)}</span>
              <span>{formatDurationLabel(durationMax, true)}</span>
            </div>

            <div
              className="duration-slider-track"
              style={
                {
                  "--duration-min": `${durationMinPercent}%`,
                  "--duration-max": `${durationMaxPercent}%`,
                } as DurationSliderStyle
              }
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
      </div>

      <div className="modal-actions filter-actions">
        <button
          className="secondary-button"
          onClick={onReset}
          title="Reset filters"
          aria-label="Reset filters"
        >
          Reset filters
        </button>
        <button className="secondary-button" onClick={onClose} title="Cancel" aria-label="Cancel">
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
    </Modal>
  );
}

export default FilterModal;
