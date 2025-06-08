import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { Instagram, Linkedin, Youtube, Users, Heart, TrendingUp, Plus, Video, FileText } from 'lucide-react';
import XLogo from './XLogo'; // Ensure XLogo is imported
// Import actual components
import SocialMediaCard from './SocialMediaCard';
import ContentCreator from './ContentCreator';
import StudioSelector from './StudioSelector';
// StudioInterface is usually rendered by StudioSelector, so direct import might not be needed here unless used elsewhere.

// Placeholder UI Components that are still needed or specific to Dashboard
// const Button = ({ children, className, variant, onClick }) => <button className={className} onClick={onClick} variant={variant}>{children}</button>;
// Card, Badge, Tabs etc. will be imported by the individual components from ui/placeholders or ui/actual_components later

// Tabs might still be used directly in Dashboard or defined in ui/placeholders and imported.
// For this step, assuming ContentCreator brings its own Tabs from placeholders.

import { useWorkspace } from '../contexts/WorkspaceContext'; // Import useWorkspace
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for checking authentication status

export default function Dashboard() {
  const { currentWorkspace, isLoading: workspaceIsLoading, error: workspaceError } = useWorkspace();
  const { isAuthenticated } = useAuth();
  const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] = useState(false);
  const [connectedAccountListKey, setConnectedAccountListKey] = useState(0); // Key for refreshing list

  // TODO: Replace this mock data with actual connected accounts from currentWorkspace
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    instagram: true,
    x: false,
    linkedin: true,
    youtube: false,
  });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const socialPlatforms = [
    { name: "Instagram", key: "instagram", icon: <Instagram className="h-8 w-8" />, color: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500", username: "@insta_user" },
    { name: "X (Twitter)", key: "x", icon: <XLogo className="h-8 w-8" />, color: "bg-black", username: "@twitter_handle" },
    { name: "LinkedIn", key: "linkedin", icon: <Linkedin className="h-8 w-8" />, color: "bg-blue-700", username: "linkedin.com/in/user" },
    { name: "YouTube", key: "youtube", icon: <Youtube className="h-8 w-8" />, color: "bg-red-600", username: "youtube.com/channel/UC..." },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="w-full h-screen backdrop-blur-xl bg-white/30 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        <Header sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar sidebarVisible={sidebarVisible} isMobile={isMobile} />

          <motion.div
            className="flex-1 overflow-auto p-6 sm:p-8 md:p-10"
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ConnectedAccountList integration */}
            {isAuthenticated && currentWorkspace && !workspaceIsLoading && (
              <div className="mb-10">
                <ConnectedAccountList
                  key={connectedAccountListKey}
                  workspaceId={currentWorkspace.id}
                  onOpenConnectModal={() => setIsConnectAccountModalOpen(true)}
                />
              </div>
            )}
            {/* Messages for workspace loading, error, or selection */}
            {workspaceIsLoading && <p className="text-center my-4">Loading workspace data...</p>}
            {workspaceError && <p className="text-red-500 text-center my-4">Error loading workspace: {workspaceError}</p>}
            {!currentWorkspace && !workspaceIsLoading && isAuthenticated && (
                <div className="nb-card p-6 border-2 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center my-10">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Welcome to Postcraft!</h3>
                    <p className="text-gray-600">Please select a workspace from the header, or create a new one to manage your social accounts and content.</p>
                </div>
            )}

            {/* Existing sections: Create Content & Content Studio, conditionally rendered */}
            {currentWorkspace && (
              <>
                <div className="mb-10">
                  <h2 className="text-3xl font-black mb-6 text-gray-800">CREATE CONTENT</h2>
                  <ContentCreator initialType="post" />
                </div>

                <div>
                  <h2 className="text-3xl font-black mb-6 text-gray-800">CONTENT STUDIO</h2>
                  <StudioSelector />
                </div>
              </>
            )}

            {/* Footer or additional content can go here */}
            <footer className="mt-12 text-center text-gray-500 text-sm">
              Postcraft &copy; {new Date().getFullYear()} - Supercharge your social media.
            </footer>

          </motion.div>
        </div>
      </div>
      {currentWorkspace && (
        <ConnectAccountModal
          isOpen={isConnectAccountModalOpen}
          onClose={() => setIsConnectAccountModalOpen(false)}
          workspaceId={currentWorkspace.id}
          onAccountConnected={() => {
            setConnectedAccountListKey(prevKey => prevKey + 1); // Increment key to trigger refresh
          }}
        />
      )}
    </div>
  );
}
              <h2 className="text-3xl font-black mb-6 text-gray-800">CREATE CONTENT</h2>
              {/* ContentCreator will use useWorkspace() hook directly if currentWorkspace is needed */}
              {currentWorkspace ? <ContentCreator initialType="post" /> : <p>Please select a workspace to create content.</p>}
            </div>

            <div>
              <h2 className="text-3xl font-black mb-6 text-gray-800">CONTENT STUDIO</h2>
              {/* StudioSelector will use useWorkspace() hook directly if currentWorkspace is needed */}
              {currentWorkspace ? <StudioSelector /> : <p>Please select a workspace to use the content studio.</p>}
            </div>

            {/* Footer or additional content can go here */}
            <footer className="mt-12 text-center text-gray-500 text-sm">
              Postcraft &copy; {new Date().getFullYear()} - Supercharge your social media.
            </footer>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
