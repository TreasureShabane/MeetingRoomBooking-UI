import { computed, reactive } from 'vue'
import { bookingApi } from '../services/bookingApi'
import { validateBooking } from '../schemas/bookingSchema'
import type { Booking, CreateBookingInput } from '../types/booking'

const rooms = bookingApi.getRooms()
const state = reactive({ bookings: bookingApi.getBookings() })

export function useBookingStore() {
  function createBooking(input: CreateBookingInput): Booking {
    const validation = validateBooking(input)
    if (!validation.valid) {
      throw new Error(validation.message ?? 'The booking details are invalid.')
    }

    const room = rooms.find((candidate) => candidate.id === input.roomId)
    if (!room) {
      throw new Error('That meeting room could not be found.')
    }

    if (input.attendees > room.capacity) {
      throw new Error(`This room can accommodate up to ${room.capacity} people.`)
    }

    const overlappingBooking = state.bookings.find(
      (booking) =>
        booking.roomId === input.roomId &&
        booking.date === input.date &&
        booking.status === 'confirmed' &&
        input.startTime < booking.endTime &&
        input.endTime > booking.startTime,
    )
    if (overlappingBooking) {
      throw new Error('This room is already booked for part of that time. Try another time.')
    }

    const booking = bookingApi.createBooking(input)
    state.bookings.push(booking)
    return booking
  }

  function cancelBooking(bookingId: string): void {
    const bookingIndex = state.bookings.findIndex((booking) => booking.id === bookingId)
    if (bookingIndex < 0) {
      throw new Error('This booking could not be found.')
    }

    bookingApi.cancelBooking(bookingId)
    state.bookings[bookingIndex] = { ...state.bookings[bookingIndex]!, status: 'cancelled' }
  }

  return {
    rooms,
    bookings: computed(() => state.bookings.filter((booking) => booking.status === 'confirmed')),
    createBooking,
    cancelBooking,
  }
}