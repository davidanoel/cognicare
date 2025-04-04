"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin } from "@/lib/client-auth";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                CogniCare
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/dashboard")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/clients")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Clients
              </Link>
              <Link
                href="/sessions"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/sessions")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Sessions
              </Link>
              {isAdmin(session.user) && (
                <Link
                  href="/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/users")
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium mr-4 ${
                  isActive("/profile")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Profile
              </Link>
              <span className="text-sm text-gray-500 mr-4">{session.user.name}</span>
              <Link
                href="/api/auth/signout"
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
