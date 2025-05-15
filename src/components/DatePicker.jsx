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