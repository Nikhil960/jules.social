import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/placeholders'; // Assuming placeholders.js is one level up
import { Music, VideoIcon as Video, ImageIcon, FileText, Zap, X } from 'lucide-react'; // Renamed Video to VideoIcon
import StudioInterface from './StudioInterface'; // This will be created next

const StudioSelector = () => {
  const [activeStudio, setActiveStudio] = useState(null); // null | 'audio' | 'video' | 'image' | 'text'

  const studioOptions = [
    { id: 'audio', name: 'Audio Lab', icon: <Music className="h-10 w-10 mb-3 text-pink-500" />, description: "Craft podcasts, voiceovers, and jingles." },
    { id: 'video', name: 'Video Suite', icon: <Video className="h-10 w-10 mb-3 text-purple-500" />, description: "Edit clips, add effects, and create shorts." },
    { id: 'image', name: 'Image Studio', icon: <ImageIcon className="h-10 w-10 mb-3 text-blue-500" />, description: "Design graphics, memes, and thumbnails." },
    { id: 'text', name: 'Writing Desk', icon: <FileText className="h-10 w-10 mb-3 text-green-500" />, description: "Generate blog posts, scripts, and captions." },
  ];

  if (activeStudio) {
    const selectedOption = studioOptions.find(opt => opt.id === activeStudio);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <StudioInterface
          type={activeStudio}
          typeName={selectedOption?.name || 'Studio'}
          onBack={() => setActiveStudio(null)}
        />
      </motion.div>
    );
  }

  return (
    <Card className="p-6 sm:p-8 bg-white/60 backdrop-blur-md border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center">
          <Zap className="h-7 w-7 mr-3 text-yellow-500" />
          Choose Your Creative Studio
        </h2>
      </div>
      <p className="text-gray-600 mb-8 text-sm sm:text-base">
        Select a specialized studio to start crafting your content. Each studio is equipped with tools tailored for the specific media type.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {studioOptions.map((studio) => (
          <motion.div
            key={studio.id}
            onClick={() => setActiveStudio(studio.id)}
            className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center text-center"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {studio.icon}
            <h3 className="text-lg font-bold mb-1 text-gray-800">{studio.name}</h3>
            <p className="text-xs text-gray-500">{studio.description}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default StudioSelector;
