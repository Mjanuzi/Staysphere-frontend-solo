const DatePicker = ({
    selectedDates = [],
    onDateChange,
    bookedDates = [],
    availableDates = [],
    isAddingAvailability = false,
    debug = false,
  }) => {
    // function for date comparison
    const isSameDay = useCallback((date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
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
  
    // Parse all date arrays memoized function
    const parsedSelectedDates = parseDates(selectedDates);
    const parsedBookedDates = parseDates(bookedDates);
    const parsedAvailableDates = parseDates(availableDates);
  
    // Conditionally log debug information
    if (debug) {
      console.log("DatePicker - Date Data:", {
        selectedDates,
        availableDates: availableDates.length,
        bookedDates: bookedDates.length,
      });
    }
  
    // Helper function to determine if a date should be disabled
    const isDateDisabled = useCallback(
      (date) => {
        // Past dates are always disabled
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return true;
  
        // If it's a booked date, disable it
        if (parsedBookedDates.some((bookedDate) => isSameDay(bookedDate, date))) {
          return true;
        }
  
        // If we're in booking mode (not adding availability)
        if (!isAddingAvailability) {
          // If there are available dates and this date is not in that list, disable it
          if (parsedAvailableDates.length > 0) {
            return !parsedAvailableDates.some((availableDate) =>
              isSameDay(availableDate, date)
            );
          }
        }
  
        return false;
      },
      [parsedBookedDates, parsedAvailableDates, isAddingAvailability, isSameDay]
    );
  
    // Handle date changes
    const handleDateChange = useCallback(
      (dates) => {
        if (!dates) {
          onDateChange([]);
          return;
        }
  
        // If it's an array with start and end dates
        if (Array.isArray(dates) && dates.length === 2) {
          onDateChange(dates);
        }
        // If it's a single date (or first selection in a range)
        else if (dates instanceof Date) {
          onDateChange([dates]);
        }
      },
      [onDateChange]
    );
  
    //selecting a range or a single date
    const selectsRange = isAddingAvailability || parsedSelectedDates.length > 0;
  
    //day class name calculator
    const getDayClassName = useCallback(
      (date) => {
        const classes = [];
  
        const isStartDate =
          parsedSelectedDates[0] && isSameDay(date, parsedSelectedDates[0]);
  
        const isEndDate =
          parsedSelectedDates[1] && isSameDay(date, parsedSelectedDates[1]);
  
        if (isStartDate) classes.push("start-date");
        if (isEndDate) classes.push("end-date");
  
        return classes.join(" ");
      },
      [parsedSelectedDates, isSameDay]
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