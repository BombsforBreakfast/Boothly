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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date, address, phone, email, cost, flyer_url, application_link')

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        console.log('Fetched events:', data)
        setEvents(data || [])
      }
    }

    fetchEvents()
  }, [])

  const calendarDays = Array.from({ length: 90 }, (_, i) =>
    dayjs().add(i, 'day')
  )

  return (
    <div className="mt-10 relative">
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
            <p className="text-sm text-gray-600 mb-1">📅 {dayjs(selectedEvent.date).format('MMMM D, YYYY')}</p>
            {selectedEvent.address && <p><strong>Address:</strong> {selectedEvent.address}</p>}
            {selectedEvent.phone && <p><strong>Phone:</strong> {selectedEvent.phone}</p>}
            {selectedEvent.email && <p><strong>Email:</strong> {selectedEvent.email}</p>}
            {selectedEvent.cost && <p><strong>Cost:</strong> {selectedEvent.cost}</p>}
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