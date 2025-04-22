'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dayjs from 'dayjs'

type Event = {
  id: string
  name: string
  date: string
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      

      const { data, error } = await supabase
        .from('events')
        .select('id, name, date')
        

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        console.log('Fetched events:', data)
        setEvents(data || [])
        console.log('Parsed event dates:', (data || []).map(e => ({ name: e.name, date: dayjs(e.date).format() })))
      }
    }

    fetchEvents()
  }, [])

  const calendarDays = Array.from({ length: 90 }, (_, i) =>
    dayjs().add(i, 'day')
  )

  return (
    <div className="mt-10">
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
                    <div key={event.id} className="text-blue-600 underline cursor-pointer">
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
    </div>
  )
}