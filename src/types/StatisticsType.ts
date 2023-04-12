export type StatisticsType = {
    id: string;
    calendarCount: number;
    eventCount: number;
    userCount: number;
    users: string[];
    pendingCalendarShares: { calendarAddress: string, userAddress: string }[];
}
