import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Users, MessageSquare, BarChart3, Calendar, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Business Brain",
      description: "Upload your data and SIBE learns your entire business ecosystem"
    },
    {
      icon: Users,
      title: "Synthetic AI Employees",
      description: "Create CFOs, Engineers, Analysts, and more - each with specialized knowledge"
    },
    {
      icon: MessageSquare,
      title: "Voice Meetings",
      description: "Hold live strategy sessions with your AI team every week"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Real-time KPIs, forecasts, and actionable business insights"
    },
    {
      icon: Calendar,
      title: "Automated Reports",
      description: "AI-generated summaries, meeting notes, and strategic recommendations"
    },
    {
      icon: Sparkles,
      title: "Continuous Learning",
      description: "Your AI team improves as your business grows and evolves"
    }
  ];

  const pricingTiers = [
    {
      name: "Starter Access",
      price: "$99",
      period: "per month",
      description: "Perfect for small businesses and startups",
      features: [
        "1 AI Employee",
        "Core Dashboard & KPI Tracking",
        "AI Chat Interface",
        "Basic Reports",
        "Email Support"
      ]
    },
    {
      name: "Growth Access",
      price: "$299",
      period: "per month",
      description: "For scaling companies needing deeper insights",
      features: [
        "Up to 5 AI Employees",
        "Voice Meetings & Conferences",
        "Advanced Analytics & Forecasting",
        "AI-Generated Reports",
        "Calendar Integration",
        "Priority Support"
      ],
      featured: true
    },
    {
      name: "Enterprise Access",
      price: "Custom",
      period: "pricing",
      description: "For large organizations and government",
      features: [
        "Unlimited AI Employees",
        "Full Predictive Analytics Suite",
        "Custom Integrations",
        "Dedicated Consultant",
        "White-Label Options",
        "24/7 Premium Support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"></div>
        
        <nav className="container mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold glow-text">SIBE SI</div>
            <Link to="/dashboard">
              <Button className="glass-button gap-2">
                Enter Platform
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <div className="glass-card px-6 py-3 rounded-full">
                <span className="text-primary font-semibold">Synthetic Intelligence Business Engine</span>
              </div>
            </div>
            
            <h1 className="text-7xl font-bold mb-8 leading-tight">
              The AI that <span className="glow-text">meets with you</span>, speaks with you, and scales your business
            </h1>
            
            <p className="text-2xl text-secondary mb-12 max-w-3xl mx-auto">
              SIBE SI is the world's first interactive synthetic business partner - combining AI reasoning, 
              voice meetings, and an entire AI workforce to transform how you run your organization.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="glass-button gap-3 text-lg px-8 py-6 animate-pulse-glow">
                  <Sparkles className="w-6 h-6" />
                  Start Your AI Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="glass-button text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-secondary">Always Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">94%</div>
                <div className="text-sm text-secondary">Efficiency Boost</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
                <div className="text-sm text-secondary">Scalability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Synthetic Intelligence vs Traditional AI</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              SIBE doesn't just analyze - it constructs its own logical understanding of your business, 
              continuously improving with every interaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card p-8 hover:glow-border transition-all duration-300 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-6 animate-pulse-glow">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">How SIBE SI Works</h2>
            <p className="text-xl text-secondary">Simple, powerful, transformative</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { step: 1, title: "Upload Your Data", desc: "Business plans, reports, financial data - SIBE learns everything" },
              { step: 2, title: "Create Your AI Team", desc: "Build your synthetic workforce with specialized AI employees" },
              { step: 3, title: "Weekly Strategy Meetings", desc: "Voice-enabled conferences with your AI team every Monday" },
              { step: 4, title: "Scale Intelligently", desc: "Get AI-generated insights, reports, and strategic recommendations" }
            ].map((item, index) => (
              <Card key={index} className="glass-card p-8 flex items-start gap-6 hover:glow-border transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-secondary">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Choose Your Access Level</h2>
            <p className="text-xl text-secondary">Start with what you need, scale as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`glass-card p-8 ${tier.featured ? 'border-primary glow-border scale-105' : ''} hover:glow-border transition-all duration-300`}
              >
                {tier.featured && (
                  <div className="bg-primary text-black text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary">{tier.price}</span>
                  <span className="text-secondary ml-2">{tier.period}</span>
                </div>
                <p className="text-secondary mb-8">{tier.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full ${tier.featured ? 'glass-button animate-pulse-glow' : 'glass-button'}`}>
                  {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-2xl text-secondary mb-12">
              Join the future of business intelligence. Start with SIBE SI today.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="glass-button gap-3 text-xl px-12 py-8 animate-pulse-glow">
                <Brain className="w-6 h-6" />
                Launch SIBE SI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold glow-text">SIBE SI</div>
            <p className="text-secondary">© 2025 SGD Business Analysis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
