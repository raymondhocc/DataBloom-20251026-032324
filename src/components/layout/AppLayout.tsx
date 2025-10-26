import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <Header />
      <SidebarInset className="pt-16">
        <div className="absolute left-2 top-18 z-20">
          <SidebarTrigger />
        </div>
        {children}
        <footer className="text-center text-sm text-muted-foreground/80 py-6 px-4">
          <p>There is a limit on the number of requests that can be made to the AI servers.</p>
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}