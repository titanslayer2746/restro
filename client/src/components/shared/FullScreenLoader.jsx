import React from 'react'
import logo from "../../assets/images/logo.png";

const FullScreenLoader = () => {
  return (
    <div className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-paper'>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink">
          <img src={logo} alt="" className="h-6 w-6" />
        </span>
        <div className="mt-6 h-[3px] w-40 overflow-hidden rounded-full bg-line">
          <div className="animate-loadbar h-full w-2/5 bg-accent" />
        </div>
        <p className="mono-label mt-4">warming up the kitchen…</p>
    </div>
  )
}

export default FullScreenLoader
