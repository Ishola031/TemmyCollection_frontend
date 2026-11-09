import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import EnableCustomerNotifications from "../Components/EnableCustomerNotifications";
// import IsAuth from '../Components/IsAuth';

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <IsAuth> */}
        {/* <div className="flex shrink-0 items-center max-[740px]:w-full max-[740px]:justify-start max-[740px]:border-t max-[740px]:border-gray-200 max-[740px]:py-2">
            <EnableCustomerNotifications />
        </div> */}
        <Navbar />
          {children}
        <Footer />
      {/* </IsAuth> */}
    </>
  );
}
