import React from 'react'

const page = () => {
  return (
    <div className='fixed top-0 left-0 z-1000 w-full h-full bg-white items-center justify-center flex'>
      <div className='uppercase font-medium font-accent text-3xl absolute bottom-10 '>Loading...</div>
      <div className='bg-red-400 w-full h-full flex items-center justify-center relative'>
        <div className='absolute z-20'>
          <img
            src="icons/apex-logo-white.svg"
            alt="Loading..."
            className="w-[600px] object-contain saturate-50"
          />
        </div>
        <div className='absolute z-30 overflow-hidden w-[19%]'>
          <img
            src="icons/apex-logo.svg"
            alt="Loading..."
            className="w-[600px] object-contain saturate-50"
          />
        </div>
      </div>
    </div>
  )
}

export default page