import { Dialog, DialogTitle, Box, FormGroup, FormControl, TextField, Button } from "@mui/material";
import { useState } from "react";
import { Contract } from "../hooks/useContract";
import { CalendarType } from "../types/CalendarType";

export default function ShareCalendarDialog({ calendar, onShare }: { calendar: CalendarType, onShare: (id: string, addr: string) => void }) {
    const [dialog, setDialog] = useState(false);
    const [share, setShare] = useState('');

    return <div>
        <Dialog onClose={() => setDialog(false)} open={dialog}>
            <DialogTitle>Share Calendar</DialogTitle>
            <Box sx={{ p: 2 }}>
                <FormGroup>
                    <FormControl fullWidth>
                        <TextField label="Address" value={share} onChange={e => setShare(e.target.value)} />
                    </FormControl>
                    <Button onClick={() => onShare(calendar.id, share)} type='button' >Share Calendar</Button>
                </FormGroup>
                <ul>
                    {calendar.sharedWith.map((address) => <li key={address}>{address}</li>)}
                </ul>
            </Box>
        </Dialog>
        <Button onClick={() => setDialog(true)} type='button' >Share</Button>
    </div>
}