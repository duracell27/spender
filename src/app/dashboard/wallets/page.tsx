import UserWaletForm from '@/components/forms/UserWaletForm'
import React from 'react'
import { prisma } from '../../../../prisma/prisma';
import { auth } from '../../../../auth';
import { Pencil, Trash2 } from 'lucide-react';
import Confirm from '@/components/Confirm';
import { deleteWallet } from '@/actions/wallets';


const WaletsPage = async() => {
  const currencys = await prisma.currency.findMany();
  const session = await auth();
  if (!session?.user.id) return;
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      currency: true,
    }
  });

  return (
    <div className=''>
      <UserWaletForm title="Додати рахунок" currencys={currencys}/>
      {wallets.map((wallet, inex)=>(
        <div key={inex} className="flex justify-between">
          <h1 className='font-bold'>{wallet.name}</h1>
          <p>{wallet.balance} {wallet.currency.symbol}</p>
          <div className="flex items-center gap-2">
          <UserWaletForm
                    title={<Pencil />}
                    edit={true}
                    data={wallet}
                    id={wallet.id}
                    currencys={currencys}
                  />
                  <Confirm
                    title={<Trash2 />}
                    actionButtonTitle="Видалити"
                    fn={deleteWallet}
                    id={wallet.id}
                  />
          </div>
        </div>
      ))}
    </div>
  )
}

export default WaletsPage