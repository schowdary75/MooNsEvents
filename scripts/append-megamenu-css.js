import fs from 'node:fs';

const megaMenuCss = `

/* ==========================================================================
   MEGA MENU & TOP NAVIGATION STYLES
   ========================================================================== */

.nav-item-dropdown {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.nav-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.active {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.06);
}

.nav-chevron {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-chevron.rotate {
  transform: rotate(180deg);
}

.special-offers-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #e11d48 !important;
}

.special-offers-link:hover {
  background: rgba(225, 29, 72, 0.08) !important;
}

.offers-tag-icon {
  animation: pulse-badge 2s infinite ease-in-out;
}

.nav-badge-pill {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #e11d48, #be123c);
  color: #fff;
  line-height: 1;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Mega Menu Dropdown Panel */
.mega-menu-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 10, 30, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(124, 58, 237, 0.18);
  padding: 1.5rem;
  z-index: 1000;
  animation: mega-menu-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes mega-menu-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.mega-menu-grid {
  display: grid;
  gap: 1.5rem;
}

.mega-menu-grid.three-col {
  grid-template-columns: 240px 240px 280px;
}

.mega-menu-grid.two-col {
  grid-template-columns: 280px 280px;
}

.mega-menu-grid.four-col {
  grid-template-columns: 210px 210px 220px 220px;
  gap: 1.25rem;
}

.mega-menu-col {
  display: flex;
  flex-direction: column;
}

.mega-menu-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c084fc;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mega-menu-icon-accent {
  color: #a855f7;
}

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
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.16s ease;
  border: 1px solid transparent;
}

.mega-link-item:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.25);
  transform: translateX(3px);
}

.mega-link-item strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #f8fafc;
  line-height: 1.3;
}

.mega-link-item small {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.2rem;
  line-height: 1.3;
}

/* Mega Spotlight Promo Card */
.mega-spotlight-card {
  height: 100%;
  padding: 1.25rem;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(88, 28, 135, 0.45), rgba(30, 16, 60, 0.6));
  border: 1px solid rgba(168, 85, 247, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mega-spotlight-card.corporate {
  background: linear-gradient(145deg, rgba(14, 116, 144, 0.35), rgba(15, 23, 42, 0.65));
  border-color: rgba(56, 189, 248, 0.35);
}

.mega-spotlight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #e9d5ff;
  background: rgba(168, 85, 247, 0.25);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  align-self: flex-start;
}

.mega-spotlight-card.corporate .mega-spotlight-badge {
  color: #bae6fd;
  background: rgba(56, 189, 248, 0.25);
}

.mega-spotlight-card h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.mega-spotlight-card p {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.mega-spotlight-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.16s;
}

.mega-spotlight-btn:hover {
  background: #6d28d9;
}

/* Location Picker Dropdown */
.location-picker-wrapper {
  position: relative;
}

.location-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.16s;
}

.location-badge-btn:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

.city-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  padding: 0.5rem;
  z-index: 1000;
  animation: mega-menu-in 0.18s ease-out both;
}

.city-dropdown-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  padding: 0.35rem 0.5rem;
  margin-bottom: 0.25rem;
}

.city-item-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 0.84rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.city-item-btn:hover {
  background: #f1f5f9;
  color: #7c3aed;
}

.city-item-btn.selected {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  font-weight: 700;
}

/* Mobile Toggle & Drawer */
.mobile-menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.mobile-nav-drawer {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(15, 10, 30, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(168, 85, 247, 0.25);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  padding: 1.5rem 1rem;
  max-height: calc(100vh - 64px);
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
  color: #fff;
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

.mobile-nav-item.highlight {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #fb7185;
}

@media (max-width: 1024px) {
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

let currentCss = fs.readFileSync('C:/MooNsEWeb/app/globals.css', 'utf8');
currentCss += megaMenuCss;
fs.writeFileSync('C:/MooNsEWeb/app/globals.css', currentCss, 'utf8');
console.log('Successfully appended Mega Menu styles to C:/MooNsEWeb/app/globals.css');
