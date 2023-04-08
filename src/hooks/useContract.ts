import { JsonRpcProvider, SuiEvent, TransactionBlock, localnetConnection } from "@mysten/sui.js";
import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { CalendarType } from "../types/CalendarType";
import { CalendarEventType } from "../types/CalendarEventType";

const PACKAGE_ID = import.meta.env.VITE_MOVE_PACKAGE_ID;
const STATISTICS_OBJECT_ID = import.meta.env.VITE_MOVE_STATISTICS_OBJECT_ID;

// if the package id has a leading 0 (0x0), we need to replace it with 0x
// this is a bit of a hack and should be fixed in the future
const OBJECT_TYPE_BASE = PACKAGE_ID.replace('0x0', '0x');
const CALENDAR_OBJECT_TYPE = `${OBJECT_TYPE_BASE}::calendar::Calendar`;

const PROD = import.meta.env.PROD;
const connection = PROD ? undefined : localnetConnection;

const provider = new JsonRpcProvider(connection);

const getObjectContentsByType = async (owner: string, type: string) => {
    const resp = await provider.getOwnedObjects({ owner: owner, options: { showContent: true } });
    const objects = resp.data.filter(d => d.data && d.data.content).map(d => d.data!.content);
    return objects.filter(o => (o as any).type === type) as any[];
}

export type Contract = ReturnType<typeof useContract>;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const useContract = () => {
    const wallet = useWallet();
    const [isReady, setIsReady] = useState(false);
    const [owner, setOwner] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // This is a temporary solution and should be replaced with a better solution
    const wait = async () => {
        const waitTime = PROD ? 5000 : 1000;
        setLoading(true);
        await delay(waitTime);
        setLoading(false);
    };

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
        await wait();
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

        await wait();
    }

    const deleteCalendarEvent = async (calendarId: string, eventId: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::delete_calendar_event`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(calendarId),
                tx.pure(+eventId),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();
    }



    const getCalendars = async (): Promise<CalendarType[]> => {
        const calendars = await getObjectContentsByType(owner, CALENDAR_OBJECT_TYPE);

        return calendars.map(c => {
            const events: CalendarEventType[] = c.fields.events.map((e: any) => {
                return {
                    title: e.fields.title,
                    start: new Date(+e.fields.start_timestamp),
                    end: new Date(+e.fields.end_timestamp),
                    id: e.fields.id
                }
            });
            return {
                title: c.fields.title,
                id: c.fields.id.id,
                events: events
            }
        })
    }

    const deleteCalendar = async (calendarId: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::delete_calendar`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(calendarId),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();
    }



    const getStats = async () => {
        const stats = await provider.getObject({ id: STATISTICS_OBJECT_ID, options: { showContent: true } });
        return stats;
    }

    return {
        loading,
        isReady,
        deleteCalendar,
        deleteCalendarEvent,
        createCalendarEvent,
        debugPrintMessage,
        createCalendar,
        getCalendars,
        getStats
    }

}

export default useContract;