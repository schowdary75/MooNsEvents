import Image from "next/image";

const repoUrl = "https://github.com/schowdary75/moonsevents";

const workflow = [
  {
    number: "01",
    title: "Capture the enquiry",
    copy: "Bring a lead in from calls, chat, WhatsApp, callback requests, or a form and keep ownership, follow-ups, and history together.",
  },
  {
    number: "02",
    title: "Curate the event",
    copy: "Turn a brief or inspiration image into an editable runOfShow, then add activities, stays, transport, media, and route stops.",
  },
  {
    number: "03",
    title: "Request real rates",
    copy: "Choose scope, dates, venues, and vendors. Review Maya's RFQ draft before anything leaves the workspace.",
  },
  {
    number: "04",
    title: "Build the proposal",
    copy: "Use catalogue and rate-card data to create a versioned quote and branded PDF without inventing missing supplier prices.",
  },
  {
    number: "05",
    title: "Book and operate",
    copy: "Keep services, participants, payments, invoices, incidents, messages, and event status connected to one client record.",
  },
];

const screens = [
  {
    src: "/screens/dashboard-live.png",
    alt: "MooNsEvents dashboard with lead, revenue, pipeline and conversion summaries",
    eyebrow: "Live operating dashboard",
    title: "See revenue, leads, pipeline, conversion, and live activity together",
    copy: "The home dashboard surfaces current work, revenue and lead pulses, open pipeline, conversion, Maya activity, and questions operators can ask about their live numbers.",
    layout: "wide",
  },
  {
    src: "/screens/mission-control.png",
    alt: "MooNsEvents Mission Control showing revenue, lead funnel, queues and Maya Autopilot activity",
    eyebrow: "Mission Control",
    title: "Run the agency from one operational command surface",
    copy: "Track gross revenue, escrow, pipeline, active leads, bookings, clients, follow-up queues, payment checks, refunds, and Maya Autopilot actions without losing the underlying records.",
    layout: "wide",
  },
  {
    src: "/screens/analytics.png",
    alt: "MooNsEvents analytics with booking health, revenue trends, package performance and demand signals",
    eyebrow: "Events analytics",
    title: "Understand bookings, revenue, cancellations, products, and demand",
    copy: "Confirmed revenue, gross booking value, average booking value, cancellation rate, booking health, package rankings, and location demand signals are calculated from the operating data.",
  },
  {
    src: "/screens/lead-workspace.png",
    alt: "MooNsEvents lead workspace filtered to a fictional Jane Smith demo lead",
    eyebrow: "Lead workspace",
    title: "Calls, email, WhatsApp, triage, notes, and follow-ups in context",
    copy: "The screenshot uses a clearly fictional 555 demo record. The in-app WhatsApp inbox supports human replies, templates, unread state, and delivery status when Meta is configured.",
  },
  {
    src: "/screens/command-center.png",
    alt: "MooNsEvents Command Center with sales, product, support, marketing, finance and admin answer modes",
    eyebrow: "Command Center",
    title: "Turn live events data into grounded answers and next actions",
    copy: "Choose Sales, Product, Support, Marketing, Finance, or Admin mode; add a real lead or package as context; then prepare a reply and internal action list grounded in workspace data.",
  },
  {
    src: "/screens/runOfShow-builder.png",
    alt: "MooNsEvents visual runOfShow builder",
    eyebrow: "RunOfShow studio",
    title: "Edit every day instead of accepting an opaque AI answer",
    copy: "Generate a starting point, then control descriptions, time-of-day activities, locations, coordinates, route stops, and transport segments.",
  },
  {
    src: "/screens/packages.png",
    alt: "MooNsEvents package catalogue",
    eyebrow: "Package operations",
    title: "Package content, pricing, media, suppliers, and publishing in one place",
    copy: "Manage regional and seasonal packages, B2B cost, B2C selling price, margins, verification, SEO, runOfShows, RFQs, and publishing.",
  },
  {
    src: "/screens/asset-library.png",
    alt: "MooNsEvents Asset Library with cover-flow and grid views for package, stay, car and venueProduction media",
    eyebrow: "Asset Library",
    title: "Reuse approved events media across packages and services",
    copy: "Browse package, stay, car, and venueProduction images in cover-flow or grid view, inspect the published asset path, and copy the URL for reuse across the events storefront and operations.",
  },
  {
    src: "/screens/vendor-rfq.png",
    alt: "MooNsEvents request for quote composer",
    eyebrow: "Vendor outreach",
    title: "Ask the right suppliers for the right information",
    copy: "Select package, venue, transport, or venueProduction scope; require events dates; choose vendors; and review the composed email before dispatch.",
  },
  {
    src: "/screens/whatsapp-banners.png",
    alt: "MooNsEvents WhatsApp banner studio with lifecycle filters, AI copy generator and editable campaign cards",
    eyebrow: "WhatsApp campaign studio",
    title: "Create, edit, and send lifecycle-specific WhatsApp banners",
    copy: "Use the AI-assisted copy generator and a complete banner library for lead creation, calls, quotes, links, and retries. Every card keeps copy, delivery, editing, and design specifications close together.",
    layout: "wide banner",
  },
  {
    src: "/screens/maya-ops-center.png",
    alt: "MooNsEvents Maya Ops Center with channel controls, approval queue, lifecycle automation, supplier operations and finance queues",
    eyebrow: "Maya Ops Center",
    title: "Govern automation with controls, approvals, and operational evidence",
    copy: "Channel and tool kill switches, approval queues, lifecycle events, supplier exceptions, events finance, refund SLAs, disruptions, permits, and Maya activity remain visible to human operators.",
    layout: "wide",
  },
];

