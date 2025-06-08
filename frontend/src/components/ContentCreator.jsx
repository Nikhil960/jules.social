import React, { useState } from 'react';
import {
  Card,
  Label,
  Textarea,
  Button,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from './ui/placeholders'; // Assuming placeholders.js is one level up
import {
  ImageIcon,
  Calendar,
  Sparkles,
  Palette,
  ChevronDown,
  Send,
  Instagram,
  Linkedin,
  Youtube,
  Settings,
  FileText,
  VideoIcon, // Renamed from Video to avoid conflict with HTML video tag
  PlusCircle
} from 'lucide-react';
import XLogo from './XLogo';

const ContentCreator = ({ initialType = "post" }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: true,
    x: false,
    linkedin: false,
    youtube: false,
  });
  const [content, setContent] = useState("");
  const [aiAssistance, setAiAssistance] = useState(false);
  const [contentType, setContentType] = useState(initialType); // 'post', 'story', 'video'
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const platformIcons = {
    instagram: <Instagram className="h-5 w-5" />,
    x: <XLogo className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
  };

  const getPlatformButtonStyle = (platformKey) => {
    return selectedPlatforms[platformKey]
      ? 'bg-black text-white border-black'
      : 'bg-white text-black border-gray-300 hover:border-black';
  };

  const handleSchedule = () => {
    console.log(`Content for ${contentType} scheduled for ${scheduledTime} on platforms:`, selectedPlatforms, "Content:", content);
    // Add actual scheduling logic here
  };

  const renderMediaUpload = () => {
    if (contentType === 'post') {
      return <Button variant="outline" className="w-full border-dashed border-2 border-gray-400 py-4 hover:border-black transition-colors"> <ImageIcon className="h-5 w-5 mr-2 text-gray-500"/> Add Image/Video </Button>;
    }
    if (contentType === 'story') {
      return <Button variant="outline" className="w-full border-dashed border-2 border-gray-400 py-4 hover:border-black transition-colors"> <PlusCircle className="h-5 w-5 mr-2 text-gray-500"/> Add Story Content </Button>;
    }
    if (contentType === 'video') {
      return <Button variant="outline" className="w-full border-dashed border-2 border-gray-400 py-4 hover:border-black transition-colors"> <VideoIcon className="h-5 w-5 mr-2 text-gray-500"/> Upload Video File </Button>;
    }
    return null;
  };

  return (
    <Card className="border-2 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <Tabs defaultValue={contentType} onValueChange={setContentType} className="flex flex-col h-full">
        <TabsList className="bg-gray-100 border-b-2 border-black p-1">
          <TabsTrigger value="post" className="flex-1 data-[state=active]:bg-yellow-300 data-[state=active]:shadow-md data-[state=active]:border-yellow-400 rounded-lg transition-all duration-150">
            <FileText className="h-4 w-4 mr-2" /> Post
          </TabsTrigger>
          <TabsTrigger value="story" className="flex-1 data-[state=active]:bg-pink-300 data-[state=active]:shadow-md data-[state=active]:border-pink-400 rounded-lg transition-all duration-150">
            <PlusCircle className="h-4 w-4 mr-2" /> Story
          </TabsTrigger>
          <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-purple-300 data-[state=active]:shadow-md data-[state=active]:border-purple-400 rounded-lg transition-all duration-150">
            <VideoIcon className="h-4 w-4 mr-2" /> Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post" className="flex-grow p-6 bg-white">
          <ContentArea
            type="post"
            content={content}
            setContent={setContent}
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
            platformIcons={platformIcons}
            getPlatformButtonStyle={getPlatformButtonStyle}
            aiAssistance={aiAssistance}
            setAiAssistance={setAiAssistance}
            renderMediaUpload={renderMediaUpload}
          />
        </TabsContent>
        <TabsContent value="story" className="flex-grow p-6 bg-white">
          <ContentArea
            type="story"
            content={content}
            setContent={setContent}
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
            platformIcons={platformIcons}
            getPlatformButtonStyle={getPlatformButtonStyle}
            aiAssistance={aiAssistance}
            setAiAssistance={setAiAssistance}
            renderMediaUpload={renderMediaUpload}
          />
        </TabsContent>
        <TabsContent value="video" className="flex-grow p-6 bg-white">
          <ContentArea
            type="video"
            content={content}
            setContent={setContent}
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
            platformIcons={platformIcons}
            getPlatformButtonStyle={getPlatformButtonStyle}
            aiAssistance={aiAssistance}
            setAiAssistance={setAiAssistance}
            renderMediaUpload={renderMediaUpload}
          />
        </TabsContent>

        <div className="p-6 border-t-2 border-black bg-gray-50 space-y-4">
            <Collapsible open={isSchedulerOpen}>
                <CollapsibleTrigger className="w-full" onClick={() => setIsSchedulerOpen(!isSchedulerOpen)}>
                    <Button variant="outline" className="w-full flex justify-between items-center font-bold py-3 hover:bg-gray-100">
                        <span>Schedule Options</span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${isSchedulerOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </CollapsibleTrigger>
                {isSchedulerOpen && (
                    <CollapsibleContent className="pt-4 space-y-3">
                        <Label htmlFor="schedule-time">Schedule Time (Optional)</Label>
                        <input
                            type="datetime-local"
                            id="schedule-time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-black focus:border-black"
                        />
                    </CollapsibleContent>
                )}
            </Collapsible>

            <Button onClick={handleSchedule} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                {scheduledTime ? `Schedule ${contentType}` : `Publish ${contentType} Now`}
            </Button>
        </div>
      </Tabs>
    </Card>
  );
};


