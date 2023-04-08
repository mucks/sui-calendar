import { useEffect, useState } from "react";
import CreateCalendarForm from "../components/CreateCalendarForm";
import useContract from "../hooks/useContract";
import { CalendarType } from "../types/CalendarType";
import { Box, Button, Container, Dialog, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import Calendar from "../components/Calendar";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Home() {
    const contract = useContract();

    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [calendar, setCalendar] = useState<CalendarType | null>(null);
    const [calendarId, setCalendarId] = useState<string>('');

    useEffect(() => {
        // This is a hack to wait for the contract to be ready
        if (!contract.isReady) return;
        getCalendars();

        console.log('Home.tsx: useEffect')

    }, [contract.isReady])


    const getCalendars = async () => {
        const calendars = await contract.getCalendars();
        console.log(calendars);
        setCalendars(calendars);
        if (calendars.length > 0) {
            setCalendarId(calendars[0].id);
            setCalendar(calendars[0]);
        } else {
            setCalendarId('');
            setCalendar(null);
        }
    }

    const calendarSelector = () => {
        const onChange = (e: any) => {
            const calendarId = e.target.value;
            setCalendarId(calendarId);
            const calendar = calendars.find(c => c.id === calendarId);
            if (calendar) {
                setCalendar(calendar);
            }
        }


        return <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel>Calendar</InputLabel>
                <Select label="Calendar" value={calendarId} onChange={e => onChange(e)}>
                    {calendars.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                </Select>
            </FormControl>
        </Box>
    };

    const [dialog, setDialog] = useState(false);

    return <Container>
        <LoadingOverlay open={!contract.isReady || contract.loading} />
        <Grid container spacing={2}>
            <Grid item xs={4}>
                {calendarSelector()}
            </Grid>
            <Grid item xs={4}>
                <Dialog onClose={() => setDialog(false)} open={dialog}>
                    <DialogTitle>Create Calendar</DialogTitle>
                    <Box sx={{ p: 2 }}>
                        <CreateCalendarForm contract={contract} onCreate={() => { setDialog(false); getCalendars(); }} />
                    </Box>
                </Dialog>
                <Button onClick={() => setDialog(true)} type='button' >Create Calendar</Button>
            </Grid>

            <Grid item xs={12}>
                {calendar ? <Calendar onChange={() => getCalendars()} calendar={calendar} contract={contract} /> : <></>}
            </Grid>

        </Grid>
    </Container>
}