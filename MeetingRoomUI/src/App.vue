<script setup lang="ts">
import { computed, ref } from 'vue'
import BookingDialog from './components/BookingDialog.vue'
import { useBookingStore } from './stores/bookingStore'
import type { CreateBookingInput } from './types/booking'

const { bookings, rooms, createBooking, cancelBooking } = useBookingStore()
const selectedDate = ref(toDateInputValue(new Date()))
const searchQuery = ref('')
const capacityFilter = ref('any')
const showBookingDialog = ref(false)
const activeNav = ref('Overview')
const bookingError = ref('')
const bookingRoomId = ref(rooms[0]?.id ?? '')

const filteredRooms = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return rooms.filter((room) => {
    const matchesQuery =
      !query ||
      room.name.toLowerCase().includes(query) ||
      room.location.toLowerCase().includes(query) ||
      room.amenities.some((amenity) => amenity.toLowerCase().includes(query))
    const matchesCapacity =
      capacityFilter.value === 'any' || room.capacity >= Number(capacityFilter.value)

    return matchesQuery && matchesCapacity
  })
})

const todaysBookings = computed(() =>
  bookings.value
    .filter((booking) => booking.date === selectedDate.value)
    .sort((first, second) => first.startTime.localeCompare(second.startTime)),
)

const availableRoomCount = computed(
  () =>
    rooms.filter(
      (room) =>
      !bookings.value.some(
          (booking) =>
            booking.roomId === room.id &&
            booking.date === selectedDate.value &&
            booking.status === 'confirmed',
        ),
    ).length,
)

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(
    new Date(`${selectedDate.value}T12:00:00`),
  ),
)

function toDateInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function changeDate(offset: number): void {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + offset)
  selectedDate.value = toDateInputValue(date)
}

function formatTime(time: string): string {
  const [hours = '0', minutes = '00'] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  )
}

function handleCancel(bookingId: string): void {
  cancelBooking(bookingId)
}

function openBookingDialog(roomId = rooms[0]?.id ?? ''): void {
  bookingRoomId.value = roomId
  bookingError.value = ''
  showBookingDialog.value = true
}

