'use client'
import { useTheme } from '@/context/ThemeContext'
import React from 'react'
import { Audio } from 'react-loader-spinner'

const PageLoadingSpinner = () => {
    const {theme} = useTheme()
  return (
    <div className="flex justify-center items-center h-screen">
        {theme === 'light' ? (
            <Audio height="80" width="80" color="#090909" ariaLabel="three-dots-loading" />
        ) : (
            <Audio height="80" width="80" color="#f7f7f7" ariaLabel="three-dots-loading" />
        )}
    </div>
  )
}

export default PageLoadingSpinner