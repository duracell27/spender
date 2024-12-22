
import AdminMenu from '@/components/AdminMenu'
import React from 'react'

const Adminlayout = ({children}:{children:React.ReactNode}) => {
    
  return (
    <div>
        <AdminMenu />
        {children}
    </div>
  )
}

export default Adminlayout