INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Ahmedabad', 'India', 'Event market', 0, 'ahmedabad-events', 'Events', 'Event services in Ahmedabad', 'Venues, production, catering, decor, entertainment, and event logistics in Ahmedabad.', 'Ahmedabad events, Ahmedabad venues, event production Ahmedabad'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Ahmedabad' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Bengaluru', 'India', 'Event market', 0, 'bengaluru-events', 'Events', 'Event services in Bengaluru', 'Venues, production, catering, decor, entertainment, and event logistics in Bengaluru.', 'Bengaluru events, Bengaluru venues, event production Bengaluru'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Bengaluru' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Chennai', 'India', 'Event market', 0, 'chennai-events', 'Events', 'Event services in Chennai', 'Venues, production, catering, decor, entertainment, and event logistics in Chennai.', 'Chennai events, Chennai venues, event production Chennai'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Chennai' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Delhi NCR', 'India', 'Event market', 0, 'delhi-ncr-events', 'Events', 'Event services in Delhi NCR', 'Venues, production, catering, decor, entertainment, and event logistics across Delhi NCR.', 'Delhi events, NCR venues, event production Delhi'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Delhi NCR' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Goa', 'India', 'Event market', 0, 'goa-events', 'Events', 'Event services in Goa', 'Venues, production, catering, decor, entertainment, and event logistics in Goa.', 'Goa events, Goa wedding venues, event production Goa'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Goa' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Hyderabad', 'India', 'Event market', 0, 'hyderabad-events', 'Events', 'Event services in Hyderabad', 'Venues, production, catering, decor, entertainment, and event logistics in Hyderabad.', 'Hyderabad events, Hyderabad venues, event production Hyderabad'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Hyderabad' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Jaipur', 'India', 'Event market', 0, 'jaipur-events', 'Events', 'Event services in Jaipur', 'Venues, production, catering, decor, entertainment, and event logistics in Jaipur.', 'Jaipur events, Jaipur wedding venues, event production Jaipur'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Jaipur' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Kochi', 'India', 'Event market', 0, 'kochi-events', 'Events', 'Event services in Kochi', 'Venues, production, catering, decor, entertainment, and event logistics in Kochi.', 'Kochi events, Kochi venues, event production Kochi'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Kochi' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Kolkata', 'India', 'Event market', 0, 'kolkata-events', 'Events', 'Event services in Kolkata', 'Venues, production, catering, decor, entertainment, and event logistics in Kolkata.', 'Kolkata events, Kolkata venues, event production Kolkata'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Kolkata' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Mumbai', 'India', 'Event market', 0, 'mumbai-events', 'Events', 'Event services in Mumbai', 'Venues, production, catering, decor, entertainment, and event logistics in Mumbai.', 'Mumbai events, Mumbai venues, event production Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Mumbai' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Pune', 'India', 'Event market', 0, 'pune-events', 'Events', 'Event services in Pune', 'Venues, production, catering, decor, entertainment, and event logistics in Pune.', 'Pune events, Pune venues, event production Pune'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Pune' AND country = 'India');

INSERT INTO destinations (name, country, price, nights, image_key, tag, meta_title, meta_description, meta_keywords)
SELECT 'Udaipur', 'India', 'Event market', 0, 'udaipur-events', 'Events', 'Event services in Udaipur', 'Venues, production, catering, decor, entertainment, and event logistics in Udaipur.', 'Udaipur events, Udaipur wedding venues, event production Udaipur'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Udaipur' AND country = 'India');
