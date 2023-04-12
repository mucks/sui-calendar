import { Box, Button, Container, Dialog, DialogTitle, FormControl, FormGroup, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import useContract from "../hooks/useContract";
import { useState, useEffect, Fragment } from "react";
import CreateCalendarForm from "../components/CreateCalendarForm";
import LoadingOverlay from "../components/LoadingOverlay";
import { CalendarType } from "../types/CalendarType";
import Calendar from "../components/Calendar";
import CalendarList from "../components/CalendarList";
import { StatisticsType } from "../types/StatisticsType";

export default function CalendarView() {
    const contract = useContract();

    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [dialog, setDialog] = useState(false);
    const [disabled, setDisabled] = useState<string[]>([]);
    const [stats, setStats] = useState<StatisticsType | null>(null);

    useEffect(() => {
        // This is a hack to wait for the contract to be ready
        if (!contract.isReady) return;
        if (!contract.user) return;
        getCalendars();
        contract.getStats().then(setStats);


    }, [contract.isReady, contract.user])

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

    const renderPendingCalendarShares = () => {

        if (!stats) {
            return;
        }

        const shares = stats.pendingCalendarShares.filter(share => share.userAddress == contract.owner);



        return <Grid item xs={12}>
            <h2>Pending Invites</h2>
            <ul>
                {shares.map(share => {
                    return <li key={share.calendarAddress}>
                        <p>
                            {share.calendarAddress}
                        </p>
                        <Button onClick={() => contract.acceptShare(share.calendarAddress)}>Accept</Button>
                    </li>
                })}
            </ul>

        </Grid>


    }


    const renderHasUser = () => {
        return <Fragment>
            {renderPendingCalendarShares()}
            <Grid item xs={2}>
                <CalendarList onShare={(id, addr) => contract.shareCalendar(id, addr)} onDelete={(id) => deleteCalendar(id)} onChange={onDisabledChange} calendars={calendars} />
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
        </Fragment>
    }

    // CreateUserForm
    const [username, setUsername] = useState('');

    const renderNoUser = () => {
        return <Grid item xs={12}>
            <FormGroup>
                <FormControl>
                    <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                </FormControl>
                <Button type='button' onClick={() => contract.createUser(username)}>Create User</Button>
            </FormGroup>
        </Grid>
    }
    //


    return <Container maxWidth="xl">
        <LoadingOverlay open={contract.loading} />
        <Grid container spacing={2}>
            {contract.user ? renderHasUser() : renderNoUser()}
        </Grid>
    </Container>
}