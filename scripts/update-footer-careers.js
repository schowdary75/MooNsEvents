import fs from 'node:fs';

const footerFile = 'C:/MooNsEWeb/components/professional-footer.tsx';
let code = fs.readFileSync(footerFile, 'utf8');

code = code.replace(
  '["Event planner wizard","/plan-your-event"],["Verified vendors","/contact"]',
  '["Event planner wizard","/plan-your-event"],["Careers & Hiring","/careers"],["Verified vendors","/contact"]'
);

fs.writeFileSync(footerFile, code, 'utf8');
console.log('Successfully updated professional-footer.tsx with Careers link');
