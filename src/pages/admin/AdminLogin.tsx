import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminInstallPrompt from "@/components/admin/AdminInstallPrompt";

interface Props {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">سجّل دخولك للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label className="text-foreground">البريد الإلكتروني</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 bg-background"
                placeholder="admin@diriyah.com"
                dir="ltr"
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-foreground">كلمة المرور</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-background"
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <AdminInstallPrompt variant="full" />
      </div>
    </div>
  );
};

export default AdminLogin;
