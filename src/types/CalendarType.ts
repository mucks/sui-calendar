import { CalendarEventType } from "./CalendarEventType";

export type CalendarType = {
    id: string;
    title: string;
    events: CalendarEventType[];
    sharedWith: string[];
}