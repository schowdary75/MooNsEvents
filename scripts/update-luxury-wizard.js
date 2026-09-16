import fs from 'node:fs';

const wizardCode = `"use client";

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
  Tag,
  Building,
  Car,
  Layers,
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

const cities = [
  "Hyderabad",
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Goa",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Udaipur",
  "Anywhere in India",
];

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
        {/* Step Navigation Rail */}
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

        {/* Dynamic Wizard Stage Panes */}
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
            {/* --- STAGE 0: Occasion & Scale --- */}
            {step === 0 && (
              <>
                <span className="planner-kicker"><PartyPopper size={16} /> Step 1: Occasion & Scale</span>
                <h1 className="planner-heading">What event are we<br /><em>bringing to life?</em></h1>
                <p className="planner-lead">Select your event occasion and guest scale. We will customize every vendor, decor, catering, transport, and drone recommendation.</p>

                <div className="planner-grid-cards" style={{ marginBottom: "2rem" }}>
                  {eventTypes.slice(0, 8).map((type, index) => {
                    const isSelected = state.eventType === type.slug;
                    return (
                      <div
                        key={type.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, eventType: type.slug }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <Sparkles size={12} /> {String(index + 1).padStart(2, "0")}
                          </span>
                          {isSelected && <span className="planner-card-active-dot"><Check size={12} /> Selected</span>}
                        </div>
                        <h4 className="planner-card-title">{type.name}</h4>
                        <p className="planner-card-desc">{type.summary || \`Complete tailored execution for \${type.name.toLowerCase()}\`}</p>
                        <div className="planner-card-footer">
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? "✓ Active Choice" : "+ Select Occasion"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="planner-essentials-grid">
                  <label className="planner-field">
                    <span><MapPin size={16} /> Event City / Region</span>
                    <select
                      value={state.city}
                      onChange={(e) => setState((s) => ({ ...s, city: e.target.value }))}
                      className="planner-luxury-input"
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
                      className="planner-luxury-input"
                    >
                    </input>
                  </label>

                  <div className="planner-guest-field" style={{ gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span><UsersRound size={16} /> Approximate Guest Count</span>
                      <strong style={{ fontSize: "1.5rem", color: "#c084fc", fontWeight: 800 }}>{state.guests} Guests</strong>
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
                  <div className="planner-urgent-banner">
                    <Zap size={28} color="#ef4444" />
                    <div>
                      <strong>Urgent Last-Minute Event Request</strong>
                      <small>Your date is within 14 days. MooNs Emergency Event Protocol is activated with zero-penalty 24h vendor lock-in!</small>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* --- STAGE 1: Venue & Decor Layout --- */}
            {step === 1 && (
              <>
                <span className="planner-kicker"><Crown size={16} /> Step 2: Stage, Mandap & Seating Infrastructure</span>
                <h1 className="planner-heading">Décor Theme &<br /><em>Dining Layout</em></h1>
                <p className="planner-lead">Choose your central theme and seating format. We calculate required dining tables, gold chairs, and lighting automatically.</p>

                <div className="planner-section-header">
                  <span className="planner-section-num">1</span>
                  <h3>Select Décor & Stage Theme</h3>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.decorOptions.map((decor) => {
                    const isSelected = state.decorId === decor.id;
                    return (
                      <div
                        key={decor.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, decorId: decor.id }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <Sparkles size={12} /> {decor.category}
                          </span>
                          <span className="planner-card-price">₹{(decor.basePrice / 1000).toFixed(0)}k</span>
                        </div>
                        <h4 className="planner-card-title">{decor.name}</h4>
                        <p className="planner-card-desc">{decor.description}</p>
                        <div className="planner-card-footer">
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? <><Check size={13} /> Active Decor</> : "+ Select Theme"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="planner-section-header">
                  <span className="planner-section-num">2</span>
                  <h3>Seating & Dining Layout</h3>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.seatingOptions.map((seating) => {
                    const isSelected = state.seatingId === seating.id;
                    const tableCount = Math.ceil(state.guests / seating.tablesPerGuestRatio);
                    return (
                      <div
                        key={seating.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, seatingId: seating.id }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <Crown size={12} /> {seating.chairType}
                          </span>
                          <span className="planner-card-price">₹{seating.pricePerGuest}/guest</span>
                        </div>
                        <h4 className="planner-card-title">{seating.name}</h4>
                        <p className="planner-card-desc">{seating.description}</p>
                        <div className="planner-auto-calc-badge">
                          <Zap size={12} /> Calculated for {state.guests} guests: ~{tableCount} tables + {state.guests} chairs
                        </div>
                        <div className="planner-card-footer" style={{ marginTop: "1rem" }}>
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? <><Check size={13} /> Active Seating</> : "+ Select Seating"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* --- STAGE 2: Catering & Hospitality --- */}
            {step === 2 && (
              <>
                <span className="planner-kicker"><UtensilsCrossed size={16} /> Step 3: Multi-Cuisine & Hospitality Team</span>
                <h1 className="planner-heading">Culinary Feast &<br /><em>Welcome Crew</em></h1>
                <p className="planner-lead">Delight your relatives and VIP guests with gourmet catering spreads and professional welcome hostesses.</p>

                <div className="planner-section-header">
                  <span className="planner-section-num">1</span>
                  <h3>Catering Buffet & Live Counters</h3>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.cateringTiers.map((cater) => {
                    const isSelected = state.cateringId === cater.id;
                    return (
                      <div
                        key={cater.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, cateringId: cater.id }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <UtensilsCrossed size={12} /> {cater.liveCountersCount} Live Stations
                          </span>
                          <span className="planner-card-price">₹{cater.pricePerGuest}/plate</span>
                        </div>
                        <h4 className="planner-card-title">{cater.name}</h4>
                        <p className="planner-card-desc">{cater.description}</p>
                        <div className="planner-auto-calc-badge">
                          <Sparkles size={12} /> Includes Signature Welcome Drinks & Mocktails
                        </div>
                        <div className="planner-card-footer" style={{ marginTop: "1rem" }}>
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? <><Check size={13} /> Active Menu</> : "+ Select Spread"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="planner-section-header">
                  <span className="planner-section-num">2</span>
                  <h3>Guest Hospitality, Valet & Registration Desk</h3>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.hospitalityTiers.map((hosp) => {
                    const isSelected = state.hospitalityId === hosp.id;
                    return (
                      <div
                        key={hosp.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, hospitalityId: hosp.id }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <HeartHandshake size={12} /> {hosp.staffCount} Dedicated Crew
                          </span>
                          <span className="planner-card-price">₹{(hosp.basePrice / 1000).toFixed(0)}k total</span>
                        </div>
                        <h4 className="planner-card-title">{hosp.name}</h4>
                        <p className="planner-card-desc">{hosp.description}</p>
                        <div className="planner-card-footer">
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? <><Check size={13} /> Active Hospitality</> : "+ Select Crew"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* --- STAGE 3: Photography, Drone & Transport Fleet --- */}
            {step === 3 && (
              <>
                <span className="planner-kicker"><Camera size={16} /> Step 4: 4K Drone Visuals & Relatives Fleet</span>
                <h1 className="planner-heading">Media Capture &<br /><em>Guest Transport Fleet</em></h1>
                <p className="planner-lead">Ensure high-definition memories with aerial drone coverage and effortless guest transport with AC luxury buses.</p>

                <div className="planner-section-header">
                  <span className="planner-section-num">1</span>
                  <h3>Photography, Film & 4K Drone</h3>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.mediaPackages.map((media) => {
                    const isSelected = state.mediaId === media.id;
                    return (
                      <div
                        key={media.id}
                        className={\`planner-luxury-card \${isSelected ? "selected" : ""}\`}
                        onClick={() => setState((s) => ({ ...s, mediaId: media.id }))}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <Camera size={12} /> {media.includesDrone ? "🚁 4K Drone Included" : "📸 Ground Crew"}
                          </span>
                          <span className="planner-card-price">₹{(media.basePrice / 1000).toFixed(0)}k</span>
                        </div>
                        <h4 className="planner-card-title">{media.name}</h4>
                        <p className="planner-card-desc">{media.description}</p>
                        {media.includesLiveStream && (
                          <div className="planner-auto-calc-badge">
                            <Zap size={12} /> Private Live YouTube / Zoom Web Broadcast Included
                          </div>
                        )}
                        <div className="planner-card-footer" style={{ marginTop: "1rem" }}>
                          <span className={\`planner-card-status \${isSelected ? "active" : ""}\`}>
                            {isSelected ? <><Check size={13} /> Active Media</> : "+ Select Media"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="planner-section-header" style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span className="planner-section-num">2</span>
                    <h3>Relative & Guest Transport Fleet</h3>
                  </div>
                  <span className="planner-fleet-capacity-badge">
                    <Bus size={13} /> Fleet Capacity: ~{totalFleetCapacity} seats
                  </span>
                </div>

                <div className="planner-grid-cards">
                  {modularCatalog.transportFleet.map((fleet) => {
                    const count = state.transportFleet[fleet.id] || 0;
                    return (
                      <div
                        key={fleet.id}
                        className={\`planner-luxury-card fleet \${count > 0 ? "selected" : ""}\`}
                      >
                        <div className="planner-card-top">
                          <span className="planner-card-badge">
                            <Bus size={12} /> {fleet.capacity} Seats
                          </span>
                          <span className="planner-card-price">₹{fleet.pricePerUnit.toLocaleString("en-IN")}/unit</span>
                        </div>
                        <h4 className="planner-card-title">{fleet.name}</h4>
                        <p className="planner-card-desc">{fleet.description}</p>

                        <div className="planner-stepper-row">
                          <span className="planner-stepper-label">Quantity:</span>
                          <div className="planner-stepper-controls">
                            <button
                              type="button"
                              className="planner-stepper-btn"
                              onClick={() => updateTransport(fleet.id, -1)}
                              disabled={count === 0}
                            >
                              -
                            </button>
                            <strong className="planner-stepper-val">{count}</strong>
                            <button
                              type="button"
                              className="planner-stepper-btn"
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

            {/* --- STAGE 4: Quote, Trust & CRM Sync --- */}
            {step === 4 && (
              <>
                {!submitted ? (
                  <form onSubmit={submitBrief}>
                    <span className="planner-kicker"><ShieldCheck size={16} /> Step 5: Transparent Pricing & 100% Reliability SLA</span>
                    <h1 className="planner-heading">Your Tailored Event Brief &<br /><em>Live Estimate</em></h1>
                    <p className="planner-lead">Review your custom package breakdown. Connect directly with our event command team without middleman delays.</p>

                    {/* Trust Guarantees Bar */}
                    <div className="planner-trust-grid">
                      <div className="planner-trust-card purple">
                        <div className="planner-trust-card-head">
                          <ShieldCheck size={18} />
                          <strong>Zero No-Show Guarantee</strong>
                        </div>
                        <small>Pre-contracted backup vendors on standby. 100% emergency replacement SLA.</small>
                      </div>

                      <div className="planner-trust-card cyan">
                        <div className="planner-trust-card-head">
                          <HeartHandshake size={18} />
                          <strong>Dedicated Event Captain</strong>
                        </div>
                        <small>On-site production manager from day 1 through teardown to orchestrate run-of-show.</small>
                      </div>

                      <div className="planner-trust-card green">
                        <div className="planner-trust-card-head">
                          <Zap size={18} />
                          <strong>Instant CRM Sync</strong>
                        </div>
                        <small>Direct tracking in MooNsEvents CRM with milestone-based payment safety.</small>
                      </div>
                    </div>

                    {/* Cost Breakdown Grid */}
                    <div className="planner-invoice-card">
                      <div className="planner-invoice-head">
                        <div>
                          <h3>Itemized Scope Estimation</h3>
                          <small>Calculated for {state.guests} Guests in {state.city}</small>
                        </div>
                        <span className="planner-invoice-total">{money(estimatedCost.subtotal)}</span>
                      </div>

                      <div className="planner-invoice-items">
                        <div className="planner-invoice-item">
                          <small>Décor & Stage</small>
                          <strong>{selectedDecor.name}</strong>
                          <span className="planner-item-cost">₹{selectedDecor.basePrice.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="planner-invoice-item">
                          <small>Seating & Dining</small>
                          <strong>{selectedSeating.name}</strong>
                          <span className="planner-item-cost">₹{(selectedSeating.pricePerGuest * state.guests).toLocaleString("en-IN")} (~{calculatedTables} tables)</span>
                        </div>

                        <div className="planner-invoice-item">
                          <small>Catering Spread</small>
                          <strong>{selectedCatering.name}</strong>
                          <span className="planner-item-cost">₹{(selectedCatering.pricePerGuest * state.guests).toLocaleString("en-IN")}</span>
                        </div>

                        <div className="planner-invoice-item">
                          <small>Media & 4K Drone</small>
                          <strong>{selectedMedia.name}</strong>
                          <span className="planner-item-cost">₹{selectedMedia.basePrice.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="planner-invoice-item">
                          <small>Hospitality & Valet</small>
                          <strong>{selectedHospitality.name}</strong>
                          <span className="planner-item-cost">₹{selectedHospitality.basePrice.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="planner-invoice-item">
                          <small>Transport Fleet</small>
                          <strong>~{totalFleetCapacity} Seats Fleet</strong>
                          <span className="planner-item-cost">₹{estimatedCost.transportCost.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Confirmation Form */}
                    <div className="concierge-form-grid" style={{ marginBottom: "1.5rem" }}>
                      <label className="concierge-field">
                        <span>Contact Name</span>
                        <input
                          placeholder="Your Full Name"
                          required
                          value={state.contactName}
                          onChange={(e) => setState((s) => ({ ...s, contactName: e.target.value }))}
                          className="planner-luxury-input"
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
                          className="planner-luxury-input"
                        />
                      </label>

                      <label className="concierge-field full">
                        <span>Email (For PDF Proposal & Run-of-Show)</span>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={state.email}
                          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
                          className="planner-luxury-input"
                        />
                      </label>

                      <label className="concierge-field full">
                        <span>Special Instructions or Requirements</span>
                        <textarea
                          placeholder="Tell us about any specific preferences, special dietary requests, ritual timings, or venue details..."
                          value={state.specialNotes}
                          onChange={(e) => setState((s) => ({ ...s, specialNotes: e.target.value }))}
                          className="planner-luxury-input"
                          style={{ minHeight: "100px", resize: "vertical" }}
                        />
                      </label>
                    </div>

                    {submitMessage && (
                      <div className="planner-error-banner">
                        {submitMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="planner-submit-btn"
                    >
                      {submitting ? "Transmitting brief to MooNs CRM..." : <>Submit Event Brief & Lock In Pricing <ArrowRight size={18} /></>}
                    </button>
                  </form>
                ) : (
                  <div className="planner-confirmed-screen">
                    <div className="planner-confirmed-icon">
                      <CheckCircle2 size={56} />
                    </div>
                    <h2>Your Event Brief is Confirmed!</h2>
                    <p className="planner-confirmed-lead">
                      {submitMessage}
                    </p>
                    <div className="planner-confirmed-box">
                      <div className="planner-confirmed-box-title">What happens next?</div>
                      <ul>
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

      {/* Wizard Footer Navigation */}
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
            <span style={{ color: "#c084fc", fontWeight: 800 }}>Est: {money(estimatedCost.subtotal)}</span>
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

fs.writeFileSync('C:/MooNsEWeb/components/event-planner-wizard.tsx', wizardCode, 'utf8');
console.log('Successfully written luxury event-planner-wizard.tsx');
