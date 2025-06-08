import React from 'react';

export const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  // Basic placeholder button, does not implement variants or sizes yet.
  // The className prop will pass through Tailwind classes for now.
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={`${className} inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button"

// Placeholder for Slot if you were to use Radix UI's Slot component
// For now, it's not strictly necessary if asChild is not heavily used with complex components.
const Slot = React.forwardRef((props, ref) => {
  return React.cloneElement(props.children, { ...props, ref });
});
Slot.displayName = "Slot"
