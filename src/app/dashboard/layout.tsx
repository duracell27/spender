import DashBoardMenu from '@/components/DashBoardMenu'
import React from 'react'

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='flex gap-x-4'>
        <div className="">
            <DashBoardMenu/>
        </div>
        <div className="">
            {children}
        </div>
    </div>
  )
}

export default DashboardLayout