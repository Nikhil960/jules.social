import React from 'react';
import { Button as ActualButton } from './button'; // Assuming button.js is in the same folder

// Re-export Button or define it here if it's not complex
export const Button = ActualButton;

export const Card = ({ className, children, ...props }) => <div className={`border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`} {...props}>{children}</div>;

export const Badge = ({ children, className, variant, ...props }) => <span className={`${className} ${variant === 'default' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'} px-2 py-1 rounded-full text-xs font-semibold`} {...props}>{children}</span>;

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} {...props} className={`border-2 border-black rounded-xl p-4 w-full ${className}`} />
));
Textarea.displayName = "Textarea";

export const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <input type="checkbox" ref={ref} {...props} className={`form-checkbox h-5 w-5 text-black border-gray-300 rounded focus:ring-black ${className}`} />
));
Switch.displayName = "Switch";

export const Label = ({ children, className, ...props }) => <label className={`block text-sm font-bold text-gray-700 mb-1 ${className}`} {...props}>{children}</label>;

export const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <input type="range" ref={ref} {...props} className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`} />
));
Slider.displayName = "Slider";

// Simplified Select placeholders
export const Select = ({ children, onValueChange, defaultValue, ...props }) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);

  const handleSelect = (value) => {
    setSelectedValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return <div className="relative" {...props}>{React.Children.map(children, child => React.cloneElement(child, { selectedValue, handleSelect }))}</div>;
};

export const SelectTrigger = ({ children, className, selectedValue, handleSelect }) => (
  <div className={`border-2 border-black rounded-xl p-3 flex justify-between items-center cursor-pointer ${className}`}>
    {React.Children.map(children, child => child.type === SelectValue && selectedValue ? React.Children.toArray(children).find(c => c.type !== SelectValue && c.props.value === selectedValue)?.props.children || child : child)}
  </div>
);

export const SelectValue = ({ placeholder }) => <span className="text-gray-500">{placeholder || "Select..."}</span>;

export const SelectContent = ({ children, className, selectedValue, handleSelect }) => (
  <div className={`absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-xl shadow-lg ${className}`}>
    {React.Children.map(children, child => React.cloneElement(child, { selectedValue, handleSelect }))}
  </div>
);

export const SelectItem = ({ children, value, className, selectedValue, handleSelect }) => (
  <div
    data-value={value}
    onClick={() => handleSelect(value)}
    className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedValue === value ? 'bg-gray-200' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Collapsible = ({ children, ...props }) => <div {...props}>{children}</div>;

export const CollapsibleTrigger = ({ children, onClick, ...props }) => <div onClick={onClick} {...props}>{children}</div>;

export const CollapsibleContent = ({ children, ...props }) => <div {...props}>{children}</div>;


// Tabs placeholders (already defined in Dashboard.jsx, but good to have them centrally if needed)
// For now, we'll assume Dashboard.jsx's Tabs are sufficient, or these can be expanded later.
export const Tabs = ({ children, defaultValue, className, onValueChange }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };
  // This map function is to pass activeTab and handleTabChange to children like TabsList and TabsContent
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, handleTabChange });
    }
    return child;
  });
  return <div className={className}>{childrenWithProps}</div>;
};

export const TabsList = ({ children, className, activeTab, handleTabChange }) => (
  <div className={`flex border-b border-gray-300 ${className}`}>
    {React.Children.map(children, child => React.cloneElement(child, { activeTab, handleTabChange }))}
  </div>
);

export const TabsTrigger = ({ children, value, className, activeTab, handleTabChange }) => (
  <button
    onClick={() => handleTabChange(value)}
    className={`${className} ${activeTab === value ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-3 px-4 border-b-2 font-medium text-sm focus:outline-none`}
    data-state={activeTab === value ? 'active' : 'inactive'}
  >
    {children}
  </button>
);

export const TabsContent = ({ children, value, activeTab }) => (
  activeTab === value ? <div className="p-4">{children}</div> : null
);
