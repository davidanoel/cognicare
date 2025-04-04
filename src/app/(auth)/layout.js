"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="CogniCare Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">CogniCare</span>
          </Link>
        </div>
        <main className="flex-1">{children}</main>
        <footer className="bg-white py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} CogniCare. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
