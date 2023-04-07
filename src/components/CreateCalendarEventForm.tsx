import { useState } from "react";
import { Contract } from "../hooks/useContract";
import { Box, Button, FormControl, InputLabel, Stack, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

export default function CreateCalendarEventForm({ calendarId, contract, onCreate }: { calendarId: string, contract: Contract, onCreate: () => void }) {
    const [calendarEventTitle, setCalendarEventTitle] = useState('');

    const [start, setStart] = useState<Dayjs>(dayjs(new Date()));
    const [end, setEnd] = useState<Dayjs>(dayjs(new Date()));

    const createCalendarEvent = async (calendarId: string) => {
        await contract.createCalendarEvent(calendarId, calendarEventTitle, start.toString(), end.toString());
        onCreate();
    }


    return <Box>
        <Stack spacing={2}>
            <FormControl fullWidth>
                <TextField label="Calendar Event" value={calendarEventTitle} onChange={e => setCalendarEventTitle(e.target.value)} />
            </FormControl>
            <FormControl fullWidth>
                <DateTimePicker label="Start" onChange={(v: any) => setStart(v)} />
            </FormControl>
            <FormControl fullWidth>
                <DateTimePicker label="End" onChange={(v: any) => setStart(v)} />
            </FormControl>
        </Stack>
        <Button onClick={() => createCalendarEvent(calendarId)} type='button' >Create Calendar Event</Button>
    </Box>
}