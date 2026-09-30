// Role Achievement Showcase — premium Software Vala presentation.
// Every showcase item renders the project's REAL role artwork (trophies,
// awards, badges, passports, ranks, certificates, membership, identity cards,
// trust seals, medals, coins, crystals, chests). No glyph placeholders, no
// repeated artwork and no repeated card design: each achievement type has its
// own bespoke layout (museum stage, booklet, banner, parchment, credit card,
// artifact puck).

import { useEffect, useMemo, useState } from "react";
import { ROLES, type RoleDNA, type RoleSlug } from "@/lib/ams/roles";
import {
  ROLE_TROPHY, ROLE_AWARD, ROLE_BADGE, ROLE_PASSPORT, ROLE_RANK,
  ROLE_CERTIFICATE, ROLE_MEMBERSHIP, ROLE_IDENTITY_CARD, ROLE_TRUST_SEAL,
  ROLE_LEGACY_MEDAL, ROLE_HONOR_COIN, ROLE_XP_CRYSTAL, ROLE_REWARD_CHEST,
  ROLE_SHIELD,
} from "@/lib/ams/role-assets";
import { MuseumCase, SVMicroMark, SVSeal, svCollectionNumber } from "@/components/ams/brand/SVMark";
import {
  ShowcaseDetailDialog,
  type ShowcaseItem,
  type ShowcaseKind,
} from "@/components/ams/shared/ShowcaseDetailDialog";
import { Button } from "@/components/ui/button";

/** Wraps a showcase card so click / Enter / Space opens the detail modal. */
function Clickable({
  item, onOpen, children, className,
}: {
  item: ShowcaseItem;
  onOpen: (item: ShowcaseItem) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${item.kind}: ${item.label} — view details`}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className={`group/click relative h-full min-w-0 cursor-pointer rounded-xl outline-none ring-1 ring-transparent transition-all duration-300 hover:ring-primary/40 hover:shadow-[0_18px_40px_-28px_var(--primary)] focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ────────────────────────── shared atoms ────────────────────────── */

function Sparkles({ accent }: { accent: string }) {
  const dots = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      i,
      left: 8 + Math.random() * 84,
      top: 8 + Math.random() * 84,
      sx: (Math.random() * 24 - 12).toFixed(1) + "px",
      sy: (Math.random() * -30 - 4).toFixed(1) + "px",
      d: (Math.random() * 2.6).toFixed(2) + "s",
    })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.i}
          className="absolute h-1.5 w-1.5 rounded-full trophy-sparkle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            background: accent,
            boxShadow: `0 0 8px ${accent}, 0 0 16px ${accent}88`,
            animationDelay: d.d,
            ["--sx" as any]: d.sx,
            ["--sy" as any]: d.sy,
          }}
        />
      ))}
    </div>
  );
}

