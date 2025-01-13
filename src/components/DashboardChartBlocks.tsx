import { MonthlyInfoData } from '@/actions/transactions'
import { Currency, UserSettings } from '@prisma/client'
import React from 'react'

const DashboardChartBlocks = ({data, userSettings}:{data: MonthlyInfoData, userSettings: UserSettings & {defaultCurrency: Currency}}) => {
  return (
    <div className='w-full gap-4 flex flex-wrap justify-evenly items-center text-[10px] sm:text-sm '>
        <div className="bg-[#f34c38] p-1 sm:p-2 px-2 sm:px-4 rounded-lg">
          <h2 className='font-bold'>Максимальна витрата:</h2> 
          <p>Назва: {data.maxExpense?.title}</p>
          <p>Сума: {data.maxExpense?.amount} {userSettings.defaultCurrency.symbol}</p>
        </div>
        <div className="bg-[#6dc743] p-1 sm:p-2 px-2 sm:px-4 rounded-lg">
          <h2 className='font-bold'>Максимальний заробіток:</h2> 
          <p>Назва: {data.maxIncome?.title}</p>
          <p>Сума: {data.maxIncome?.amount} {userSettings.defaultCurrency.symbol}</p>
        </div>
        <div className="bg-[#f34c38] p-1 sm:p-2 px-2 sm:px-4 rounded-lg">
          <h2 className='font-bold'>Середні витрати в день:</h2> 
          <p>{data.averageDailyExpense} {userSettings.defaultCurrency.symbol}</p>
          </div>
          <div className="bg-[#6dc743] p-1 sm:p-2 px-2 sm:px-4 rounded-lg">
          <h2 className='font-bold'>Середні прибутки в день:</h2> 
          <p>{data.averageDailyIncome} {userSettings.defaultCurrency.symbol}</p>
          </div>
    </div>
  )
}

export default DashboardChartBlocks