const fit = [
  "Events agencies replacing spreadsheets and disconnected point tools",
  "Showcase operators building custom runOfShows and supplier quotes",
  "DMCs coordinating packages, vendors, stays, cars, and activities",
  "Engineering teams exploring a multi-tenant events SaaS foundation",
  "Contributors interested in maps, workflow automation, accessibility, and AI guardrails",
];

const localSteps = [
  "Install Docker Desktop or Docker Engine with Compose.",
  "Clone the repository and enter the moonsevents directory.",
  "Run ./start.sh on macOS/Linux or Git Bash on Windows.",
  "Open the printed local URL; run ./stop.sh when finished.",
];

export default function Home() {
  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="#top" aria-label="MooNsEvents home">
          <span className="brandMoon">MooN</span>
          <span>Configs</span>
        </a>
        <nav aria-label="Site navigation">
          <a href="#workflow">Workflow</a>
          <a href="#showcase">Product showcase</a>
          <a href="#run">Run locally</a>
          <a className="navCta" href={repoUrl}>
            GitHub ↗
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">Open-source event operating system</p>
          <h1>
            From first enquiry
            <br />
            to <em>production complete.</em>
          </h1>
          <p className="heroLead">
            MooNsEvents connects CRM, runOfShow curation, supplier RFQs, proposals,
            bookings, customer support, and governed Maya automation in one TypeScript platform.
          </p>
          <div className="heroActions">
            <a className="primaryButton" href={`${repoUrl}#run-locally-with-docker`}>
              Run it locally
            </a>
            <a className="secondaryButton" href={`${repoUrl}/issues`}>
              Find an issue
            </a>
          </div>
          <p className="honestyLine">
            Core modules run locally. Provider-backed AI, email, telephony, payments, WhatsApp,
            SSO, and live inventory require your own credentials and stay disabled when absent.
          </p>
        </div>
        <figure className="heroFrame">
          <Image
            src="/screens/dashboard-live.png"
            alt="MooNsEvents events operations dashboard"
            width={2400}
            height={1138}
            priority
            sizes="(max-width: 1050px) 100vw, 62vw"
          />
          <figcaption>
            <span>Live application</span>
            <span>Captured locally · no mock-up</span>
          </figcaption>
        </figure>
      </section>

      <section className="workflowSection" id="workflow">
        <div className="sectionIntro">
          <p className="eyebrow">The core workflow</p>
          <h2>One client production, not five disconnected tools.</h2>
          <p>
            The shortest way to understand MooNsEvents is to follow the work from enquiry to
            operation. Each step feeds the next and keeps its evidence attached.
          </p>
        </div>
        <ol className="workflow">
          {workflow.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="tourSection" id="showcase">
        <div className="sectionIntro">
          <p className="eyebrow">Guided product showcase</p>
          <h2>Real screens from the running application.</h2>
          <p>
            These are direct Chrome captures from the local MooNsEvents interface. They show
            implemented workflows, not concept art or a fabricated customer deployment.
          </p>
        </div>
        <div className="screenGrid">
          {screens.map((screen, index) => (
            <article className={`screenCard ${screen.layout ?? ""}`} key={screen.src}>
              <div className="screenImage">
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={2400}
                  height={1138}
                  loading={index > 1 ? "lazy" : "eager"}
                  sizes={screen.layout?.includes("wide") ? "86vw" : "(max-width: 720px) 100vw, 43vw"}
                />
              </div>
              <div className="screenCopy">
                <p className="eyebrow">{screen.eyebrow}</p>
                <h3>{screen.title}</h3>
                <p>{screen.copy}</p>
              </div>
            </article>
          ))}
          <article className="screenCard conversationCard wide">
            <div className="conversationVisuals">
              <figure>
                <Image
                  src="/screens/maya-chat.png"
                  alt="Maya AI team-chat conversation with call history and live updates"
                  width={350}
                  height={500}
                  loading="lazy"
                  sizes="(max-width: 720px) 72vw, 350px"
                />
                <figcaption>Maya AI · calls and live team updates</figcaption>
              </figure>
              <figure>
                <Image
                  src="/screens/customer-chats.png"
                  alt="Customer support chat queue with open conversations, message counts and resolution controls"
                  width={350}
                  height={405}
                  loading="lazy"
                  sizes="(max-width: 720px) 72vw, 350px"
                />
                <figcaption>Customer support · open, resolve, and track</figcaption>
              </figure>
            </div>
            <div className="screenCopy">
              <p className="eyebrow">Live conversations</p>
              <h3>Maya, team chat, and customer support stay in one realtime workspace</h3>
              <p>
                Operators can move between internal teammates, Maya, and customer conversations
                with live updates, call history, unread context, message counts, and clear
                resolution controls.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="fitSection">
        <div>
          <p className="eyebrow">Who this is for</p>
          <h2>Built for events teams. Open for builders.</h2>
        </div>
        <ul>
          {fit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="runSection" id="run">
        <div className="terminal" aria-label="Local setup commands">
          <div className="terminalBar">
            <span />
            <span />
            <span />
          </div>
          <code>
            <span>$ git clone {repoUrl}.git</span>
            <span>$ cd moonsevents</span>
            <span>$ ./start.sh</span>
            <span className="terminalSuccess">✓ MooNsEvents is ready</span>
          </code>
        </div>
        <div className="runCopy">
          <p className="eyebrow">Evaluate it yourself</p>
          <h2>One start command, documented configuration.</h2>
          <ol>
            {localSteps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="runActions">
            <a className="primaryButton light" href={`${repoUrl}#run-locally-with-docker`}>
              Open setup guide
            </a>
            <a className="textLink" href={`${repoUrl}/blob/main/SECURITY.md`}>
              Security policy ↗
            </a>
          </div>
        </div>
      </section>

      <section className="contributeSection">
        <p className="eyebrow">Open source, MIT licensed</p>
        <h2>Pick a small problem. Leave the events stack better.</h2>
        <p>
          Start with documentation, accessibility, timeline polish, responsive UI, testing,
          sample integrations, or developer setup. The repository includes scoped issues,
          contribution guidance, recognition, and a code of conduct.
        </p>
        <div className="heroActions centered">
          <a className="primaryButton" href={`${repoUrl}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`}>
            Good first issues
          </a>
          <a className="secondaryButton" href={`${repoUrl}/blob/main/CONTRIBUTING.md`}>
            Contribution guide
          </a>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">
          <span className="brandMoon">MooN</span>
          <span>Configs</span>
        </a>
        <p>Open events operations, maintained by MooN and contributors.</p>
        <div>
          <a href={repoUrl}>GitHub</a>
          <a href={`${repoUrl}/discussions`}>Discussions</a>
          <a href={`${repoUrl}/blob/main/LICENSE`}>MIT License</a>
        </div>
      </footer>
    </main>
  );
}