function Kicker({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground"
      style={accent ? { color: `color-mix(in oklab, ${accent} 55%, var(--muted-foreground))` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Detects blank, broken, tiny or edge-cropped artwork.
 * Cropped art bleeds off the canvas: its opaque pixels touch the image edges.
 * Real trophy renders are transparent PNGs whose edges are (mostly) clear.
 */
function isCroppedArt(img: HTMLImageElement): boolean {
  try {
    const w = Math.min(img.naturalWidth, 96);
    const h = Math.min(img.naturalHeight, 96);
    if (w < 2 || h < 2) return true;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let edgeOpaque = 0;
    let edgeTotal = 0;
    for (let x = 0; x < w; x++) {
      for (const y of [0, h - 1]) {
        edgeTotal++;
        if (data[(y * w + x) * 4 + 3] > 40) edgeOpaque++;
      }
    }
    for (let y = 1; y < h - 1; y++) {
      for (const x of [0, w - 1]) {
        edgeTotal++;
        if (data[(y * w + x) * 4 + 3] > 40) edgeOpaque++;
      }
    }
    // Opaque artwork (certificates, cards) fills the frame by design — only
    // treat it as cropped when nearly the entire border is solid.
    return edgeOpaque / edgeTotal > 0.92;
  } catch {
    return false;
  }
}

function ArtImg({
  src,
  alt,
  accent,
  extra = "",
  eager = false,
  style,
}: {
  src: string;
  alt: string;
  accent: string;
  extra?: string;
  eager?: boolean;
  style?: React.CSSProperties;
}) {
  const [bad, setBad] = useState(false);
  if (bad) {
    return (
      <div className="relative z-10 grid h-full w-full place-items-center">
        <div className="flex flex-col items-center gap-1.5 opacity-60">
          <Trophy className="h-6 w-6 text-muted-foreground" />
          <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Artwork unavailable</span>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={(e) => {
        const img = e.currentTarget;
        if (img.naturalWidth < 64 || img.naturalHeight < 64 || isCroppedArt(img)) setBad(true);
      }}
      onError={() => setBad(true)}
      className={`relative z-10 block object-contain object-center ${extra}`}
      style={{
        imageRendering: "auto",
        filter: `saturate(1.16) contrast(1.06) drop-shadow(0 14px 22px rgba(0,0,0,0.6)) drop-shadow(0 0 18px color-mix(in oklab, ${accent} 45%, transparent))`,
        ...style,
      }}
    />
  );
}

function artImage(src: string, alt: string, accent: string, extra = "") {
  return <ArtImg src={src} alt={alt} accent={accent} extra={extra} />;
}

/* ───────────────────── 1. Signature trophy stage ───────────────────── */

function TrophyStage({ role, unlockKey, label }: { role: RoleDNA; unlockKey: string; label: string }) {
  const accent = role.accent;
  return (
    <div
      key={unlockKey}
      className="trophy-unlock relative h-[360px] overflow-hidden rounded-xl border sm:h-[400px] xl:h-full xl:min-h-[404px]"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 45%, var(--border))`,
        background: `
          radial-gradient(120% 80% at 50% 110%, color-mix(in oklab, ${accent} 34%, transparent) 0%, color-mix(in oklab, ${accent} 10%, transparent) 40%, transparent 70%),
          radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, ${accent} 18%, transparent) 0%, transparent 65%),
          linear-gradient(180deg, var(--card), color-mix(in oklab, var(--background) 82%, var(--primary)) 60%, var(--background))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 70px color-mix(in oklab, ${accent} 16%, transparent), 0 24px 60px -24px color-mix(in oklab, ${accent} 55%, transparent)`,
      }}
    >
      <div
        className="absolute inset-x-1/4 -top-6 h-40 opacity-40 blur-2xl"
        style={{ background: `radial-gradient(50% 100% at 50% 0%, ${accent}, transparent 70%)` }}
      />
      <div className="absolute left-1/2 bottom-14 -translate-x-1/2 h-24 w-[70%]">
        <div
          className="absolute inset-0 rounded-[50%] trophy-glow"
          style={{ background: `radial-gradient(50% 50% at 50% 50%, ${accent}66, transparent 70%)`, filter: "blur(6px)" }}
        />
      </div>
      <div className="absolute inset-0 grid place-items-center px-6 pb-20 pt-10 [perspective:1200px]">
        <img
          src={ROLE_TROPHY[role.slug]}
          alt={`${role.name} signature trophy — ${label}`}
          loading="eager"
          decoding="async"
      onLoad={hideBadArt}
      onError={hideBadArt}
          width={2048}
          height={2048}
          className="trophy-float relative z-10 max-h-[86%] w-auto object-contain"
          style={{
            filter: `saturate(1.2) contrast(1.09) drop-shadow(0 26px 38px rgba(0,0,0,0.7)) drop-shadow(0 0 30px color-mix(in oklab, ${accent} 58%, transparent))`,
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 h-full w-1/3 trophy-shine" style={{ background: `linear-gradient(90deg, transparent, ${accent}22, transparent)` }} />
      </div>
      <Sparkles accent={accent} />
      <MuseumCase accent={accent} />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <SVSeal accent={accent} size={22} />
        <SVMicroMark accent={accent} />
      </div>
      <div
        className="absolute inset-x-4 bottom-4 z-10 rounded-lg border px-4 py-2.5 text-center backdrop-blur-sm"
        style={{ borderColor: `${accent}66`, background: `linear-gradient(180deg, ${accent}1f, rgba(0,0,0,0.42))` }}
      >
        <Kicker>Signature Trophy</Kicker>
        <div className="text-base font-semibold tracking-wide" style={{ color: accent }}>{label}</div>
        <div className="mt-0.5 font-mono uppercase text-muted-foreground" style={{ fontSize: 8, letterSpacing: "0.22em" }}>
          {svCollectionNumber(`${role.slug}-trophy`, role.passportPrefix)}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── 2. Award — spotlight plinth ───────────────────── */

function AwardPlinth({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="group relative flex h-[188px] flex-col overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 34%, var(--border))`,
        background: `radial-gradient(90% 70% at 50% 0%, color-mix(in oklab, ${accent} 20%, transparent), transparent 62%), linear-gradient(180deg, var(--card), var(--background))`,
        boxShadow: `0 18px 40px -28px color-mix(in oklab, ${accent} 70%, transparent)`,
      }}
    >
      <Kicker accent={accent}>Latest Award</Kicker>
      <div className="absolute right-2 top-2 z-20"><SVSeal accent={accent} size={18} /></div>
      <div className="relative mt-2 grid min-h-0 flex-1 place-items-center">
        <div className="absolute bottom-1 h-3 w-2/3 rounded-[50%]" style={{ background: `${accent}55`, filter: "blur(8px)" }} />
        {artImage(ROLE_AWARD[role.slug], `${role.name} award — ${label}`, accent, "max-h-full w-auto transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.03]")}
      </div>
      <div className="relative z-20 mt-2 truncate text-[12px] font-semibold" style={{ color: accent }}>{label}</div>
    </div>
  );
}

