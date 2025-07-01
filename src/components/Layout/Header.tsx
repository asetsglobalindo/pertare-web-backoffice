import {cn} from "@/lib/utils";
// import {Link} from "react-router-dom";
import {MobileSidebar} from "./MobileSidebar";
import UserNav from "./UserNav";
import ThemeToggle from "./theme-toggle";
import {Link} from "react-router-dom";
import {LayoutDashboard, Menu} from "lucide-react";
import {useSidebar} from "@/contexts/SidebarContext";
import {Button} from "../ui/button";

export default function Header() {
  const {toggleSidebar} = useSidebar();

  return (
    <div className="fixed top-0 left-0 right-0 z-20 border-b supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur">
      <nav className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {/* Desktop sidebar toggle - only show when sidebar is visible */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden xl:flex h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <Link to="/" className="hidden sm:block">
            <div className="flex items-center gap-2">
              <LayoutDashboard />
              <p className="text-2xl font-bold uppercase">backoffice</p>
            </div>
          </Link>
          
          {/* Mobile sidebar - show on mobile and tablet */}
          <div className={cn("block xl:!hidden")}>
            <MobileSidebar />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

