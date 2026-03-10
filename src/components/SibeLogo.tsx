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
        "relative rounded-full bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      style={{ boxShadow: "0 0 20px hsla(190, 95%, 50%, 0.3), 0 0 40px hsla(190, 95%, 50%, 0.1)" }}
    >
      {/* Arc reactor ring */}
      <div className="absolute inset-0 rounded-full border border-primary/30 animate-arc-pulse" />
      <div className="absolute inset-[3px] rounded-full border border-primary/20" />
      
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
      
      {/* AI status dot */}
      <div className={cn(
        "absolute bg-primary rounded-full border-2 border-background",
        size === "sm" && "w-2 h-2 -bottom-0.5 -right-0.5",
        size === "md" && "w-3 h-3 -bottom-0.5 -right-0.5",
        size === "lg" && "w-4 h-4 bottom-0 right-0"
      )}
        style={{ boxShadow: "0 0 8px hsla(190, 95%, 50%, 0.5)" }}
      />
    </div>
  );
};

export default SibeLogo;
