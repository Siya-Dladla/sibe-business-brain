import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
const emailSchema = z.string().trim().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin) {
        nameSchema.parse(fullName);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message
        });
      }
      return false;
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    setLoading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message
      });
    } else {
      toast({
        title: "Success!",
        description: "Check your email to confirm your account."
      });
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message
      });
    }
  };
  return <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-6">
      <Card className="glass-card w-full max-w-md hover-lift border-primary/20">
        <CardHeader className="space-y-6 text-center bg-primary-foreground">
          <div className="mx-auto animate-float">
            <div className="relative text-secondary-foreground">
              <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center bg-gradient-card backdrop-blur-sm shadow-2xl">
                <div className="text-center">
                  <h1 className="text-3xl font-extralight tracking-wider glow-text text-primary bg-primary-foreground">Sibe</h1>
                  <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                </div>
              </div>
              <div className="absolute -top-3 -right-5 text-xl font-extralight text-primary tracking-widest">SI</div>
              <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-glow bg-primary-foreground"></div>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-extralight tracking-wide text-primary mb-2">
              Synthetic Intelligence Business Engine
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light">
              {isLogin ? "Access Your Business Intelligence" : "Create Your Account"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="bg-primary-foreground">
          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            {!isLogin && <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-light">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-primary/50" />
                  <Input id="fullName" type="text" placeholder="Enter your name" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 bg-input border-primary/20 focus:border-primary h-11 font-light" required={!isLogin} />
                </div>
              </div>}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-light">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-primary/50" />
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 bg-input border-primary/20 focus:border-primary h-11 font-light" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-light">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-primary/50" />
                <Input id="password" type="password" placeholder={isLogin ? "Enter your password" : "Minimum 6 characters"} value={password} onChange={e => setPassword(e.target.value)} className="pl-10 bg-input border-primary/20 focus:border-primary h-11 font-light" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light mt-6" disabled={loading}>
              {loading ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  Processing...
                </div> : <>{isLogin ? "Sign In" : "Create Account"}</>}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => {
            setIsLogin(!isLogin);
            setEmail("");
            setPassword("");
            setFullName("");
          }} className="text-sm text-primary hover:text-primary/80 transition-colors font-light">
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-primary/10">
            <p className="text-xs text-center text-muted-foreground font-light">
              Secure authentication powered by Lovable Cloud
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;