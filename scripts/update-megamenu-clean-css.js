import fs from 'node:fs';

let css = fs.readFileSync('C:/MooNsEWeb/app/globals.css', 'utf8');

// Cut off previous append if exists
const marker = '/* ==========================================================================\\n   MEGA MENU & TOP NAVIGATION STYLES';
if (css.includes(marker)) {
  css = css.split(marker)[0];
}

const cleanMegaMenuStyles = `
/* ==========================================================================
   MEGA MENU & TOP NAVIGATION STYLES (PREMIUM REDESIGN)
   ========================================================================== */

@keyframes red-flame-flicker {
  0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239,68,68,0.5)); }
  100% { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(239,68,68,0.8)); }
}

@keyframes mega-menu-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eventflow-header {
  position: sticky;
  top: 0;
  z-index: 999;
  height: 68px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #eeeaf2;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.eventflow-header-container {
  width: 95vw;
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.eventflow-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.eventflow-logo img {
  display: block;
  width: 125px;
  height: 42px;
  object-fit: contain;
}

.eventflow-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-item-dropdown {
  display: inline-flex;
  align-items: center;
}

.nav-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.nav-link:hover,
.nav-link.active {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.08);
}

.nav-chevron {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: #64748b;
}

.nav-chevron.rotate {
  transform: rotate(180deg);
  color: #7c3aed;
}

/* Vibrant Red Offers Link */
.red-offers-nav-link {
  color: #ef4444 !important;
  font-weight: 700 !important;
  background: rgba(239, 68, 68, 0.06);
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  padding: 0.45rem 0.85rem !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.12);
}

.red-offers-nav-link:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.3) !important;
  transform: translateY(-1px);
}

.red-offers-icon {
  color: #ef4444;
  animation: red-flame-flicker 1.8s infinite alternate;
}

.red-offers-badge {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  line-height: 1;
}

/* Header Right Actions */
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
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff !important;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
  transition: all 0.18s ease;
}

.header-planner-link:hover {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
  transform: translateY(-1px);
}

/* Premium Location Pill */
.location-picker-wrapper {
  position: relative;
}

.premium-location-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem 0.35rem 0.4rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(168, 85, 247, 0.12));
  border: 1.5px solid rgba(124, 58, 237, 0.28);
  color: #6d28d9;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.premium-location-pill:hover {
  background: rgba(124, 58, 237, 0.16);
  border-color: #7c3aed;
  box-shadow: 0 3px 12px rgba(124, 58, 237, 0.2);
  transform: translateY(-1px);
}

.location-pill-icon-glow {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #7c3aed;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
}

.location-pill-text {
  font-weight: 700;
  letter-spacing: -0.01em;
}

.location-pill-chevron {
  transition: transform 0.2s;
  color: #7c3aed;
}

.location-pill-chevron.rotate {
  transform: rotate(180deg);
}

.city-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 230px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 1001;
  animation: mega-menu-fade 0.18s ease-out both;
}

.city-dropdown-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 0.4rem 0.6rem;
}

.city-item-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
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
  color: #7c3aed;
}

.header-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: grid;
  place-items: center;
  color: #334155;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.18s ease;
}

.header-icon-btn:hover {
  border-color: #7c3aed;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.06);
  transform: translateY(-1px);
}

/* =========================================================================
   FULL-WIDTH MEGA MENU FLOATING DROPDOWN
   ========================================================================= */

.mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  padding-top: 6px;
  animation: mega-menu-fade 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.mega-menu-container {
  width: 95vw;
  max-width: 1240px;
  margin: 0 auto;
  background: rgba(14, 9, 28, 0.98);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 20px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.75), 0 0 45px rgba(124, 58, 237, 0.22);
  padding: 1.75rem 2rem;
}

.mega-menu-grid {
  display: grid;
  gap: 1.75rem;
}

.mega-menu-grid.three-col {
  grid-template-columns: 270px 270px 1fr;
}

.mega-menu-grid.two-col {
  grid-template-columns: 320px 320px;
}

.mega-menu-grid.four-col {
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.mega-menu-col {
  display: flex;
  flex-direction: column;
}

.mega-menu-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c084fc;
  margin-bottom: 0.85rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mega-icon-purple { color: #c084fc; }
.mega-icon-cyan { color: #38bdf8; }
.mega-icon-pink { color: #f472b6; }

.mega-menu-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.mega-link-item {
  display: block;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.16s ease;
  border: 1px solid transparent;
}

.mega-link-item:hover {
  background: rgba(168, 85, 247, 0.16);
  border-color: rgba(168, 85, 247, 0.35);
  transform: translateX(4px);
}

.mega-link-item strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.mega-link-item small {
  display: block;
  font-size: 0.76rem;
  color: #cbd5e1;
  margin-top: 0.2rem;
  line-height: 1.35;
}

/* Mega Spotlight Promo Card */
.mega-spotlight-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(88, 28, 135, 0.55), rgba(24, 12, 48, 0.85));
  border: 1px solid rgba(168, 85, 247, 0.45);
  box-shadow: inset 0 0 30px rgba(168, 85, 247, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.mega-spotlight-card.corporate {
  background: linear-gradient(145deg, rgba(14, 116, 144, 0.45), rgba(15, 23, 42, 0.85));
  border-color: rgba(56, 189, 248, 0.45);
}

.mega-spotlight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #f3e8ff;
  background: rgba(168, 85, 247, 0.3);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.85rem;
  align-self: flex-start;
}

.mega-spotlight-badge.corporate {
  color: #e0f2fe;
  background: rgba(56, 189, 248, 0.3);
}

.mega-spotlight-card h4 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.mega-spotlight-card p {
  font-size: 0.82rem;
  color: #cbd5e1;
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

.mega-spotlight-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.7rem 1.15rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #fff !important;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
  transition: all 0.18s;
}

.mega-spotlight-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  box-shadow: 0 6px 22px rgba(124, 58, 237, 0.55);
  transform: translateY(-1px);
}

.mega-spotlight-btn.corporate {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
}

.mega-spotlight-btn.corporate:hover {
  background: linear-gradient(135deg, #0369a1, #075985);
}

/* Mobile Toggle & Drawer */
.mobile-menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
}

.mobile-nav-drawer {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(14, 9, 28, 0.98);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(168, 85, 247, 0.25);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  padding: 1.5rem 1rem;
  max-height: calc(100vh - 68px);
  overflow-y: auto;
  z-index: 999;
}

.mobile-nav-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mobile-planner-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #fff !important;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
}

.mobile-section-title {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c084fc;
  margin-bottom: 0.5rem;
}

.mobile-nav-item {
  display: block;
  padding: 0.45rem 0.5rem;
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s;
}

.mobile-nav-item:hover {
  color: #fff;
  background: rgba(168, 85, 247, 0.15);
}

.mobile-nav-item.red-highlight {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #f87171 !important;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .eventflow-nav {
    display: none;
  }
  .mobile-menu-toggle {
    display: flex;
  }
  .mobile-nav-drawer {
    display: block;
  }
}
`;

css += cleanMegaMenuStyles;
fs.writeFileSync('C:/MooNsEWeb/app/globals.css', css, 'utf8');
console.log('Successfully written clean Mega Menu CSS to C:/MooNsEWeb/app/globals.css');