/* ───────────────────── 3. Badge — hex crest pad ───────────────────── */

function BadgeCrest({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="group relative flex h-[188px] flex-col overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 30%, var(--border))`,
        background: `conic-gradient(from 210deg at 50% 40%, color-mix(in oklab, ${accent} 18%, transparent), transparent 42%, color-mix(in oklab, ${accent} 14%, transparent) 78%, transparent), linear-gradient(180deg, var(--card), var(--background))`,
      }}
    >
      <Kicker accent={accent}>Featured Badge</Kicker>
      <div className="absolute right-2 top-2 z-20"><SVSeal accent={accent} size={18} /></div>
      <div className="relative mt-2 grid min-h-0 flex-1 place-items-center">
        <div
          className="absolute h-24 w-24 rotate-6 rounded-2xl border"
          style={{ borderColor: `${accent}44`, background: `${accent}12` }}
        />
        {artImage(ROLE_BADGE[role.slug], `${role.name} badge — ${label}`, accent, "max-h-[88%] w-auto transition-transform duration-500 group-hover:rotate-[3deg] group-hover:scale-[1.04]")}
      </div>
      <div className="relative z-20 mt-2 truncate text-[12px] font-semibold" style={{ color: accent }}>{label}</div>
    </div>
  );
}

/* ───────────────────── 4. Passport — booklet ───────────────────── */

