import React from 'react';
import './SlotGrid.css';

const SlotGrid = ({ slots, selectedSlot, onSelectSlot }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="slots-empty-state">
        <p>No available slots found for the selected date and doctor.</p>
      </div>
    );
  }

  return (
    <div className="slots-grid-container">
      {slots.map((slot, index) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;
        
        let buttonClass = 'slot-btn';
        if (slot.isBooked) {
          buttonClass += ' slot-booked';
        } else if (slot.isPast) {
          buttonClass += ' slot-past';
        } else {
          buttonClass += ' slot-available';
          if (isSelected) {
            buttonClass += ' slot-selected';
          }
        }

        return (
          <button
            key={index}
            className={buttonClass}
            disabled={!slot.isAvailable}
            onClick={() => slot.isAvailable && onSelectSlot(slot)}
            type="button"
          >
            <span className="slot-time">{slot.startTime}</span>
            <span className="slot-status">
              {slot.isBooked ? 'Booked' : slot.isPast ? 'Past' : 'Available'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SlotGrid;
