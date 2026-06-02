import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  layerLabel: string;
  children: ReactNode;
}

const AXLayerShell = ({ icon: Icon, title, subtitle, layerLabel, children }: Props) => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
          {layerLabel}
        </Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-safe max-w-6xl">
        <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AXLayerShell;
