import CollectionView from '../../../Components/CollectionView';

const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            {/*  */}
            <CollectionView slug={slug} />;
        </>
    )
}

export default page