function PassportBooklet({ role }: { role: RoleDNA }) {
  const accent = role.accent;
  return (
    <div
      className="relative h-[188px] overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 34%, var(--border))`,
        background: `linear-gradient(115deg, color-mix(in oklab, ${accent} 16%, var(--card)), var(--background))`,
        boxShadow: `inset 14px 0 24px -22px ${accent}, 0 18px 40px -30px ${accent}`,
      }}
    >
      <div className="absolute left-4 top-0 h-full w-px" style={{ background: `linear-gradient(180deg, transparent, ${accent}55, transparent)` }} />
      <div className="flex gap-3">
        <div className="relative grid h-36 w-28 shrink-0 place-items-center overflow-hidden rounded-md">
          {artImage(ROLE_PASSPORT[role.slug], `${role.name} digital passport`, accent, "max-h-full max-w-full")}
        </div>
        <div className="min-w-0 flex-1">
          <Kicker accent={accent}>Digital Passport</Kicker>
          <div className="mt-1 truncate text-sm font-semibold" style={{ color: accent }}>{role.name} Passport</div>
          <dl className="mt-2 space-y-1 text-[10px] text-muted-foreground">
            <div className="flex justify-between gap-2"><dt>Holder ID</dt><dd className="font-mono" style={{ color: accent }}>{role.passportPrefix}-00001</dd></div>
            <div className="flex justify-between gap-2"><dt>Clearance</dt><dd className="truncate">{role.passport.verification}</dd></div>
            <div className="flex justify-between gap-2"><dt>Signature</dt><dd className="truncate">{role.signature}</dd></div>
          </dl>
          <div className="mt-2 flex items-center gap-1.5">
            <SVSeal accent={accent} size={16} />
            <SVMicroMark accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── 5. Rank — vertical banner ───────────────────── */

function RankBanner({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="relative flex h-[188px] flex-col overflow-hidden rounded-xl border p-3 text-center"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 34%, var(--border))`,
        background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 22%, var(--card)), var(--background) 75%)`,
      }}
    >
      <Kicker accent={accent}>Current Rank</Kicker>
      <div className="absolute right-2 top-2 z-20"><SVSeal accent={accent} size={18} /></div>
      <div className="relative mx-auto mt-2 grid min-h-0 w-full flex-1 place-items-center">
        <div className="absolute inset-x-8 top-0 h-full" style={{ background: `linear-gradient(180deg, ${accent}22, transparent 70%)` }} />
        {artImage(ROLE_RANK[role.slug], `${role.name} rank insignia — ${label}`, accent, "max-h-full w-auto")}
      </div>
      <div className="relative z-20 mt-2 truncate text-[12px] font-semibold" style={{ color: accent }}>{label}</div>
    </div>
  );
}

/* ───────────────────── 6. Certificate — landscape parchment ───────────────────── */

