import React from 'react';
import { Card, Badge } from './ui/placeholders';
import { Users, Heart, TrendingUp } from 'lucide-react';

function SocialMediaCard({ platform, username, icon, color, isConnected }) {
  return (
    <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform duration-150 ease-in-out">
      <div className={`p-6 text-white ${color}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="transform scale-125">{icon}</div> {/* Slightly larger icon */}
          <Badge variant={isConnected ? "default" : "secondary"} className="font-bold text-xs">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <h3 className="text-xl font-black tracking-tight">{platform}</h3>
        <p className="text-sm opacity-80 break-all">{username || "Not connected"}</p>
      </div>
      {isConnected && (
        <div className="p-4 bg-white text-black border-t-4 border-black">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                <Users className="h-3 w-3" />
                <span className="font-semibold">Followers</span>
              </div>
              <p className="font-bold text-lg text-gray-800">--</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                <Heart className="h-3 w-3" />
                <span className="font-semibold">Engagement</span>
              </div>
              <p className="font-bold text-lg text-gray-800">--%</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">Growth</span>
              </div>
              <p className="font-bold text-lg text-gray-800">--%</p>
            </div>
          </div>
        </div>
      )}
       {!isConnected && (
        <div className="p-4 bg-gray-50 border-t-4 border-black text-center">
            <button
              className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-500 transition-colors text-sm"
              onClick={() => console.log(`Connect ${platform} clicked from SocialMediaCard`)}
            >
                Connect Account
            </button>
        </div>
      )}
    </Card>
  );
}

export default SocialMediaCard;
