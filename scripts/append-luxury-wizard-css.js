import fs from 'node:fs';

const wizardLuxuryCss = `

/* ==========================================================================
   EVENT PLANNER WIZARD LUXURY DARK GLASS DESIGN SYSTEM
   ========================================================================== */

.planner-heading {
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.planner-heading em {
  color: transparent;
  background: linear-gradient(135deg, #c084fc, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  font-style: normal;
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
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
}

.planner-section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.planner-fleet-capacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(14, 116, 144, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.planner-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.planner-luxury-card {
  background: rgba(22, 14, 42, 0.82) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(168, 85, 247, 0.22) !important;
  border-radius: 18px;
  padding: 1.4rem;
  color: #ffffff !important;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.planner-luxury-card:hover {
  background: rgba(35, 20, 65, 0.9) !important;
  border-color: rgba(168, 85, 247, 0.6) !important;
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.3) !important;
  transform: translateY(-3px);
}

.planner-luxury-card.selected {
  border-color: #c084fc !important;
  background: linear-gradient(145deg, rgba(88, 28, 135, 0.55), rgba(30, 16, 60, 0.9)) !important;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2) !important;
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
  color: #e9d5ff;
  background: rgba(168, 85, 247, 0.25);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.planner-card-active-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #4ade80;
  background: rgba(34, 197, 94, 0.2);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.planner-card-price {
  font-size: 1rem;
  font-weight: 800;
  color: #c084fc;
  letter-spacing: -0.01em;
}

.planner-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff !important;
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}

.planner-card-desc {
  font-size: 0.84rem;
  color: #cbd5e1 !important;
  line-height: 1.45;
  margin: 0 0 0.85rem 0;
}

.planner-auto-calc-badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(14, 116, 144, 0.25);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
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
  color: #a855f7;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.25);
  transition: all 0.16s;
}

.planner-card-status.active {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.4);
  font-weight: 700;
}

/* Stepper Controls */
.planner-stepper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.planner-stepper-label {
  font-size: 0.85rem;
  color: #cbd5e1;
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
  border: 1px solid rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.2);
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s;
}

.planner-stepper-btn:hover:not(:disabled) {
  background: #7c3aed;
  border-color: #a855f7;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
}

.planner-stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.planner-stepper-val {
  font-size: 1.2rem;
  font-weight: 800;
  min-width: 1.5rem;
  text-align: center;
  color: #ffffff;
}

/* Urgent Banner */
.planner-urgent-banner {
  margin-top: 1.5rem;
  padding: 1.15rem 1.4rem;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.14);
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
}

.planner-urgent-banner strong {
  color: #f87171;
  display: block;
  font-size: 1rem;
}

.planner-urgent-banner small {
  color: #fca5a5;
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
  border-radius: 14px;
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.planner-trust-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}

.planner-trust-card small {
  opacity: 0.85;
  font-size: 0.82rem;
  line-height: 1.45;
}

.planner-trust-card.purple {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #e9d5ff;
}

.planner-trust-card.purple .planner-trust-card-head { color: #c084fc; }

.planner-trust-card.cyan {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #e0f2fe;
}

.planner-trust-card.cyan .planner-trust-card-head { color: #38bdf8; }

.planner-trust-card.green {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #dcfce7;
}

.planner-trust-card.green .planner-trust-card-head { color: #4ade80; }

.planner-invoice-card {
  background: rgba(18, 12, 38, 0.95);
  border: 1.5px solid rgba(168, 85, 247, 0.35);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
}

.planner-invoice-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.planner-invoice-head h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.planner-invoice-head small {
  color: #94a3b8;
  font-size: 0.85rem;
}

.planner-invoice-total {
  font-size: 1.7rem;
  font-weight: 800;
  color: #c084fc;
  letter-spacing: -0.02em;
}

.planner-invoice-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.planner-invoice-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.planner-invoice-item small {
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.planner-invoice-item strong {
  color: #ffffff;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.planner-item-cost {
  color: #c084fc;
  font-weight: 700;
  font-size: 0.9rem;
  margin-top: auto;
}

.planner-luxury-input {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 12px !important;
  color: #ffffff !important;
  font-size: 0.95rem !important;
  padding: 0.85rem 1rem !important;
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
}

.planner-luxury-input:focus {
  border-color: #a855f7 !important;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.25) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.planner-error-banner {
  padding: 0.85rem 1.15rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.4);
  margin-bottom: 1.25rem;
  color: #fca5a5;
  font-weight: 600;
}

.planner-submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.15rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #ffffff !important;
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.45);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.planner-submit-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(124, 58, 237, 0.6);
}

.planner-confirmed-screen {
  text-align: center;
  padding: 3rem 1.5rem;
}

.planner-confirmed-icon {
  display: inline-flex;
  padding: 1.5rem;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.planner-confirmed-screen h2 {
  font-size: 2.2rem;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.planner-confirmed-lead {
  max-width: 620px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
  color: #cbd5e1;
  font-size: 1.05rem;
}

.planner-confirmed-box {
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  max-width: 520px;
  margin: 0 auto 2.5rem auto;
  text-align: left;
}

.planner-confirmed-box-title {
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #c084fc;
  font-size: 1.05rem;
}

.planner-confirmed-box ul {
  padding-left: 1.25rem;
  font-size: 0.92rem;
  line-height: 1.7;
  color: #e2e8f0;
}
`;

let currentCss = fs.readFileSync('C:/MooNsEWeb/app/globals.css', 'utf8');
currentCss += wizardLuxuryCss;
fs.writeFileSync('C:/MooNsEWeb/app/globals.css', currentCss, 'utf8');
console.log('Successfully appended Luxury Wizard styles to C:/MooNsEWeb/app/globals.css');
