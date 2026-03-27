import { Bell, Settings, LogIn, LogOut, User, ShieldCheck, BellRing } from 'lucide-react';
import { getGreeting } from '@/lib/formatters';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export function Header() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileRole, setProfileRole] = useState<'owner' | 'staff'>('owner');
  const [isManageProfileOpen, setIsManageProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const resolveDisplayName = (session: { user: { user_metadata?: Record<string, unknown>; email?: string | null } } | null) => {
    if (!session) return null;
    const fromMeta = session.user.user_metadata?.full_name;
    if (typeof fromMeta === 'string' && fromMeta.trim().length > 0) return fromMeta.trim();
    const fromPhone = session.user.user_metadata?.phone;
    if (typeof fromPhone === 'string' && fromPhone.trim().length > 0) return fromPhone.trim();
    const email = session.user.email ?? '';
    if (email.endsWith('@bizplus.local')) return email.replace('@bizplus.local', '');
    return null;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let mounted = true;

    const applySession = (
      session: { user: { id: string; user_metadata?: Record<string, unknown>; email?: string | null } } | null,
    ) => {
      setIsAuthed(Boolean(session));
      setDisplayName(resolveDisplayName(session));
      if (!session) {
        setUserId(null);
        setProfileName('');
        setProfilePhone('');
        setProfileRole('owner');
        return;
      }
      setUserId(session.user.id);
      const fullName = session.user.user_metadata?.full_name;
      const phone = session.user.user_metadata?.phone;
      const role = session.user.user_metadata?.role;
      if (typeof fullName === 'string') setProfileName(fullName);
      if (typeof phone === 'string') setProfilePhone(phone);
      if (role === 'owner' || role === 'staff') setProfileRole(role);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      applySession(
        data.session as {
          user: { id: string; user_metadata?: Record<string, unknown>; email?: string | null };
        } | null,
      );
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      applySession(
        session as {
          user: { id: string; user_metadata?: Record<string, unknown>; email?: string | null };
        } | null,
      );
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleAuthClick = async () => {
    if (!isSupabaseConfigured) {
      navigate('/auth');
      return;
    }
    if (isAuthed) {
      await signOut();
      setIsAuthed(false);
      setDisplayName(null);
      navigate('/', { replace: true });
    } else {
      navigate('/auth');
    }
  };

  const notifications = [
    {
      id: 'welcome',
      title: 'Welcome to BizPlus',
      body: 'Your dashboard is ready. Add income and expenses to start tracking profit.',
    },
    {
      id: 'security',
      title: 'Account security',
      body: isAuthed
        ? 'You are currently signed in.'
        : 'Sign in to sync your account and data securely.',
    },
  ];

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    setHasUnreadNotifications(false);
  };

  const handleManageProfile = () => {
    setIsManageProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!supabase || !userId || !profileName.trim() || !profilePhone.trim()) {
      toast({
        title: 'Missing profile info',
        description: 'Please fill in name and phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileName.trim(),
          phone: profilePhone.trim(),
          role: profileRole,
        },
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          phone: profilePhone.trim(),
          role: profileRole,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
      if (profileError) throw profileError;

      setDisplayName(profileName.trim());
      setIsManageProfileOpen(false);
      toast({
        title: 'Profile updated',
        description: 'Your account details were saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Could not save profile',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">
              {displayName ? `${getGreeting()}, ${displayName}` : getGreeting()} 👋
            </p>
            <h1 className="text-xl font-bold tracking-tight">BizPlus</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAuthClick}
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label={isAuthed ? 'Logout' : 'Login'}
              title={isAuthed ? 'Logout' : 'Login'}
            >
              {isAuthed ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </button>
            <button
              onClick={openNotifications}
              className="relative p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotifications && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-warning" />
              )}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="right" className="w-[92vw] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              Notifications
            </SheetTitle>
            <SheetDescription>Latest updates and reminders for your account.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setHasUnreadNotifications(false);
                toast({ title: 'Notifications', description: 'Marked as read.' });
              }}
            >
              Mark all as read
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="right" className="w-[92vw] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </SheetTitle>
            <SheetDescription>Manage your account and app preferences.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>{displayName ?? 'User'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{isAuthed ? 'Signed in' : 'Not signed in'}</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full" onClick={handleManageProfile}>
              Manage profile
            </Button>

            {isManageProfileOpen && (
              <div className="rounded-xl border bg-card p-3 space-y-3">
                <p className="text-sm font-semibold text-foreground">Edit profile</p>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Full name</label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <Input
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    inputMode="tel"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Role</label>
                  <Select value={profileRole} onValueChange={(v) => setProfileRole(v as 'owner' | 'staff')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsManageProfileOpen(false)}
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              variant={isAuthed ? 'destructive' : 'default'}
              onClick={handleAuthClick}
            >
              {isAuthed ? 'Logout' : 'Login'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Curved bottom edge */}
      <div className="h-4 bg-background rounded-t-3xl" />
    </header>
  );
}
