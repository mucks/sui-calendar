import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import './App.css'
import { JsonRpcProvider, TransactionBlock, localnetConnection } from '@mysten/sui.js';
import { useEffect } from 'react';

const PACKAGE_ID = import.meta.env.VITE_MOVE_PACKAGE_ID;
const STATISTICS_OBJECT_ID = import.meta.env.VITE_MOVE_STATISTICS_OBJECT_ID;

const provider = new JsonRpcProvider(localnetConnection);

function App() {
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.connected) {
      return;
    }

    (async () => {
      const objects = await provider.getOwnedObjects({ owner: wallet.account?.address!, options: { showContent: true } });
      console.log('objects', objects);


    })();

    console.log('package id: ', PACKAGE_ID)
    console.log('statistics object id: ', STATISTICS_OBJECT_ID)
    console.log('connected wallet name: ', wallet.name)
    console.log('account address: ', wallet.account?.address)
    console.log('account publicKey: ', wallet.account?.publicKey)



  }, [wallet.connected, wallet.name, wallet.account?.address, wallet.account?.publicKey])

  const debugPrintMessage = async () => {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::calendar::debug_print_message`,
      arguments: [tx.pure('Hello World')],
    });

    await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
  }


  const createCalendar = async () => {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::calendar::create_calendar_without_statistics`,
      arguments: [
        tx.pure('TestCalendar')],
    });

    await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });

  }


  return (
    <div>
      <ConnectButton />
      <button onClick={createCalendar}>Create Calendar</button>
      <button onClick={debugPrintMessage}>Debug Print Message</button>

    </div>
  );
}

export default App
