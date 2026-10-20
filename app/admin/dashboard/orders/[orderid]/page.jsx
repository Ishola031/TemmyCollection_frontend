import React from 'react'
import OrderDetailsPage from '../../../../Components/AdminComponents/orders/OrderDetails';

const page = async ({params}) => {
    const {orderid} = await params;
  return (
    <OrderDetailsPage orderid={orderid}/>
  )
}

export default page
