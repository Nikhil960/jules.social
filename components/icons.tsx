import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Share2,
  HelpCircle,
  Youtube,
} from "lucide-react";

// Create a custom Pinterest icon since it's not available in lucide-react
function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.5c-.07-.7-.15-1.87 0-2.7l.76-3.18s-.2-.39-.2-.98c0-.9.54-1.59 1.2-1.59.56 0 .84.42.84.93 0 .57-.36 1.42-.55 2.2-.16.65.33 1.18.99 1.18 1.18 0 2.08-1.25 2.08-3.03 0-1.6-1.14-2.71-2.79-2.71a2.9 2.9 0 0 0-3.02 2.93c0 .57.18 1.19.48 1.52.05.06.06.12.04.18l-.17.73c-.03.1-.09.13-.2.08-1.02-.48-1.48-1.93-1.48-3.07 0-2.06 1.5-3.93 4.32-3.93 2.27 0 4.02 1.7 4.02 3.95 0 2.36-1.32 4.26-3.15 4.26-.61 0-1.19-.32-1.39-.7l-.38 1.45c-.13.51-.51 1.15-.75 1.54A10 10 0 1 0 12 2z" />
    </svg>
  );
}

// Create a custom TikTok icon since it's not available in lucide-react
function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

// Create a custom X icon (formerly Twitter)
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l7.2 8.4L4 20h3.6l4.8-5.6L16.8 20H20l-7.2-8.4L20 4h-3.6l-4.8 5.6L7.6 4H4z" />
    </svg>
  );
}

export const Icons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: XIcon,
  twitter: XIcon, // Keep for backward compatibility
  pinterest: PinterestIcon,
  tiktok: TiktokIcon,
  youtube: Youtube,
  message: MessageCircle,
  share: Share2,
  question: HelpCircle,
};