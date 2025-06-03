'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./icons";
import { useToast } from "./ui/use-toast";

type Platform = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
};

type ConnectPlatformProps = {
  platform: Platform;
  onSuccess?: () => void;
};

export default function ConnectPlatform({ platform, onSuccess }: ConnectPlatformProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Get the auth URL for the platform
      const response = await fetch(`/api/accounts/auth-url?platform=${platform.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to get authentication URL');
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open the auth URL in a new window
        const authWindow = window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        // Poll for completion
        const checkInterval = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkInterval);
            setLoading(false);
            
            // Check if the connection was successful
            fetch(`/api/accounts/status?platform=${platform.id}`)
              .then(res => res.json())
              .then(statusData => {
                if (statusData.connected) {
                  toast({
                    title: "Connection Successful",
                    description: `Your ${platform.name} account has been connected successfully.`,
                    variant: "default",
                  });
                  
                  if (onSuccess) {
                    onSuccess();
                  }
                } else {
                  toast({
                    title: "Connection Failed",
                    description: "The connection process was cancelled or failed.",
                    variant: "destructive",
                  });
                }
              })
              .catch(() => {
                toast({
                  title: "Connection Status Unknown",
                  description: "Unable to verify connection status. Please check your accounts page.",
                  variant: "destructive",
                });
              });
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting to platform:', error);
      setLoading(false);
      
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to platform",
        variant: "destructive",
      });
    }
  };

  // Dynamically get the icon component
  const IconComponent = platform.icon in Icons ? Icons[platform.icon as keyof typeof Icons] : Icons.question;

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${platform.color} text-white`}>
        <div className="flex items-center gap-2">
          <IconComponent className="h-6 w-6" />
          <CardTitle>{platform.name}</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          {platform.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <h4 className="mb-2 text-sm font-semibold">Features</h4>
        <ul className="list-disc pl-5 text-sm">
          {platform.features.map((feature, index) => (
            <li key={index} className="capitalize">{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-4">
        <Button 
          onClick={handleConnect} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect {platform.name}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}