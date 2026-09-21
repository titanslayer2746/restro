import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatDate, getGreeting } from '../../utils'

const Greetings = () => {

    const [dataTime, setDateTime] = useState(new Date());
    const { name } = useSelector((state) => state.user);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) =>
        `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;

  return (
    <div className='flex flex-wrap items-end justify-between gap-4'>
      {/* Greet */}
      <div>
        <p className='mono-label'>§ 01 · service</p>
        <h1 className='mt-1 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl'>
          {getGreeting(dataTime)}, <span className='text-muted'>{name?.split(" ")[0]}.</span>
        </h1>
      </div>

      {/* Time */}
      <div className='text-right'>
        <p className='font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink'>{formatTime(dataTime)}</p>
        <p className='font-mono text-[11px] uppercase tracking-wider text-muted'>{formatDate(dataTime)}</p>
      </div>
    </div>
  )
}

export default Greetings
