'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content cannot exceed 2000 characters'),
  mediaUrls: z.array(z.string().url('Must be a valid URL')).optional(),
  scheduledAt: z.date().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  useAi: z.boolean().default(false),
  aiPrompt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Platform = {
  id: string;
  name: string;
  icon: string;
};

type ConnectedAccount = {
  id: string;
  platformId: string;
  username: string;
};

export default function CreatePostForm() {
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedTab, setSelectedTab] = useState('create');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      mediaUrls: [],
      platforms: [],
      useAi: false,
      aiPrompt: '',
    },
  });

  const useAi = form.watch('useAi');
  const content = form.watch('content');

  useEffect(() => {
    // Fetch platforms
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/platforms/list');
        const data = await response.json();
        setPlatforms(data.platforms);
      } catch (error) {
        console.error('Error fetching platforms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load platforms',
          variant: 'destructive',
        });
      }
    };

    // Fetch connected accounts
    const fetchAccounts = async () => {
      try {
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/accounts/list');
        // const data = await response.json();
        
        // Mock data for now
        setConnectedAccounts([
          { id: '1', platformId: 'facebook', username: 'YourPage' },
          { id: '2', platformId: 'x', username: '@YourHandle' },
          { id: '3', platformId: 'instagram', username: 'your_instagram' },
        ]);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchPlatforms();
    fetchAccounts();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/posts/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      // const data = await response.json();
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: values.scheduledAt 
          ? `Post scheduled for ${format(values.scheduledAt, 'PPP')}` 
          : 'Post published successfully',
      });
      
      // Reset form
      form.reset();
      setSelectedTab('create');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content to optimize',
        variant: 'destructive',
      });
      return;
    }

    try {
      setOptimizing(true);
      
      const aiPrompt = form.getValues('aiPrompt') || 'Optimize this content for better engagement';
      
      const response = await fetch('/api/ai/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, prompt: aiPrompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize content');
      }
      
      const data = await response.json();
      
      if (data.optimizedContent) {
        form.setValue('content', data.optimizedContent);
        toast({
          title: 'Content Optimized',
          description: 'Your content has been optimized with AI',
        });
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast({
        title: 'Optimization Failed',
        description: error instanceof Error ? error.message : 'Failed to optimize content',
        variant: 'destructive',
      });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>
          Create and schedule posts across your social media platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's on your mind?" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {2000 - (field.value?.length || 0)} characters remaining
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mediaUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media URLs</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value?.[0] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? [value] : []);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Add URLs to images or videos to include in your post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Schedule</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                "Post immediately"
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select a date to schedule your post or leave empty to post immediately
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Platforms</FormLabel>
                        <FormDescription>
                          Select the platforms to post to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {platforms.map((platform) => {
                          // Check if user has connected this platform
                          const isConnected = connectedAccounts.some(
                            (account) => account.platformId === platform.id
                          );
                          
                          return (
                            <FormField
                              key={platform.id}
                              control={form.control}
                              name="platforms"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={platform.id}
                                    className={cn(
                                      "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
                                      !isConnected && "opacity-50"
                                    )}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(platform.id)}
                                        onCheckedChange={(checked) => {
                                          if (!isConnected) return;
                                          
                                          const updatedPlatforms = checked
                                            ? [...field.value, platform.id]
                                            : field.value?.filter(
                                                (value) => value !== platform.id
                                              );
                                          field.onChange(updatedPlatforms);
                                        }}
                                        disabled={!isConnected}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>
                                        {platform.name}
                                      </FormLabel>
                                      <FormDescription>
                                        {isConnected 
                                          ? connectedAccounts.find(a => a.platformId === platform.id)?.username 
                                          : "Not connected"}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="useAi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Use AI to optimize content
                        </FormLabel>
                        <FormDescription>
                          Let AI help you optimize your content for better engagement
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {useAi && (
                  <FormField
                    control={form.control}
                    name="aiPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Prompt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g., Make this more engaging for a professional audience" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide specific instructions for the AI
                        </FormDescription>
                        <div className="mt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleOptimizeContent}
                            disabled={optimizing || !content.trim()}
                          >
                            {optimizing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Optimizing...
                              </>
                            ) : (
                              'Optimize Now'
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {form.getValues('scheduledAt') ? 'Scheduling...' : 'Publishing...'}
                      </>
                    ) : (
                      <>{form.getValues('scheduledAt') ? 'Schedule Post' : 'Publish Now'}</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-4">
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">Content Preview</h3>
              <div className="whitespace-pre-wrap">{content || 'No content to preview'}</div>
              
              {form.getValues('mediaUrls')?.[0] && (
                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Media Preview</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={form.getValues('mediaUrls')[0]} 
                      alt="Media preview" 
                      className="max-h-[300px] w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="mb-2 font-semibold">Publishing Details</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">When: </span>
                    {form.getValues('scheduledAt') 
                      ? format(form.getValues('scheduledAt'), 'PPP p') 
                      : 'Immediately'}
                  </li>
                  <li>
                    <span className="font-medium">Platforms: </span>
                    {form.getValues('platforms').length > 0 
                      ? form.getValues('platforms')
                          .map(id => platforms.find(p => p.id === id)?.name || id)
                          .join(', ')
                      : 'None selected'}
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="button" 
                  onClick={() => setSelectedTab('create')}
                  variant="outline"
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button 
                  type="button" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {form.getValues('scheduledAt') ? 'Scheduling...' : 'Publishing...'}
                    </>
                  ) : (
                    <>{form.getValues('scheduledAt') ? 'Schedule Post' : 'Publish Now'}</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}