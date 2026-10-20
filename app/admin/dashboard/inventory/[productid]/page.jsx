import ProductDetails from "../../../../Components/AdminComponents/products/ProductView";


export default async function ProductDetailsPage({params}) {
    const { productid } = await params;
    
    return (
        <ProductDetails productid={productid}/>
    );
}
