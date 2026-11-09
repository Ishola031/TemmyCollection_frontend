"use client";
import React, { useEffect, useState } from 'react'
import ProductCollection from "../../Components/ProductCollection";
import Hero from '../../Components/Home/Hero'
import Navbar from '../../Components/Navbar'
import ProductCollection2 from '../Include/ProductCollection2';
import ProductCollectionList from '../Include/ProductCollectionList';
import {useDashboard} from '../../hook/useDashboard'
import Footer from '../Footer'

const HomePage = () => {
    const {data: dashboard, isLoading:loadingdashboard} = useDashboard()
    console.log(dashboard)
    // const {data: recentViewdData, isLoading:loadingRecentViewed} = useRecentViewed()
    // const [recentViewed, setRecentViewed] = useState({
    //     name: 'Recently Viewed',
    //     product: [],
    // })

    // useEffect(()=> {
    //     setRecentViewed(v=> ({...v, product: recentViewdData}))
    // },[recentViewdData])
    
  return (
    <>
      <Navbar />
      <Hero />

      {/* RECENTLY VIEWED PRODUCT */}
      {loadingdashboard ? (
        [1].map(lop => {
            return (
                <section key={lop} className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full flex justify-between items-center skeleton py-1.5 px-3 text-white text-[13px]">
                            <h4>name</h4>
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll 
                                    [&::-webkit-scrollbar]:w-1
                                    [&::-webkit-scrollbar-track]:bg-transparent 
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]">
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                        </div>

                    </div>
                </ section>
            )
        })
      ):(
        <ProductCollection2 col={dashboard?.recently_viewed} name={'Recently Viewed'}/>
      )}

      {/* LOVED BY CUSTOMER */}
      {loadingdashboard ? (
        [1].map(lop => {
            return (
                <section key={lop} className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full flex justify-between items-center skeleton py-1.5 px-3 text-white text-[13px]">
                            <h4>name</h4>
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll 
                                    [&::-webkit-scrollbar]:w-1
                                    [&::-webkit-scrollbar-track]:bg-transparent 
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]">
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                        </div>

                    </div>
                </ section>
            )
        })
      ):(
        <ProductCollectionList col={dashboard?.basedOnResearch} name={'Based On Research'}/>
      )}

      {/* BASED ON RESEARCH */}
      {loadingdashboard ? (
        [1].map(lop => {
            return (
                <section key={lop} className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full flex justify-between items-center skeleton py-1.5 px-3 text-white text-[13px]">
                            <h4>name</h4>
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll 
                                    [&::-webkit-scrollbar]:w-1
                                    [&::-webkit-scrollbar-track]:bg-transparent 
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]">
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                            </div>
                        </div>

                    </div>
                </ section>
            )
        })
      ):(
        <ProductCollectionList col={dashboard?.lovedByCustomers} name={'Loved By Customers'}/>
      )}

      {/* CATEGORY */}


      {/* COLLECTIONS */}
      <ProductCollection />

      {/* FOOTER */}
      <Footer/>
    </>
  )
}

export default HomePage
