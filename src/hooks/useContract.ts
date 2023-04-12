import { JsonRpcProvider, SuiEvent, TransactionBlock, localnetConnection } from "@mysten/sui.js";
import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { CalendarType } from "../types/CalendarType";
import { CalendarEventType } from "../types/CalendarEventType";
import { UserType } from "../types/UserType";
import { StatisticsType } from "../types/StatisticsType";

const PACKAGE_ID = import.meta.env.VITE_MOVE_PACKAGE_ID;
const STATISTICS_OBJECT_ID = import.meta.env.VITE_MOVE_STATISTICS_OBJECT_ID;

// if the package id has a leading 0 (0x0), we need to replace it with 0x
// this is a bit of a hack and should be fixed in the future
const OBJECT_TYPE_BASE = PACKAGE_ID.replace('0x0', '0x');
const CALENDAR_OBJECT_TYPE = `${OBJECT_TYPE_BASE}::calendar::Calendar`;
const USER_OBJECT_TYPE = `${OBJECT_TYPE_BASE}::calendar::User`;

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

    const [user, setUser] = useState<UserType | null>(null);

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

    useEffect(() => {
        reloadUser();
    }, [owner])


    const reloadUser = async () => {
        if (owner) {
            const _user = await getUser();
            setUser(_user);
        }
    }

    const shareCalendar = async (calendarId: string, address: string) => {
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::share_calendar`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(calendarId),
                tx.pure(address),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();

    }



    const createUser = async (name: string) => {
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::create_user`,
            arguments: [tx.object(STATISTICS_OBJECT_ID), tx.pure(name)],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();

        await reloadUser();
    }

    const getUser = async (): Promise<UserType | null> => {
        const users = await getObjectContentsByType(owner, USER_OBJECT_TYPE);
        if (users.length === 0) {
            return null;
        }


        return {
            id: users[0].fields.id.id,
            name: users[0].fields.name,
            calendars: users[0].fields.calendars,
        };


    }



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

        if (!user) {
            throw new Error('User is not set');
        }

        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::create_calendar`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(user.id),
                tx.pure(name)],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();

        await reloadUser();
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

        await reloadUser();
    }



    const getCalendars = async (): Promise<CalendarType[]> => {
        if (!user) {
            throw new Error('User is not set');
        }

        const objects = await provider.multiGetObjects({ ids: user.calendars, options: { showContent: true } })

        return objects.map(o => {
            const c: any = o.data!.content;
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
                sharedWith: c.fields.shared_with,
                events: events
            }
        })
    }

    const deleteCalendar = async (calendarId: string) => {
        if (!user) {
            throw new Error('User is not set');
        }

        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::delete_calendar`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(user.id),
                tx.object(calendarId),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();

        await reloadUser();
    }

    const acceptShare = async (calendarId: string) => {
        if (!user) {
            throw new Error('User is not set');
        }

        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::calendar::accept_share`,
            arguments: [
                tx.object(STATISTICS_OBJECT_ID),
                tx.object(user.id),
                tx.pure(calendarId),
            ],
        });

        await wallet.signAndExecuteTransactionBlock({
            transactionBlock: tx,
        });

        await wait();

        await reloadUser();
    }



    const getStats = async (): Promise<StatisticsType> => {
        const stats = await provider.getObject({ id: STATISTICS_OBJECT_ID, options: { showContent: true } });
        const content: any | undefined = stats.data?.content;
        if (content) {
            console.log(content)

            return {
                id: content.fields.id.id,
                userCount: +content.fields.user_count,
                calendarCount: +content.fields.calendar_count,
                eventCount: +content.fields.calendar_event_count,
                users: content.fields.users,
                pendingCalendarShares: content.fields.pending_calendar_shares.map((psc: any) => ({
                    calendarAddress: psc.fields.calendar_address,
                    userAddress: psc.fields.user_address,
                }))
            }
        }
        return Promise.reject('No stats found');
    }

    return {
        acceptShare,
        loading,
        isReady,
        shareCalendar,
        user,
        owner,
        createUser,
        getUser,
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