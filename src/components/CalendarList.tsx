import { Button, Checkbox, FormControlLabel, FormGroup, Grid } from "@mui/material";
import { CalendarType } from "../types/CalendarType";
import { useEffect, useState } from "react";
import ShareCalendarDialog from "./ShareCalendarDialog";

export default function CalendarList({ calendars, onChange, onDelete, onShare }: { calendars: CalendarType[], onChange: (disabled: string[]) => void, onDelete: (id: string) => void, onShare: (id: string, addr: string) => void }) {
    const [disabled, setDisabled] = useState<string[]>([]);

    const onItemChange = (id: string) => {

        if (disabled.some(d => d === id)) {
            setDisabled(disabled.filter(d => d !== id));
        } else {
            setDisabled([...disabled, id]);
        }
    }

    useEffect(() => {
        onChange(disabled)
    }, [disabled])

    return <div>
        <h4>Calendars</h4>
        <FormGroup>
            {calendars.map(c => <CalendarListItem onShare={onShare} onDelete={onDelete} onChange={onItemChange} key={c.id} calendar={c} checked={!disabled.some(d => d === c.id)} />)}
        </FormGroup>
    </div>
}

const CalendarListItem = ({ calendar, checked, onChange, onDelete, onShare }: { calendar: CalendarType, checked: boolean, onChange: (id: string) => void, onDelete: (id: string) => void, onShare: (id: string, addr: string) => void }) => {
    return <Grid container>
        <Grid item xs={6}>
            <FormControlLabel control={<Checkbox checked={checked} onChange={() => onChange(calendar.id)} />} label={calendar.title} />
        </Grid>
        <Grid item xs={6}>
            <Button onClick={() => onDelete(calendar.id)}>Delete</Button>
            <ShareCalendarDialog onShare={onShare} calendar={calendar} />
        </Grid>


    </Grid>

};