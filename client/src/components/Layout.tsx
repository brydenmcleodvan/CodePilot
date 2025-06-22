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
      
      <main className="flex-grow py-8">
        <div className="clean-container">
          {children}
        </div>
      </main>
      
      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;