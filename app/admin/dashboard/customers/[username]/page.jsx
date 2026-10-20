import CustomerDetails from "../../../../Components/AdminComponents/customers/CustomerDetails";


export default async function CustomerDetailsPage({params}) {
    const { username } = await params;
    
    return (
        <CustomerDetails username={username}/>
    );
}
