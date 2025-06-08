import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Calendar,
  MessageCircle,
  Palette,
  Zap,
  Settings,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import XLogo from './XLogo';

// Placeholder for Button
const Button = (props) => <button className={props.className} onClick={props.onClick} variant={props.variant}>{props.children}</button>;

const Sidebar = ({ sidebarVisible, isMobile }) => {
  if (isMobile) {
    return null; // Sidebar is handled by MobileNavigation on mobile
  }

  return (
    <AnimatePresence initial={false}>
      {sidebarVisible && (
        <motion.div
          initial={{ width: 0, opacity: 0, x: -300 }}
          animate={{ width: 300, opacity: 1, x: 0 }}
          exit={{ width: 0, opacity: 0, x: -300 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40, duration: 0.3 }}
          className="border-r-4 border-black bg-white/40 overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 90px)' }} // Assuming header height is approx 90px
        >
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <nav className="space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 text-lg font-bold p-3 bg-black text-white rounded-xl shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                Analytics
              </Link>
              <Link
                to="/calendar"
                className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
              >
                <Calendar className="h-5 w-5" />
                Calendar
              </Link>
              <Link
                to="/messages"
                className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Messages
              </Link>
            </nav>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Studios
              </h3>
              <nav className="space-y-2">
                <Link
                  to="/studio/post-editor"
                  className="flex items-center gap-3 text-md font-medium p-3 hover:bg-black/5 rounded-xl transition-colors"
                >
                  <Palette className="h-5 w-5 text-purple-500" />
                  Post Editor
                </Link>
                <Link
                  to="/studio/video-editor"
                  className="flex items-center gap-3 text-md font-medium p-3 hover:bg-black/5 rounded-xl transition-colors"
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Video Editor
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Connected Platforms
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-2 border-black/10 font-bold hover:bg-gray-50 text-sm py-3 px-3"
                  onClick={() => console.log("Connect Instagram clicked from Sidebar")}
                >
                  <Instagram className="h-5 w-5 text-pink-500" /> Instagram
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-2 border-black/10 font-bold hover:bg-gray-50 text-sm py-3 px-3"
                  onClick={() => console.log("Connect X clicked from Sidebar")}
                >
                  <XLogo className="h-5 w-5" /> X (Twitter)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-2 border-black/10 font-bold hover:bg-gray-50 text-sm py-3 px-3"
                  onClick={() => console.log("Connect LinkedIn clicked from Sidebar")}
                >
                  <Linkedin className="h-5 w-5 text-blue-600" /> LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-2 border-black/10 font-bold hover:bg-gray-50 text-sm py-3 px-3"
                  onClick={() => console.log("Connect YouTube clicked from Sidebar")}
                >
                  <Youtube className="h-5 w-5 text-red-500" /> YouTube
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t-4 border-black">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-2 border-black font-bold hover:bg-gray-100"
              onClick={() => console.log("Settings clicked from Sidebar")}
            >
              <Settings className="h-5 w-5" /> Settings
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
