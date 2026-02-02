import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink, Sparkles, Cpu, Brain, MessageSquare, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileMenu from "@/components/MobileMenu";
import { useToast } from "@/hooks/use-toast";
import CommunityDevelopers from "@/components/CommunityDevelopers";

interface AgentPlatform {
  id: string;
  name: string;
  description: string;
  icon: typeof Bot;
  color: string;
  url: string;
  features: string[];
  category: 'builder' | 'framework' | 'marketplace';
}

const AGENT_PLATFORMS: AgentPlatform[] = [
  {
    id: 'openai-assistants',
    name: 'OpenAI Assistants',
    description: 'Build custom AI assistants with GPT-4, code interpreter, and knowledge retrieval capabilities.',
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500',
    url: 'https://platform.openai.com/assistants',
    features: ['GPT-4 Turbo', 'Code Interpreter', 'Function Calling', 'File Search'],
    category: 'builder'
  },
  {
    id: 'anthropic-claude',
    name: 'Claude by Anthropic',
    description: 'Create agents with Claude for safe, helpful, and honest AI interactions.',
    icon: Brain,
    color: 'from-orange-500 to-amber-500',
    url: 'https://console.anthropic.com',
    features: ['200K context', 'Vision capabilities', 'Tool use', 'Constitutional AI'],
    category: 'builder'
  },
  {
    id: 'google-vertex',
    name: 'Google Vertex AI Agents',
    description: 'Build conversational AI agents with Gemini models and Google Cloud integration.',
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
    url: 'https://cloud.google.com/vertex-ai',
    features: ['Gemini Pro', 'Grounding', 'Extensions', 'Multi-modal'],
    category: 'builder'
  },
  {
    id: 'langchain',
    name: 'LangChain',
    description: 'Open-source framework for building context-aware reasoning applications.',
    icon: Cpu,
    color: 'from-teal-500 to-green-500',
    url: 'https://langchain.com',
    features: ['Chain composition', 'Agent toolkits', 'Memory systems', 'RAG'],
    category: 'framework'
  },
  {
    id: 'crewai',
    name: 'CrewAI',
    description: 'Framework for orchestrating role-playing AI agents working together.',
    icon: Bot,
    color: 'from-purple-500 to-pink-500',
    url: 'https://www.crewai.com',
    features: ['Multi-agent', 'Role-based', 'Task delegation', 'Process types'],
    category: 'framework'
  },
  {
    id: 'autogen',
    name: 'Microsoft AutoGen',
    description: 'Build next-gen LLM applications with multi-agent conversation framework.',
    icon: MessageSquare,
    color: 'from-indigo-500 to-purple-500',
    url: 'https://microsoft.github.io/autogen/',
    features: ['Multi-agent', 'Human-in-loop', 'Code execution', 'Customizable'],
    category: 'framework'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Agents',
    description: 'Build agents with open-source models and the Transformers Agents library.',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    url: 'https://huggingface.co/docs/transformers/agents',
    features: ['Open models', 'Custom tools', 'Multi-modal', 'Community'],
    category: 'marketplace'
  },
  {
    id: 'fixie',
    name: 'Fixie.ai',
    description: 'Platform for building and deploying production-ready AI agents.',
    icon: Bot,
    color: 'from-rose-500 to-red-500',
    url: 'https://fixie.ai',
    features: ['Agent hosting', 'Memory', 'Tool integration', 'Analytics'],
    category: 'marketplace'
  }
];

const Employees = () => {
  const [platforms] = useState<AgentPlatform[]>(AGENT_PLATFORMS);
  const [filter, setFilter] = useState<'all' | 'builder' | 'framework' | 'marketplace'>('all');
  const [activeTab, setActiveTab] = useState<'platforms' | 'community'>('platforms');
  const { toast } = useToast();

  const handleConnect = (platform: AgentPlatform) => {
    window.open(platform.url, '_blank');
    toast({
      title: `Opening ${platform.name}`,
      description: "Create your AI agents there, then connect them to Sibe via API Data Feeds.",
    });
  };

  const builderPlatforms = platforms.filter(p => p.category === 'builder');
  const frameworkPlatforms = platforms.filter(p => p.category === 'framework');
  const marketplacePlatforms = platforms.filter(p => p.category === 'marketplace');

  const renderPlatformCard = (platform: AgentPlatform) => (
    <Card
      key={platform.id}
      className="glass-card p-6 hover-lift group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${platform.color} opacity-10 blur-2xl`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.color}`}>
            <platform.icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant="outline" className="text-xs">
            {platform.category}
          </Badge>
        </div>

        <h3 className="text-xl font-light mb-2">{platform.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {platform.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {platform.features.slice(0, 3).map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs bg-primary/5">
              {feature}
            </Badge>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
          onClick={() => handleConnect(platform)}
        >
          Open Platform
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">AI Agent Platforms</div>
      </div>

      <div className="container mx-auto px-6 py-8 bg-primary-foreground">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <Bot className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-4xl font-extralight tracking-wide">AI Agents</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Build AI agents on external platforms and connect them to Sibe
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="platforms" className="gap-2">
              <Bot className="w-4 h-4" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="w-4 h-4" />
              Developer Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="mt-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Platforms
              </Button>
              <Button
                variant={filter === 'builder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('builder')}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Agent Builders
              </Button>
              <Button
                variant={filter === 'framework' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('framework')}
                className="gap-2"
              >
                <Cpu className="w-4 h-4" />
                Frameworks
              </Button>
              <Button
                variant={filter === 'marketplace' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('marketplace')}
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                Marketplaces
              </Button>
            </div>

            {/* Info Box */}
            <Card className="glass-card p-4 mb-8 border-amber-500/20 bg-amber-500/5">
              <p className="text-sm text-amber-400">
                ⚡ <span className="font-medium">How it works:</span> Build your AI agents on these platforms, 
                then connect them to Sibe via the <span className="font-medium">Data → Connection Dashboard</span>. 
                Extra token charges may apply on third-party platforms.
              </p>
            </Card>

            {/* Agent Builder Platforms */}
            {(filter === 'all' || filter === 'builder') && (
              <div className="mb-10">
                <h2 className="text-2xl font-extralight mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Agent Builder Platforms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {builderPlatforms.map(renderPlatformCard)}
                </div>
              </div>
            )}

            {/* Frameworks */}
            {(filter === 'all' || filter === 'framework') && (
              <div className="mb-10">
                <h2 className="text-2xl font-extralight mb-6 flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-primary" />
                  Agent Frameworks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {frameworkPlatforms.map(renderPlatformCard)}
                </div>
              </div>
            )}

            {/* Marketplaces */}
            {(filter === 'all' || filter === 'marketplace') && (
              <div className="mb-10">
                <h2 className="text-2xl font-extralight mb-6 flex items-center gap-3">
                  <Bot className="w-6 h-6 text-primary" />
                  Agent Marketplaces
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplacePlatforms.map(renderPlatformCard)}
                </div>
              </div>
            )}

            {/* Getting Started */}
            <Card className="glass-card p-8 border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-1">Ready to Connect Your AI Agent?</h3>
                    <p className="text-muted-foreground text-sm">
                      After creating your agent, go to Data → Connection Dashboard to link it to Sibe.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="shrink-0" onClick={() => window.location.href = '/dashboard'}>
                  Open Dashboard
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <CommunityDevelopers 
              filterSpecialties={['openai', 'anthropic', 'langchain', 'crewai', 'autogen', 'huggingface']}
              title="AI Agent Developers"
              subtitle="Connect with experts who can help you build and deploy AI agents"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Employees;
