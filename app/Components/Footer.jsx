'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FiArrowUpRight,
  FiInstagram,
  FiShoppingBag,
  FiTwitter,
} from 'react-icons/fi'
import api from '../api/api'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = (e)=> {
    e.preventDefault()

    try{
      setLoading(true)
      const res = api.post(`api/n/subscribe/`,{
        email
      })
    }catch(error){
      console.log(error)
    }finally{
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gray-950 text-white mt-10">
      <div className="px-6 py-14 sm:px-10 lg:px-15">
        <div className="mx-auto max-w-7xl">

          {/* Newsletter */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div className="max-w-md">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                The Temmy edit
              </p>

              <h2 className="text-xl font-semibold">
                A little style in your inbox
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Get updates on new arrivals, fresh looks, and special offers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex w-full max-w-md gap-2 sm:mt-0">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <input
                id="footer-email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                autoComplete="email"
                required
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />

              <button
                type="submit"
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                {loading ? (
                  <div className="h-5.5 w-5.5 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                ):('Subscribe')}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">

            {/* Brand */}
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                  <FiShoppingBag className="text-xl" />
                </span>

                <span className="text-lg font-bold tracking-tight">
                  Temmy <span className="text-blue-400">Collection</span>
                </span>
              </Link>

              <p className="mt-5 text-sm leading-6 text-gray-400">
                Discover thoughtfully selected styles that help you look good,
                feel comfortable, and stand out with confidence.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                >
                  <FiInstagram />
                </a>

                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                >
                  <FiTwitter />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="mb-5 text-sm font-semibold">Shop</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/store" className="transition hover:text-white">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/store" className="transition hover:text-white">
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/store" className="transition hover:text-white">
                    Best sellers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="mb-5 text-sm font-semibold">Help</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/contact" className="transition hover:text-white">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="transition hover:text-white">
                    Shipping information
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="transition hover:text-white">
                    Returns and exchanges
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="mb-5 text-sm font-semibold">About</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="transition hover:text-white">
                    Our story
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition hover:text-white">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition hover:text-white">
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col gap-4 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Temmy Collection. All rights reserved.
            </p>

            <Link
              href="/store"
              className="inline-flex items-center gap-1 font-medium text-gray-300 transition hover:text-blue-400"
            >
              Find your style
              <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer