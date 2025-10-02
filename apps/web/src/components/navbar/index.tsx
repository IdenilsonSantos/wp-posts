"use client";

import { useState, FC } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { links } from "@/app/utils/constants/menuLinks";
import { Button } from "../button";

interface NavbarProps {
  logoText?: string;
  showLinks?: true | false;
}

const Navbar: FC<NavbarProps> = ({
  logoText = "Order System",
  showLinks = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const getLinkClass = (href: string) =>
    pathname === href
      ? "text-esmerald-500 font-semibold"
      : "text-gray-400 hover:text-esmerald-600";

  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-400">{logoText}</div>
        {showLinks ? (
          <>
            <ul className="hidden md:flex space-x-6 items-center">
              {links.map((link) => (
                <li key={link.href}>
                  {link.name === "Sair" && pathname.includes("wp") ? (
                    <Button
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/login");
                      }}
                      variant="success"
                      className="cursor-pointer text-white"
                    >
                      {link.name}
                    </Button>
                  ) : (
                    <Link href={link.href} className={getLinkClass(link.href)}>
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </>
        ) : (
          <></>
        )}
      </div>

      {isOpen && !showLinks && (
        <ul className="md:hidden bg-gray-900 px-4 pb-4 space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={getLinkClass(link.href)}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