function CertificatePlate({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="relative h-[188px] overflow-hidden rounded-xl border"
      style={{ borderColor: `color-mix(in oklab, ${accent} 36%, var(--border))`, background: "var(--card)" }}
    >
      <div className="relative grid h-[136px] w-full place-items-center overflow-hidden p-2">
        <img
          src={ROLE_CERTIFICATE[role.slug]}
          alt={`${role.name} certificate — ${label}`}
          loading="lazy"
          decoding="async"
      onLoad={hideBadArt}
      onError={hideBadArt}
          className="h-full w-full object-contain object-center"
          style={{ filter: "saturate(1.12) contrast(1.05)" }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--background) 88%, transparent))` }} />
        <div className="absolute right-2 top-2"><SVSeal accent={accent} size={20} /></div>
      </div>
      <div className="flex items-end justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <Kicker accent={accent}>Certificate</Kicker>
          <div className="truncate text-[12px] font-semibold" style={{ color: accent }}>{label}</div>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground">
          {svCollectionNumber(`${role.slug}-cert`, role.passportPrefix)}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────── 7. Membership — horizontal metal card ───────────────────── */

function MembershipMetalCard({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="group relative h-[188px] overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 32%, var(--border))`,
        background: `linear-gradient(100deg, color-mix(in oklab, ${accent} 20%, var(--card)) 0%, var(--card) 45%, var(--background) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 40px -30px ${accent}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />
      <div className="absolute right-2 top-2 z-20"><SVSeal accent={accent} size={18} /></div>
      <div className="flex h-full items-center gap-3">
        <div className="relative h-28 w-36 shrink-0 [perspective:900px]">
          <img
            src={ROLE_MEMBERSHIP[role.slug]}
            alt={`${role.name} membership card`}
            loading="lazy"
            decoding="async"
      onLoad={hideBadArt}
      onError={hideBadArt}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:[transform:none]"
            style={{
              transform: "rotateY(-14deg) rotateX(6deg)",
              filter: `saturate(1.14) drop-shadow(0 16px 22px rgba(0,0,0,0.6)) drop-shadow(0 0 16px color-mix(in oklab, ${accent} 40%, transparent))`,
            }}
          />
        </div>
        <div className="min-w-0">
          <Kicker accent={accent}>Membership</Kicker>
          <div className="truncate text-[13px] font-semibold" style={{ color: accent }}>{label}</div>
          <div className="mt-1 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-1.5 w-6 rounded-full" style={{ background: `${accent}${i < 3 ? "cc" : "33"}` }} />
            ))}
          </div>
          <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.24em] text-muted-foreground">
            {svCollectionNumber(`${role.slug}-member`, role.passportPrefix)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── 8. Identity — portrait clearance card ───────────────────── */

function IdentityClearanceCard({ role, label }: { role: RoleDNA; label: string }) {
  const accent = role.accent;
  return (
    <div
      className="group relative h-[188px] overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 32%, var(--border))`,
        background: `radial-gradient(120% 90% at 100% 0%, color-mix(in oklab, ${accent} 22%, transparent), transparent 60%), linear-gradient(180deg, var(--card), var(--background))`,
      }}
    >
      <div className="flex h-full items-stretch gap-3">
        <div className="absolute right-2 top-2 z-20"><SVSeal accent={accent} size={18} /></div>
        <div className="min-w-0 flex-1">
          <Kicker accent={accent}>Identity Card</Kicker>
          <div className="truncate text-[13px] font-semibold" style={{ color: accent }}>{label}</div>
          <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
            <div>Clearance · <span style={{ color: accent }}>{role.passport.verification}</span></div>
            <div>Archetype · {role.archetype}</div>
          </div>
          <div
            className="mt-2 h-6 w-full rounded"
            style={{
              background: `repeating-linear-gradient(90deg, ${accent}cc 0 2px, transparent 2px 4px, ${accent}66 4px 5px, transparent 5px 9px)`,
              opacity: 0.7,
            }}
          />
        </div>
        <div className="relative grid w-32 shrink-0 place-items-center overflow-hidden rounded-lg border p-1" style={{ borderColor: `${accent}44` }}>
          {artImage(ROLE_IDENTITY_CARD[role.slug], `${role.name} identity card`, accent, "max-h-full max-w-full")}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── 9. Artifact rail — distinct frames per artifact ───────────────────── */

type FrameShape = "disc" | "hex" | "diamond" | "shield" | "capsule" | "gem";

