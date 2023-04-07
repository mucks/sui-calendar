import { useState } from "react";
import { Contract } from "../hooks/useContract";
import { Box, Button, FormControl, TextField } from "@mui/material";

export default function CreateCalendarForm(props: { contract: Contract, onCreate: () => void }) {
    const [calendarTitle, setCalendarTitle] = useState('');

    const createCalendar = async () => {
        await props.contract.createCalendar(calendarTitle);
        props.onCreate();
    }

    return <Box>
        <FormControl fullWidth>
            <TextField label="Create Calendar" value={calendarTitle} onChange={e => setCalendarTitle(e.target.value)} />
        </FormControl>
        <Button onClick={() => createCalendar()} type='button' >Create Calendar</Button>
    </Box>
}
