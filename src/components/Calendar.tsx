import { useEffect, useState } from "react";
import { CalendarType } from "../types/CalendarType";
import CreateCalendarEventForm from "./CreateCalendarEventForm";
import { Contract } from "../hooks/useContract";
import { CalendarEventType } from "../types/CalendarEventType";
import { Box, Button, Card, CardContent, Dialog, DialogTitle, Typography } from "@mui/material";
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import ReactCalendar from 'react-calendar';

const sameDay = (a: Date, b: Date) => {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

const betweenDays = (start: Date, end: Date, date: Date) => {
    if (date.getTime() > start.getTime()) return false;
    if (date.getTime() < end.getTime()) return false;
    return true;
}


export default function Calendar({ calendar, contract }: { calendar: CalendarType, contract: Contract }) {
    const [calendarEvents, setCalendarEvents] = useState<CalendarEventType[]>([]);
    const [dialog, setDialog] = useState(false);
    const [event, setEvent] = useState<CalendarEventType | null>(null);


    useEffect(() => {
        if (!contract.isReady) return;
        getCalendarEvents();
    }, [calendar])



    const getCalendarEvents = async () => {
        const calendarEvents = await contract.getCalendarEvents(calendar.id);
        setCalendarEvents(calendarEvents);
    }

    const deleteCalendarEvent = async (calendarEventId: string) => {
        await contract.deleteCalendarEvent(calendarEventId);
        await getCalendarEvents();
        setEvent(null);
    }

    const showEvent = (event: CalendarEventType) => {
        setEvent(event);
    }

    const renderEventDialog = () => {
        if (!event) return;
        return <Dialog open={event != null} onClose={() => setEvent(null)}>
            <DialogTitle>{event.title}</DialogTitle>
            <Box sx={{ p: 2 }}>
                <p>{event.start.toLocaleDateString()} - {event.end.toLocaleDateString()}</p>
                <Button onClick={() => deleteCalendarEvent(event.id)}>Delete</Button>
            </Box>
        </Dialog>
    }

    const renderCreateCalendarEventDialog = () => {
        return <>
            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Create Calendar Event</DialogTitle>
                <Box sx={{ p: 2 }}>
                    <CreateCalendarEventForm calendarId={calendar.id} contract={contract} onCreate={() => { setDialog(false); getCalendarEvents(); }} />
                </Box>
            </Dialog>
            <Button onClick={() => setDialog(true)}>Create Calendar Event</Button>
        </>
    };


    const renderEventContent = (event?: CalendarEventType) => {
        if (!event) return;
        return <p onClick={() => showEvent(event)}>{event.title}</p>
    }

    const hasEvent = (event: CalendarEventType, date: Date) => {
        return sameDay(event.start, date) || sameDay(event.end, date) || betweenDays(event.start, event.end, date);
    }


    const hasEvents = (date: Date) => {
        return calendarEvents.some((event: CalendarEventType) => hasEvent(event, date));
    }

    const tileContents = (date: Date, view: string) => {
        if (view === 'month' && hasEvents(date)) {
            return renderEventContent(calendarEvents.find(event => hasEvent(event, date)));
        }
    }

    return <Card>
        <CardContent>
            <Typography>Calendar: {calendar.title}</Typography>
            {renderEventDialog()}
            <ReactCalendar
                tileContent={({ date, view }) => tileContents(date, view)}
            />
            {renderCreateCalendarEventDialog()}
        </CardContent>
    </Card>
}
