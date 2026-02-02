import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Star, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

interface Developer {
  id: string;
  name: string;
  specialty: string[];
  description: string | null;
  profile_url: string | null;
  availability: string;
  hourly_rate: number | null;
  rating: number;
  review_count: number;
  verified: boolean;
}

interface CommunityDevelopersProps {
  filterSpecialties?: string[];
  title?: string;
  subtitle?: string;
}

const CommunityDevelopers = ({ 
  filterSpecialties, 
  title = "AI Developer Community",
  subtitle = "Connect with experts to help you build automations and AI solutions"
}: CommunityDevelopersProps) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevelopers();
  }, [filterSpecialties]);

  const loadDevelopers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('community_developers')
        .select('*')
        .order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];
      
      // Filter by specialties if provided
      if (filterSpecialties && filterSpecialties.length > 0) {
        filteredData = filteredData.filter(dev => 
          dev.specialty?.some((s: string) => 
            filterSpecialties.some(fs => s.toLowerCase().includes(fs.toLowerCase()))
          )
        );
      }

      setDevelopers(filteredData);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400 border-0">Available</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Busy</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400 border-0">Unavailable</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      'n8n': 'bg-orange-500/20 text-orange-400',
      'zapier': 'bg-amber-500/20 text-amber-400',
      'make': 'bg-purple-500/20 text-purple-400',
      'openai': 'bg-green-500/20 text-green-400',
      'anthropic': 'bg-orange-500/20 text-orange-400',
      'langchain': 'bg-teal-500/20 text-teal-400',
      'crewai': 'bg-pink-500/20 text-pink-400',
      'autogen': 'bg-indigo-500/20 text-indigo-400',
      'huggingface': 'bg-yellow-500/20 text-yellow-400',
      'shopify': 'bg-green-500/20 text-green-400',
      'meta': 'bg-blue-500/20 text-blue-400',
      'stripe': 'bg-purple-500/20 text-purple-400',
      'supabase': 'bg-emerald-500/20 text-emerald-400',
    };
    
    const lowerSpecialty = specialty.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (lowerSpecialty.includes(key)) return color;
    }
    return 'bg-primary/20 text-primary';
  };

  if (loading) {
    return (
      <Card className="glass-card p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-extralight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <p className="text-sm text-amber-400">
          💡 <span className="font-medium">Need help?</span> These verified AI developers can help you build workflows 
          and agents on third-party platforms that integrate seamlessly with Sibe.
        </p>
      </div>

      {developers.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No developers found for these specialties</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((dev) => (
            <Card key={dev.id} className="glass-card p-5 hover-lift group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(dev.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{dev.name}</h3>
                      {dev.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{dev.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground/50">({dev.review_count} reviews)</span>
                    </div>
                  </div>
                </div>
                {getAvailabilityBadge(dev.availability)}
              </div>

              {dev.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {dev.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {dev.specialty?.slice(0, 4).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className={`text-xs ${getSpecialtyColor(spec)}`}>
                    {spec}
                  </Badge>
                ))}
                {(dev.specialty?.length || 0) > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dev.specialty!.length - 4}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                {dev.hourly_rate && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">${dev.hourly_rate}/hr</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 ml-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    if (dev.profile_url) {
                      window.open(dev.profile_url, '_blank');
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityDevelopers;
