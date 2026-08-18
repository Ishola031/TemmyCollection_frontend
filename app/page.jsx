import Image from "next/image";
import Link from "next/link";
import ProductCollection from "./Components/ProductCollection";
import Hero from './Components/Home/Hero'
import Navbar from "./Components/Navbar";

export default function Home() {


  return (
    <>
      <Navbar />
      {/* HERO */}
      <Hero />

      {/* PRODUCT */}
      {/* <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-6 max-[740px]:px-5">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-full flex justify-between items-center bg-blue-600 py-2 px-3 text-white text-[13px]">
            <h4>Top Product</h4>
            <Link href="">See All </Link>
          </div>

          <div className="w-full h-full flex overflow-scroll">
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
          </div>

        </div>
      </section> */}

      {/* PRODUCT */}
      {/* <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-6 max-[740px]:px-5">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-full flex justify-between items-center bg-blue-600 py-2 px-3 text-white text-[13px]">
            <h4>Latest Product</h4>
            <Link href="">See All </Link>
          </div>

          <div className="w-full h-full flex overflow-scroll">
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
            <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
              <div className="w-full h-45 rounded-xl mb-0.5">
                <Link href=""><img src="" alt="" className="w-full h-full object-cover rounded-xl" /></Link>
              </div>
              <h2 className="text-[22px] font-bold pb-0">Snicker</h2>
              <div className="">
                <h2 className="text-[19px] font-bold">N20000 <span className="text-[15px] font-normal"><strike>$25000</strike></span></h2>
              </div>
              <div className="absolute top-4 right-5 bg-amber-300 text-[12px] py-1 px-1.5">
                <h3>-10%</h3>
              </div>

            </div>
          </div>

        </div>
      </section> */}

      {/* PRODUCT */}
      <ProductCollection />

      {/* SIGN IN */}
      {/* <section className="w-full h-screen pt-18 px-17.5 pb-5 max-[740px]:px-5 flex justify-center items-center">
        <form className="w-auto h-auto p-10 bg-white rounded-xl ">
          <h2 className="text-[#333] text-center my-2.5 text-[20px] pb-4">Sign Up</h2>

          <div className="relative w-75 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
            <input type="email" name="email" id="email" required value="" className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" />
            <label htmlFor='email' className="absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]">Email</label>
          </div>

          <div className="relative w-75 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
            <input type="password" name="password" id="password" required value="" className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" />
            <label htmlFor='password' className="absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]">Password</label>
          </div>

          <button className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black">Login</button>
        </form>
      </section> */}
    </>
  );
}
