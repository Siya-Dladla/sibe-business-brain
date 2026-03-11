import { cn } from "@/lib/utils";

interface SibeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SibeLogo = ({ className, size = "md" }: SibeLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "relative rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
      
      {/* Inner content - S logo */}
      <div className="relative z-10 flex items-center justify-center">
        <span className={cn(
          "font-bold text-primary-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl"
        )}>
          S
        </span>
      </div>
      
      {/* AI indicator dot */}
      <div className={cn(
        "absolute bg-green-400 rounded-full border-2 border-background animate-pulse",
        size === "sm" && "w-2 h-2 -bottom-0.5 -right-0.5",
        size === "md" && "w-3 h-3 -bottom-0.5 -right-0.5",
        size === "lg" && "w-4 h-4 bottom-0 right-0"
      )} />
    </div>
  );
};

export default SibeLogo;
