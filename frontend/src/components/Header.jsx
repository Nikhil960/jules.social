import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Zap, Plus, Bell, UserCircle, Search } from 'lucide-react';
import MobileNavigation from './MobileNavigation';

// Placeholders for shadcn/ui components
const Button = (props) => <button className={props.className} onClick={props.onClick} variant={props.variant}>{props.children}</button>;
const Sheet = ({ children, ...props }) => <div {...props}>{children}</div>;
const SheetContent = ({ children, ...props }) => <div {...props}>{children}</div>;
const SheetTrigger = ({ children, ...props }) => <button {...props}>{children}</button>;


const Header = ({ sidebarVisible, toggleSidebar, isMobile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isMobile && (
            <motion.button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-black/10 transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label={sidebarVisible ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-6 w-6 text-black" />
            </motion.button>
          )}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-black/10 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 text-black" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-r-4 border-black">
                <MobileNavigation />
              </SheetContent>
            </Sheet>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!isMobile && <h1 className="text-2xl font-black hidden sm:block">POSTCRAFT</h1>}
          </Link>
        </div>

        {!isMobile && (
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <input
                type="search"
                placeholder="Search content, features, help..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          <Button className="hidden sm:flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl border-2 border-black hover:bg-gray-800 transition-colors font-bold text-sm shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
            <Plus className="h-4 w-4" /> Create
          </Button>
          <button className="p-2.5 rounded-xl hover:bg-black/10 transition-colors border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
            <Bell className="h-5 w-5 text-black" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-black/10 transition-colors border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
            <UserCircle className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
