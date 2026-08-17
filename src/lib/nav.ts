import {
  LayoutDashboard, UsersRound, BookMarked, Fingerprint, Trophy, Award, Shield,
  Ribbon, CreditCard, Crown, Zap, ArrowUpCircle, Target, Gift, BarChart3, Star,
  Archive, Layers, LineChart, Settings, Bell, ScrollText, Sparkles, MessageSquare,
  Landmark, Coins, Gem, Package, Medal, IdCard, FileBadge, Stamp, ShieldCheck,
  Swords, Flag, Ticket, Building2,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = { label: string; items: NavItem[] };

/** Always-visible top-level entries. */
export const primaryNav: NavItem[] = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/ams", label: "AMS Tickets", icon: Ticket },
];

export const navGroups: NavGroup[] = [
  {
    label: "Identity",
    items: [
      { to: "/role-manager", label: "Role Manager", icon: UsersRound },
      { to: "/passport", label: "Passport", icon: BookMarked },
      { to: "/identity", label: "Identity", icon: Fingerprint },
    ],
  },
  {
    label: "Recognition",
    items: [
      { to: "/achievements", label: "Achievements", icon: Trophy },
      { to: "/awards", label: "Awards", icon: Award },
      { to: "/badges", label: "Badges", icon: Shield },
      { to: "/trophies", label: "Trophies", icon: Trophy },
      { to: "/certificates", label: "Certificates", icon: Ribbon },
      { to: "/hall-of-fame", label: "Hall of Fame", icon: Star },
      { to: "/legacy", label: "Legacy", icon: Archive },
      { to: "/collections", label: "Collections", icon: Layers },
      { to: "/trophy-gallery", label: "Trophy Gallery", icon: Landmark },
      { to: "/role-showcase", label: "Role Rooms", icon: Crown },
      { to: "/museum", label: "Museum", icon: Building2 },
    ],
  },
  {
    label: "Progression",
    items: [
      { to: "/xp", label: "XP", icon: Zap },
      { to: "/levels", label: "Levels", icon: ArrowUpCircle },
      { to: "/ranks", label: "Ranks", icon: Crown },
      { to: "/developer-progression", label: "Dev Progression", icon: ArrowUpCircle },
      { to: "/author-progression", label: "Author Progression", icon: ArrowUpCircle },
      { to: "/vendor-progression", label: "Vendor Progression", icon: ArrowUpCircle },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/missions", label: "Missions", icon: Target },
      { to: "/quests", label: "Quests", icon: Flag },
      { to: "/challenges", label: "Challenges", icon: Swords },
    ],
  },
  {
    label: "Rewards",
    items: [
      { to: "/rewards", label: "Rewards", icon: Gift },
      { to: "/claims", label: "Claims", icon: Package },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/leaderboards", label: "Leaderboard", icon: BarChart3 },
      { to: "/analytics", label: "Analytics", icon: LineChart },
    ],
  },
  {
    label: "Vaults",
    items: [
      { to: "/passport-vault", label: "Passport Vault", icon: BookMarked },
      { to: "/achievement-vault", label: "Achievement Vault", icon: Trophy },
      { to: "/award-vault", label: "Award Vault", icon: Award },
      { to: "/badge-vault", label: "Badge Vault", icon: Shield },
      { to: "/trophy-vault", label: "Trophy Vault", icon: Trophy },
      { to: "/certificate-vault", label: "Certificate Vault", icon: Ribbon },
      { to: "/membership-vault", label: "Membership Vault", icon: CreditCard },
      { to: "/rank-vault", label: "Rank Vault", icon: Crown },
      { to: "/verification-vault", label: "Verification Vault", icon: ShieldCheck },
      { to: "/reputation-vault", label: "Reputation Vault", icon: Star },
      { to: "/trust-seal-vault", label: "Trust Seal Vault", icon: Stamp },
      { to: "/recognition-coin-vault", label: "Recognition Coins", icon: Coins },
      { to: "/xp-crystal-vault", label: "XP Crystals", icon: Gem },
      { to: "/reward-chest-vault", label: "Reward Chests", icon: Package },
      { to: "/honor-coin-vault", label: "Honor Coins", icon: Coins },
      { to: "/legacy-medal-vault", label: "Legacy Medals", icon: Medal },
      { to: "/identity-card-vault", label: "Identity Cards", icon: IdCard },
      { to: "/license-card-vault", label: "License Cards", icon: FileBadge },
      { to: "/founder-seal-vault", label: "Founder Seals", icon: Stamp },
      { to: "/hall-of-fame-vault", label: "Hall of Fame Vault", icon: Star },
    ],
  },
];

/** Pinned to the bottom of the sidebar. */
export const bottomNav: NavItem[] = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/ai", label: "AI Center", icon: Sparkles },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

const ALL: { item: NavItem; group: string }[] = [
  ...primaryNav.map((item) => ({ item, group: "Command Center" })),
  ...navGroups.flatMap((g) => g.items.map((item) => ({ item, group: g.label }))),
  ...bottomNav.map((item) => ({ item, group: "System" })),
];

/** Longest-prefix match so nested routes still resolve to their module. */
export function navMetaForPath(pathname: string) {
  if (pathname === "/") return { label: "Command Center", group: "Overview", icon: LayoutDashboard };
  let best: { item: NavItem; group: string } | null = null;
  for (const entry of ALL) {
    if (entry.item.to === "/") continue;
    if (pathname === entry.item.to || pathname.startsWith(entry.item.to + "/")) {
      if (!best || entry.item.to.length > best.item.to.length) best = entry;
    }
  }
  if (!best) return null;
  return { label: best.item.label, group: best.group, icon: best.item.icon };
}
