import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import './App.css'
import { JsonRpcProvider, TransactionBlock, localnetConnection } from '@mysten/sui.js';
import { useEffect, useState } from 'react';
import useContract from './hooks/useContract';
import { Calendar } from './types/Calendar';


function App() {
  const contract = useContract();
  const [calendarName, setCalendarName] = useState('');
  const [calendars, setCalendars] = useState<Calendar[]>([]);

  useEffect(() => {
    if (!contract.isReady) return;
    getCalendars();
  }, [contract.isReady])


  const createCalendarForm = () => {
    return <form>
      <input type="text" placeholder="Calendar Name" onChange={e => setCalendarName(e.target.value)} />
      <button onClick={() => contract.createCalendar(calendarName)} type="button">Create Calendar</button>
    </form>
  }

  const getCalendars = async () => {
    const calendars = await contract.getCalendars();
    setCalendars(calendars);
  }

  const calendarList = () => {
    const calendarListItem = (calendar: Calendar) => {
      return <li key={calendar.id}>{calendar.id} : {calendar.title}</li>
    }

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
      <button onClick={() => contract.debugPrintMessage("Hello")}>Debug Print Message</button>
      {createCalendarForm()}
      {calendarList()}

    </div>
  );
}

export default App
