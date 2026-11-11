<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreateBookingInput, Room } from '../types/booking'
import { validateBooking } from '../schemas/bookingSchema'

const props = defineProps<{
  rooms: Room[]
  initialDate: string
  initialRoomId: string
  submissionError?: string
}>()

const emit = defineEmits<{
  close: []
  book: [booking: CreateBookingInput]
}>()

const title = ref('')
const roomId = ref(props.initialRoomId)
const date = ref(props.initialDate)
const startTime = ref('10:00')
const endTime = ref('11:00')
const attendees = ref(2)
const validationError = ref('')

const selectedRoom = computed(() => props.rooms.find((room) => room.id === roomId.value))

function submitBooking(): void {
  const booking: CreateBookingInput = {
    title: title.value,
    roomId: roomId.value,
    date: date.value,
    startTime: startTime.value,
    endTime: endTime.value,
    attendees: attendees.value,
  }
  const validation = validateBooking(booking)
  if (!validation.valid) {
    validationError.value = validation.message ?? 'Check the booking details and try again.'
    return
  }

  validationError.value = ''
  emit('book', booking)
}
</script>

<template>
  <div class="dialog-backdrop" @click.self="emit('close')" @keydown.esc="emit('close')">
    <section
      class="booking-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <header class="dialog-header">
        <div>
          <span class="dialog-eyebrow">MAKE IT A GOOD MEETING</span>
          <h2 id="dialog-title">Book a room</h2>
          <p>Bring your people together in the right space.</p>
        </div>
        <button class="dialog-close" type="button" aria-label="Close dialog" @click="emit('close')">×</button>
      </header>

      <form class="booking-form" @submit.prevent="submitBooking">
        <label class="form-field">
          <span>Meeting name</span>
          <input v-model="title" autofocus maxlength="80" placeholder="e.g. Weekly team sync" required />
        </label>

        <label class="form-field">
          <span>Meeting room</span>
          <select v-model="roomId" required>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }} · {{ room.capacity }} people
            </option>
          </select>
        </label>

        <div v-if="selectedRoom" class="selected-room-note">
          <span class="selected-room-icon" aria-hidden="true">⌂</span>
          <span>{{ selectedRoom.location }} <b>·</b> {{ selectedRoom.amenities.slice(0, 2).join(' · ') }}</span>
        </div>

        <label class="form-field">
          <span>Date</span>
          <input v-model="date" type="date" required />
        </label>

        <div class="form-row">
          <label class="form-field">
            <span>Starts</span>
            <input v-model="startTime" type="time" required />
          </label>
          <label class="form-field">
            <span>Ends</span>
            <input v-model="endTime" type="time" required />
          </label>
        </div>

        <label class="form-field">
          <span>Attendees</span>
          <input
            v-model.number="attendees"
            type="number"
            min="1"
            :max="selectedRoom?.capacity ?? 99"
            required
          />
        </label>

        <p v-if="validationError || submissionError" class="form-error" role="alert">
          {{ validationError || submissionError }}
        </p>

        <div class="dialog-actions">
          <button class="button button-secondary" type="button" @click="emit('close')">Cancel</button>
          <button class="button button-primary" type="submit">Confirm booking <span aria-hidden="true">→</span></button>
        </div>
        <p class="form-footnote">You can cancel your booking any time before it starts.</p>
      </form>
    </section>
  </div>
</template>