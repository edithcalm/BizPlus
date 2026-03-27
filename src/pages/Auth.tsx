import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signInWithPhonePin, signUpWithPhonePin, type BizPlusRole } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<BizPlusRole>("owner");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const p = phone.trim();
    const x = pin.trim();
    const n = fullName.trim();
    if (tab === "signup") return p.length >= 9 && x.length >= 4 && n.length >= 2;
    return p.length >= 9 && x.length >= 4;
  }, [phone, pin, fullName, tab]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
    });
  }, [navigate]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border rounded-2xl p-5 shadow-card space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Cloud accounts aren’t enabled yet on this build.
            </p>
          </div>

          <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            To enable login + database saving:
            <div className="mt-2 space-y-1">
              <div>1) Create a Supabase project</div>
              <div>2) Copy <code className="font-mono">.env.example</code> to <code className="font-mono">.env</code></div>
              <div>3) Set <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code></div>
              <div>4) Run the SQL in <code className="font-mono">README.md</code> to create <code className="font-mono">profiles</code></div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="w-full" variant="secondary" onClick={() => navigate("/", { replace: true })}>
              Back to app
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (tab === "login") {
        await signInWithPhonePin({ phone, pin });
        toast({ title: "Welcome back", description: "Signed in successfully." });
      } else {
        await signUpWithPhonePin({ phone, pin, role, fullName });
        toast({ title: "Account created", description: "You can now use BizPlus." });
      }
      navigate("/app", { replace: true });
    } catch (e) {
      toast({
        title: "Auth failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-5 shadow-card">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">BizPlus</h1>
          <p className="text-sm text-muted-foreground">Sign in to save your data in the cloud.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">PIN</label>
              <Input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4+ digits"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
            </div>

            <TabsContent value="signup" className="m-0">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Wendy Atieno"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={role} onValueChange={(v) => setRole(v as BizPlusRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <Button className="w-full" disabled={!canSubmit || loading} onClick={onSubmit}>
              {loading ? "Please wait..." : tab === "login" ? "Login" : "Create account"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Note: for now, phone+PIN is stored using Supabase Auth via an internal email alias.
            </p>

          </div>
        </Tabs>
      </div>
    </div>
  );
}

