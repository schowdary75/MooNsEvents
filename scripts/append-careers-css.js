import fs from 'node:fs';

const careersCss = `
/* ==========================================================================
   CAREERS & EVENT REASONING ASSESSMENT STYLING
   ========================================================================== */

.careers-page-shell {
  min-height: calc(100vh - 70px);
  background:
    radial-gradient(circle at 15% 15%, rgba(216, 180, 254, 0.3), transparent 45%),
    radial-gradient(circle at 85% 85%, rgba(254, 205, 211, 0.35), transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.18), transparent 60%),
    linear-gradient(180deg, #fdfbf9 0%, #faf5ff 50%, #fdf2f8 100%);
  color: #0f172a;
}

.careers-hero-section {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem 2.5rem 1.5rem;
}

.careers-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.18s;
}

.careers-back-link:hover {
  color: #7c3aed;
}

.careers-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7c3aed;
  margin-bottom: 0.75rem;
}

.careers-hero-heading {
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 1rem 0;
}

.careers-hero-heading em {
  color: transparent;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  -webkit-background-clip: text;
  background-clip: text;
  font-style: normal;
}

.careers-hero-lead {
  max-width: 760px;
  font-size: 1.1rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.careers-perks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
}

.careers-perk-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border: 1.5px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  padding: 1.4rem;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.careers-perk-card strong {
  font-size: 1.05rem;
  color: #0f172a;
  margin-top: 0.35rem;
}

.careers-perk-card small {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.45;
}

/* Board Section */
.careers-board-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem 1.5rem;
}

.careers-board-head {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .careers-board-head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.careers-board-head h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.35rem 0;
}

.careers-board-head p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.careers-dept-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.careers-dept-pill {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: all 0.16s ease;
}

.careers-dept-pill:hover {
  border-color: #c084fc;
  color: #7c3aed;
}

.careers-dept-pill.active {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}

.careers-jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.5rem;
}

.careers-job-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.6rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.careers-job-card:hover {
  border-color: #a855f7;
  transform: translateY(-3px);
  box-shadow: 0 16px 45px rgba(124, 58, 237, 0.1);
}

.careers-job-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.careers-job-dept-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.08);
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  margin-bottom: 0.35rem;
}

.careers-job-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.careers-job-salary {
  font-size: 0.9rem;
  font-weight: 800;
  color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
}

.careers-job-desc {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.careers-job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.careers-job-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.careers-job-points {
  margin-bottom: 1.5rem;
}

.careers-job-points strong {
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.careers-job-points ul {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.55;
}

.careers-apply-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff !important;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25);
  transition: all 0.2s ease;
}

.careers-apply-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(124, 58, 237, 0.4);
}

/* Modal Overlay & Box */
.careers-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.careers-modal-box {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2.2rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  position: relative;
}

.careers-modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.careers-modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.careers-modal-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.careers-step-badge {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.08);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}

.careers-test-benchmark {
  font-size: 0.78rem;
  font-weight: 800;
  color: #d97706;
  background: rgba(245, 158, 11, 0.12);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.careers-modal-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.35rem 0;
}

.careers-modal-header p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.careers-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.careers-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.careers-form-field.full {
  grid-column: 1 / -1;
}

.careers-form-field span {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.careers-form-field input,
.careers-form-field select,
.careers-form-field textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.92rem;
  outline: none;
}

.careers-form-field input:focus,
.careers-form-field select:focus,
.careers-form-field textarea:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

.careers-modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.careers-back-subtle-btn {
  padding: 0.75rem 1.2rem;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.careers-submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.4rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
}

.careers-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quiz List */
.careers-quiz-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.careers-quiz-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
}

.careers-quiz-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.careers-quiz-num {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  background: #7c3aed;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.careers-quiz-cat {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.careers-quiz-scenario {
  font-size: 0.92rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.careers-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.careers-option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.16s ease;
}

.careers-option-item:hover {
  border-color: #a855f7;
  background: #faf5ff;
}

.careers-option-item.selected {
  border-color: #7c3aed;
  background: #faf5ff;
  color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.careers-option-radio {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.careers-option-item.selected .careers-option-radio {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #ffffff;
}

/* Results Box */
.careers-result-box {
  padding: 2rem 1rem;
  text-align: center;
}

.careers-result-icon {
  display: inline-flex;
  padding: 1.25rem;
  border-radius: 50%;
  margin-bottom: 1.25rem;
}

.careers-result-icon.pass {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
}

.careers-result-icon.fail {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
}

.careers-result-pill {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
}

.careers-result-pill.pass {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.careers-result-pill.fail {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.careers-result-content h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.careers-result-desc {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
  max-width: 580px;
  margin: 0 auto 1.5rem auto;
}

.careers-result-subtext {
  font-size: 0.82rem;
  color: #64748b;
  max-width: 500px;
  margin: 0 auto 1.5rem auto;
}

.careers-next-steps-card {
  background: rgba(243, 232, 255, 0.6);
  border: 1.5px solid rgba(192, 132, 252, 0.4);
  border-radius: 16px;
  padding: 1.25rem;
  max-width: 480px;
  margin: 0 auto 2rem auto;
  text-align: left;
}

.careers-next-steps-card strong {
  display: block;
  font-size: 0.9rem;
  color: #7c3aed;
  margin-bottom: 0.4rem;
}

.careers-next-steps-card ul {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.6;
}

.careers-finish-btn {
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.92rem;
  border: none;
  cursor: pointer;
}

.careers-finish-btn.fail {
  background: #475569;
}
`;

fs.writeFileSync('C:/MooNsEWeb/app/globals.css', fs.readFileSync('C:/MooNsEWeb/app/globals.css', 'utf8') + careersCss, 'utf8');
console.log('Successfully appended careers styling to C:/MooNsEWeb/app/globals.css');
