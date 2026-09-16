import fs from 'node:fs';

let content = fs.readFileSync('C:/MooNsEWeb/lib/api.ts', 'utf8');

// Replace addOns in packageTemplate
content = content.replace(
  `  addOns: [
    { id: \`\${input.id}-photo\`, name: "Cinematic photography", priceMinor: "8500000", cutoffDays: 14 },
    { id: \`\${input.id}-live\`, name: "Live music ensemble", priceMinor: "12000000", cutoffDays: 21 },
  ],`,
  `  addOns: [
    { id: \`\${input.id}-drone\`, name: "4K Aerial Drone Coverage & Cinematic Highlights", priceMinor: "3500000", cutoffDays: 3 },
    { id: \`\${input.id}-bus-50\`, name: "50-Seater AC Luxury Coach Bus (Guest Logistics)", priceMinor: "1800000", cutoffDays: 2 },
    { id: \`\${input.id}-tempo\`, name: "17-Seater Deluxe Tempo Traveler (Family Shuttle)", priceMinor: "850000", cutoffDays: 2 },
    { id: \`\${input.id}-dining-chairs\`, name: "Gold Chiavari Chairs & Banquet Dining Table Setup", priceMinor: "2800000", cutoffDays: 3 },
    { id: \`\${input.id}-welcome-crew\`, name: "Uniformed Welcome Hostesses & Valet Parking Crew", priceMinor: "2400000", cutoffDays: 3 },
    { id: \`\${input.id}-photo\`, name: "Cinematic Photography & Film Crew", priceMinor: "8500000", cutoffDays: 7 },
  ],`
);

// Replace addOns: [] in legacyPackageToPublic
content = content.replace(
  `    addOns: [],`,
  `    addOns: [
      { id: \`\${pkg.id}-addon-drone\`, name: "4K Aerial Drone Coverage", priceMinor: "3500000" },
      { id: \`\${pkg.id}-addon-bus\`, name: "50-Seater AC Luxury Coach Bus", priceMinor: "1800000" },
      { id: \`\${pkg.id}-addon-tempo\`, name: "17-Seater Deluxe Tempo Traveler", priceMinor: "850000" },
      { id: \`\${pkg.id}-addon-seating\`, name: "Gold Chiavari Chairs & Round Dining Tables", priceMinor: "2800000" },
      { id: \`\${pkg.id}-addon-hospitality\`, name: "Welcome Hostesses & Valet Crew", priceMinor: "2400000" },
    ],`
);

fs.writeFileSync('C:/MooNsEWeb/lib/api.ts', content, 'utf8');
console.log('Successfully updated C:/MooNsEWeb/lib/api.ts with modular add-ons');
