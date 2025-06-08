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
  VideoIcon,
  PlusCircle
} from 'lucide-react';
import XLogo from './XLogo';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import apiClient from '../services/api';
import toast from '../utils/toastNotifications'; // Import custom toast

const ContentCreator = ({ initialType = "post" }) => {
  const { token } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    // TODO: This should be dynamically populated based on currentWorkspace.connected_accounts
    // And the keys should ideally be platform IDs or a consistent identifier.
    // For now, we'll keep the structure but acknowledge it needs linking to actual accounts.
    // Example: if currentWorkspace has an Instagram account with ID 5, this might be:
    // '5': true, // where '5' is the connected_account_id
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
  const [apiStatus, setApiStatus] = useState({ loading: false, error: null, success: null });


  // TODO: This should be derived from currentWorkspace.connected_accounts
  const availablePlatformsForSelection = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-5 w-5" />, connected_account_id_temp: 1 }, // Replace with actual ID
    { id: 'x', name: 'X (Twitter)', icon: <XLogo className="h-5 w-5" />, connected_account_id_temp: 2 },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, connected_account_id_temp: 3 },
    // { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-5 w-5" /> }, // YouTube might have different content types
  ];
  // Initialize selectedPlatforms based on available ones (all false initially)
  useEffect(() => {
    const initialSelection = {};
    availablePlatformsForSelection.forEach(p => initialSelection[p.id] = false);
    setSelectedPlatforms(initialSelection);
  }, [currentWorkspace]); // Reset/re-init if workspace changes


  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }));
  };

  const getPlatformButtonStyle = (platformId) => {
    return selectedPlatforms[platformId]
      ? 'bg-black text-white border-black'
      : 'bg-white text-black border-gray-300 hover:border-black';
  };

  const handleSchedule = async () => {
    if (!currentWorkspace) {
      setApiStatus({ loading: false, error: "No workspace selected.", success: null });
      return;
    }
    if (!token) {
      setApiStatus({ loading: false, error: "Authentication token not found.", success: null });
      return;
    }

    const connectedAccountIds = Object.entries(selectedPlatforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platformId, _]) => {
        // This needs to map platformId (e.g., 'instagram') to actual connected_account.id
        // This is a placeholder until connected_accounts are properly loaded into state.
        const platform = availablePlatformsForSelection.find(p => p.id === platformId);
        return platform?.connected_account_id_temp; // Use a temporary or placeholder ID
      })
      .filter(id => id !== undefined); // Filter out undefined if mapping fails

    if (connectedAccountIds.length === 0) {
      setApiStatus({ loading: false, error: "Please select at least one platform to publish to.", success: null });
      return;
    }

    setApiStatus({ loading: true, error: null, success: null }); // Keep for local loading state if needed, or remove if toast.promise handles all

    const postDataPayload = {
      content_text: content,
      // media_url: "http://example.com/image.jpg", // TODO: Implement media upload
      status: scheduledTime ? "scheduled" : "draft",
      scheduled_at: scheduledTime ? new Date(scheduledTime).toISOString() : null,
    };

    const requestBodyPayload = {
      post_data: postDataPayload,
      connected_account_ids: connectedAccountIds,
    };

    const promise = apiClient.post(
      `/workspaces/${currentWorkspace.id}/posts`,
      requestBodyPayload
    );

    toast.promise(
      promise,
      {
        pending: 'Scheduling post...',
        success: 'Post scheduled successfully!',
        error: {
          render({data}){
            // data will be the error thrown by apiClient
            return data.response?.data?.detail || data.message || 'Failed to schedule post.';
          }
        }
      }
    ).then(() => {
      // On success (toast.promise resolves)
      setApiStatus({ loading: false, error: null, success: "Post created/scheduled successfully!"}); // Update local status
      setContent("");
      setScheduledTime("");
      const initialSelection = {};
      availablePlatformsForSelection.forEach(p => initialSelection[p.id] = false);
      setSelectedPlatforms(initialSelection);
      // TODO: Trigger calendar refresh here
      // Example: workspaceContext.refreshCalendarPosts(); or similar
    }).catch((error) => {
      // On error (toast.promise rejects)
      // Error is already displayed by toast.promise
      setApiStatus({ loading: false, error: error.response?.data?.detail || "Failed to create post.", success: null });
    }).finally(() => {
       setApiStatus(prev => ({ ...prev, loading: false })); // Ensure loading is false
    });
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
            // platformIcons no longer needed directly in ContentArea if availablePlatformsForSelection is used
            availablePlatformsForSelection={availablePlatformsForSelection}
            availablePlatformsForSelection={availablePlatformsForSelection}
            availablePlatformsForSelection={availablePlatformsForSelection}
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

            <Button
              onClick={handleSchedule}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              disabled={apiStatus.loading} // Disable button while loading
            >
                <Send className="h-5 w-5" />
                {apiStatus.loading ? "Processing..." : (scheduledTime ? `Schedule ${contentType}` : `Publish ${contentType} Now`)}
            </Button>
            {/* Local error/success messages can be removed if toasts are sufficient */}
            {/* {apiStatus.error && <p className="text-sm text-red-600 mt-2">{apiStatus.error}</p>} */}
            {/* {apiStatus.success && <p className="text-sm text-green-600 mt-2">{apiStatus.success}</p>} */}
        </div>
      </Tabs>
    </Card>
  );
};


const ContentArea = ({ type, content, setContent, selectedPlatforms, togglePlatform, availablePlatformsForSelection, getPlatformButtonStyle, aiAssistance, setAiAssistance, renderMediaUpload }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={`content-${type}`} className="text-lg">Your {type} content:</Label>
        {/* TODO: Add a check here if currentWorkspace is null, and disable textarea or show a message */}
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
          {/* TODO: This should list Connected Accounts from the currentWorkspace */}
          {/* For now, using placeholder `availablePlatformsForSelection` */}
          {availablePlatformsForSelection.map((platform) => (
            <Button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              // variant={selectedPlatforms[platform.id] ? 'solid' : 'outline'} // Placeholder doesn't have variant prop behavior
              className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md ${getPlatformButtonStyle(platform.id)}`}
            >
              {platform.icon} {platform.name}
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
