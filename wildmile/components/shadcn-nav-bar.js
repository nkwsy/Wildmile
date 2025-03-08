"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../lib/hooks";
import { cn } from "@/lib/utils";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav_tabs = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Trash",
    link: "/trash",
    subitems: [
      {
        label: "New Log",
        link: "/trash/log",
      },
      {
        label: "History",
        link: "/trash/history",
      },
    ],
  },
  {
    label: "Plants",
    link: "/plants",
    subitems: [
      {
        label: "Species List",
        link: "/plants/species",
      },
      {
        label: "Add an Observation",
        link: "/plants/observe",
      },
    ],
  },
  {
    label: "Projects",
    link: "/projects",
  },
  {
    label: "Camera Traps",
    link: "/cameratrap",
  },
];

export function HeaderNav() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  let photoSrc = "https://api.multiavatar.com/noname.png";

  if (user && user.profile) {
    if (user.profile.picture) {
      photoSrc = user.profile.picture;
    } else {
      photoSrc = "https://api.multiavatar.com/" + user.profile.name + ".png";
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Urban Rivers
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {nav_tabs.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.subitems ? (
                    <>
                      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          {item.subitems.map((subitem) => (
                            <li key={subitem.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subitem.link}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    pathname === subitem.link && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">{subitem.label}</div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={item.link} legacyBehavior passHref>
                      <NavigationMenuLink className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === item.link && "bg-accent text-accent-foreground"
                      )}>
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Urban Rivers</SheetTitle>
              <SheetDescription>Navigation Menu</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4">
              {nav_tabs.map((item) => (
                <div key={item.label}>
                  {item.subitems ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">{item.label}</h4>
                      <div className="pl-4 space-y-2">
                        {item.subitems.map((subitem) => (
                          <Link 
                            key={subitem.label} 
                            href={subitem.link}
                            className={cn(
                              "block text-sm transition-colors hover:text-primary",
                              pathname === subitem.link && "text-primary font-medium"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href={item.link}
                      className={cn(
                        "block text-base transition-colors hover:text-primary",
                        pathname === item.link && "text-primary font-medium"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold">Urban Rivers</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={photoSrc} alt={user.profile?.name || "User"} />
                      <AvatarFallback>{user.profile?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.profile?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/api/logout">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 