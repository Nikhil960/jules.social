import React from 'react';
import { Link } from 'react-router-dom';
// import { Button as ShadCnButton } from './ui/button'; // Unused import
import {
  Home,
  BarChart3,
  Calendar,
  MessageCircle,
  Instagram,
  Linkedin,
  Youtube,
  Settings,
  Zap,
} from 'lucide-react';
import XLogo from './XLogo';

// Placeholder for Button until shadcn/ui components are properly set up
const Button = (props) => <button className={props.className} onClick={props.onClick} variant={props.variant}>{props.children}</button>;


function MobileNavigation() {
  return (
    <div className="h-full bg-white/40 backdrop-blur-md flex flex-col">
      <div className="p-6 border-b-4 border-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-black">POSTCRAFT</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-2 mb-8">
          <Link to="#" className="flex items-center gap-3 text-lg font-bold p-3 bg-black text-white rounded-xl">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Calendar
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Messages
          </Link>
        </nav>

        <div>
          <h2 className="text-xl font-black mb-4">PLATFORMS</h2>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-2 border-black font-bold hover:bg-gray-50"
              onClick={() => console.log("Connect Instagram clicked from Mobile Navigation")}
            >
              <Instagram className="h-5 w-5 text-pink-500" /> Instagram
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-2 border-black font-bold hover:bg-gray-50"
              onClick={() => console.log("Connect X clicked from Mobile Navigation")}
            >
              <XLogo className="h-5 w-5" /> X
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-2 border-black font-bold hover:bg-gray-50"
              onClick={() => console.log("Connect LinkedIn clicked from Mobile Navigation")}
            >
              <Linkedin className="h-5 w-5 text-blue-600" /> LinkedIn
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-2 border-black font-bold hover:bg-gray-50"
              onClick={() => console.log("Connect YouTube clicked from Mobile Navigation")}
            >
              <Youtube className="h-5 w-5 text-red-500" /> YouTube
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t-4 border-black">
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-xl border-2 border-black font-bold transition-colors"
            onClick={() => console.log("Connect Account clicked from Mobile Navigation")}
          >
            Connect
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-black font-bold hover:bg-gray-50"
            onClick={() => console.log("Settings clicked from Mobile Navigation")} // Added for completeness
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigation;
