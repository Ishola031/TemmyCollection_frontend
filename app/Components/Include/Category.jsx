import React from 'react'

const Category = ({cat}) => {
  return (
    <>
      <section className="w-full h-auto px-10 lg:px-15 py-4 max-[740px]:px-5">
        <div className="w-full">
            {/* HEADER */}
            {/* <div className="w-full flex items-center justify-between bg-blue-600 text-white px-4 py-2.5 rounded-t-lg">
                <div>
                    <h4 className="text-[15px] font-semibold">
                        {col?.name}
                    </h4>
                </div>

                {col?.slug && (
                    <Link href={`/collection/${col?.slug || ''}`}
                        className="text-[12px] font-medium hover:underline"
                    >
                        See All
                    </Link>
                )}
            </div> */}

            {/* PRODUCTS */}
            <div className="
                w-full
                flex
                overflow-x-auto
                bg-white
                border-x
                border-b
                border-gray-100
                rounded-b-lg
                [&::-webkit-scrollbar]:h-1
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
                [scrollbar-width:thin]
                [scrollbar-color:#d1d5db_transparent]
            ">
                {cat?.product?.length > 0 ? (
                    cat.product.map((pr) => (
                        <CollectionProduct
                            pr={pr?.product}
                            key={`prod_${pr.id}`}
                        />
                    ))
                ) : (
                    <div className="w-full py-10 text-center text-[13px] text-gray-400">
                        No products available
                    </div>
                )}
            </div>
        </div>
      </section>
    </>
  )
}

export default Category
