import { Stack } from "@mui/material";
import { Contract } from "../hooks/useContract";
import { CalendarType } from "../types/CalendarType";
import Calendar from "./Calendar";

export default function CalendarList({ calendars, contract }: { calendars: CalendarType[], contract: Contract }) {
    return <Stack>
        <h1>Calendars</h1>
        {calendars.map(calendar => <Calendar key={calendar.id} calendar={calendar} contract={contract} />)}
    </Stack>
}