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
    if (date.getTime() < start.getTime()) return false;
    if (date.getTime() > end.getTime()) return false;
    return true;
}


export default function Calendar({ calendars, disabled, contract, onChange }: { calendars: CalendarType[], contract: Contract, disabled: string[], onChange: () => void }) {
    const [dialog, setDialog] = useState(false);
    const [event, setEvent] = useState<CalendarEventType | null>(null);
    const [events, setEvents] = useState<CalendarEventType[]>([]);

    useEffect(() => {
        const _events = [];
        for (const calendar of calendars) {
            if (disabled.includes(calendar.id)) continue;
            // Add calendar id to each event, so we can delete it later by calendar id and event id
            const calendarEvents = calendar.events.map((event) => ({ ...event, calendarId: calendar.id }));
            _events.push(...calendarEvents);
        }
        setEvents(_events);

    }, [calendars, disabled])



    const deleteCalendarEvent = async (event: CalendarEventType) => {
        if (!event.calendarId) {
            console.error('Event calendar Id is not found');
            return;
        }
        await contract.deleteCalendarEvent(event.calendarId, event.id);
        setEvent(null);
        onChange();
    }

    const renderEventDialog = () => {
        if (!event) return;
        return <Dialog open={event != null} onClose={() => setEvent(null)}>
            <DialogTitle>{event.title}</DialogTitle>
            <Box sx={{ p: 2 }}>
                <p>{event.start.toLocaleDateString()} - {event.end.toLocaleDateString()}</p>
                <Button onClick={() => deleteCalendarEvent(event)}>Delete</Button>
            </Box>
        </Dialog>
    }

    const renderCreateCalendarEventDialog = () => {
        return <>
            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Create Calendar Event</DialogTitle>
                <Box sx={{ p: 2 }}>
                    <CreateCalendarEventForm calendars={calendars} contract={contract} onCreate={() => { setDialog(false); onChange(); }} />
                </Box>
            </Dialog>
            <Button onClick={() => setDialog(true)}>Create Calendar Event</Button>
        </>
    };


    const renderEventContent = (event?: CalendarEventType) => {
        if (!event) return;
        return <p onClick={() => setEvent(event)}>{event.title}</p>
    }



    const hasEvent = (event: CalendarEventType, date: Date) => {
        return sameDay(event.start, date) || sameDay(event.end, date) || betweenDays(event.start, event.end, date);
    }


    const hasEvents = (date: Date) => {
        return events.some((event: CalendarEventType) => hasEvent(event, date));
    }

    const tileContents = (date: Date, view: string) => {
        if (view === 'month' && hasEvents(date)) {
            return renderEventContent(events.find(event => hasEvent(event, date)));
        }
    }

    return <Card>
        <CardContent>
            {renderEventDialog()}
            <ReactCalendar
                tileContent={({ date, view }) => tileContents(date, view)}
            />
            {renderCreateCalendarEventDialog()}
        </CardContent>
    </Card>
}
