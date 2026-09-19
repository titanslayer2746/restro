import React from 'react'
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const BackButton = () => {

    const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className='mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-paper'
    >
        <IoArrowBackOutline />
    </button>
  )
}

export default BackButton
