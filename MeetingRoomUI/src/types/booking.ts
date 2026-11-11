export interface Room {
  id: string
  name: string
  location: string
  capacity: number
  description: string
  amenities: string[]
}

export type BookingStatus = 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  roomId: string
  title: string
  date: string
  startTime: string
  endTime: string
  attendees: number
  status: BookingStatus
}

export interface CreateBookingInput {
  roomId: string
  title: string
  date: string
  startTime: string
  endTime: string
  attendees: number
}
