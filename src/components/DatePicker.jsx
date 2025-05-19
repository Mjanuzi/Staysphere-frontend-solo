import React, { useCallback, memo, useState, useEffect, useMemo } from "react";
import ReactDatePicker from "react-datepicker";
import { differenceInCalendarDays, format, addDays } from "date-fns";
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
 * @param {Function} props.onNightCountChange - Optional callback that returns the number of nights selected
 * @param {Array} props.availableDateStrings - Raw date strings from MongoDB for direct comparison
 * @param {Function} props.isDateAvailable - Function to check date availability using string comparison
 */
const DatePicker = ({
  selectedDates = [],
  onDateChange,
  bookedDates = [],
  availableDates = [],
  isAddingAvailability = false,
  onNightCountChange = null,
  availableDateStrings = [],
  isDateAvailable = null,
}) => {
  // Internal night count state
  const [nightCount, setNightCount] = useState(0);

  // Format date to YYYY-MM-DD string (timezone-safe)
  const formatDateString = useCallback((date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
    return format(date, "yyyy-MM-dd");
  }, []);

  // Parse string dates to Date objects with timezone handling
  const parseStringToDate = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;

    try {
      // For LocalDate style strings (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Force noon UTC to avoid timezone issues
        return new Date(`${dateStr}T12:00:00Z`);
      }

      // Fallback to standard Date constructor
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }, []);

  // Create a date lookup for fast checking
  const availableDatesLookup = useMemo(() => {
    const lookup = new Set();

    // Add all the date strings
    if (availableDateStrings?.length > 0) {
      availableDateStrings.forEach((dateStr) => {
        if (dateStr) lookup.add(dateStr);
      });
    }

    // Also add formatted dates from the availableDates array
    if (availableDates?.length > 0) {
      availableDates.forEach((date) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
          lookup.add(formatDateString(date));
        }
      });
    }

    return lookup;
  }, [availableDateStrings, availableDates, formatDateString]);

  // Parse dates to ensure they're Date objects
  const ensureDates = useCallback(
    (dates) => {
      if (!dates || !Array.isArray(dates)) return [];

      return dates
        .map((date) => {
          if (!date) return null;
          if (date instanceof Date) return date;
          if (typeof date === "string") return parseStringToDate(date);
          return null;
        })
        .filter((date) => date !== null && !isNaN(date.getTime()));
    },
    [parseStringToDate]
  );

  // date arrays - memoize
  const parsedSelectedDates = useMemo(
    () => ensureDates(selectedDates),
    [selectedDates, ensureDates]
  );

  const parsedBookedDates = useMemo(
    () => ensureDates(bookedDates),
    [bookedDates, ensureDates]
  );

  //compare dates for equal
  const areDatesEqual = useCallback(
    (date1, date2) => {
      if (!date1 || !date2) return false;
      const str1 = formatDateString(date1);
      const str2 = formatDateString(date2);
      return str1 === str2 && str1 !== null;
    },
    [formatDateString]
  );

  // Check if a date is available
  const isDateInAvailableDates = useCallback(
    (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime()))
        return false;

      // First try with provided isDateAvailable function
      if (isDateAvailable && typeof isDateAvailable === "function") {
        return isDateAvailable(date);
      }

      // Then use our internal lookup which is faster
      const dateString = formatDateString(date);
      return dateString && availableDatesLookup.has(dateString);
    },
    [isDateAvailable, formatDateString, availableDatesLookup]
  );

  // Check if a date is booked
  const isDateBooked = useCallback(
    (date) =>
      parsedBookedDates.some((bookedDate) => areDatesEqual(date, bookedDate)),
    [parsedBookedDates, areDatesEqual]
  );

  // Find last available date in current selection range
  const findLastAvailableDate = useCallback(() => {
    const selectedStartDate = parsedSelectedDates[0];
    if (!selectedStartDate || !isDateInAvailableDates(selectedStartDate))
      return null;

    // Find the latest available date that's consecutive with our selected date
    let lastAvailableDate = selectedStartDate;
    let currentDate;

    for (let i = 1; i <= 30; i++) {
      // Check up to 30 days ahead
      currentDate = addDays(selectedStartDate, i);

      if (isDateInAvailableDates(currentDate)) {
        // If days are consecutive, update the last available date
        if (areDatesEqual(currentDate, addDays(lastAvailableDate, 1))) {
          lastAvailableDate = currentDate;
        } else {
          break; // Found a gap, stop looking
        }
      } else {
        break; // Found a non-available date, stop looking
      }
    }

    return lastAvailableDate;
  }, [parsedSelectedDates, isDateInAvailableDates, areDatesEqual]);

  // Calculate nights when both dates are selected
  useEffect(() => {
    if (
      parsedSelectedDates.length === 2 &&
      parsedSelectedDates[0] &&
      parsedSelectedDates[1]
    ) {
      const startDate = parsedSelectedDates[0];
      const endDate = parsedSelectedDates[1];

      if (endDate > startDate) {
        const nights = differenceInCalendarDays(endDate, startDate);
        setNightCount(nights);
        if (onNightCountChange) onNightCountChange(nights);
      } else {
        setNightCount(0);
        if (onNightCountChange) onNightCountChange(0);
      }
    } else {
      setNightCount(0);
      if (onNightCountChange) onNightCountChange(0);
    }
  }, [parsedSelectedDates, onNightCountChange]);

  // Determine if a date should be disabled
  const isDateDisabled = useCallback(
    (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime()))
        return true;

      // Disable past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;

      // If in availability mode, don't disable future dates
      if (isAddingAvailability) {
        return false;
      }

      // Disable booked dates for normal booking mode
      if (isDateBooked(date)) return true;

      // Special case: checkout date selection
      if (parsedSelectedDates.length === 1 && parsedSelectedDates[0]) {
        const startDate = parsedSelectedDates[0];
        const nextDay = addDays(startDate, 1);

        if (areDatesEqual(date, nextDay)) {
          // Check if the start date was the last available date
          const lastAvailableDate = findLastAvailableDate();

          if (
            lastAvailableDate &&
            areDatesEqual(startDate, lastAvailableDate)
          ) {
            return false; // Allow checkout on next day after last available date
          }

          // Otherwise, checkout date must also be available
          return !isDateInAvailableDates(date);
        }
      }

      // Standard availability check for booking mode
      return !isAddingAvailability && !isDateInAvailableDates(date);
    },
    [
      parsedSelectedDates,
      isDateBooked,
      isDateInAvailableDates,
      areDatesEqual,
      isAddingAvailability,
      findLastAvailableDate,
    ]
  );

  // Handle date changes
  const handleDateChange = useCallback(
    (dates) => {
      if (!dates) {
        onDateChange([]);
        return;
      }

      // Normalize dates array
      let newDates = Array.isArray(dates) ? [...dates] : [dates];

      // In availability mode, just pass the dates through without validation
      if (isAddingAvailability) {
        // Make sure we have proper Date objects
        if (newDates.length > 0) {
          // Log for debugging
          /*console.log(
            "DatePicker handling date selection in availability mode:",
            newDates
          );*/

          // Make sure we have proper Date objects
          newDates = newDates.map((date) => {
            if (date instanceof Date && !isNaN(date.getTime())) {
              return date;
            }
            return null;
          });
        }

        onDateChange(newDates);
        return;
      }

      // For booking mode, apply all the validations
      if (newDates.length === 2 && newDates[0] && newDates[1]) {
        const [start, end] = newDates;

        // Basic validation for start before end
        if (end < start) {
          onDateChange([start]);
          return;
        }

        // Check every date in the range (except checkout day)
        let currentDate = new Date(start);
        while (currentDate < end) {
          if (isDateDisabled(currentDate)) {
            onDateChange([end]);
            return;
          }

          // Move to next day
          currentDate = addDays(currentDate, 1);
        }
      }

      onDateChange(newDates);
    },
    [onDateChange, isDateDisabled, isAddingAvailability]
  );

  // Day class name calculator for styling
  const getDayClassName = useCallback(
    (date) => {
      const classes = [];

      // Mark available dates
      if (isDateInAvailableDates(date)) {
        classes.push("available-date");
      }

      // Special class for day after a selected start date (for booking mode)
      if (
        !isAddingAvailability &&
        parsedSelectedDates.length === 1 &&
        parsedSelectedDates[0]
      ) {
        const nextDay = addDays(parsedSelectedDates[0], 1);
        if (areDatesEqual(date, nextDay)) {
          classes.push("checkout-date");
        }
      }

      // Start/end date classes
      if (
        parsedSelectedDates[0] &&
        areDatesEqual(date, parsedSelectedDates[0])
      ) {
        classes.push("start-date");
      }

      if (
        parsedSelectedDates[1] &&
        areDatesEqual(date, parsedSelectedDates[1])
      ) {
        classes.push("end-date");
      }

      return classes.join(" ");
    },
    [
      parsedSelectedDates,
      isDateInAvailableDates,
      areDatesEqual,
      isAddingAvailability,
    ]
  );

  // Get the appropriate hint text
  const getHintText = () => {
    if (isAddingAvailability) {
      return "Please select an end date";
    }

    return "Please select a checkout date";
  };

  return (
    <div className="date-picker-container">
      <ReactDatePicker
        selected={parsedSelectedDates[0] || null}
        onChange={handleDateChange}
        startDate={parsedSelectedDates[0] || null}
        endDate={parsedSelectedDates[1] || null}
        selectsRange={true}
        inline
        monthsShown={1}
        filterDate={(date) => !isDateDisabled(date)}
        minDate={new Date()}
        calendarClassName="staysphere-calendar"
        dayClassName={getDayClassName}
      />
      {parsedSelectedDates.length === 1 && (
        <div className="date-picker-hint">{getHintText()}</div>
      )}
    </div>
  );
};

export default memo(DatePicker);
