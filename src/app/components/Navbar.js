"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin } from "@/lib/client-auth";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!session) return null;

  const isActive = (path) => pathname === path;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                CogniCare
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/dashboard")
                    ? "border-white text-white"
                    : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/clients")
                    ? "border-white text-white"
                    : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
                }`}
              >
                Clients
              </Link>
              <Link
                href="/sessions"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/sessions")
                    ? "border-white text-white"
                    : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
                }`}
              >
                Sessions
              </Link>
              <Link
                href="/reports"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/reports")
                    ? "border-white text-white"
                    : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
                }`}
              >
                Reports
              </Link>
              {isAdmin(session.user) && (
                <Link
                  href="/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/users")
                      ? "border-white text-white"
                      : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
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
                    ? "border-white text-white"
                    : "border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white"
                }`}
              >
                Profile
              </Link>
              <span className="text-sm text-indigo-100 mr-4">{session.user.name}</span>
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Sign Out
              </button>

              {showConfirmDialog && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Out</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Are you sure you want to sign out? You&apos;ll need to sign in again to access
                      your account.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
