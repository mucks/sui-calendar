import { Box, Button, Container, Dialog, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import useContract from "../hooks/useContract";
import { useState, useEffect } from "react";
import CreateCalendarForm from "../components/CreateCalendarForm";
import LoadingOverlay from "../components/LoadingOverlay";
import { CalendarType } from "../types/CalendarType";
import Calendar from "../components/Calendar";
import CalendarList from "../components/CalendarList";

export default function CalendarView() {
    const contract = useContract();

    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [dialog, setDialog] = useState(false);
    const [disabled, setDisabled] = useState<string[]>([]);

    useEffect(() => {
        // This is a hack to wait for the contract to be ready
        if (!contract.isReady) return;
        getCalendars();


    }, [contract.isReady])

    const deleteCalendar = async (calendarId: string) => {
        await contract.deleteCalendar(calendarId);
        await getCalendars();
    }

    const onDisabledChange = (disabled: string[]) => {
        setDisabled(disabled);
    }

    const getCalendars = async () => {
        const calendars = await contract.getCalendars();
        setCalendars(calendars);
    }


    return <Container maxWidth="xl">
        <LoadingOverlay open={contract.loading} />
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <CalendarList onDelete={(id) => deleteCalendar(id)} onChange={onDisabledChange} calendars={calendars} />
                <Dialog onClose={() => setDialog(false)} open={dialog}>
                    <DialogTitle>Create Calendar</DialogTitle>
                    <Box sx={{ p: 2 }}>
                        <CreateCalendarForm contract={contract} onCreate={() => { setDialog(false); getCalendars(); }} />
                    </Box>
                </Dialog>
                <Button onClick={() => setDialog(true)} type='button' >Create Calendar</Button>
            </Grid>

            <Grid item xs={10}>
                <Calendar onChange={() => getCalendars()} calendars={calendars} disabled={disabled} contract={contract} />
            </Grid>

        </Grid>
    </Container>
}