const FRAME_CSS: Record<FrameShape, { className: string; clip?: string }> = {
  disc: { className: "rounded-full" },
  hex: { className: "", clip: "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)" },
  diamond: { className: "", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  shield: { className: "", clip: "polygon(50% 0%, 100% 14%, 100% 62%, 50% 100%, 0% 62%, 0% 14%)" },
  capsule: { className: "rounded-[36%]" },
  gem: { className: "", clip: "polygon(30% 0%, 70% 0%, 100% 33%, 50% 100%, 0% 33%)" },
};

function ArtifactFrame({
  role, src, kicker, label, shape,
}: { role: RoleDNA; src: string; kicker: string; label: string; shape: FrameShape }) {
  const accent = role.accent;
  const f = FRAME_CSS[shape];
  return (
    <div className="group flex h-[132px] min-w-0 flex-col items-center justify-center gap-1.5 px-1">
      <div
        className={`relative grid h-20 w-20 place-items-center border transition-transform duration-500 group-hover:-translate-y-1.5 ${f.className}`}
        style={{
          clipPath: f.clip,
          borderColor: `color-mix(in oklab, ${accent} 40%, var(--border))`,
          background: `radial-gradient(70% 70% at 40% 25%, color-mix(in oklab, ${accent} 26%, transparent), transparent 70%), var(--card)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 14px 24px -18px ${accent}`,
        }}
      >
        {artImage(src, `${role.name} ${kicker}`, accent, "h-[76%] w-[76%]")}
        <div className="absolute right-1 top-1 z-20"><SVSeal accent={accent} size={14} /></div>
      </div>
      <div className="w-full text-center">
        <Kicker>{kicker}</Kicker>
        <div className="truncate text-[10px] font-semibold leading-tight" style={{ color: accent }}>{label}</div>
      </div>
    </div>
  );
}


/* ───────────────────────────── section ───────────────────────────── */

const OVERRIDES: Partial<Record<RoleSlug, { trophy?: string; award?: string; badge?: string }>> = {
  reseller: { trophy: "Million Dollar Club", award: "Revenue King Crown", badge: "Sales Diamond" },
  franchise: { trophy: "Global Empire", award: "Business Empire Award", badge: "Leadership Crown" },
  author: { trophy: "Gold Pen", award: "Master Publisher", badge: "Creative Crown" },
  vendor: { trophy: "Trusted Seller", award: "Marketplace Excellence", badge: "Quality Merchant" },
  affiliate: { trophy: "Referral King", award: "Conversion Champion", badge: "Partner Excellence" },
  influencer: { trophy: "Creator Diamond", award: "Brand Ambassador", badge: "Influence Crown" },
  developer: { trophy: "Code Excellence", award: "Architecture Master", badge: "Elite Developer" },
  support: { trophy: "Customer Hero", award: "Five Star Service", badge: "Fast Resolution" },
  seo: { trophy: "Search King", award: "Organic Growth", badge: "SEO Expert" },
  creator: { trophy: "Creative Master", award: "Design Innovation", badge: "Prism Master" },
  user: { trophy: "Loyalty", award: "Community Star", badge: "Verified Member" },
  manager: { trophy: "Team Commander", award: "Operational Excellence", badge: "People Leader" },
  administrator: { trophy: "System Sovereign", award: "Governance Award", badge: "Root Authority" },
  founder: { trophy: "Origin Stone", award: "Visionary Founder", badge: "Founding Signature" },
  operator: { trophy: "Uptime Sentinel", award: "Mission Control", badge: "Zero Downtime" },
};

const ARTIFACT_SHAPES: FrameShape[] = ["disc", "hex", "diamond", "gem", "capsule", "shield"];


export function RoleAchievementShowcase({
  defaultRole = "developer" as RoleSlug,
  name,
}: { defaultRole?: RoleSlug; name?: string }) {
  const [slug, setSlug] = useState<RoleSlug>(defaultRole);
  const role = useMemo(() => ROLES.find((r) => r.slug === slug) ?? ROLES[0], [slug]);
  const [unlockKey, setUnlockKey] = useState(0);
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  useEffect(() => { setUnlockKey((k) => k + 1); setSelected(null); }, [slug]);

  const mk = (kind: ShowcaseKind, label: string, src: string): ShowcaseItem => ({
    kind, label, src, seed: `${slug}-${kind}-${label}`,
  });

  if (!role) return null;

  const ov = OVERRIDES[role.slug] ?? {};
  const roleIndex = ROLES.findIndex((r) => r.slug === role.slug);
  const stageRight = roleIndex % 2 === 1;
  const swapRow = roleIndex % 3 === 2;

  const trophyLabel = ov.trophy ?? role.trophies[3].label;
  const awardLabel = ov.award ?? role.awardExamples[3];
  const badgeLabel = ov.badge ?? role.badges[4].label;
  const rankLabel = role.trophies[5].label;
  const certLabel = role.certificates[Math.min(3, role.certificates.length - 1)].label;
  const membershipLabel = role.trophies[4].label;
  const levelLabel = role.careerPath[Math.min(3, role.careerPath.length - 1)];

  const artifacts = [
    { src: ROLE_TRUST_SEAL[role.slug], kicker: "Trust Seal", label: role.passport.verification },
    { src: ROLE_LEGACY_MEDAL[role.slug], kicker: "Legacy Medal", label: role.trophies[6].label },
    { src: ROLE_HONOR_COIN[role.slug], kicker: "Honor Coin", label: role.awardExamples[5] },
    { src: ROLE_XP_CRYSTAL[role.slug], kicker: "XP Crystal", label: role.careerPath[role.careerPath.length - 1] },
    { src: ROLE_REWARD_CHEST[role.slug], kicker: "Reward Chest", label: role.awardExamples[1] },
    { src: ROLE_SHIELD[role.slug], kicker: "Guardian Shield", label: role.badges[2].label },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/60 p-5"
      style={{
        background: `
          radial-gradient(900px 220px at 8% -20%, color-mix(in oklab, ${role.accent} 16%, transparent), transparent 60%),
          radial-gradient(700px 200px at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%),
          linear-gradient(180deg, var(--card), var(--background))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 26px 70px -40px color-mix(in oklab, ${role.accent} 60%, transparent)`,
      }}
    >
       <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
         <div className="min-w-0">
          <Kicker>Role Achievement Showcase</Kicker>
          <h2 className="text-lg font-semibold tracking-tight">
            {name ? `${name} · ` : ""}
            <span style={{ color: role.accent }}>{role.name}</span>
            <span className="text-sm font-normal text-muted-foreground"> — {role.archetype}</span>
          </h2>
          <p className="mt-0.5 text-[11px] italic text-muted-foreground">"{role.motto}"</p>
        </div>
         <div className="col-span-2 flex min-w-0 gap-1.5 overflow-x-auto pb-1 sm:col-span-1 sm:flex-wrap sm:justify-end" role="group" aria-label="Select role">
          {ROLES.map((r) => {
            const active = r.slug === role.slug;
            return (
              <Button
                key={r.slug}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSlug(r.slug)}
                aria-pressed={active}
                className="group relative h-8 shrink-0 rounded-lg px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                style={
                  active
                    ? {
                        borderColor: `color-mix(in oklab, ${r.accent} 70%, white)`,
                        color: "var(--background)",
                        background: `linear-gradient(180deg, color-mix(in oklab, ${r.accent} 82%, white) 0%, ${r.accent} 48%, color-mix(in oklab, ${r.accent} 78%, black) 100%)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(0,0,0,0.35), 0 6px 14px -6px color-mix(in oklab, ${r.accent} 85%, transparent), 0 0 20px -6px ${r.accent}`,
                        transform: "translateY(-1px)",
                      }
                    : {
                        borderColor: `color-mix(in oklab, ${r.accent} 30%, var(--border))`,
                        color: r.accent,
                        background: `linear-gradient(180deg, color-mix(in oklab, var(--card) 88%, ${r.accent}) 0%, var(--background) 100%)`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 10px -6px rgba(0,0,0,0.7)",
                      }
                }
              >
                <span className="mr-1">{r.glyph}</span>{r.name}
              </Button>
            );
          })}
        </div>
      </header>

      <div className="mb-2 flex items-center justify-between gap-3">
        <Kicker>01 · Trophy & distinctions</Kicker>
        <span className="text-[10px] text-muted-foreground">4 live collectibles</span>
      </div>
      <div className={`grid gap-3 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.6fr)] ${stageRight ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]" : ""}`}>
        <div className={stageRight ? "xl:order-2" : ""}>
          <Clickable item={mk("Signature Trophy", trophyLabel, ROLE_TROPHY[role.slug])} onOpen={setSelected}>
            <TrophyStage role={role} unlockKey={`${role.slug}-${unlockKey}`} label={trophyLabel} />
          </Clickable>
        </div>

        <div className={`grid gap-3 sm:grid-cols-3 ${stageRight ? "xl:order-1" : ""}`}>
          <div className={`grid gap-3 sm:col-span-3 sm:grid-cols-3 ${swapRow ? "[&>*:nth-child(3)]:sm:order-first" : ""}`}>
            <Clickable item={mk("Latest Award", awardLabel, ROLE_AWARD[role.slug])} onOpen={setSelected}>
              <AwardPlinth role={role} label={awardLabel} />
            </Clickable>
            <Clickable item={mk("Featured Badge", badgeLabel, ROLE_BADGE[role.slug])} onOpen={setSelected}>
              <BadgeCrest role={role} label={badgeLabel} />
            </Clickable>
            <Clickable item={mk("Current Rank", rankLabel, ROLE_RANK[role.slug])} onOpen={setSelected}>
              <RankBanner role={role} label={rankLabel} />
            </Clickable>
          </div>

        </div>
      </div>

      <div className="mb-2 mt-5 flex items-center justify-between gap-3">
        <Kicker>02 · Credentials & identity</Kicker>
        <span className="text-[10px] text-muted-foreground">4 verified credentials</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Clickable
              item={mk("Digital Passport", `${role.name} Passport`, ROLE_PASSPORT[role.slug])}
              onOpen={setSelected}
            >
              <PassportBooklet role={role} />
            </Clickable>
            <Clickable item={mk("Certificate", certLabel, ROLE_CERTIFICATE[role.slug])} onOpen={setSelected}>
              <CertificatePlate role={role} label={certLabel} />
            </Clickable>
            <Clickable item={mk("Membership", membershipLabel, ROLE_MEMBERSHIP[role.slug])} onOpen={setSelected}>
              <MembershipMetalCard role={role} label={membershipLabel} />
            </Clickable>
            <Clickable item={mk("Identity Card", levelLabel, ROLE_IDENTITY_CARD[role.slug])} onOpen={setSelected}>
              <IdentityClearanceCard role={role} label={levelLabel} />
            </Clickable>
      </div>

      <div className="mb-2 mt-5 flex items-center justify-between gap-3">
        <Kicker>03 · Special recognition</Kicker>
        <span className="text-[10px] text-muted-foreground">6 collection pieces</span>
      </div>
          <div
            className="grid grid-cols-2 gap-2 rounded-xl border p-3 min-[520px]:grid-cols-3 lg:grid-cols-6"
            style={{
              borderColor: `color-mix(in oklab, ${role.accent} 22%, var(--border))`,
              background: `linear-gradient(180deg, color-mix(in oklab, var(--card) 92%, ${role.accent}), var(--background))`,
            }}
          >
            {artifacts.map((a, i) => (
              <Clickable
                key={a.kicker}
                item={mk(a.kicker as ShowcaseKind, a.label, a.src)}
                onOpen={setSelected}
              >
                <ArtifactFrame
                  role={role}
                  src={a.src}
                  kicker={a.kicker}
                  label={a.label}
                  shape={ARTIFACT_SHAPES[(i + roleIndex) % ARTIFACT_SHAPES.length]}
                />
              </Clickable>
            ))}
          </div>


      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Passport · <span style={{ color: role.accent }}>{role.passportPrefix}-00001</span></span>
        <span>Verification · <span style={{ color: role.accent }}>{role.passport.verification}</span></span>
        <span>Signature · <span style={{ color: role.accent }}>{role.signature}</span></span>
        <span className="inline-flex items-center gap-1.5">
          <SVSeal accent={role.accent} size={14} title="Software Vala Collection Mark" />
          Software Vala Collection · <span style={{ color: role.accent }}>{svCollectionNumber(role.slug, role.passportPrefix)}</span>
        </span>
      </footer>

      <ShowcaseDetailDialog
        role={role}
        item={selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </section>
  );
}
