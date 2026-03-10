import { Brain, LayoutDashboard, Upload, Lightbulb, Bot, FileText, Plug, MessageSquare, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Data Upload", url: "/data-upload", icon: Upload },
  { title: "Insights", url: "/insights", icon: Lightbulb },
  { title: "Agent Actions", url: "/agent-actions", icon: Bot },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Chat with Sibe", url: "/chat", icon: MessageSquare },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative w-7 h-7 shrink-0 rounded-full flex items-center justify-center arc-gradient" 
               style={{ boxShadow: "0 0 12px hsla(190, 95%, 50%, 0.3)" }}>
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
            SIBE
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={isActive(item.url) ? "text-accent-foreground bg-accent border-l-2 border-primary" : ""}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
