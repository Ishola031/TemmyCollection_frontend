import Link from 'next/link'
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi'

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-16">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FiShoppingBag className="text-3xl" />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
          404 — Page not found
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          This look is
          <br />
          <span className="text-blue-600">out of reach.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-gray-500">
          The page you’re looking for may have moved or no longer exists.
          Let’s help you find something you’ll love.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/store"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FiShoppingBag />
            Explore the store
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FiArrowLeft />
            Back to home
          </Link>
        </div>

        <div className="mx-auto mt-14 h-px max-w-xs bg-gray-200" />

        <p className="mt-5 text-sm text-gray-400">
          Temmy Collection <span className="mx-1">·</span> Dress better. Feel
          better.
        </p>
      </section>
    </main>
  )
}

export default NotFound