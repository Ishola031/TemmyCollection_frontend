import ProductDetail from '../../../Components/ProductDetail';
const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            {/*  */}
            <ProductDetail slug={slug} />
        </>
    )
}

export default page