const ContentArea = ({ type, content, setContent, selectedPlatforms, togglePlatform, platformIcons, getPlatformButtonStyle, aiAssistance, setAiAssistance, renderMediaUpload }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={`content-${type}`} className="text-lg">Your {type} content:</Label>
        <Textarea
          id={`content-${type}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Craft your amazing ${type} here... Add hashtags, mentions, and emojis!`}
          className="min-h-[150px] text-base focus:shadow-lg transition-shadow"
        />
      </div>

      <div>{renderMediaUpload()}</div>

      <div className="space-y-3">
        <Label className="text-lg">Publish to:</Label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(platformIcons).map(([key, icon]) => (
            <Button
              key={key}
              onClick={() => togglePlatform(key)}
              variant={selectedPlatforms[key] ? 'solid' : 'outline'}
              className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md ${getPlatformButtonStyle(key)}`}
            >
              {icon} {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`ai-assist-${type}`} className="text-lg flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" /> AI Assistant
          </Label>
          <Switch
            id={`ai-assist-${type}`}
            checked={aiAssistance}
            onChange={(e) => setAiAssistance(e.target.checked)}
            className="transform scale-90"
          />
        </div>
        {aiAssistance && (
          <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Textarea placeholder="Ask AI to improve your text, generate ideas, or check grammar..." className="min-h-[80px] bg-white" />
            <Button
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-3 text-sm rounded-md border border-yellow-500"
              onClick={() => console.log("AI Enhance clicked from ContentCreator")}
            >
              Generate with AI
            </Button>
          </div>
        )}
      </div>

      <Collapsible>
        {/* Assuming CollapsibleTrigger should also toggle a state if it's meant to expand/collapse something independently */}
        <CollapsibleTrigger className="w-full text-left" >
            <Button variant="outline" className="w-full flex justify-between items-center text-sm text-gray-600 py-2.5 hover:bg-gray-50">
                <span>Advanced Options</span>
                <ChevronDown className="h-4 w-4" />
            </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 px-1 text-sm space-y-3">
            {/* Content for advanced options should be visible if a corresponding state is true */}
            <Label htmlFor={`settings-${type}`}>Specific settings for {type}...</Label>
            <Textarea id={`settings-${type}`} placeholder={`e.g., For Instagram: add location, tag people...\nFor X: add source label...`} className="min-h-[70px] text-xs"/>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ContentCreator;
