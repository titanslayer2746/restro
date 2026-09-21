import React from 'react'
import { Skeleton } from '../shared/ui'

// One cell of the readout strip on the home screen
const MiniCard = ({title, number, footer, loading = false, first = false, accent = false}) => {
  return (
    <div className={`px-5 py-4 ${first ? "" : "border-t border-ink sm:border-l sm:border-t-0"}`}>
      <div className='flex items-center justify-between'>
        <p className='mono-label'>{title}</p>
        {accent && <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-accent' />}
      </div>
      {loading ? (
        <Skeleton className='mt-3 h-6 w-24' />
      ) : (
        <p className='mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight text-ink'>{number}</p>
      )}
      <p className='mt-1 font-mono text-[11px] text-muted'>{footer}</p>
    </div>
  )
}

export default MiniCard
