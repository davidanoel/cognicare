"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Clients", href: "/clients", icon: "👥" },
  { name: "Sessions", href: "/sessions", icon: "💬" },
  { name: "Reports", href: "/reports", icon: "📝" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-900">CogniCare</h1>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="ml-3">
                <div className="text-sm text-gray-500">{session?.user?.email}</div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
