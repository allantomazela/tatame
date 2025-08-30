import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavigationButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavigationButton({ 
  icon: Icon, 
  label, 
  isActive = false, 
  onClick,
  className 
}: NavigationButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 text-left font-normal",
        isActive && "bg-gradient-primary text-white shadow-primary",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}