import { createFileRoute, Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, BookMarked, Stamp, CalendarClock, Landmark, ScrollText, Hash } from "lucide-react";
import { findPassportByCode, passportVerifyUrl } from "@/lib/ams/passport-id";
import { certificateVerifyUrl, findCertificateByCode, type CertificateIdentity } from "@/lib/ams/certificate-id";
import { ROLE_CERTIFICATE, ROLE_PASSPORT } from "@/lib/ams/role-assets";
import type { RoleDNA } from "@/lib/ams/roles";
import { Collectible3D } from "@/components/ams/collectible/Collectible3D";
import { CelebrationProvider } from "@/components/ams/effects/Celebration";

export const Route = createFileRoute("/verify/$code")({
  head: () => ({
    meta: [
      { title: "Passport Verification — AMS Global Registry" },
      { name: "description", content: "Scan-to-verify page for AMS digital passports: holder identity, issuing authority, stamps, validity window and authenticity status." },
      { property: "og:title", content: "Passport Verification — AMS Global Registry" },
      { property: "og:description", content: "Verify the authenticity of an AMS digital passport by its verification code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPageRoot,
});

function VerifyPageRoot() {
  return (
    <CelebrationProvider>
      <VerifyPage />
    </CelebrationProvider>
  );
}

function VerifyPage() {
  const { code } = Route.useParams();
  const match = findPassportByCode(code);
  const certMatch = match ? null : findCertificateByCode(code);

  if (certMatch) {
    return <CertificateVerification role={certMatch.role} identity={certMatch.identity} />;
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-[#05070d] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/40 bg-red-500/5 p-8 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-red-400" />
          <h1 className="mt-4 text-2xl font-semibold">Verification Failed</h1>
          <p className="mt-2 text-sm text-white/60">
            No digital passport or certificate is registered under code{" "}
            <span className="font-mono text-white/80">{code}</span>.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-lg border border-white/20 px-4 py-2 text-xs hover:bg-white/5">
            Back to AMS
          </Link>
        </div>
      </main>
    );
  }


  const { role, identity } = match;
  const accent = role.accent;

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div
        className="border-b"
        style={{
          borderColor: `${accent}33`,
          background: `radial-gradient(80% 120% at 50% 0%, ${accent}22, transparent 70%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-[11px] font-mono tracking-[0.35em] uppercase" style={{ color: `${accent}cc` }}>
            AMS Global Registry
          </div>
          <h1 className="mt-3 text-3xl lg:text-4xl font-semibold">Digital Passport Verification</h1>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "#34d39966", background: "#34d39918", color: "#6ee7b7" }}
          >
            <ShieldCheck className="h-4 w-4" /> Authentic · Active · Registry Verified
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border overflow-hidden" style={{ borderColor: `${accent}44` }}>
          <Collectible3D
            src={ROLE_PASSPORT[role.slug]}
            filename={`${role.slug}-passport.png`}
            accent={accent}
            label={`${role.passportPrefix} · Passport`}
            height={360}
            eager
          />
          <div className="p-5 space-y-1">
            <div className="text-xl font-semibold">{role.name} Passport</div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: `${accent}bb` }}>
              {role.archetype} · {identity.verification}
            </div>
            <p className="pt-2 text-xs text-white/60 italic">"{role.passport.cover}"</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: `${accent}33` }}>
            <Row icon={<BookMarked className="h-4 w-4" />} label="Passport Number" value={identity.number} accent={accent} />
            <Row icon={<ShieldCheck className="h-4 w-4" />} label="Verification Code" value={identity.code} accent={accent} mono />
            <Row icon={<Landmark className="h-4 w-4" />} label="Issuing Authority" value={identity.authority} accent={accent} />
            <Row icon={<CalendarClock className="h-4 w-4" />} label="Issued / Expires" value={`${identity.issued} → ${identity.expires}`} accent={accent} mono />
            <Row icon={<Stamp className="h-4 w-4" />} label="Stamp Motif" value={role.passport.stamp} accent={accent} />
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: `${accent}33` }}>
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] mb-3" style={{ color: `${accent}cc` }}>
              Passport Chapters
            </div>
            <ol className="space-y-2">
              {role.passport.timeline.map((chapter, i) => (
                <li key={chapter} className="flex items-center gap-3 text-sm text-white/75">
                  <span
                    className="h-6 w-6 shrink-0 rounded-full grid place-items-center text-[10px] font-bold"
                    style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
                  >
                    {i + 1}
                  </span>
                  {chapter}
                </li>
              ))}
            </ol>
          </div>

          <ScanBlock accent={accent} url={passportVerifyUrl(role)} />
        </section>
      </div>
    </main>
  );
}

function Row({
  icon, label, value, accent, mono,
}: { icon: React.ReactNode; label: string; value: string; accent: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ color: accent }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
        <div className={`text-sm text-white/90 break-words ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function ScanBlock({ accent, url }: { accent: string; url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { width: 360, margin: 1, errorCorrectionLevel: "M" })
      .then((d) => alive && setDataUrl(d))
      .catch(() => alive && setDataUrl(null));
    return () => { alive = false; };
  }, [url]);

  return (
    <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ borderColor: `${accent}33` }}>
      {dataUrl && (
        <img src={dataUrl} alt="Passport verification QR code" className="rounded-lg bg-white p-1.5" width={110} height={110} />
      )}
      <div className="text-xs text-white/60">
        <div className="text-white/85 font-semibold mb-1">Re-scan or share</div>
        This QR resolves to the same verification record.
        <div className="mt-1 font-mono text-[10px] text-white/40 break-all">{url}</div>
      </div>
    </div>
  );
}

function CertificateVerification({ role, identity }: { role: RoleDNA; identity: CertificateIdentity }) {
  const accent = role.accent;
  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div
        className="border-b"
        style={{ borderColor: `${accent}33`, background: `radial-gradient(80% 120% at 50% 0%, ${accent}22, transparent 70%)` }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-[11px] font-mono tracking-[0.35em] uppercase" style={{ color: `${accent}cc` }}>
            AMS Global Registry
          </div>
          <h1 className="mt-3 text-3xl lg:text-4xl font-semibold">Certificate Verification</h1>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "#34d39966", background: "#34d39918", color: "#6ee7b7" }}
          >
            <ShieldCheck className="h-4 w-4" /> Authentic · Issued · Registry Verified
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border overflow-hidden" style={{ borderColor: `${accent}44` }}>
          <Collectible3D
            src={ROLE_CERTIFICATE[role.slug]}
            filename={`${role.slug}-certificate.png`}
            accent={accent}
            label={`${identity.number} · Certificate`}
            height={360}
            eager
          />
          <div className="p-5 space-y-1">
            <div className="text-xl font-semibold">{identity.title}</div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: `${accent}bb` }}>
              {role.name} · {role.archetype}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: `${accent}33` }}>
            <Row icon={<ScrollText className="h-4 w-4" />} label="Certificate Number" value={identity.number} accent={accent} mono />
            <Row icon={<ShieldCheck className="h-4 w-4" />} label="Verification Code" value={identity.code} accent={accent} mono />
            <Row icon={<Hash className="h-4 w-4" />} label="Registry Reference" value={identity.registry} accent={accent} mono />
            <Row icon={<Landmark className="h-4 w-4" />} label="Issuing Authority" value={identity.authority} accent={accent} />
            <Row icon={<CalendarClock className="h-4 w-4" />} label="Date of Issue" value={identity.issued} accent={accent} mono />
            <Row icon={<Stamp className="h-4 w-4" />} label="Seal Motif" value={identity.seal} accent={accent} />
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: `${accent}33` }}>
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] mb-3" style={{ color: `${accent}cc` }}>
              Certification Track
            </div>
            <ol className="space-y-2">
              {role.certificates.map((cert, i) => (
                <li key={cert.key} className="flex items-center gap-3 text-sm text-white/75">
                  <span
                    className="h-6 w-6 shrink-0 rounded-full grid place-items-center text-[10px] font-bold"
                    style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
                  >
                    {i + 1}
                  </span>
                  {cert.label}
                </li>
              ))}
            </ol>
          </div>

          <ScanBlock accent={accent} url={certificateVerifyUrl(role)} />
        </section>
      </div>
    </main>
  );
}
