import {cn} from "@/lib/utils";
import {DashboardNav} from "./DashboardNav";
import {useSidebar} from "@/contexts/SidebarContext";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";

export default function Sidebar() {
  const {isMinimized, toggleSidebar} = useSidebar();

  return (
    <nav className={cn(
      `border-r sticky top-0 flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out`,
      // Always show on desktop, hide on mobile
      "hidden xl:flex",
      // Responsive width based on screen size and minimize state
      isMinimized 
        ? "w-[70px] min-w-[70px]" 
        : "w-[280px] min-w-[280px] 2xl:w-[320px] 2xl:min-w-[320px]"
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-2 border-b bg-background min-h-[57px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          {isMinimized ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Content */}
      <div className={cn(
        "w-full mt-4 overflow-y-auto scrollbar-sm flex-1",
        isMinimized ? "px-2" : "px-4"
      )}>
        {!isMinimized && (
          <h2 className="mb-2 text-lg font-semibold tracking-tight px-2">OVERVIEW</h2>
        )}
        <div className="space-y-1">
          <DashboardNav isMinimized={isMinimized} />
        </div>
      </div>
    </nav>
  );
}
