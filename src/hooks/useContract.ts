import { JsonRpcProvider, TransactionBlock, localnetConnection } from "@mysten/sui.js";
import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { Calendar } from "../types/Calendar";

const PACKAGE_ID = import.meta.env.VITE_MOVE_PACKAGE_ID;
const STATISTICS_OBJECT_ID = import.meta.env.VITE_MOVE_STATISTICS_OBJECT_ID;
const CALENDAR_OBJECT_TYPE = `${PACKAGE_ID}::calendar::Calendar`;

const provider = new JsonRpcProvider(localnetConnection);

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

    const getCalendars = async (): Promise<Calendar[]> => {
        const resp = await provider.getOwnedObjects({ owner: owner, options: { showContent: true } });
        const objects = resp.data.filter(d => d.data && d.data.content).map(d => d.data!.content);
        const calendars: any[] = objects.filter(o => (o as any).type === CALENDAR_OBJECT_TYPE);
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
        debugPrintMessage,
        createCalendar,
        getCalendars,
        getStats
    }

}

export default useContract;