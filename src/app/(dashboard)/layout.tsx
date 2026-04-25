"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login")
      }
    });
  };

  if (isPending || !session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">AudioDash</h2>
        <p className="text-sm text-slate-500 mt-1">Admin Panel</p>
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        <Button variant="secondary" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-medium">Welcome, {session.user.name || 'Admin'}</span>
        </div>
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Sidebar */}
      <div className="md:hidden border-b border-slate-200 bg-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">AudioDash</h2>
        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
