import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const NotFound = () => {
  const { isAuth } = useSelector((state) => state.user);

  return (
    <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-paper px-5 py-16'>
      <div className='ticket-shadow w-full max-w-[340px] -rotate-2'>
        <div className='bg-white px-6 pb-6 pt-8 text-center font-mono text-xs text-ink'>
          <p className='text-sm font-bold tracking-[0.35em]'>RESTRO</p>
          <p className='mt-1 text-[11px] text-muted'>error ticket · #404</p>
          <div className='rule-dashed my-4' />
          <p className='font-sans text-5xl font-semibold tracking-[-0.04em]'>404</p>
          <p className='mt-2 font-sans text-base font-semibold tracking-tight'>This table doesn&apos;t exist.</p>
          <p className='mt-1 text-[11px] text-muted'>the page you ordered isn&apos;t on the menu</p>
          <div className='rule-dashed my-4' />
          <Link to={isAuth ? "/home" : "/"} className='btn-primary w-full font-sans text-xs'>
            Back to the floor →
          </Link>
        </div>
        <div className='receipt-edge' />
      </div>
    </div>
  )
}

export default NotFound
