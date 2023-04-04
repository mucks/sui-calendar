import './App.css';
import { TransactionBlock } from '@mysten/sui.js';
import { ConnectButton } from '@suiet/wallet-kit';
import { useWallet } from '@suiet/wallet-kit';
import { useEffect } from 'react';



function App() {

  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.connected) {
      return;
    }
    console.log('connected wallet name: ', wallet.name)
    console.log('account address: ', wallet.account?.address)
    console.log('account publicKey: ', wallet.account?.publicKey)


  }, [wallet.connected, wallet.name, wallet.account?.address, wallet.account?.publicKey])


  const createCalendarEvent = async () => {
    const tx = new TransactionBlock();
    const packageObjectId = '0x0';

    tx.moveCall({
      target: `${packageObjectId}::calendar::create_calendar`,
      arguments: [tx.pure('TestCalendar')],
    });

    await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
  }


  return (
    <div className="App">
      <ConnectButton />
      <button onClick={createCalendarEvent}>Create Calendar Event</button>

    </div>
  );
}

export default App;
