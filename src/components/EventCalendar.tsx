'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dayjs from 'dayjs'

type Event = {
  id: string
  name: string
  date: string
  address?: string
  phone?: string
  email?: string
  cost?: string
  flyer_url?: string
  application_link?: string
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Filters
  const [keyword, setKeyword] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().add(90, 'day').format('YYYY-MM-DD'))

  useEffect(() => {
    const fetchEvents = async () => {
      let query = supabase.from('events').select(
        'id, name, date, address, phone, email, cost, flyer_url, application_link'
      )

      // Apply date filters
      query = query.gte('date', startDate).lte('date', endDate)

      // Apply keyword filter if provided
      if (keyword.trim() !== '') {
        query = query.ilike('name', `%${keyword}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        setEvents(data || [])
        // Build unique name suggestions
        const names = Array.from(new Set((data || []).map((e) => e.name)))
        setSuggestions(names)
      }
    }

    fetchEvents()
  }, [keyword, startDate, endDate])

  const calendarDays = Array.from({ length: 90 }, (_, i) => dayjs().add(i, 'day'))

  return (
    <div className="mt-10 relative">
      {/* Filter Section */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1">
          <input
            type="text"
            list="event-suggestions"
            placeholder="Search keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <datalist id="event-suggestions">
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Calendar Grid */}
      <h2 className="text-xl font-semibold mb-4">📅 90-Day Calendar</h2>
      <div className="flex overflow-x-auto space-x-2">
        {calendarDays.map((day) => {
          const dayEvents = events.filter((e) =>
            dayjs(e.date).isSame(day, 'day')
          )

          return (
            <div
              key={day.toString()}
              className="min-w-[150px] border rounded p-2 flex-shrink-0"
            >
              <div className="font-bold text-sm">{day.format('MMM D')}</div>
              <div className="mt-2 space-y-1 text-sm">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 underline cursor-pointer"
                    >
                      {event.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No events</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">{selectedEvent.name}</h3>
            <p className="text-sm text-gray-600 mb-1">
              📅 {dayjs(selectedEvent.date).format('MMMM D, YYYY')}
            </p>
            {selectedEvent.address && (
              <p>
                <strong>Address:</strong> {selectedEvent.address}
              </p>
            )}
            {selectedEvent.phone && (
              <p>
                <strong>Phone:</strong> {selectedEvent.phone}
              </p>
            )}
            {selectedEvent.email && (
              <p>
                <strong>Email:</strong> {selectedEvent.email}
              </p>
            )}
            {selectedEvent.cost && (
              <p>
                <strong>Cost:</strong> {selectedEvent.cost}
              </p>
            )}
            {selectedEvent.application_link?.startsWith('http') && (
              <p className="mt-2">
                <a
                  href={selectedEvent.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Application / Event Link
                </a>
              </p>
            )}
            {selectedEvent.flyer_url?.startsWith('http') && (
              <img
                src={selectedEvent.flyer_url}
                alt="Flyer"
                className="mt-3 w-full rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}