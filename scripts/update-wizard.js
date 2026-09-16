import fs from 'node:fs';
import path from 'node:path';

const wizardContent = `"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  HeartHandshake,
  MapPin,
  PartyPopper,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  UtensilsCrossed,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicPackage } from "@/lib/api";
import { modularCatalog } from "@/lib/catalog";

type WizardState = {
  eventType: string;
  guests: number;
  city: string;
  date: string;
  decorId: string;
  seatingId: string;
  cateringId: string;
  mediaId: string;
  hospitalityId: string;
  transportFleet: Record<string, number>;
  contactName: string;
  phone: string;
  email: string;
  specialNotes: string;
};

const cities = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi NCR", "Goa", "Chennai", "Kolkata", "Jaipur", "Udaipur", "Anywhere in India"];

const steps = ["Occasion", "Venue & Decor", "Catering & Welcome", "Media & Transport", "Quote & Trust"];

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export function EventPlannerWizard({ packages }: { packages: PublicPackage[] }) {
  const eventTypes = useMemo(
    () => [...new Map(packages.map((pkg) => [pkg.eventType.slug, pkg.eventType])).values()],
    [packages],
  );

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const [state, setState] = useState<WizardState>({
    eventType: eventTypes[0]?.slug ?? "weddings",
    guests: 250,
    city: "Hyderabad",
    date: "",
    decorId: modularCatalog.decorOptions[0].id,
    seatingId: modularCatalog.seatingOptions[0].id,
    cateringId: modularCatalog.cateringTiers[0].id,
    mediaId: modularCatalog.mediaPackages[0].id,
    hospitalityId: modularCatalog.hospitalityTiers[0].id,
    transportFleet: {
      "bus-50-luxury": 2,
      "tempo-17-seater": 1,
      "vip-bridal-sedan": 1,
    },
    contactName: "",
    phone: "",
    email: "",
    specialNotes: "",
  });

  const isUrgent = useMemo(() => {
    if (!state.date) return false;
    const diff = (new Date(state.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 14;
  }, [state.date]);

  const selectedDecor = modularCatalog.decorOptions.find((d) => d.id === state.decorId) || modularCatalog.decorOptions[0];
  const selectedSeating = modularCatalog.seatingOptions.find((s) => s.id === state.seatingId) || modularCatalog.seatingOptions[0];
  const selectedCatering = modularCatalog.cateringTiers.find((c) => c.id === state.cateringId) || modularCatalog.cateringTiers[0];
  const selectedMedia = modularCatalog.mediaPackages.find((m) => m.id === state.mediaId) || modularCatalog.mediaPackages[0];
  const selectedHospitality = modularCatalog.hospitalityTiers.find((h) => h.id === state.hospitalityId) || modularCatalog.hospitalityTiers[0];

  const calculatedTables = Math.ceil(state.guests / selectedSeating.tablesPerGuestRatio);
  const totalFleetCapacity = Object.entries(state.transportFleet).reduce((total, [fleetId, count]) => {
    const fleet = modularCatalog.transportFleet.find((f) => f.id === fleetId);
    return total + (fleet ? fleet.capacity * count : 0);
  }, 0);

  const estimatedCost = useMemo(() => {
    const decorCost = selectedDecor.basePrice;
    const seatingCost = selectedSeating.pricePerGuest * state.guests;
    const cateringCost = selectedCatering.pricePerGuest * state.guests;
    const mediaCost = selectedMedia.basePrice;
    const hospitalityCost = selectedHospitality.basePrice;
    const transportCost = Object.entries(state.transportFleet).reduce((sum, [fleetId, count]) => {
      const fleet = modularCatalog.transportFleet.find((f) => f.id === fleetId);
      return sum + (fleet ? fleet.pricePerUnit * count : 0);
    }, 0);

    return {
      decorCost,
      seatingCost,
      cateringCost,
      mediaCost,
      hospitalityCost,
      transportCost,
      subtotal: decorCost + seatingCost + cateringCost + mediaCost + hospitalityCost + transportCost,
    };
  }, [selectedDecor, selectedSeating, selectedCatering, selectedMedia, selectedHospitality, state.guests, state.transportFleet]);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const updateTransport = (id: string, delta: number) => {
    setState((prev) => {
      const current = prev.transportFleet[id] || 0;
      const updated = Math.max(0, current + delta);
      return {
        ...prev,
        transportFleet: { ...prev.transportFleet, [id]: updated },
      };
    });
  };

  const submitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.contactName || !state.phone) {
      setSubmitMessage("Please provide your name and contact phone number.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const transportSummary = Object.entries(state.transportFleet)
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => {
          const fleet = modularCatalog.transportFleet.find((f) => f.id === id);
          return \`\${count}x \${fleet?.name || id}\`;
        })
        .join(", ");

      const fullNotes = [
        \`[Wizard Event Brief] Occasion: \${state.eventType} (\${state.guests} guests in \${state.city})\`,
        \`Date: \${state.date || "Flexible / Not specified"} \${isUrgent ? "(URGENT LAST-MINUTE BOOKING)" : ""}\`,
        \`Decor: \${selectedDecor.name} (₹\${selectedDecor.basePrice.toLocaleString("en-IN")})\`,
        \`Seating: \${selectedSeating.name} (~\${calculatedTables} dining tables, \${state.guests} chairs)\`,
        \`Catering: \${selectedCatering.name} (₹\${selectedCatering.pricePerGuest}/guest x \${state.guests})\`,
        \`Media & Drone: \${selectedMedia.name}\`,
        \`Hospitality Crew: \${selectedHospitality.name}\`,
        \`Transport Fleet: \${transportSummary || "None requested"} (Capacity: ~\${totalFleetCapacity} guests)\`,
        \`Estimated Total: \${money(estimatedCost.subtotal)}\`,
        state.specialNotes ? \`Client Notes: \${state.specialNotes}\` : "",
      ].filter(Boolean).join("\\n");

      const response = await fetch("/api/event-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.contactName,
          phone: state.phone,
          email: state.email || undefined,
          location: state.city,
          eventType: state.eventType,
          eventMonth: state.date || undefined,
          clientsCount: state.guests,
          budgetRange: money(estimatedCost.subtotal),
          notes: fullNotes,
          attribution: {
            source: "MooNs Interactive Event Planner Wizard",
            isUrgent,
            estimatedSubtotal: estimatedCost.subtotal,
          },
        }),
      });

      if (!response.ok) throw new Error("Could not submit brief. Please try again.");

      setSubmitted(true);
      setSubmitMessage("Your custom event brief has been synced with MooNsEvents CRM! A senior production lead will reach out shortly.");
    } catch (err: any) {
      setSubmitMessage(err.message || "Failed to submit brief.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setStep(0);
  };

  return (
    <section className="planner-wizard-shell">
      <div className="planner-ambient planner-ambient-one" />
      <div className="planner-ambient planner-ambient-two" />

      <header className="planner-wizard-head">
        <Link href="/" className="planner-exit">
          <ArrowLeft size={16} /> Back to MooNs
        </Link>
        <div className="planner-progress-copy">
          <span>Event Builder</span>
          <strong>{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</strong>
        </div>
      </header>

      <div className="planner-progress">
        <motion.span
          animate={{ width: \`\${((step + 1) / steps.length) * 100}%\` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="planner-stage">
        <div className="planner-step-rail">
          {steps.map((label, index) => (
            <button
              type="button"
              key={label}
              className={index === step ? "active" : index < step ? "done" : ""}
              onClick={() => index < step && go(index)}
            >
              <span>{index < step ? <Check size={14} /> : index + 1}</span>
              <small>{label}</small>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            className="planner-panel"
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 36, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: direction * -28, filter: "blur(8px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <>
                <span className="planner-kicker"><PartyPopper size={16} /> Tailored Event Intelligence</span>
                <h1>What event are we<br /><em>bringing to life?</em></h1>
                <p className="planner-lead">Select your event occasion and guest scale. We will customize every vendor, decor, catering, transport, and drone recommendation.</p>

                <div className="planner-option-grid event-types" style={{ marginBottom: "2rem" }}>
                  {eventTypes.slice(0, 8).map((type, index) => (
                    <button
                      type="button"
                      className={state.eventType === type.slug ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, eventType: type.slug }))}
                      key={type.id}
                    >
                      <span className="planner-option-number">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{type.name}</strong>
                      <small>{type.summary || \`Complete planning for \${type.name.toLowerCase()}\`}</small>
                      <i>{state.eventType === type.slug ? <Check size={14} /> : <Sparkles size={14} />}</i>
                    </button>
                  ))}
                </div>

                <div className="planner-essentials-grid">
                  <label className="planner-field">
                    <span><MapPin size={16} /> Event City / Region</span>
                    <select
                      value={state.city}
                      onChange={(e) => setState((s) => ({ ...s, city: e.target.value }))}
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </label>

                  <label className="planner-field">
                    <span>
                      <CalendarDays size={16} /> Event Date
                      {isUrgent && <span style={{ color: "#ef4444", fontWeight: 700, marginLeft: "0.5rem" }}>⚡ Last-Minute Fast Track</span>}
                    </span>
                    <input
                      type="date"
                      value={state.date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
                    />
                  </label>

                  <div className="planner-guest-field" style={{ gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span><UsersRound size={16} /> Approximate Guest Count</span>
                      <strong style={{ fontSize: "1.4rem", color: "#a855f7" }}>{state.guests} Guests</strong>
                    </div>
                    <input
                      aria-label="Guest count"
                      type="range"
                      min="25"
                      max="2000"
                      step="25"
                      value={state.guests}
                      onChange={(e) => setState((s) => ({ ...s, guests: Number(e.target.value) }))}
                    />
                    <div className="planner-range-labels">
                      <span>25 Intimate</span>
                      <span>500 Grand Celebration</span>
                      <span>2000+ Mega Royal</span>
                    </div>
                  </div>
                </div>

                {isUrgent && (
                  <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Zap size={28} color="#ef4444" />
                    <div>
                      <strong style={{ color: "#ef4444", display: "block" }}>Urgent Last-Minute Event Request</strong>
                      <small style={{ opacity: 0.9 }}>Your date is within 14 days. MooNs Emergency Event Protocol is activated with zero-penalty 24h vendor lock-in!</small>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <span className="planner-kicker"><Crown size={16} /> Stage, Mandap & Seating Infrastructure</span>
                <h1>Décor Theme &<br /><em>Dining Layout</em></h1>
                <p className="planner-lead">Choose your central theme and seating format. We calculate required dining tables, gold chairs, and lighting automatically.</p>

                <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>1. Select Décor & Stage Theme</h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "2rem" }}>
                  {modularCatalog.decorOptions.map((decor) => (
                    <button
                      type="button"
                      key={decor.id}
                      className={state.decorId === decor.id ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, decorId: decor.id }))}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <span className="vendor-cat-label">{decor.category}</span>
                        <strong style={{ color: "#a855f7" }}>₹{(decor.basePrice / 1000).toFixed(0)}k</strong>
                      </div>
                      <strong>{decor.name}</strong>
                      <small style={{ marginTop: "0.35rem", display: "block" }}>{decor.description}</small>
                      <i style={{ marginTop: "0.5rem" }}>{state.decorId === decor.id ? <Check size={14} /> : "+ Select"}</i>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>2. Seating & Dining Arrangement</h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {modularCatalog.seatingOptions.map((seating) => (
                    <button
                      type="button"
                      key={seating.id}
                      className={state.seatingId === seating.id ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, seatingId: seating.id }))}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <span className="vendor-cat-label">{seating.chairType}</span>
                        <strong style={{ color: "#a855f7" }}>₹{seating.pricePerGuest}/guest</strong>
                      </div>
                      <strong>{seating.name}</strong>
                      <small style={{ marginTop: "0.35rem", display: "block" }}>{seating.description}</small>
                      <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600 }}>
                        Auto-calculated for {state.guests} guests: ~{Math.ceil(state.guests / seating.tablesPerGuestRatio)} tables + {state.guests} chairs
                      </div>
                      <i style={{ marginTop: "0.5rem" }}>{state.seatingId === seating.id ? <Check size={14} /> : "+ Select"}</i>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <span className="planner-kicker"><UtensilsCrossed size={16} /> Multi-Cuisine & Hospitality Team</span>
                <h1>Culinary Experience &<br /><em>Welcome Crew</em></h1>
                <p className="planner-lead">Delight your relatives and VIP guests with gourmet catering spreads and professional welcome hostesses.</p>

                <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>1. Catering Buffet & Live Counters</h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "2rem" }}>
                  {modularCatalog.cateringTiers.map((cater) => (
                    <button
                      type="button"
                      key={cater.id}
                      className={state.cateringId === cater.id ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, cateringId: cater.id }))}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <span className="vendor-cat-label">{cater.liveCountersCount} Live Counters</span>
                        <strong style={{ color: "#a855f7" }}>₹{cater.pricePerGuest}/plate</strong>
                      </div>
                      <strong>{cater.name}</strong>
                      <small style={{ marginTop: "0.35rem", display: "block" }}>{cater.description}</small>
                      <i style={{ marginTop: "0.5rem" }}>{state.cateringId === cater.id ? <Check size={14} /> : "+ Select"}</i>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>2. Guest Hospitality, Valet & Registration Desk</h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {modularCatalog.hospitalityTiers.map((hosp) => (
                    <button
                      type="button"
                      key={hosp.id}
                      className={state.hospitalityId === hosp.id ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, hospitalityId: hosp.id }))}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <span className="vendor-cat-label">{hosp.staffCount} Dedicated Crew</span>
                        <strong style={{ color: "#a855f7" }}>₹{(hosp.basePrice / 1000).toFixed(0)}k total</strong>
                      </div>
                      <strong>{hosp.name}</strong>
                      <small style={{ marginTop: "0.35rem", display: "block" }}>{hosp.description}</small>
                      <i style={{ marginTop: "0.5rem" }}>{state.hospitalityId === hosp.id ? <Check size={14} /> : "+ Select"}</i>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <span className="planner-kicker"><Camera size={16} /> 4K Drone Visuals & Relatives Fleet</span>
                <h1>Media Capture &<br /><em>Guest Transport Fleet</em></h1>
                <p className="planner-lead">Ensure high-definition memories with aerial drone coverage and effortless guest transport with AC luxury buses.</p>

                <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>1. Photography, Film & 4K Drone</h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "2rem" }}>
                  {modularCatalog.mediaPackages.map((media) => (
                    <button
                      type="button"
                      key={media.id}
                      className={state.mediaId === media.id ? "selected" : ""}
                      onClick={() => setState((s) => ({ ...s, mediaId: media.id }))}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                        <span className="vendor-cat-label">{media.includesDrone ? "🚁 4K Drone Included" : "📸 Ground Crew"}</span>
                        <strong style={{ color: "#a855f7" }}>₹{(media.basePrice / 1000).toFixed(0)}k</strong>
                      </div>
                      <strong>{media.name}</strong>
                      <small style={{ marginTop: "0.35rem", display: "block" }}>{media.description}</small>
                      <i style={{ marginTop: "0.5rem" }}>{state.mediaId === media.id ? <Check size={14} /> : "+ Select"}</i>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
                  2. Relative & Guest Transport Fleet
                  <span style={{ fontSize: "0.85rem", color: "#38bdf8", marginLeft: "0.75rem", fontWeight: 500 }}>
                    Total Fleet Capacity: ~{totalFleetCapacity} passengers
                  </span>
                </h3>
                <div className="planner-option-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {modularCatalog.transportFleet.map((fleet) => {
                    const count = state.transportFleet[fleet.id] || 0;
                    return (
                      <div
                        key={fleet.id}
                        className={\`planner-result-card \${count > 0 ? "best" : ""}\`}
                        style={{ padding: "1.25rem", background: "rgba(18, 12, 38, 0.7)", border: count > 0 ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span className="vendor-cat-label"><Bus size={12} /> {fleet.capacity} Seats</span>
                          <strong style={{ color: "#a855f7" }}>₹{fleet.pricePerUnit.toLocaleString("en-IN")}/vehicle</strong>
                        </div>
                        <h4 style={{ margin: "0.25rem 0", fontSize: "1rem" }}>{fleet.name}</h4>
                        <p style={{ fontSize: "0.8rem", opacity: 0.75, margin: "0.25rem 0 1rem 0" }}>{fleet.description}</p>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <span style={{ fontSize: "0.85rem" }}>Vehicle Quantity:</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <button
                              type="button"
                              className="pill-toggle-btn"
                              style={{ width: "32px", height: "32px", padding: 0 }}
                              onClick={() => updateTransport(fleet.id, -1)}
                              disabled={count === 0}
                            >
                              -
                            </button>
                            <strong style={{ minWidth: "1.5rem", textAlign: "center", fontSize: "1.1rem" }}>{count}</strong>
                            <button
                              type="button"
                              className="pill-toggle-btn"
                              style={{ width: "32px", height: "32px", padding: 0 }}
                              onClick={() => updateTransport(fleet.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                {!submitted ? (
                  <form onSubmit={submitBrief}>
                    <span className="planner-kicker"><ShieldCheck size={16} /> Transparent Pricing & 100% Reliability SLA</span>
                    <h1>Your Tailored Event Brief &<br /><em>Live Estimate</em></h1>
                    <p className="planner-lead">Review your custom package breakdown. Connect directly with our event command team without middleman delays.</p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", margin: "1.5rem 0 2rem 0" }}>
                      <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.25)" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#a855f7", marginBottom: "0.35rem" }}>
                          <ShieldCheck size={18} />
                          <strong>Zero No-Show Guarantee</strong>
                        </div>
                        <small style={{ opacity: 0.8 }}>Pre-contracted backup vendors on standby. 100% emergency replacement SLA.</small>
                      </div>

                      <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#38bdf8", marginBottom: "0.35rem" }}>
                          <HeartHandshake size={18} />
                          <strong>Dedicated Event Captain</strong>
                        </div>
                        <small style={{ opacity: 0.8 }}>On-site production manager from day 1 through teardown to orchestrate run-of-show.</small>
                      </div>

                      <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#22c55e", marginBottom: "0.35rem" }}>
                          <Zap size={18} />
                          <strong>Instant CRM Sync</strong>
                        </div>
                        <small style={{ opacity: 0.8 }}>Direct tracking in MooNsEvents CRM with milestone-based payment safety.</small>
                      </div>
                    </div>

                    <div style={{ background: "rgba(20, 14, 40, 0.8)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" }}>
                      <h3 style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Itemized Scope Estimation ({state.guests} Guests)</span>
                        <span style={{ fontSize: "1.4rem", color: "#a855f7", fontWeight: 800 }}>{money(estimatedCost.subtotal)}</span>
                      </h3>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", fontSize: "0.9rem" }}>
                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Décor & Stage</small>
                          <strong>{selectedDecor.name}</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{selectedDecor.basePrice.toLocaleString("en-IN")}</div>
                        </div>

                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Seating & Dining</small>
                          <strong>{selectedSeating.name}</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{(selectedSeating.pricePerGuest * state.guests).toLocaleString("en-IN")} (~{calculatedTables} tables)</div>
                        </div>

                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Catering Spread</small>
                          <strong>{selectedCatering.name}</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{(selectedCatering.pricePerGuest * state.guests).toLocaleString("en-IN")}</div>
                        </div>

                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Media & 4K Drone</small>
                          <strong>{selectedMedia.name}</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{selectedMedia.basePrice.toLocaleString("en-IN")}</div>
                        </div>

                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Hospitality & Valet</small>
                          <strong>{selectedHospitality.name}</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{selectedHospitality.basePrice.toLocaleString("en-IN")}</div>
                        </div>

                        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <small style={{ opacity: 0.6, display: "block" }}>Transport Fleet</small>
                          <strong>~{totalFleetCapacity} Passenger Capacity</strong>
                          <div style={{ color: "#a855f7", marginTop: "0.25rem" }}>₹{estimatedCost.transportCost.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                    </div>

                    <div className="concierge-form-grid" style={{ marginBottom: "1.5rem" }}>
                      <label className="concierge-field">
                        <span>Contact Name</span>
                        <input
                          placeholder="Your Full Name"
                          required
                          value={state.contactName}
                          onChange={(e) => setState((s) => ({ ...s, contactName: e.target.value }))}
                        />
                      </label>

                      <label className="concierge-field">
                        <span>Phone / WhatsApp Number</span>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          required
                          value={state.phone}
                          onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
                        />
                      </label>

                      <label className="concierge-field full">
                        <span>Email (For PDF Proposal & Run-of-Show)</span>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={state.email}
                          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
                        />
                      </label>

                      <label className="concierge-field full">
                        <span>Special Instructions or Requirements</span>
                        <textarea
                          placeholder="Tell us about any specific preferences, special dietary requests, ritual timings, or venue details..."
                          value={state.specialNotes}
                          onChange={(e) => setState((s) => ({ ...s, specialNotes: e.target.value }))}
                        />
                      </label>
                    </div>

                    {submitMessage && (
                      <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", marginBottom: "1rem", color: "#fca5a5" }}>
                        {submitMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="planner-primary-action"
                      style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1.05rem" }}
                    >
                      {submitting ? "Transmitting brief to MooNs CRM..." : <>Submit Event Brief & Lock In Pricing <ArrowRight size={18} /></>}
                    </button>
                  </form>
                ) : (
                  <div className="planner-results-shell" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                    <div style={{ display: "inline-flex", padding: "1.5rem", borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", marginBottom: "1.5rem" }}>
                      <CheckCircle2 size={56} />
                    </div>
                    <h2 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>Your Event Brief is Confirmed!</h2>
                    <p style={{ maxWidth: "600px", margin: "0 auto 1.5rem auto", lineHeight: 1.6, opacity: 0.85 }}>
                      {submitMessage}
                    </p>
                    <div style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", maxWidth: "480px", margin: "0 auto 2rem auto", textAlign: "left" }}>
                      <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#a855f7" }}>What happens next?</div>
                      <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", lineHeight: 1.7, opacity: 0.9 }}>
                        <li>A designated MooNs Event Captain reviews your itemized scope.</li>
                        <li>We verify live vendor availability across your decor, catering, transport fleet, and drone crew.</li>
                        <li>You receive an itemized proposal with custom milestones & escrow protection.</li>
                      </ul>
                    </div>
                    <button type="button" onClick={reset} className="button" style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                      <RotateCcw size={16} /> Plan Another Event
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {(!submitted || step < 4) && (
        <footer className="planner-wizard-actions">
          <div>
            {step > 0 && (
              <button className="planner-back" type="button" onClick={() => go(step - 1)}>
                <ArrowLeft size={16} /> Previous
              </button>
            )}
          </div>

          <div className="planner-live-summary">
            <span>{state.guests} Guests</span>
            <span>{state.city}</span>
            <span style={{ color: "#a855f7", fontWeight: 700 }}>Est: {money(estimatedCost.subtotal)}</span>
          </div>

          {step < steps.length - 1 && (
            <button className="planner-next" type="button" onClick={() => go(step + 1)}>
              Continue <ArrowRight size={16} />
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
`;

fs.writeFileSync('C:/MooNsEWeb/components/event-planner-wizard.tsx', wizardContent, 'utf8');
console.log('Successfully updated C:/MooNsEWeb/components/event-planner-wizard.tsx');
