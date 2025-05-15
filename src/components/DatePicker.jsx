import React, { useCallback, memo, useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { differenceInCalendarDays, eachDayOfInterval, addDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";

/**
 * DatePicker component using react-datepicker
 *
 * @param {Object} props
 * @param {Array} props.selectedDates - Array containing selected start and end dates
 * @param {Function} props.onDateChange - Callback for date selection changes
 * @param {Array} props.bookedDates - Array of dates that are already booked (will be marked as unavailable)
 * @param {Array} props.availableDates - Array of dates that are available for booking
 * @param {Boolean} props.isAddingAvailability - Flag to indicate if calendar is used for adding availability
 * @param {Boolean} props.debug - Enable debug mode for development
 * @param {Function} props.onNightCountChange - Optional callback that returns the number of nights selected
 */
const DatePicker = ({
  selectedDates = [],
  onDateChange,
  bookedDates = [],
  availableDates = [],
  isAddingAvailability = false,
  debug = false,
  onNightCountChange = null,
}) => {
  // Internal night count state (used only if onNightCountChange not provided)
  const [nightCount, setNightCount] = useState(0);

  // function for date comparison - strictly comparing UTC dates
  const isSameDay = useCallback((date1, date2) => {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    );
  }, []);

  // Parse dates to ensure they're Date objects
  const parseDates = useCallback((dates) => {
    if (!dates || !Array.isArray(dates)) return [];

    return dates
      .map((date) => {
        if (!date) return null;
        return date instanceof Date ? date : new Date(date);
      })
      .filter((date) => date instanceof Date && !isNaN(date.getTime()));
  }, []);

  // Parse all date arrays
  const parsedSelectedDates = parseDates(selectedDates);
  const parsedBookedDates = parseDates(bookedDates);
  const parsedAvailableDates = parseDates(availableDates);

  // Calculate nights when both dates are selected
  useEffect(() => {
    // Only calculate when we have both start and end dates
    if (
      parsedSelectedDates.length === 2 &&
      parsedSelectedDates[0] &&
      parsedSelectedDates[1]
    ) {
      const startDate = parsedSelectedDates[0];
      const endDate = parsedSelectedDates[1];

      // Ensure end date is after start date
      if (endDate > startDate) {
        const nights = differenceInCalendarDays(endDate, startDate);

        // Update internal state
        setNightCount(nights);

        // Notify parent if callback provided
        if (onNightCountChange) {
          onNightCountChange(nights);
        }
      } else if (onNightCountChange) {
        // If end date is before or same as start date, set nights to 0
        onNightCountChange(0);
        setNightCount(0);
      }
    } else {
      // Reset night count when no dates or only one date is selected
      setNightCount(0);
      if (onNightCountChange) {
        onNightCountChange(0);
      }
    }
  }, [parsedSelectedDates, onNightCountChange]);

  // Conditionally log debug information
  if (debug) {
    console.log("DatePicker - Date Data:", {
      selectedDates,
      availableDates: availableDates.length,
      bookedDates: bookedDates.length,
      nightCount,
      parsedSelectedDates,
      parsedAvailableDates:
        parsedAvailableDates.length > 0
          ? parsedAvailableDates.slice(0, 3).map((d) => d.toISOString())
          : "none",
    });
  }

  // Helper function to determine if a date should be disabled
  const isDateDisabled = useCallback(
    (date) => {
      if (!date) return true;

      // Get current date in UTC
      const now = new Date();
      const utcToday = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );

      // Convert input date to UTC midnight
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );

      // Disable past dates
      if (utcDate < utcToday) return true;

      // Check against booked dates (UTC)
      if (
        parsedBookedDates.some((bookedDate) => isSameDay(bookedDate, utcDate))
      ) {
        return true;
      }

      // Special case: If we have one selected date already, allow the next day as end date
      // even if it's not in the availability list (for checkout purposes)
      if (parsedSelectedDates.length === 1 && parsedSelectedDates[0]) {
        const startDate = parsedSelectedDates[0];
        const nextDay = addDays(startDate, 1);

        if (isSameDay(utcDate, nextDay)) {
          return false; // Always allow next day after start date as end date
        }
      }

      // Check available dates (UTC) - only if we have available dates and not in availability mode
      if (!isAddingAvailability && parsedAvailableDates.length > 0) {
        return !parsedAvailableDates.some((availableDate) =>
          isSameDay(availableDate, utcDate)
        );
      }

      return false;
    },
    [
      parsedBookedDates,
      parsedAvailableDates,
      isAddingAvailability,
      isSameDay,
      parsedSelectedDates,
    ]
  );

  // Check if date range is valid (all dates in range are available)
  const isRangeValid = useCallback(
    (start, end) => {
      if (!start || !end || start >= end) return false;

      try {
        // Get all dates in the interval excluding the last day (checkout day)
        const dateRange = eachDayOfInterval({ start, end: addDays(end, -1) });

        // Check if all dates in range (except checkout day) are valid
        return dateRange.every((date) => !isDateDisabled(date));
      } catch (error) {
        console.error("Error checking date range validity:", error);
        return false;
      }
    },
    [isDateDisabled]
  );

  // Handle date changes with validation
  const handleDateChange = useCallback(
    (dates) => {
      if (!dates) {
        onDateChange([]);
        return;
      }

      let newDates = Array.isArray(dates) ? [...dates] : [dates];

      // Handle range selection
      if (newDates.length === 2 && newDates[0] && newDates[1]) {
        const [start, end] = newDates;

        // Basic validation for start before end
        if (end < start) {
          onDateChange([start]);
          return;
        }

        // Check if all dates in the range are available (except checkout day)
        if (!isRangeValid(start, end)) {
          // If range isn't valid, treat the end date as a new start date
          if (debug) {
            console.log(
              "Invalid range detected - treating end date as new start date"
            );
          }
          onDateChange([end]);
          return;
        }
      }

      onDateChange(newDates);
    },
    [onDateChange, isRangeValid, debug]
  );

  // Determine if we're selecting a range or a single date
  const selectsRange = true; // Always use range selection for consistency

  // Day class name calculator
  const getDayClassName = useCallback(
    (date) => {
      const classes = [];

      // Convert to UTC for consistent comparison
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );

      // Mark available dates with a special class
      if (
        !isAddingAvailability &&
        parsedAvailableDates.length > 0 &&
        parsedAvailableDates.some((availableDate) =>
          isSameDay(availableDate, utcDate)
        )
      ) {
        classes.push("available-date");
      }

      // Special class for the day after selected start date (potential checkout)
      if (parsedSelectedDates.length === 1 && parsedSelectedDates[0]) {
        const nextDay = addDays(parsedSelectedDates[0], 1);
        if (isSameDay(utcDate, nextDay)) {
          classes.push("checkout-date");
        }
      }

      const isStartDate =
        parsedSelectedDates[0] && isSameDay(utcDate, parsedSelectedDates[0]);

      const isEndDate =
        parsedSelectedDates[1] && isSameDay(utcDate, parsedSelectedDates[1]);

      if (isStartDate) classes.push("start-date");
      if (isEndDate) classes.push("end-date");

      return classes.join(" ");
    },
    [parsedSelectedDates, parsedAvailableDates, isAddingAvailability, isSameDay]
  );

  return (
    <div className="date-picker-container">
      <ReactDatePicker
        selected={parsedSelectedDates[0] || null}
        onChange={handleDateChange}
        startDate={parsedSelectedDates[0] || null}
        endDate={parsedSelectedDates[1] || null}
        selectsRange={selectsRange}
        inline
        monthsShown={1}
        filterDate={(date) => !isDateDisabled(date)}
        minDate={new Date()}
        calendarClassName="staysphere-calendar"
        dayClassName={getDayClassName}
      />
      {parsedSelectedDates.length === 1 && (
        <div className="date-picker-hint">Please select a checkout date</div>
      )}
    </div>
  );
};

export default memo(DatePicker);
