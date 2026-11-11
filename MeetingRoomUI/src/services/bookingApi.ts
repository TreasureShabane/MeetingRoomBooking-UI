import type { Booking, CreateBookingInput, Room } from '../types/booking'

const rooms: Room[] = [
  {
    id: 'atlas',
    name: 'The Atlas Room',
    location: 'Level 2 · West wing',
    capacity: 10,
    description: 'A bright, flexible space for your next big idea.',
    amenities: ['Display', 'Video calls', 'Whiteboard', 'Natural light'],
  },
  {
    id: 'studio',
    name: 'Studio Two',
    location: 'Level 1 · Creative hub',
    capacity: 6,
    description: 'A cosy creative space for small, focused teams.',
    amenities: ['Display', 'Whiteboard', 'Video calls'],
  },
  {
    id: 'summit',
    name: 'Summit Boardroom',
    location: 'Level 4 · North wing',
    capacity: 14,
    description: 'A considered space for conversations that matter.',
    amenities: ['Video calls', 'Display', 'Conference phone', 'Catering'],
  },
  {
    id: 'garden',
    name: 'The Garden Room',
    location: 'Level 3 · East wing',
    capacity: 8,
    description: 'A calm, light-filled room to reset and reconnect.',
    amenities: ['Natural light', 'Whiteboard', 'Display'],
  },
]

function localDateOffset(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

let bookings: Booking[] = [
  {
    id: 'demo-1',
    roomId: 'atlas',
    title: 'Weekly product sync',
    date: localDateOffset(0),
    startTime: '09:30',
    endTime: '10:30',
    attendees: 8,
    status: 'confirmed',
  },
  {
    id: 'demo-2',
    roomId: 'studio',
    title: 'Design critique',
    date: localDateOffset(0),
    startTime: '11:00',
    endTime: '12:00',
    attendees: 5,
    status: 'confirmed',
  },
  {
    id: 'demo-3',
    roomId: 'summit',
    title: 'Planning session',
    date: localDateOffset(1),
    startTime: '13:00',
    endTime: '14:30',
    attendees: 12,
    status: 'confirmed',
  },
]

export const bookingApi = {
  getRooms(): Room[] {
    return rooms.map((room) => ({ ...room, amenities: [...room.amenities] }))
  },

  getBookings(): Booking[] {
    return bookings.map((booking) => ({ ...booking }))
  },

  createBooking(input: CreateBookingInput): Booking {
    const booking: Booking = {
      ...input,
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'confirmed',
    }
    bookings = [...bookings, booking]
    return { ...booking }
  },

  cancelBooking(bookingId: string): void {
    bookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking,
    )
  },
}