import fs from 'node:fs';

const brightCssRules = `
/* ==========================================================================
   BRIGHT RADIANT CELEBRATORY LUXURY DESIGN SYSTEM
   ========================================================================== */

/* Root Animated Scroll Progress */
.site-scroll-progress {
  position: fixed;
  z-index: 1200;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, #7c3aed, #db2777, #f59e0b);
  box-shadow: 0 0 14px rgba(124, 58, 237, 0.4);
}

/* ==========================================================================
   HEADER & LUMINOUS PEARL GLASS MEGA MENU
   ========================================================================== */

.eventflow-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
  transition: background-color 0.25s, box-shadow 0.25s;
}

.eventflow-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.eventflow-logo img {
  height: 38px;
  width: auto;
  object-fit: contain;
  display: block;
}

.eventflow-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.18s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.08);
}

.nav-chevron {
  transition: transform 0.2s ease;
  color: #94a3b8;
}

.nav-chevron.rotate {
  transform: rotate(180deg);
  color: #7c3aed;
}

/* Red Offers Button */
.red-offers-nav-link {
  color: #ef4444 !important;
  font-weight: 700 !important;
  background: rgba(239, 68, 68, 0.08) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
  padding: 0.45rem 0.85rem !important;
  border-radius: 999px !important;
}

.red-offers-nav-link:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25) !important;
}

.red-offers-badge {
  font-size: 0.65rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #ffffff;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

/* Header Actions */
.eventflow-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-planner-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff !important;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-planner-link:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
}

/* Premium Location Pill */
.location-picker-wrapper {
  position: relative;
}

.premium-location-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(243, 232, 255, 0.8);
  border: 1.5px solid rgba(168, 85, 247, 0.35);
  color: #6b21a8;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.premium-location-pill:hover {
  background: rgba(233, 213, 255, 0.9);
  border-color: #a855f7;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.location-pill-icon-glow {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7c3aed;
  color: #ffffff;
}

.city-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 230px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.5rem;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.city-dropdown-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0.4rem 0.6rem;
}

.city-item-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.city-item-btn:hover {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.city-item-btn.selected {
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
  font-weight: 700;
}

.city-check-icon {
  margin-left: auto;
  color: #7c3aed;
}

.header-icon-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid #e2e8f0;
  color: #475569;
  text-decoration: none;
  transition: all 0.18s ease;
}

.header-icon-btn:hover {
  background: #ffffff;
  color: #7c3aed;
  border-color: #c084fc;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #334155;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .eventflow-nav { display: none; }
  .mobile-menu-toggle { display: block; }
}

/* ==========================================================================
   LUMINOUS PEARL MEGA MENU PANEL
   ========================================================================== */

.mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
  padding: 0.75rem 1.5rem 1.5rem 1.5rem;
  animation: mega-menu-fade-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes mega-menu-fade-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.mega-menu-container {
  max-width: 1320px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1.5px solid rgba(226, 232, 240, 0.95);
  border-radius: 20px;
  box-shadow: 0 25px 65px rgba(15, 23, 42, 0.12), 0 0 35px rgba(124, 58, 237, 0.06);
  padding: 1.75rem;
}

.mega-menu-grid {
  display: grid;
  gap: 1.75rem;
}

.mega-menu-grid.two-col { grid-template-columns: repeat(2, 1fr); }
.mega-menu-grid.three-col { grid-template-columns: repeat(3, 1fr); }
.mega-menu-grid.four-col { grid-template-columns: repeat(4, 1fr); }

.mega-menu-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid #f1f5f9;
}

.mega-menu-heading.purple { color: #7c3aed; }
.mega-menu-heading.rose { color: #e11d48; }
.mega-menu-heading.cyan { color: #0284c7; }
.mega-menu-heading.amber { color: #d97706; }
.mega-menu-heading.pink { color: #db2777; }

.mega-menu-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mega-link-item {
  display: block;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.18s ease;
}

.mega-link-item:hover {
  background: rgba(243, 232, 255, 0.6);
  transform: translateX(4px);
}

.mega-link-item strong {
  display: block;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.3;
}

.mega-link-item small {
  display: block;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.4;
  margin-top: 0.15rem;
}

/* Spotlight Promo Card */
.mega-spotlight-card {
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.mega-spotlight-card.wedding {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.25);
}

.mega-spotlight-card.corporate {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
}

.mega-spotlight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: fit-content;
  margin-bottom: 0.75rem;
}

.mega-spotlight-card h4 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.mega-spotlight-card p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1.25rem 0;
}

.mega-spotlight-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  background: #ffffff;
  color: #7c3aed !important;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  width: fit-content;
}

.mega-spotlight-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.mega-spotlight-btn.corporate {
  color: #0f172a !important;
}

/* Mobile Nav Drawer */
.mobile-nav-drawer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 1.5rem;
}

.mobile-nav-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.mobile-section-title {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #7c3aed;
  margin-bottom: 0.75rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
}

.mobile-nav-item.red-highlight {
  color: #ef4444;
  font-weight: 700;
}

.mobile-planner-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff !important;
  font-weight: 700;
  text-decoration: none;
}

/* ==========================================================================
   EVENT PLANNER WIZARD — BRIGHT RADIANT CELEBRATORY THEME
   ========================================================================== */

.planner-wizard-shell.bright-luxury {
  position: relative;
  min-height: calc(100vh - 70px);
  overflow: hidden;
  color: #0f172a;
  background:
    radial-gradient(circle at 10% 10%, rgba(216, 180, 254, 0.35), transparent 45%),
    radial-gradient(circle at 90% 85%, rgba(254, 205, 211, 0.4), transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.22), transparent 60%),
    linear-gradient(180deg, #fdfbf9 0%, #faf5ff 50%, #fdf2f8 100%);
}

/* Floating Celebration Light Orbs */
.planner-ambient-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  animation: float-orb 12s ease-in-out infinite alternate;
}

.orb-champagne {
  width: 340px;
  height: 340px;
  top: 8%;
  right: 5%;
  background: rgba(251, 191, 36, 0.18);
  animation-duration: 14s;
}

.orb-rose {
  width: 380px;
  height: 380px;
  bottom: 12%;
  left: 4%;
  background: rgba(244, 63, 94, 0.14);
  animation-duration: 16s;
}

.orb-amethyst {
  width: 300px;
  height: 300px;
  top: 45%;
  left: 35%;
  background: rgba(124, 58, 237, 0.12);
  animation-duration: 10s;
}

@keyframes float-orb {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25px, -20px) scale(1.08); }
  100% { transform: translate(-20px, 25px) scale(0.95); }
}

.planner-wizard-head {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: min(100% - 64px, 1440px);
  margin: 0 auto;
  padding: 24px 0 16px;
}

.planner-exit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: color 0.18s;
}

.planner-exit:hover {
  color: #7c3aed;
}

.planner-progress-copy {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.planner-progress-copy strong {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
}

.planner-progress {
  position: relative;
  z-index: 2;
  width: min(100% - 64px, 1440px);
  height: 3px;
  margin: 0 auto;
  overflow: hidden;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 999px;
}

.planner-progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c3aed, #db2777, #f59e0b);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
}

.planner-stage {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: clamp(30px, 5vw, 80px);
  width: min(100% - 64px, 1440px);
  min-height: 650px;
  margin: 0 auto;
  padding: clamp(32px, 5vw, 60px) 0 140px;
}

/* Step Rail */
.planner-step-rail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 10px;
}

.planner-step-rail button {
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  color: #94a3b8;
  background: none;
  text-align: left;
  font: inherit;
  cursor: default;
  transition: color 0.2s;
}

.planner-step-rail button>span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1.5px solid #cbd5e1;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: #ffffff;
  color: #64748b;
  transition: all 0.2s;
}

.planner-step-rail button small {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 700;
}

.planner-step-rail button.active {
  color: #7c3aed;
}

.planner-step-rail button.active>span {
  border-color: #7c3aed;
  background: #7c3aed;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.4);
}

.planner-step-rail button.done {
  color: #475569;
  cursor: pointer;
}

.planner-step-rail button.done>span {
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

/* Planner Panel */
.planner-panel {
  max-width: 1200px;
}

.planner-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #7c3aed;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.planner-heading {
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #0f172a;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.planner-heading em {
  color: transparent;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  -webkit-background-clip: text;
  background-clip: text;
  font-style: normal;
}

.planner-lead {
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 720px;
  margin-bottom: 2rem;
}

.planner-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 2.2rem 0 1rem 0;
}

.planner-section-num {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #7c3aed;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.3);
}

.planner-section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.planner-fleet-capacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0284c7;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.planner-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

/* Luminous Pearl Option Cards */
.planner-luxury-card {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
  border-radius: 18px;
  padding: 1.4rem;
  color: #0f172a !important;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.05);
}

.planner-luxury-card:hover {
  background: #ffffff !important;
  border-color: rgba(124, 58, 237, 0.5) !important;
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.12) !important;
  transform: translateY(-3px);
}

.planner-luxury-card.selected {
  border-color: #7c3aed !important;
  background: linear-gradient(145deg, #ffffff, #faf5ff) !important;
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.16), 0 0 0 1px rgba(124, 58, 237, 0.12) !important;
}

.planner-luxury-card.fleet {
  cursor: default;
}

.planner-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.planner-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.planner-card-active-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #16a34a;
  background: rgba(34, 197, 94, 0.15);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.planner-card-price {
  font-size: 1.05rem;
  font-weight: 800;
  color: #7c3aed;
  letter-spacing: -0.01em;
}

.planner-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a !important;
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}

.planner-card-desc {
  font-size: 0.84rem;
  color: #64748b !important;
  line-height: 1.45;
  margin: 0 0 0.85rem 0;
}

.planner-auto-calc-badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.25);
  color: #0284c7;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  margin-top: 0.5rem;
}

.planner-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
}

.planner-card-status {
  font-size: 0.8rem;
  font-weight: 600;
  color: #7c3aed;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  transition: all 0.16s;
}

.planner-card-status.active {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  font-weight: 700;
}

/* Stepper Controls */
.planner-stepper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.planner-stepper-label {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
}

.planner-stepper-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.planner-stepper-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid rgba(124, 58, 237, 0.35);
  background: rgba(243, 232, 255, 0.7);
  color: #7c3aed;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s;
}

.planner-stepper-btn:hover:not(:disabled) {
  background: #7c3aed;
  color: #ffffff;
  border-color: #7c3aed;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.35);
}

.planner-stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.planner-stepper-val {
  font-size: 1.2rem;
  font-weight: 800;
  min-width: 1.5rem;
  text-align: center;
  color: #0f172a;
}

/* Guest & Input Fields */
.planner-essentials-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.planner-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.planner-field>span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.planner-guest-field {
  padding: 1.5rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.04);
}

.planner-guest-field input[type="range"] {
  width: 100%;
  margin: 1.5rem 0 0.75rem 0;
  accent-color: #7c3aed;
}

.planner-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.planner-luxury-input {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 12px !important;
  color: #0f172a !important;
  font-size: 0.95rem !important;
  padding: 0.85rem 1rem !important;
  width: 100%;
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.planner-luxury-input:focus {
  border-color: #7c3aed !important;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18) !important;
}

/* Urgent Banner */
.planner-urgent-banner {
  margin-top: 1.5rem;
  padding: 1.15rem 1.4rem;
  border-radius: 14px;
  background: rgba(254, 242, 242, 0.95);
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.08);
}

.planner-urgent-banner strong {
  color: #dc2626;
  display: block;
  font-size: 1rem;
}

.planner-urgent-banner small {
  color: #991b1b;
  font-size: 0.85rem;
}

/* Trust Grid & Invoice */
.planner-trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 2rem 0;
}

.planner-trust-card {
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
}

.planner-trust-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
}

.planner-trust-card small {
  font-size: 0.82rem;
  line-height: 1.45;
  color: #475569;
}

.planner-trust-card.purple {
  background: rgba(243, 232, 255, 0.7);
  border: 1.5px solid rgba(192, 132, 252, 0.4);
}

.planner-trust-card.purple .planner-trust-card-head { color: #7c3aed; }

.planner-trust-card.cyan {
  background: rgba(224, 242, 254, 0.7);
  border: 1.5px solid rgba(125, 211, 252, 0.4);
}

.planner-trust-card.cyan .planner-trust-card-head { color: #0284c7; }

.planner-trust-card.green {
  background: rgba(220, 252, 231, 0.7);
  border: 1.5px solid rgba(134, 239, 172, 0.4);
}

.planner-trust-card.green .planner-trust-card-head { color: #16a34a; }

.planner-invoice-card {
  background: #ffffff;
  border: 1.5px solid rgba(124, 58, 237, 0.25);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px rgba(124, 58, 237, 0.08);
  margin-bottom: 2rem;
}

.planner-invoice-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.planner-invoice-head h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.planner-invoice-head small {
  color: #64748b;
  font-size: 0.85rem;
}

.planner-invoice-total {
  font-size: 1.7rem;
  font-weight: 800;
  color: #7c3aed;
  letter-spacing: -0.02em;
}

.planner-invoice-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.planner-invoice-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.planner-invoice-item small {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.planner-invoice-item strong {
  color: #0f172a;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.planner-item-cost {
  color: #7c3aed;
  font-weight: 700;
  font-size: 0.9rem;
  margin-top: auto;
}

.planner-submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.15rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff !important;
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.planner-submit-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(124, 58, 237, 0.5);
}

.planner-wizard-actions {
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 84px;
  padding: 14px max(32px, calc((100vw - 1440px) / 2));
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.04);
}

.planner-wizard-actions>div:last-of-type { justify-self: center; }

.planner-back,
.planner-next {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 48px;
  border-radius: 999px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.planner-back {
  border: 1.5px solid #cbd5e1;
  padding: 0 20px;
  color: #475569;
  background: #ffffff;
}

.planner-back:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

.planner-next {
  justify-self: end;
  min-width: 172px;
  padding: 0 24px;
  border: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
}

.planner-next:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.45);
}

.planner-live-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.planner-live-summary span {
  padding: 6px 12px;
  border-radius: 999px;
  color: #475569;
  background: rgba(241, 245, 249, 0.9);
  font-size: 0.78rem;
  font-weight: 600;
}

.planner-confirmed-screen {
  text-align: center;
  padding: 3rem 1.5rem;
}

.planner-confirmed-icon {
  display: inline-flex;
  padding: 1.5rem;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
}

.planner-confirmed-screen h2 {
  font-size: 2.2rem;
  color: #0f172a;
  margin-bottom: 0.75rem;
  font-weight: 800;
}

.planner-confirmed-lead {
  max-width: 620px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
  color: #475569;
  font-size: 1.05rem;
}

.planner-confirmed-box {
  padding: 1.5rem;
  border-radius: 18px;
  background: rgba(243, 232, 255, 0.6);
  border: 1.5px solid rgba(192, 132, 252, 0.4);
  max-width: 540px;
  margin: 0 auto 2.5rem auto;
  text-align: left;
}

.planner-confirmed-box-title {
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #7c3aed;
  font-size: 1.05rem;
}

.planner-confirmed-box ul {
  padding-left: 1.25rem;
  font-size: 0.92rem;
  line-height: 1.7;
  color: #334155;
}
`;

fs.writeFileSync('C:/MooNsEWeb/app/globals.css', fs.readFileSync('C:/MooNsEWeb/app/globals.css', 'utf8') + brightCssRules, 'utf8');
console.log('Successfully appended bright CSS rules to globals.css');
