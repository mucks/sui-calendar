import { JsonRpcProvider, TransactionBlock, localnetConnection } from "@mysten/sui.js";
import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { CalendarType } from "../types/CalendarType";
import { CalendarEventType } from "../types/CalendarEventType";

const PACKAGE_ID = import.meta.env.VITE_MOVE_PACKAGE_ID;
const STATISTICS_OBJECT_ID = import.meta.env.VITE_MOVE_STATISTICS_OBJECT_ID;
const CALENDAR_OBJECT_TYPE = `${PACKAGE_ID}::calendar::Calendar`;
const CALENDAR_EVENT_OBJECT_TYPE = `${PACKAGE_ID}::calendar::CalendarEvent`;

const provider = new JsonRpcProvider(localnetConnection);

const getObjectContentsByType = async (owner: string, type: string) => {
    const resp = await provider.getOwnedObjects({ owner: owner, options: { showContent: true } });
    const objects = resp.data.filter(d => d.data && d.data.content).map(d => d.data!.content);
    return objects.filter(o => (o as any).type === type) as any[];
}

export type Contract = ReturnType<typeof useContract>;

const useContract = () => {
    const wallet = useWallet();
    const [isReady, setIsReady] = useState(false);
    const [owner, setOwner] = useState<string>('');

    useEffect(() => {
        if (wallet.account) {
            setIsReady(true);
            setOwner(wallet.account.address);
        }
    }, [wallet.account]);



    const debugPrintMessage = async (message: string) => {
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::debug_print_message`,
            arguments: [tx.pure(message)],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });
    }

    const getCalendarEvents = async (calendarId: string): Promise<CalendarEventType[]> => {
        const events = await getObjectContentsByType(owner, CALENDAR_EVENT_OBJECT_TYPE);
        console.log(events);
        return events.map(e => {
            return {
                title: e.fields.title,
                start: new Date(+e.fields.start_timestamp),
                end: new Date(+e.fields.end_timestamp),
                id: e.fields.id.id
            }
        });
    }


    const createCalendar = async (name: string) => {
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::create_calendar`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.pure(name)],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });
    }

    const createCalendarEvent = async (calendarId: string, name: string, start: string, end: string) => {
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::create_calendar_event`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(calendarId),
                tx.pure(name),
                tx.pure(+new Date(start)),
                tx.pure(+new Date(end))
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });
    }

    const deleteCalendarEvent = async (eventId: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::delete_calendar_event`,
            arguments: [
                tx.object(eventId),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });
    }



    const getCalendars = async (): Promise<CalendarType[]> => {
        const calendars = await getObjectContentsByType(owner, CALENDAR_OBJECT_TYPE);

        return calendars.map(c => {
            return {
                title: c.fields.title,
                id: c.fields.id.id
            }
        })
    }



    const getStats = async () => {
        const stats = await provider.getObject({ id: STATISTICS_OBJECT_ID, options: { showContent: true } });
        return stats;
    }

    return {
        isReady,
        deleteCalendarEvent,
        createCalendarEvent,
        getCalendarEvents,
        debugPrintMessage,
        createCalendar,
        getCalendars,
        getStats
    }

}

export default useContract;