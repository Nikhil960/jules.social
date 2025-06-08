import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Card,
  Textarea,
  Label,
  Slider,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './ui/placeholders'; // Assuming placeholders.js is one level up
import {
  Music,
  Film,
  ImageIcon,
  FileText,
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Mic,
  Wand2,
  Scissors,
  Layers,
  Crop,
  RotateCcw,
  Check,
  Copy,
  Sparkles,
  Loader2,
  MessageSquare,
  Volume2,
  VolumeX,
  Save,
  Download,
  ChevronLeft,
  Settings,
  Trash2,
  Palette,
  Maximize,
  Minimize
} from 'lucide-react';

const StudioInterface = ({ type, typeName, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [fileName, setFileName] = useState('MyCreation');
  const [history, setHistory] = useState([]);
  const [activeTool, setActiveTool] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name.split('.')[0]);
      // Add to history
      addToHistory(`Uploaded file: ${file.name}`);
      // TODO: Process file
    }
  };

  const addToHistory = (action) => {
    setHistory(prev => [action, ...prev.slice(0, 4)]); // Keep last 5 actions
  };

  const commonTools = [
    { id: 'upload', name: 'Upload', icon: Upload },
    { id: 'save', name: 'Save', icon: Save },
    { id: 'download', name: 'Download', icon: Download },
    { id: 'ai', name: 'AI Magic', icon: Sparkles },
  ];

  const studioSpecificTools = {
    audio: [
      { id: 'record', name: 'Record', icon: Mic },
      { id: 'trim', name: 'Trim', icon: Scissors },
      { id: 'merge', name: 'Merge', icon: Layers },
    ],
    video: [
      { id: 'trim', name: 'Trim', icon: Scissors },
      { id: 'effects', name: 'Effects', icon: Wand2 },
      { id: 'transitions', name: 'Transitions', icon: Film },
    ],
    image: [
      { id: 'crop', name: 'Crop', icon: Crop },
      { id: 'filters', name: 'Filters', icon: Palette },
      { id: 'text', name: 'Add Text', icon: FileText },
    ],
    text: [
      { id: 'format', name: 'Format', icon: Palette },
      { id: 'summarize', name: 'Summarize', icon: Layers },
      { id: 'translate', name: 'Translate', icon: MessageSquare },
    ],
  };

  const typeIcons = {
    audio: <Music className="h-8 w-8 text-pink-500" />,
    video: <Film className="h-8 w-8 text-purple-500" />,
    image: <ImageIcon className="h-8 w-8 text-blue-500" />,
    text: <FileText className="h-8 w-8 text-green-500" />,
  };

  const handleAIProcess = async () => {
    if (!aiPrompt) return;
    setIsProcessing(true);
    addToHistory(`AI processing: "${aiPrompt}"`);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiResponse(`AI generated response for: "${aiPrompt}". Lorem ipsum dolor sit amet, consectetur adipiscing elit.`);
    setIsProcessing(false);
  };

  const CurrentToolInterface = () => {
    if (!activeTool) return <p className="text-gray-500 text-center py-8">Select a tool to start editing.</p>;

    switch(activeTool) {
        case 'upload':
            return (
                <div>
                    <h3 className="font-semibold text-lg mb-2">Upload Media</h3>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    {fileName && <p className="mt-2 text-sm">Working on: {fileName}</p>}
                </div>
            );
        case 'ai':
            return (
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">AI Magic Assistant</h3>
                    <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe what you want the AI to do..." className="min-h-[80px]" />
                    <Button onClick={handleAIProcess} disabled={isProcessing} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                        {isProcessing ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                        Process with AI
                    </Button>
                    {aiResponse && <Card className="p-3 bg-yellow-50 border-yellow-200 text-sm">{aiResponse}</Card>}
                </div>
            );
        // Add more cases for other tools
        default:
            return <p className="text-gray-600">Tool selected: <span className="font-semibold">{activeTool}</span>. Interface not yet implemented.</p>;
    }
  };


  return (
    <Card className="border-2 border-black rounded-xl shadow-[rgba(0,_0,_0,_0.4)_0px_30px_90px] overflow-hidden w-full max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="p-5 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="outline" className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          {typeIcons[type]}
          <h2 className="text-2xl font-black tracking-tighter">{typeName}</h2>
        </div>
        <div className="flex items-center gap-2">
            <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-black"/>
            <Button variant="ghost" className="p-2 hover:bg-gray-200 rounded-full"><Settings className="h-5 w-5 text-gray-600"/></Button>
        </div>
      </div>

      <div className="flex">
        {/* Toolbar */}
        <div className="w-20 sm:w-24 bg-gray-100 border-r-2 border-black p-3 space-y-3 flex flex-col items-center">
          {(commonTools || []).concat(studioSpecificTools[type] || []).map(tool => {
            let specificClickHandler = () => {
              setActiveTool(tool.id);
              addToHistory(`Selected tool: ${tool.name}`);
            };

            if (tool.id === 'save') {
              specificClickHandler = () => {
                setActiveTool(tool.id);
                addToHistory(`Selected tool: ${tool.name}`);
                console.log("Save Project action triggered from toolbar");
                // Potentially, a save UI would appear in CurrentToolInterface
                // For now, this log indicates the intent to save.
              };
            } else if (tool.id === 'upload') {
              specificClickHandler = () => {
                setActiveTool(tool.id);
                addToHistory(`Selected tool: ${tool.name}`);
                console.log("Upload action triggered from toolbar");
                // The CurrentToolInterface for 'upload' shows the file input.
              };
            } else if (tool.id === 'download') {
              specificClickHandler = () => {
                setActiveTool(tool.id);
                addToHistory(`Selected tool: ${tool.name}`);
                console.log("Download action triggered from toolbar");
                // Actual download logic would be here or in CurrentToolInterface
              };
            }

            return (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? 'solid' : 'ghost'}
                onClick={specificClickHandler}
                className={`w-full aspect-square flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-150 ease-in-out
                            ${activeTool === tool.id ? 'bg-black text-white shadow-md' : 'hover:bg-gray-200 text-gray-700'}`}
                title={tool.name}
              >
                <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
              <span className="text-xs hidden sm:block">{tool.name}</span>
            </Button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preview Area */}
            <motion.div
                className="md:col-span-2 bg-gray-200 aspect-video rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center relative overflow-hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1}}
            >
              {/* Placeholder for media preview */}
              <p className="text-gray-500">Media Preview Area</p>
              {type === 'audio' && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/70 backdrop-blur-sm rounded-lg shadow-md flex items-center gap-3">
                  <Button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-black text-white rounded-full">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Slider value={volume} onChange={(e) => setVolume(parseInt(e.target.value, 10))} max={100} step={1} className="flex-1" />
                  {volume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </div>
              )}
            </motion.div>

            {/* Controls/History */}
            <div className="space-y-4">
                <Card className="p-4 bg-gray-50 border-gray-200">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Toolbox</h4>
                    <CurrentToolInterface />
                </Card>
                <Card className="p-4 bg-gray-50 border-gray-200">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">History</h4>
                    {history.length > 0 ? (
                        <ul className="space-y-1 text-xs text-gray-600">
                        {history.map((item, index) => (
                            <li key={index} className="truncate p-1 bg-white rounded border border-gray-100">{item}</li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-gray-400">No actions yet.</p>
                    )}
                </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer/Actions */}
      <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end items-center gap-3">
        <Button variant="outline" className="font-medium hover:bg-gray-200" onClick={() => { addToHistory('Cleared changes'); console.log("Clear All clicked"); }}>
            <Trash2 className="h-4 w-4 mr-2"/> Clear All
        </Button>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white font-bold flex items-center"
          onClick={() => {
            addToHistory('Project finalized');
            console.log(`Finalize & Export ${type} clicked`);
            /* Finalize logic */
          }}
        >
          <Check className="h-4 w-4 mr-2" /> Finalize & Export
        </Button>
      </div>
    </Card>
  );
};

export default StudioInterface;
