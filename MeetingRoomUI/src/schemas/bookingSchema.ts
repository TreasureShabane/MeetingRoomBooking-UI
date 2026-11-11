import type { CreateBookingInput } from '../types/booking'

export interface ValidationResult {
  valid: boolean
  message?: string
}

export function validateBooking(input: CreateBookingInput): ValidationResult {
  if (!input.title.trim()) {
    return { valid: false, message: 'Add a meeting name to continue.' }
  }

  if (!input.roomId || !input.date || !input.startTime || !input.endTime) {
    return { valid: false, message: 'Complete all the required fields.' }
  }

  if (input.startTime >= input.endTime) {
    return { valid: false, message: 'The end time must be after the start time.' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const bookingDate = new Date(`${input.date}T00:00:00`)
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) {
    return { valid: false, message: 'Choose today or a future date.' }
  }

  if (!Number.isInteger(input.attendees) || input.attendees < 1) {
    return { valid: false, message: 'At least one attendee is required.' }
  }

  return { valid: true }
}