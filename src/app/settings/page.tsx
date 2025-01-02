import React from 'react'
import { auth } from '../../../auth';
import { prisma } from '../../../prisma/prisma';
import UserSettingForm from '@/components/forms/UserSettingForm';

const SettingsPage = async () => {
    const session = await auth();
  if (!session?.user.id) return;

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const currencies = await prisma.currency.findMany();

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!userSettings) {
    return <div>Налаштування не знайдені</div>;
  }

  return (
    <div className='p-4'>
        <h1 className='text-3xl font-bold'>Налаштування</h1>
        <UserSettingForm wallets={wallets} currencies={currencies} userSettings={userSettings}/>
    </div>
  )
}

export default SettingsPage