function handleBooking(input: CreateBookingInput): void {
  try {
    createBooking(input)
    bookingError.value = ''
    showBookingDialog.value = false
  } catch (error) {
    bookingError.value =
      error instanceof Error ? error.message : 'We could not complete your booking. Please try again.'
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="Gather home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M5 8.5 16 3l11 5.5v15L16 29 5 23.5v-15Z" />
            <path d="m5.5 8.5 10.5 5.4 10.5-5.4M16 14v14" />
          </svg>
        </span>
        <span>gather<span class="brand-period">.</span></span>
      </a>

      <div class="workspace-label">WORKSPACE</div>
      <nav class="primary-nav" aria-label="Main navigation">
        <button
          v-for="item in ['Overview', 'My bookings', 'Meeting rooms']"
          :key="item"
          class="nav-item"
          :class="{ 'nav-item-active': activeNav === item }"
          type="button"
          @click="activeNav = item"
        >
          <svg v-if="item === 'Overview'" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
          </svg>
          <svg v-else-if="item === 'My bookings'" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="5.5" width="16" height="15" rx="2" />
            <path d="M8 3.5v4M16 3.5v4M4 10h16M8 14h3M8 17h6" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 20.5V9l8.5-5 8.5 5v11.5h-17Z" />
            <path d="M8 20.5v-7h8v7M8 9.5h.01M12 9.5h.01M16 9.5h.01" />
          </svg>
          {{ item }}
          <span v-if="item === 'My bookings'" class="nav-count">{{ bookings.length }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="help-card">
          <span class="help-icon" aria-hidden="true">?</span>
          <div>
            <strong>Need a hand?</strong>
            <p>We're here to help.</p>
            <a href="mailto:workplace@example.com">Contact workplace team <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <button class="profile-button" type="button">
          <span class="avatar">JD</span>
          <span class="profile-details"><strong>Jordan Davis</strong><small>Product team</small></span>
          <span class="profile-more" aria-hidden="true">•••</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumbs"><span>Workspace</span><span class="crumb-divider">/</span> Overview</div>
        <div class="topbar-actions">
          <span class="office-indicator"><span class="online-dot"></span> San Francisco office</span>
          <button class="icon-button notification-button" type="button" aria-label="Notifications">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </svg>
            <span class="notification-dot"></span>
          </button>
        </div>
      </header>

      <div class="page-content">
        <section class="welcome-row">
          <div>
            <p class="eyebrow">YOUR WORKPLACE, MADE SIMPLE</p>
            <h1>Good morning, Jordan <span aria-hidden="true">✦</span></h1>
            <p class="welcome-subtitle">Find your space, bring your people together.</p>
          </div>
          <button class="button button-primary" type="button" @click="openBookingDialog()">
            <span class="button-plus" aria-hidden="true">+</span> Book a room
          </button>
        </section>

        <section class="hero-card" aria-label="Today's availability">
          <div class="hero-content">
            <span class="hero-kicker"><span class="sparkle" aria-hidden="true">✳</span> MAKE TODAY A GOOD MEETING</span>
            <h2>A little space<br />for big ideas.</h2>
            <p>Great things happen when everyone has room to think.</p>
            <button class="hero-link" type="button" @click="openBookingDialog()">
              Find your room <span aria-hidden="true">→</span>
            </button>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="art-sun"></div>
            <div class="art-window"><span></span><span></span><span></span></div>
            <div class="art-plant art-plant-one"><i></i><i></i><i></i><b></b></div>
            <div class="art-plant art-plant-two"><i></i><i></i><i></i><b></b></div>
            <div class="art-table"></div>
            <div class="art-chair"></div>
          </div>
          <div class="hero-note"><span>✦</span> Good ideas grow together</div>
        </section>

        <section class="overview-strip" aria-label="Booking overview">
          <div class="overview-date">
            <div class="calendar-icon" aria-hidden="true">
              <span>{{ new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${selectedDate}T12:00:00`)) }}</span>
              <strong>{{ new Date(`${selectedDate}T12:00:00`).getDate() }}</strong>
            </div>
            <div><span class="metric-label">YOUR DAY AT A GLANCE</span><strong>{{ formattedDate }}</strong></div>
          </div>
          <div class="overview-stat">
            <span class="stat-icon stat-icon-green" aria-hidden="true">↗</span>
            <div><strong>{{ availableRoomCount }}<small> / {{ rooms.length }}</small></strong><span>rooms available</span></div>
          </div>
          <div class="overview-stat">
            <span class="stat-icon stat-icon-peach" aria-hidden="true">▦</span>
            <div><strong>{{ todaysBookings.length }}</strong><span>bookings today</span></div>
          </div>
          <button class="overview-arrow" type="button" aria-label="Book a room" @click="openBookingDialog()">→</button>
        </section>

        <section class="rooms-section">
          <div class="section-heading">
            <div>
              <div class="section-title-row"><h2>Find your space</h2><span class="room-count">{{ filteredRooms.length }} rooms</span></div>
              <p>Spaces made for getting things done, together.</p>
            </div>
            <div class="date-control">
              <button type="button" aria-label="Previous day" @click="changeDate(-1)">‹</button>
              <label>
                <span class="sr-only">Booking date</span>
                <input v-model="selectedDate" type="date" />
              </label>
              <button type="button" aria-label="Next day" @click="changeDate(1)">›</button>
            </div>
          </div>

          <div class="room-filters">
            <label class="search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
              <input v-model="searchQuery" type="search" placeholder="Search rooms or amenities" />
            </label>
            <label class="capacity-select">
              <span class="sr-only">Minimum room capacity</span>
              <select v-model="capacityFilter">
                <option value="any">Any capacity</option>
                <option value="4">4+ people</option>
                <option value="8">8+ people</option>
                <option value="12">12+ people</option>
              </select>
            </label>
          </div>

          <div v-if="filteredRooms.length" class="room-grid">
            <article v-for="(room, index) in filteredRooms" :key="room.id" class="room-card">
              <div class="room-image" :class="`room-image-${index % 4}`">
                <div class="room-image-label"><span class="room-live-dot"></span> {{ room.location }}</div>
                <div class="room-art-shape room-art-shape-one"></div>
                <div class="room-art-shape room-art-shape-two"></div>
                <div class="room-art-window"></div>
                <div class="room-art-furniture"></div>
                <div class="room-image-footer">
                  <span class="capacity-pill"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7" cy="6" r="2.5"/><path d="M2.5 15c.2-2.5 1.8-4 4.5-4s4.3 1.5 4.5 4M13 4a2.3 2 0 0 1 0 4.5M14 11c2.1.3 3.2 1.6 3.5 3.5"/></svg>{{ room.capacity }} people</span>
                  <span class="image-booking-count">{{ bookings.filter((booking) => booking.roomId === room.id && booking.date === selectedDate && booking.status === 'confirmed').length }} booked</span>
                </div>
              </div>
              <div class="room-card-body">
                <div class="room-card-title"><h3>{{ room.name }}</h3><span class="room-status"><span></span> Ready</span></div>
                <p class="room-description">{{ room.description }}</p>
                <div class="amenity-list">
                  <span v-for="amenity in room.amenities.slice(0, 3)" :key="amenity">{{ amenity }}</span>
                  <span v-if="room.amenities.length > 3" class="more-amenities">+{{ room.amenities.length - 3 }}</span>
                </div>
                <button class="room-book-button" type="button" @click="openBookingDialog(room.id)">
                  Book this room <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">
            <span aria-hidden="true">⌕</span>
            <h3>No rooms found</h3>
            <p>Try a different search or lower the capacity filter.</p>
            <button type="button" @click="searchQuery = ''; capacityFilter = 'any'">Clear filters</button>
          </div>
        </section>

        <section class="schedule-section">
          <div class="section-heading schedule-heading">
            <div><h2>Your schedule</h2><p>Keep your day moving smoothly.</p></div>
            <button class="text-button" type="button" @click="activeNav = 'My bookings'">View all bookings <span aria-hidden="true">→</span></button>
          </div>
          <div v-if="todaysBookings.length" class="schedule-list">
            <article v-for="booking in todaysBookings" :key="booking.id" class="schedule-item">
              <div class="schedule-time">{{ formatTime(booking.startTime) }}<span>{{ formatTime(booking.endTime) }}</span></div>
              <div class="schedule-timeline"><span></span></div>
              <div class="schedule-details">
                <div><h3>{{ booking.title }}</h3><span class="schedule-room">{{ rooms.find((room) => room.id === booking.roomId)?.name }}</span></div>
                <span class="booking-confirmed"><span></span> Confirmed</span>
                <button class="cancel-button" type="button" :aria-label="`Cancel ${booking.title}`" @click="handleCancel(booking.id)">Cancel</button>
              </div>
            </article>
          </div>
          <div v-else class="schedule-empty">
            <span class="schedule-empty-icon" aria-hidden="true">☀</span>
            <div><strong>A clear day is a good day.</strong><p>No bookings for {{ formatShortDate(selectedDate) }} yet.</p></div>
            <button class="text-button" type="button" @click="openBookingDialog()">Plan a meeting <span aria-hidden="true">→</span></button>
          </div>
        </section>
        <footer class="page-footer"><span>Made for better workdays.</span><span>Need support? <a href="mailto:workplace@example.com">Get in touch</a></span></footer>
      </div>
    </main>

    <BookingDialog
      v-if="showBookingDialog"
      :rooms="rooms"
      :initial-date="selectedDate"
      :initial-room-id="bookingRoomId"
      :submission-error="bookingError"
      @close="showBookingDialog = false"
      @book="handleBooking"
    />
  </div>
</template>
