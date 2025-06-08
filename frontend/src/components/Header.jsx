import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Zap, Plus, Bell, UserCircle, Search, LogOut, LogIn, UserPlus } from 'lucide-react'; // Added LogOut, LogIn, UserPlus
import MobileNavigation from './MobileNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal'; // Import the modal

// Placeholders for shadcn/ui components - assuming these are sufficient for now
const Button = (props) => <button className={props.className} onClick={props.onClick} {...props}>{props.children}</button>;
const Sheet = ({ children, ...props }) => <div {...props}>{children}</div>;
const SheetContent = ({ children, ...props }) => <div {...props}>{children}</div>;
const SheetTrigger = ({ children, ...props }) => <button {...props}>{children}</button>;

const Header = ({ sidebarVisible, toggleSidebar, isMobile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false); // Modal state
  const { user, isAuthenticated, logout } = useAuth();
  const { userWorkspaces, currentWorkspace, selectWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Section: Menu, Logo, Brand */}
        <div className="flex items-center gap-4">
          {!isMobile && toggleSidebar && ( // Added toggleSidebar check
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
              <SheetContent side="left" className="w-[300px] p-0 border-r-4 border-black bg-white">
                <MobileNavigation closeMenu={() => setMobileMenuOpen(false)} />
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

        {/* Center Section: Search (only on desktop) */}
        {!isMobile && isAuthenticated && (
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

        {/* Workspace Selector (only on desktop and if authenticated) */}
        {!isMobile && isAuthenticated && (
          <div className="flex items-center ml-4">
            {userWorkspaces.length > 0 ? (
              <select
                value={currentWorkspace?.id || ''}
              onChange={(e) => {
                const selectedWs = userWorkspaces.find(ws => ws.id === parseInt(e.target.value));
                if (selectedWs) selectWorkspace(selectedWs);
              }}
                onChange={(e) => {
                  const selectedWs = userWorkspaces.find(ws => ws.id === parseInt(e.target.value));
                  if (selectedWs) selectWorkspace(selectedWs);
                }}
                disabled={workspaceLoading}
                className="px-3 py-2 rounded-md border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                {workspaceLoading && <option>Loading...</option>}
                {!workspaceLoading && userWorkspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
                {!workspaceLoading && userWorkspaces.length === 0 && <option value="">No workspaces</option>}
              </select>
            ) : (
              !workspaceLoading && <span className="text-sm text-gray-500 mr-2">No workspaces yet.</span>
            )}
            <Button
              onClick={() => setIsCreateWorkspaceModalOpen(true)}
              className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
              title="Create New Workspace"
            >
              <Plus size={18} /> {/* Ensure Plus is imported from lucide-react */}
            </Button>
          </div>
        )}


        {/* Right Section: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Button className="hidden sm:flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl border-2 border-black hover:bg-gray-800 transition-colors font-bold text-sm shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                <Plus className="h-4 w-4" /> Create Post {/* Changed text for clarity from generic "Create" */}
              </Button>
              <button className="p-2.5 rounded-xl hover:bg-black/10 transition-colors border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                <Bell className="h-5 w-5 text-black" />
              </button>
              <div className="relative group">
                <button className="p-1.5 rounded-xl hover:bg-black/10 transition-colors border-2 border-transparent focus-visible:border-black focus-visible:outline-none flex items-center gap-1">
                  <UserCircle className="h-7 w-7 text-black" />
                  {!isMobile && user && <span className="text-sm font-medium hidden md:inline">{user.full_name || user.email}</span>}
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-black rounded-lg shadow-lg py-1 hidden group-hover:block z-20"> {/* Added z-20 for dropdown */}
                  <Link to="/profile" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">Profile</Link>
                  <button
                    onClick={() => setIsCreateWorkspaceModalOpen(true)}
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 flex items-center gap-2"
                  >
                     <Plus size={16}/> Create Workspace
                  </button>
                  {/* <Link to="/settings" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">Settings</Link> */}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} variant="ghost" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent hover:border-black transition-colors font-bold text-sm">
                <LogIn className="h-4 w-4" /> Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="hidden sm:flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl border-2 border-black hover:bg-gray-800 transition-colors font-bold text-sm">
                <UserPlus className="h-4 w-4" /> Sign Up
              </Button>
              {/* Simplified for mobile - menu might have these */}
              {isMobile && (
                 <button onClick={() => navigate('/login')} className="p-2.5 rounded-xl hover:bg-black/10">
                    <LogIn className="h-5 w-5 text-black" />
                 </button>
              )}
            </>
          )}
        </div>
      </div>
      <CreateWorkspaceModal isOpen={isCreateWorkspaceModalOpen} onClose={() => setIsCreateWorkspaceModalOpen(false)} />
    </header>
  );
};

export default Header;
