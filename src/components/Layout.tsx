import React from "react";
import Header from "./Layout/Header";
import Sidebar from "./Layout/Sidebar";
import {Outlet} from "react-router-dom";
import {SidebarProvider, useSidebar} from "@/contexts/SidebarContext";
import {cn} from "@/lib/utils";

const LayoutContent = () => {
  const {isMinimized} = useSidebar();

  return (
    <React.Fragment>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className={cn(
          "w-full transition-all duration-300 ease-in-out",
          isMinimized ? "lg:ml-0" : "lg:ml-0"
        )}>
          <section className="flex-1 mx-4 mt-10 mb-4 md:mx-8">
            <div className="w-full h-10"></div>
            <Outlet />
          </section>
        </main>
      </div>
    </React.Fragment>
  );
};

const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout;

