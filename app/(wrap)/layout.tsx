import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";


export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
