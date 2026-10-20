import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
// import IsAuth from '../Components/IsAuth';

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <IsAuth> */}
        <Navbar />
          {children}
        <Footer />
      {/* </IsAuth> */}
    </>
  );
}
