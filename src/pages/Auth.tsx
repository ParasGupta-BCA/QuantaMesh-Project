import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, User, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { z } from "zod";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

// OAuth error information with human-readable messages and fix steps
const OAUTH_ERROR_INFO: Record<string, { title: string; steps: string[] }> = {
  invalid_client: {
    title: "Google OAuth Client Configuration Error",
    steps: [
      "Open Google Cloud Console → Credentials",
      "Ensure you're using a 'Web application' OAuth Client (not Android/iOS/Desktop)",
      "Copy Client ID + Client Secret from the SAME OAuth client",
      "Paste them in Lovable Cloud → Users → Auth Settings → Google",
      "If unsure, generate a NEW Client Secret and update it",
    ],
  },
  redirect_uri_mismatch: {
    title: "Redirect URI Mismatch",
    steps: [
      "Open Lovable Cloud → Users → Auth Settings → Google",
      "Copy the Callback/Redirect URL shown there",
      "In Google Cloud Console → Credentials → your Web OAuth client",
      "Add that EXACT URL to 'Authorized redirect URIs'",
      "Also add your site (https://www.quantamesh.store) to 'Authorized JavaScript origins'",
    ],
  },
  access_denied: {
    title: "Access Denied",
    steps: [
      "If your app is in 'Testing' mode on Google Consent Screen, add your email as a Test User",
      "Go to Google Cloud Console → OAuth consent screen → Test users",
      "Add the email you're trying to sign in with",
    ],
  },
  server_error: {
    title: "Server Error During OAuth",
    steps: [
      "This usually means the Client ID/Secret is invalid or mismatched",
      "In Lovable Cloud, verify the Google Client ID and Secret are correct",
      "Try generating a new Client Secret in Google Cloud Console and updating it",
    ],
  },
  unexpected_failure: {
    title: "Unexpected OAuth Failure",
    steps: [
      "Check that your Google OAuth Client ID and Secret are from a 'Web application' client",
      "Ensure the redirect URI in Google matches the one shown in Lovable Cloud",
      "Try regenerating the Client Secret and updating it in Lovable Cloud",
    ],
  },
};

// reCAPTCHA site key from environment
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

// Add grecaptcha type for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => Promise<void>;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [oauthErrorDismissed, setOauthErrorDismissed] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || '/';

  // Parse OAuth error from URL (comes from failed Google login callback)
  const oauthError = useMemo(() => {
    const errorCode = searchParams.get('error_code') || searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (!errorCode && !errorDescription) return null;
    
    // Find matching error info
    let errorInfo = OAUTH_ERROR_INFO[errorCode || ''];
    
    // Check if description contains known error patterns
    if (!errorInfo && errorDescription) {
      if (errorDescription.includes('invalid_client')) {
        errorInfo = OAUTH_ERROR_INFO.invalid_client;
      } else if (errorDescription.includes('redirect_uri')) {
        errorInfo = OAUTH_ERROR_INFO.redirect_uri_mismatch;
      } else if (errorDescription.includes('Unable to exchange')) {
        errorInfo = OAUTH_ERROR_INFO.invalid_client;
      }
    }
    
    // Fallback for unknown errors
    if (!errorInfo) {
      errorInfo = {
        title: "OAuth Authentication Error",
        steps: [
          "Check your Google OAuth configuration in Lovable Cloud",
          "Verify Client ID and Secret are correct",
          "Ensure redirect URIs match exactly",
        ],
      };
    }
    
    return {
      code: errorCode,
      description: errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : null,
      ...errorInfo,
    };
  }, [searchParams]);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("reCAPTCHA site key not configured");
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      setRecaptchaLoaded(true);
    };
    script.onerror = () => {
      setRecaptchaError("Failed to load security verification");
    };
    document.body.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) {
      return null;
    }

    try {
      await window.grecaptcha.ready(() => {});
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      logError("reCAPTCHA execution", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Return to /auth so we can show errors nicely if the OAuth flow fails
          redirectTo: `${window.location.origin}/auth`,
          // Some Google Workspace accounts require explicit email scope
          scopes: 'https://www.googleapis.com/auth/userinfo.email',
        },
      });

      if (error) {
        logError('Google sign in', error);
        toast({
          title: "Google Sign In Failed",
          description: getSafeErrorMessage(error, "Failed to sign in with Google."),
          variant: "destructive",
        });
      }
    } catch (err) {
      logError('Google sign in', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate input
      const schema = isSignUp ? signUpSchema : signInSchema;
      const data = isSignUp ? { email, password, fullName } : { email, password };
      const result = schema.safeParse(data);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      // Execute reCAPTCHA if available
      if (RECAPTCHA_SITE_KEY && recaptchaLoaded) {
        const recaptchaToken = await executeRecaptcha(isSignUp ? 'signup' : 'signin');
        if (recaptchaToken) {
          // Verify reCAPTCHA on server
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-recaptcha", {
            body: { token: recaptchaToken }
          });

          if (verifyError || !verifyData?.success) {
            toast({
              title: "Security Check Failed",
              description: "Please try again or refresh the page.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }
      }

      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          logError('Sign up', error);
          toast({
            title: "Sign up failed",
            description: getSafeErrorMessage(error, "Failed to create account. Please try again."),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          logError('Sign in', error);
          toast({
            title: "Sign in failed",
            description: getSafeErrorMessage(error, "Failed to sign in. Please try again."),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have signed in successfully.",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* OAuth Error Banner */}
        {oauthError && !oauthErrorDismissed && (
          <Alert variant="destructive" className="mb-4 relative">
            <AlertTriangle className="h-4 w-4" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setOauthErrorDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertTitle className="pr-8">{oauthError.title}</AlertTitle>
            <AlertDescription className="mt-2">
              {oauthError.description && (
                <p className="text-xs mb-3 opacity-80 break-words">
                  Error: {oauthError.description}
                </p>
              )}
              <p className="font-medium mb-2">How to fix:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {oauthError.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </AlertDescription>
          </Alert>
        )}

        <div className="glass-card p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Sign up to track your app publishing orders"
                : "Sign in to your Quanta Mesh account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"}</>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* reCAPTCHA badge notice */}
          {RECAPTCHA_SITE_KEY && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 mt-4">
              <ShieldCheck size={14} />
              Protected by reCAPTCHA
            </p>
          )}
          {recaptchaError && (
            <p className="text-xs text-warning text-center mt-2">{recaptchaError}</p>
          )}

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-primary hover:underline font-medium"
                disabled={loading}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
