import fs from 'node:fs';

const headerNavContent = `"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Sparkles,
  MapPin,
  ShoppingCart,
  User,
  Crown,
  Building2,
  Music,
  UtensilsCrossed,
  Bus,
  Camera,
  HeartHandshake,
  Tag,
  Zap,
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Calendar,
  Gift,
  Search,
} from "lucide-react";

export function HeaderNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("India");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const cities = [
    "India (All Regions)",
    "Hyderabad",
    "Bengaluru",
    "Mumbai",
    "Delhi NCR",
    "Goa",
    "Chennai",
    "Jaipur",
    "Udaipur",
    "Kolkata",
  ];

  return (
    <header className="eventflow-header">
      <div className="eventflow-header-container">
        {/* Logo */}
        <Link href="/" className="eventflow-logo" aria-label="MooNs home">
          <img src="/moon-logo.png" alt="MooNs" />
        </Link>

        {/* Desktop Mega Navigation */}
        <nav className="eventflow-nav" aria-label="Main Navigation">
          {/* --- 1. WEDDINGS & SOCIALS --- */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("weddings")}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/events/weddings" className={\`nav-link \${activeMenu === "weddings" ? "active" : ""}\`}>
              <span>Weddings & Social</span>
              <ChevronDown size={14} className={\`nav-chevron \${activeMenu === "weddings" ? "rotate" : ""}\`} />
            </Link>

            {activeMenu === "weddings" && (
              <div className="mega-menu-panel" onMouseEnter={() => handleMouseEnter("weddings")} onMouseLeave={handleMouseLeave}>
                <div className="mega-menu-grid three-col">
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Crown size={15} className="mega-menu-icon-accent" />
                      <span>Wedding Ceremonies</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/weddings" className="mega-link-item">
                          <strong>Grand Weddings</strong>
                          <small>End-to-end bespoke wedding production & mandap</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/engagements" className="mega-link-item">
                          <strong>Engagements & Ring Ceremonies</strong>
                          <small>Intimate to grand stage styling & hospitality</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/receptions" className="mega-link-item">
                          <strong>Receptions & Sangeet Nights</strong>
                          <small>DJ, moving lights, sound & dance choreography</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/location-weddings" className="mega-link-item">
                          <strong>Destination Weddings</strong>
                          <small>Goa, Jaipur, Udaipur & palace resort planning</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Gift size={15} className="mega-menu-icon-accent" />
                      <span>Social Celebrations</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/birthdays" className="mega-link-item">
                          <strong>Milestone Birthdays</strong>
                          <small>Themed decor, entertainment & catering</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/baby-shower" className="mega-link-item">
                          <strong>Baby Showers & Naming</strong>
                          <small>Pastel floral styling, photobooths & sweets</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/anniversary" className="mega-link-item">
                          <strong>Anniversaries & Private Galas</strong>
                          <small>Elegant dinner setups, live band & memories</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/family-functions" className="mega-link-item">
                          <strong>Family Get-Togethers</strong>
                          <small>House warming, festive rituals & dining</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col highlight-col">
                    <div className="mega-spotlight-card">
                      <div className="mega-spotlight-badge">
                        <Sparkles size={13} /> Interactive Planner
                      </div>
                      <h4>Build Your Wedding in 60s</h4>
                      <p>Pick Decor, Dining Tables & Chairs, AC Buses, Gourmet Food, 4K Drone, and Welcome Hostesses with live pricing.</p>
                      <Link href="/plan-your-event" className="mega-spotlight-btn">
                        Open Wedding Builder <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- 2. CORPORATE & SUMMITS --- */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("corporate")}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/events/corporate-events" className={\`nav-link \${activeMenu === "corporate" ? "active" : ""}\`}>
              <span>Corporate & Summits</span>
              <ChevronDown size={14} className={\`nav-chevron \${activeMenu === "corporate" ? "rotate" : ""}\`} />
            </Link>

            {activeMenu === "corporate" && (
              <div className="mega-menu-panel" onMouseEnter={() => handleMouseEnter("corporate")} onMouseLeave={handleMouseLeave}>
                <div className="mega-menu-grid three-col">
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Building2 size={15} className="mega-menu-icon-accent" />
                      <span>Business Events</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/conferences" className="mega-link-item">
                          <strong>Conferences & Summits</strong>
                          <small>Keynote stages, speaker AV, and attendee flow</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/product-launches" className="mega-link-item">
                          <strong>Product Launches & Reveals</strong>
                          <small>Dramatic LED reveals, media tech & branding</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/corporate-events" className="mega-link-item">
                          <strong>Annual Days & Awards Nights</strong>
                          <small>Gala dinners, emcee, lighting & recognition</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/exhibition" className="mega-link-item">
                          <strong>Exhibitions & Trade Expos</strong>
                          <small>Modular stalls, registration desks & kiosks</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Layers size={15} className="mega-menu-icon-accent" />
                      <span>Institution & Campus</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/college-events" className="mega-link-item">
                          <strong>College Fests & Freshers</strong>
                          <small>Concert sound, pro lighting, stage & artist bookings</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/farewell" className="mega-link-item">
                          <strong>Farewell & Graduation Galas</strong>
                          <small>Commemorative photo ops, dining & DJ</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/school-events" className="mega-link-item">
                          <strong>Annual Sports & School Fests</strong>
                          <small>Arena seating, audio PA & student coordination</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col highlight-col">
                    <div className="mega-spotlight-card corporate">
                      <div className="mega-spotlight-badge">
                        <ShieldCheck size={13} /> Enterprise SLA
                      </div>
                      <h4>Corporate RFQ & Tender Desk</h4>
                      <p>GST invoices, PO tracking, audited vendors, dedicated production captain, and guaranteed execution.</p>
                      <Link href="/contact" className="mega-spotlight-btn">
                        Submit Corporate RFQ <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- 3. CONCERTS & ENTERTAINMENT --- */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("concerts")}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/events/music-concerts" className={\`nav-link \${activeMenu === "concerts" ? "active" : ""}\`}>
              <span>Concerts & Live</span>
              <ChevronDown size={14} className={\`nav-chevron \${activeMenu === "concerts" ? "rotate" : ""}\`} />
            </Link>

            {activeMenu === "concerts" && (
              <div className="mega-menu-panel" onMouseEnter={() => handleMouseEnter("concerts")} onMouseLeave={handleMouseLeave}>
                <div className="mega-menu-grid two-col">
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Music size={15} className="mega-menu-icon-accent" />
                      <span>Live Shows & Nightlife</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/music-concerts" className="mega-link-item">
                          <strong>Music Concerts & Festivals</strong>
                          <small>Line-array pro sound, dynamic trussing & artist command</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/dj-nights" className="mega-link-item">
                          <strong>DJ Nights & Club Events</strong>
                          <small>High-energy intelligent moving heads, lasers & SFX</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/fashion-shows" className="mega-link-item">
                          <strong>Fashion Shows & Ramp Shows</strong>
                          <small>Runway lighting, VIP gallery & backstage management</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/sports-events" className="mega-link-item">
                          <strong>Sports & Tournament Nights</strong>
                          <small>Stadium sound, commentary booth & guest flow</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Sparkles size={15} className="mega-menu-icon-accent" />
                      <span>Cultural & Festival Scale</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/events/festivals" className="mega-link-item">
                          <strong>Festivals & Grand Celebrations</strong>
                          <small>Diwali, Dandiya, Holi & New Year production</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/temple-functions" className="mega-link-item">
                          <strong>Temple & Religious Functions</strong>
                          <small>Traditional mandap, floral decor, pandits & prasad</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events/charity-events" className="mega-link-item">
                          <strong>Charity Galas & Fundraisers</strong>
                          <small>Formal dining, auction stages & donor hospitality</small>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- 4. SERVICES & MODULAR RENTALS --- */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/packages" className={\`nav-link \${activeMenu === "services" ? "active" : ""}\`}>
              <span>Services & Rentals</span>
              <ChevronDown size={14} className={\`nav-chevron \${activeMenu === "services" ? "rotate" : ""}\`} />
            </Link>

            {activeMenu === "services" && (
              <div className="mega-menu-panel" onMouseEnter={() => handleMouseEnter("services")} onMouseLeave={handleMouseLeave}>
                <div className="mega-menu-grid four-col">
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Crown size={15} className="mega-menu-icon-accent" />
                      <span>Venue & Seating</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/packages?category=venues" className="mega-link-item">
                          <strong>Banquet & Convention Halls</strong>
                          <small>5-star indoor, lawn & resort venues</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=seating" className="mega-link-item">
                          <strong>Dining Tables & Chairs</strong>
                          <small>Gold Chiavari, round banquet tables & sofas</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=decor" className="mega-link-item">
                          <strong>Mandap & Floral Décor</strong>
                          <small>Theme arches, stage backdrops & lighting</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <UtensilsCrossed size={15} className="mega-menu-icon-accent" />
                      <span>Food & Hospitality</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/packages?category=catering" className="mega-link-item">
                          <strong>Multi-Cuisine Catering</strong>
                          <small>Royal buffets, live chaat & sweet counters</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=hospitality" className="mega-link-item">
                          <strong>Welcome Hostesses & Greeters</strong>
                          <small>Tilak, garlands & guest registration desk</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=valet" className="mega-link-item">
                          <strong>Valet Parking & Luggage Crew</strong>
                          <small>Smooth guest arrivals & departure transit</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Camera size={15} className="mega-menu-icon-accent" />
                      <span>Media & 4K Drone</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/packages?category=photography" className="mega-link-item">
                          <strong>4K Aerial Drone Coverage</strong>
                          <small>Licensed pilots, grand processions & sweeping visuals</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=photography" className="mega-link-item">
                          <strong>Candid Photo & Cinematic Film</strong>
                          <small>4K teasers, highlight reels & traditional albums</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=streaming" className="mega-link-item">
                          <strong>Private Live Web Streaming</strong>
                          <small>Multi-cam broadcast for overseas relatives</small>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <Bus size={15} className="mega-menu-icon-accent" />
                      <span>Transport Fleet</span>
                    </div>
                    <ul className="mega-menu-links">
                      <li>
                        <Link href="/packages?category=transport" className="mega-link-item">
                          <strong>50-Seater AC Luxury Buses</strong>
                          <small>Volvo & BharatBenz coaches for relatives</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=transport" className="mega-link-item">
                          <strong>17-Seater Tempo Travelers</strong>
                          <small>Family airport transfers & venue shuttles</small>
                        </Link>
                      </li>
                      <li>
                        <Link href="/packages?category=transport" className="mega-link-item">
                          <strong>VIP Decorated Bridal Cars</strong>
                          <small>Mercedes, BMW, Audi with floral styling</small>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- 5. OFFERS & DEALS --- */}
          <div className="nav-item-dropdown">
            <Link href="/offers" className="nav-link special-offers-link">
              <Tag size={14} className="offers-tag-icon" />
              <span>Offers</span>
              <span className="nav-badge-pill">DEALS</span>
            </Link>
          </div>
        </nav>

        {/* Header Right Actions */}
        <div className="eventflow-header-actions">
          {/* Plan My Event Primary CTA */}
          <Link href="/plan-your-event" className="header-planner-link">
            <Sparkles size={16} />
            <span>Plan my event</span>
          </Link>

          {/* City / Location Picker */}
          <div className="location-picker-wrapper" onMouseLeave={() => setCityDropdownOpen(false)}>
            <button
              type="button"
              className="location-badge-btn"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              aria-label="Select city"
            >
              <MapPin size={15} />
              <span>{selectedCity.split(" ")[0]}</span>
              <ChevronDown size={12} />
            </button>

            {cityDropdownOpen && (
              <div className="city-dropdown-menu">
                <div className="city-dropdown-title">Select Event Region</div>
                {cities.map((city) => (
                  <button
                    type="button"
                    key={city}
                    className={\`city-item-btn \${selectedCity === city ? "selected" : ""}\`}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                  >
                    <MapPin size={13} />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart / My Event */}
          <Link href="/my-event" className="header-icon-btn cart-btn" aria-label="My event brief & cart">
            <ShoppingCart size={18} />
          </Link>

          {/* Account / Portal */}
          <Link href="/portal/customer" className="header-icon-btn profile-btn" aria-label="Customer Event Portal">
            <User size={18} />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-content">
            <div className="mobile-nav-section">
              <Link href="/plan-your-event" className="mobile-planner-cta" onClick={() => setMobileOpen(false)}>
                <Sparkles size={18} />
                <span>Launch Interactive Event Builder</span>
              </Link>
            </div>

            <div className="mobile-nav-section">
              <div className="mobile-section-title">Weddings & Socials</div>
              <Link href="/events/weddings" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Grand Weddings</Link>
              <Link href="/events/engagements" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Engagements & Receptions</Link>
              <Link href="/events/birthdays" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Milestone Birthdays</Link>
              <Link href="/events/location-weddings" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Destination Weddings</Link>
            </div>

            <div className="mobile-nav-section">
              <div className="mobile-section-title">Corporate & Summits</div>
              <Link href="/events/conferences" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Conferences & Summits</Link>
              <Link href="/events/product-launches" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Product Launches</Link>
              <Link href="/events/corporate-events" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Corporate Annual Days</Link>
              <Link href="/events/exhibition" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Trade Expos & Stalls</Link>
            </div>

            <div className="mobile-nav-section">
              <div className="mobile-section-title">Concerts & Entertainment</div>
              <Link href="/events/music-concerts" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Music Concerts</Link>
              <Link href="/events/dj-nights" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>DJ & Club Nights</Link>
              <Link href="/events/fashion-shows" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Fashion Shows</Link>
              <Link href="/events/festivals" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Festivals & Celebrations</Link>
            </div>

            <div className="mobile-nav-section">
              <div className="mobile-section-title">Modular Rentals & Services</div>
              <Link href="/packages?category=venues" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Banquet & Convention Halls</Link>
              <Link href="/packages?category=seating" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Dining Tables & Chiavari Chairs</Link>
              <Link href="/packages?category=transport" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>50-Seater AC Luxury Buses</Link>
              <Link href="/packages?category=catering" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Multi-Cuisine Catering</Link>
              <Link href="/packages?category=photography" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>4K Drone & Cinematic Film</Link>
            </div>

            <div className="mobile-nav-section">
              <Link href="/offers" className="mobile-nav-item highlight" onClick={() => setMobileOpen(false)}>
                <Tag size={16} /> Exclusive Offers & Discounts
              </Link>
              <Link href="/my-event" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={16} /> My Event Brief / Cart
              </Link>
              <Link href="/portal/customer" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <User size={16} /> Client Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
`;

fs.writeFileSync('C:/MooNsEWeb/components/header-nav.tsx', headerNavContent, 'utf8');
console.log('Successfully created C:/MooNsEWeb/components/header-nav.tsx');
