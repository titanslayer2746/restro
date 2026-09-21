import React from 'react'
import BottomNav from '../components/shared/BottomNav'
import Greetings from '../components/home/Greetings'
import MiniCard from '../components/home/MiniCard'
import RecentOrders from '../components/home/RecentOrders'
import PopularDishes from '../components/home/PopularDishes'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getOrders } from '../https'
import { formatMoney } from '../utils'

const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

const Home = () => {
  // Shares the "orders" cache with RecentOrders, so this is not an extra request
  const { data: resData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  const orders = resData?.data.data || [];
  const todays = orders.filter((order) => isToday(order.orderDate));
  const earnings = todays.reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
  const inProgress = orders.filter((order) => order.orderStatus === "In Progress").length;

  return (
    <section className='mx-auto grid max-w-7xl gap-8 px-5 pb-32 pt-8 md:px-10 lg:grid-cols-[1.6fr_1fr]'>
      {/* left div */}
      <div className='min-w-0'>
        <Greetings />

        <div className='mt-8 grid grid-cols-1 overflow-hidden rounded-2xl border border-ink bg-surface sm:grid-cols-3'>
          <MiniCard title="Earned today" number={`₹${formatMoney(earnings)}`} footer="sum of today's bills" loading={isLoading} first />
          <MiniCard title="Orders today" number={String(todays.length).padStart(2, "0")} footer="placed since midnight" loading={isLoading} />
          <MiniCard title="In progress" number={String(inProgress).padStart(2, "0")} footer="waiting on the kitchen" loading={isLoading} accent />
        </div>

        <RecentOrders />
      </div>

      {/* right div */}
      <div className='min-w-0'>
        <PopularDishes />
      </div>

      <BottomNav />
    </section>
  )
}

export default Home
