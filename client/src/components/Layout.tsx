import { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

interface LayoutProps {
  children: ReactNode;
  hideNavAndFooter?: boolean;
}

const Layout = ({ children, hideNavAndFooter = false }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!hideNavAndFooter && <Navbar />}
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="clean-container px-3 sm:px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;