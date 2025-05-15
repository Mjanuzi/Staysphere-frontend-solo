import React, { useCallback, memo, useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { differenceInCalendarDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";
import { eachDayOfInterval } from "date-fns";

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

  // function for date comparison
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
          ? parsedAvailableDates
              .slice(0, 3)
              .map((d) => d.toISOString().split("T")[0]) + "..."
          : "none",
    });
  }

  // Helper function to determine if a date should be disabled
  const isDateDisabled = useCallback(
    (date) => {
      if (!date) return true;
  
      // Get current date in UTC
      const now = new Date();
      const utcToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      
      // Convert input date to UTC midnight
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
      // Disable past dates
      if (utcDate < utcToday) return true;
  
      // Check against booked dates (UTC)
      if (parsedBookedDates.some(bookedDate => 
        isSameDay(bookedDate, utcDate)
      )) {
        return true;
      }
  
      // Check available dates (UTC)
      if (!isAddingAvailability && parsedAvailableDates.length > 0) {
        return !parsedAvailableDates.some(availableDate => 
          isSameDay(availableDate, utcDate)
        );
      }
  
      return false;
    },
    [parsedBookedDates, parsedAvailableDates, isAddingAvailability, isSameDay]
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
      if (newDates.length === 2) {
        const [start, end] = newDates;
  
        // Basic validation for start before end
        if (end < start) {
          onDateChange([start]);
          return;
        }
  
        // Check all dates in the range
        const dateRange = eachDayOfInterval({ start, end });
        const isRangeValid = dateRange.every(date => !isDateDisabled(date));
  
        if (!isRangeValid) {
          // Invalid range; reset to start date only
          newDates = [start];
        }
      }
  
      onDateChange(newDates);
    },
    [onDateChange, isDateDisabled]
  );

  // Determine if we're selecting a range or a single date
  const selectsRange = true; // Always use range selection for consistency

  // Day class name calculator
  const getDayClassName = useCallback(
    (date) => {
      const classes = [];

      // Mark available dates with a special class
      if (
        !isAddingAvailability &&
        parsedAvailableDates.length > 0 &&
        parsedAvailableDates.some((availableDate) =>
          isSameDay(availableDate, date)
        )
      ) {
        classes.push("available-date");
      }

      const isStartDate =
        parsedSelectedDates[0] && isSameDay(date, parsedSelectedDates[0]);

      const isEndDate =
        parsedSelectedDates[1] && isSameDay(date, parsedSelectedDates[1]);

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
    </div>
  );
};

export default memo(DatePicker);
