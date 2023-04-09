import { Button, Checkbox, FormControlLabel, FormGroup, Grid } from "@mui/material";
import { CalendarType } from "../types/CalendarType";
import { useEffect, useState } from "react";

export default function CalendarList({ calendars, onChange, onDelete }: { calendars: CalendarType[], onChange: (disabled: string[]) => void, onDelete: (id: string) => void }) {
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
            {calendars.map(c => <CalendarListItem onDelete={onDelete} onChange={onItemChange} key={c.id} calendar={c} checked={!disabled.some(d => d === c.id)} />)}
        </FormGroup>
    </div>
}

const CalendarListItem = ({ calendar, checked, onChange, onDelete }: { calendar: CalendarType, checked: boolean, onChange: (id: string) => void, onDelete: (id: string) => void }) => {
    return <Grid container>
        <Grid item xs={6}>
            <FormControlLabel control={<Checkbox checked={checked} onChange={() => onChange(calendar.id)} />} label={calendar.title} />
        </Grid>
        <Grid item xs={6}>
            <Button onClick={() => onDelete(calendar.id)}>Delete</Button>
        </Grid>


    </Grid>

};