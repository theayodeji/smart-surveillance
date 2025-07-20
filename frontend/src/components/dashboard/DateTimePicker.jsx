import React from 'react';
import { Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';

export const DateTimePicker = ({ value, onChange, onClear }) => {
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className="flex items-center gap-2 pl-3 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <Calendar size={16} className="text-gray-500" />
        <span className="text-gray-700">
          {value || 'Select date and time'}
        </span>
      </button>
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  ));

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      maxDate={new Date()}
      placeholderText="Select date and time"
      className="w-full"
      customInput={<CustomInput />}
      popperClassName="z-50"
      popperPlacement="bottom-start"
      calendarClassName="react-datepicker-custom"
      timeClassName={() => "react-datepicker-time"}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            type="button"
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="font-medium text-gray-900 text-sm">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)}
          </div>
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            type="button"
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      wrapperClassName="w-full"
      dayClassName={(date) => {
        const day = date.getDate();
        return day % 2 === 0 ? 'even-day' : 'odd-day';
      }}
      renderDayContents={(day) => (
        <div className="react-datepicker-day-inner">
          {day}
        </div>
      )}
    />
  );
};

export default DateTimePicker;
