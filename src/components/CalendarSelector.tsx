import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { CalendarType } from "../types/CalendarType";
import { useState } from "react";

export default function CalendarSelector({ calendars, onChange }: { calendars: CalendarType[], onChange: (calendarId: string) => void }) {
    const [calendarId, setCalendarId] = useState<string>('');

    const onSelectChange = (e: any) => {
        const calendarId = e.target.value;
        setCalendarId(calendarId);
        const calendar = calendars.find(c => c.id === calendarId);
        if (calendar) {
            onChange(calendar.id);
        }
    }


    return <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
            <InputLabel>Calendar</InputLabel>
            <Select label="Calendar" value={calendarId} onChange={e => onSelectChange(e)}>
                {calendars.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </Select>
        </FormControl>
    </Box>
}
