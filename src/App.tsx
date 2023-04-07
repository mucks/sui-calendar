import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import './App.css'
import { JsonRpcProvider, TransactionBlock, localnetConnection } from '@mysten/sui.js';
import { useEffect, useState } from 'react';
import useContract from './hooks/useContract';
import { Calendar } from './types/Calendar';
import { CalendarEvent } from './types/CalendarEvent';


function App() {
  const contract = useContract();

  // Calendar
  const [calendarName, setCalendarName] = useState('');
  const [calendars, setCalendars] = useState<Calendar[]>([]);

  // Calendar Event
  const [calendarEventName, setCalendarEventName] = useState('');
  const [calendarEventStart, setCalendarEventStart] = useState('');
  const [calendarEventEnd, setCalendarEventEnd] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!contract.isReady) return;
    getCalendars();
  }, [contract.isReady])


  const createCalendarForm = () => {
    return <form>
      <input type="text" placeholder="Calendar Name" onChange={e => setCalendarName(e.target.value)} />
      <button onClick={() => createCalendar()} type="button">Create Calendar</button>
    </form>
  }

  const createCalendar = async () => {
    await contract.createCalendar(calendarName);
    await getCalendars();
  }

  const getCalendars = async () => {
    const calendars = await contract.getCalendars();
    for (const calendar of calendars) {
      await getCalendarEvents(calendar.id);
    }
    setCalendars(calendars);
  }


  const createCalendarEventForm = (calendarId: string) => {
    return <form>
      <input type="text" placeholder="Calendar Event Name" onChange={e => setCalendarEventName(e.target.value)} />

      <label>Start</label>
      <input type="date" onChange={e => setCalendarEventStart(e.target.value)} />
      <label>End</label>
      <input type="date" onChange={e => setCalendarEventEnd(e.target.value)} />

      <button onClick={() => createCalendarEvent(calendarId)} type='button' >Create Calendar Event</button>
    </form>
  }

  const getCalendarEvents = async (calendarId: string) => {
    const calendarEvents = await contract.getCalendarEvents(calendarId);
    setCalendarEvents(calendarEvents);
  }

  const createCalendarEvent = async (calendarId: string) => {
    await contract.createCalendarEvent(calendarId, calendarEventName, calendarEventStart, calendarEventEnd);
    await getCalendarEvents(calendarId);
  }

  const calendarEventListItem = (calendarId: string, calendarEvent: CalendarEvent) => {
    return <li key={calendarEvent.id}>
      <div>
        {calendarEvent.id} : {calendarEvent.title}
      </div>
      <div>
        {calendarEvent.start.toLocaleDateString()} - {calendarEvent.end.toLocaleDateString()}
      </div>
      <div>
        <button onClick={() => deleteCalendarEvent(calendarId, calendarEvent.id)}>Delete</button>
      </div>
    </li>
  }

  const deleteCalendarEvent = async (calendarId: string, calendarEventId: string) => {
    await contract.deleteCalendarEvent(calendarEventId);
    await getCalendarEvents(calendarId);
  }

  const calendarListItem = (calendar: Calendar) => {
    return <li key={calendar.id}>
      <div>
        {calendar.id} : {calendar.title}
        <ul>
          {calendarEvents.map(calendarEvent => calendarEventListItem(calendar.id, calendarEvent))}
        </ul>
        <div>
          {createCalendarEventForm(calendar.id)}
        </div>
      </div>
    </li>
  }

  const calendarList = () => {

    return <div>
      <h1>Calendar List</h1>
      <ul>
        {calendars.map(calendar => calendarListItem(calendar))}
      </ul>
    </div>
  }


  return (
    <div>
      <ConnectButton />
      {createCalendarForm()}
      {calendarList()}
    </div>
  );
}

export default App
