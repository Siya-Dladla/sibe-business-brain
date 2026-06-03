import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background safe-area-inset px-6">
      <div className="text-center max-w-md">
        <h1 className="mb-3 text-6xl font-extralight text-foreground tracking-tight">404</h1>
        <p className="mb-2 text-base font-light text-muted-foreground">Layer not found in the organism.</p>
        <p className="mb-6 text-xs text-muted-foreground/60 font-mono break-all">{location.pathname}</p>
        <Link to="/">
          <Button variant="outline" size="sm">Return to Command Center</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
