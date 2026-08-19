import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import "antd/dist/reset.css";
import {
  Alert as AntAlert,
  Button,
  Card,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Modal,
  Space,
  Tag,
  Typography,
  theme as antTheme
} from "antd";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MenuProps } from "antd";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Compass,
  Clock,
  DatabaseZap,
  Eye,
  EyeOff,
  ExternalLink,
  Gauge,
  Globe2,
  Info,
  ListFilter,
  Linkedin,
  MapPin,
  Magnet,
  Moon,
  Radio,
  RefreshCw,
  Satellite,
  ShieldCheck,
  Sun,
  Thermometer,
  UsersRound,
  Waves,
  X,
  Zap
} from "lucide-react";

import { getApiUrl } from "./apiConfig";
import { InteractiveStarField } from "./components/InteractiveStarField";
import { XRAY_ZOOM_POINT_COUNTS } from "./xrayZoom";
import "./styles.css";

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

type SeverityLevel = "low" | "moderate" | "high" | "severe";
type Freshness = "fresh" | "stale" | "unavailable";

type DashboardSummary = {
  condition: string;
  overallSeverity: SeverityLevel;
  mainCause: string;
  lastUpdated: string;
  kp: number | null;
  gScale: string;
  rScale: string;
  sScale: string;
  solarWindSpeed: number | null;
  bz: number | null;
  latestFlare: string | null;
  activeAlerts: number;
  source: string;
  freshness: Freshness;
};

type ImpactItem = {
  sector: string;
  level: SeverityLevel;
  reason: string;
  relatedParameter: string;
};

type ImpactResponse = {
  lastUpdated: string;
  source: string;
  impacts: ImpactItem[];
};

type SolarWindPoint = {
  timestamp: string;
  speedKmPerSec: number | null;
  densityPerCc: number | null;
  temperatureK: number | null;
  bzNt: number | null;
  btNt: number | null;
};

type SolarWindResponse = {
  range: string;
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  data: SolarWindPoint[];
};

type MagneticFieldPoint = {
  timestamp: string;
  bxGsmNt?: number | null;
  byGsmNt?: number | null;
  bzGsmNt: number | null;
  btNt: number | null;
};

type MagneticFieldResponse = {
  range: string;
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  data: MagneticFieldPoint[];
};

type KpPoint = {
  timestamp: string;
  value: number;
};

type KpResponse = {
  source: string;
  lastUpdated: string | null;
  current: number | null;
  gScale: string;
  freshness: Freshness;
  data: KpPoint[];
};

type ScalesResponse = {
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  current: {
    gScale: string;
    rScale: string;
    sScale: string;
  };
  forecast: Array<{
    timestamp: string;
    gScale: string;
    rScale: string;
    sScale: string;
  }>;
};

type AlertRecord = {
  id: string;
  title: string;
  status: "active" | "expired";
  scale: string;
  issuedAt: string;
  validUntil: string | null;
  affectedSystems: string[];
  summary: string;
};

type AlertsResponse = {
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  alerts: AlertRecord[];
};

type EventType = "cme" | "flare" | "gst" | "sep";
type EventFilter = EventType | "all";

type TimelineEvent = {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  title: string;
  summary: string;
  severity: SeverityLevel;
  link?: string;
  sourceLocation?: string | null;
  activeRegionNum?: number | null;
  speedKmPerSec?: number | null;
  halfAngleDeg?: number | null;
  estimatedShockArrivalTime?: string | null;
  earthDirected?: boolean;
  flareClass?: string | null;
  kpIndex?: number | null;
  associatedEventIds: string[];
  instruments: string[];
};

type EventsResponse = {
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  query: {
    type: EventFilter;
    startDate: string;
    endDate: string;
    limit: number;
  };
  events: TimelineEvent[];
  errorMessage?: string;
};

type SolarActivityResponse = {
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  xray: {
    source: string;
    lastUpdated: string | null;
    freshness: Freshness;
    currentClass: string | null;
    currentFluxWm2: number | null;
    primarySatellite: number | null;
    data: Array<{
      timestamp: string;
      fluxWm2: number | null;
      flareClass: string | null;
      energy: string;
      satellite?: number | null;
    }>;
  };
  regions: {
    source: string;
    lastUpdated: string | null;
    freshness: Freshness;
    data: unknown[];
  };
  solarCycle?: {
    source: string;
    lastUpdated: string | null;
    freshness: Freshness;
    observed: Array<{
      month: string;
      ssn: number | null;
      smoothedSsn: number | null;
    }>;
    predicted: Array<{
      month: string;
      predictedSsn: number | null;
      lowSsn: number | null;
      highSsn: number | null;
      low75Ssn: number | null;
      high75Ssn: number | null;
    }>;
  };
  images: {
    source: string;
    freshness: Freshness;
    images: Array<{
      id: string;
      label: string;
      wavelength: string;
      url: string;
      lastModified: string | null;
    }>;
  };
};

type GloTecPoint = {
  latitude: number;
  longitude: number;
  tec: number;
  anomaly: number | null;
  hmF2Km: number | null;
  nmF2: number | null;
  qualityFlag: number | null;
};

type GloTecResponse = {
  source: string;
  lastUpdated: string | null;
  freshness: Freshness;
  productUrl: string | null;
  summary: {
    pointCount: number;
    meanTec: number | null;
    maxTec: number | null;
    maxAnomaly: number | null;
    observedCoveragePercent: number | null;
  };
  points: GloTecPoint[];
  errorMessage?: string;
};

type SourceHealthRecord = {
  sourceName: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  lastSuccessAt?: string;
  latencyMs?: number;
  recordsFetched?: number;
  errorMessage?: string;
};

type SourceHealthResponse = {
  sources: SourceHealthRecord[];
};

type DashboardData = {
  summary: DashboardSummary;
  impacts: ImpactResponse;
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  scales: ScalesResponse;
  alerts: AlertsResponse;
  events: EventsResponse;
  solarActivity: SolarActivityResponse;
  glotec: GloTecResponse;
  sourceHealth: SourceHealthResponse;
};

const severityLabels: Record<SeverityLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe"
};

const sectorIcons: Record<string, typeof Satellite> = {
  Satellites: Satellite,
  "GNSS and navigation": Compass,
  "HF radio communication": Radio,
  Aviation: ShieldCheck,
  "Power grids": Zap,
  "Aurora visibility": Sun,
  "Human spaceflight radiation awareness": Activity
};

const eventTypeLabels: Record<EventFilter, string> = {
  all: "All",
  cme: "CME",
  flare: "Flare",
  gst: "Storm",
  sep: "SEP"
};

const XRAY_FLARE_CLASS_RANGES = [
  { label: "A", range: "1.0e-8 to < 1.0e-7 W/m2", meaning: "Very low background solar X-ray level.", color: "#3b82f6" },
  { label: "B", range: "1.0e-7 to < 1.0e-6 W/m2", meaning: "Low solar activity; usually minor operational impact.", color: "#22c55e" },
  { label: "C", range: "1.0e-6 to < 1.0e-5 W/m2", meaning: "Common small flares; weak radio effects are possible.", color: "#facc15" },
  { label: "M", range: "1.0e-5 to < 1.0e-4 W/m2", meaning: "Medium flares; radio blackouts and radiation changes can matter.", color: "#f97316" },
  { label: "X", range: ">= 1.0e-4 W/m2", meaning: "Major flares; strongest class with increasing subclasses such as X2 or X10.", color: "#ef4444" }
];

const LANDING_APP_NAME = "NCGSA Space Weather Observatory";
const HEADER_AFFILIATIONS = [
  "GNSS Research Lab",
  "IST Islamabad, PK"
];
const BRAND_LOGO_DARK_SRC = "/assets/ncgsa-space-weather-icon.png";
const BRAND_LOGO_LIGHT_SRC = "/assets/ncgsa-space-weather-icon-light.png";

function getBrandLogoSrc(themeMode: "dark" | "light") {
  return themeMode === "light" ? BRAND_LOGO_LIGHT_SRC : BRAND_LOGO_DARK_SRC;
}

const FOOTER_LOGOS = [
  { name: "Global Navigation Satellite System Lab", src: "/assets/footer-gnss.png", href: "https://gnss.ncgsa.org.pk/wp/" },
  { name: "Institute of Space Technology", src: "/assets/footer-ist.png", href: "https://www.ist.edu.pk/" },
  { name: "National Center of GIS and Space Applications", src: "/assets/footer-ncgsa.png", href: "https://ncgsa.org.pk/" },
  { name: "Ministry of Planning, Development and Special Initiatives", src: "/assets/footer-planning-ministry.png", href: "https://www.pc.gov.pk/" },
  { name: "Higher Education Commission", src: "/assets/footer-hec.png", href: "https://www.hec.gov.pk/english/Pages/default.aspx" }
];

const FOOTER_LINKS = {
  gnssWebsite: "https://gnss.ncgsa.org.pk/wp/",
  gnssLinkedin: "https://www.linkedin.com/gnss-research-lab-ncgsa",
  ncgsaWebsite: "https://ncgsa.org.pk/",
  ncgsaLinkedin: "https://www.linkedin.com/company/ncgsa"
};

const HERO_IMAGES = [
  { url: "/landing/hero-space-weather.png", label: "Solar wind and magnetosphere artwork" },
  { url: "/landing/solar-activity.png", label: "Solar activity artwork" },
  { url: "/landing/geomagnetic-field.png", label: "Geomagnetic field artwork" },
  { url: "/landing/ionosphere-gnss.png", label: "Ionosphere and GNSS artwork" }
];

const LANDING_LAYER_CARDS = [
  {
    title: "Sun",
    description: "X-ray flux, solar flares, sunspots, CME watch, and solar imagery describe current solar activity.",
    href: "#overview",
    image: "/landing/solar-flares.svg",
    imageAlt: "Solar activity illustration"
  },
  {
    title: "Solar Wind & IMF",
    description: "Solar wind plasma, speed trends, and IMF Bz/Bt show upstream conditions arriving near Earth.",
    href: "#solar-wind",
    image: "/landing/solar-wind.svg",
    imageAlt: "Solar wind stream illustration"
  },
  {
    title: "Geomagnetic Field",
    description: "Kp index, G-scale status, and storm context summarize Earth’s magnetic response.",
    href: "#geomagnetic",
    image: "/landing/hero-magnetosphere.svg",
    imageAlt: "Geomagnetic field illustration"
  },
  {
    title: "Ionosphere",
    description: "TEC and GNSS-aware ionosphere views explain navigation delay and radio propagation changes.",
    href: "#overview",
    image: "/landing/ionosphere.svg",
    imageAlt: "NOAA GloTEC ionosphere map illustration"
  },
  {
    title: "Contributors",
    description: "Contributors, source health, references, attribution, and mission details keep the observatory transparent.",
    href: "#system",
    image: "/landing/gnss.svg",
    imageAlt: "Contributor and reference signal illustration"
  }
];

const LANDING_CARDS = [
  {
    title: "Sun",
    description: "Characterize solar activity and energetic phenomena driving variability across the heliosphere.",
    section: "layer-sun",
    accent: "#f97316",
    image: "/landing/solar-activity.png",
    imageAlt: "Solar activity illustration",
    links: [
      { label: "X-ray Flux", section: "overview-1-xray" },
      { label: "Solar Flares", section: "overview-1-flares" },
      { label: "Sunspots", section: "overview-1-sunspots" },
      { label: "Coronal Mass Ejections", section: "overview-1-cme" },
      { label: "Solar Imagery", section: "overview-1-imagery" }
    ]
  },
  {
    title: "Solar Wind & IMF",
    description: "Examine solar-wind plasma and magnetic-field dynamics governing Sun-Earth coupling.",
    section: "layer-solar-wind",
    accent: "#38bdf8",
    image: "/landing/solar-wind-field.png",
    imageAlt: "Solar wind stream illustration",
    links: [
      { label: "Solar Wind Plasma", section: "overview-1-plasma" },
      { label: "IMF Bz + Bt", section: "overview-1-imf" }
    ]
  },
  {
    title: "Geomagnetic Field",
    description: "Monitor geomagnetic disturbances and Earth's magnetic response to solar forcing.",
    section: "layer-geomagnetic",
    accent: "#8b5cf6",
    image: "/landing/geomagnetic-field.png",
    imageAlt: "Geomagnetic field illustration",
    links: [
      { label: "Kp Index", section: "overview-1-kp" },
      { label: "Dst Index", section: "overview-1-dst" }
    ]
  },
  {
    title: "Ionosphere",
    description: "Investigate ionospheric dynamics and TEC variability affecting GNSS signal propagation.",
    section: "layer-ionosphere",
    accent: "#22c55e",
    image: "/landing/ionosphere-gnss.png",
    imageAlt: "NOAA GloTEC ionosphere map illustration",
    links: [
      { label: "Ionosphere & TEC", section: "overview-1-tec" },
      { label: "GNSS Impacts", section: "overview-1-gnss" }
    ]
  }
];

const LAYER_MENU_KEYS = [
  "layer-sun",
  "layer-solar-wind",
  "layer-geomagnetic",
  "layer-ionosphere",
  "layer-system"
];

const SUBSECTION_PARENT: Record<string, string> = {
  "overview-1-xray": "layer-sun",
  "overview-1-flares": "layer-sun",
  "overview-1-sunspots": "layer-sun",
  "overview-1-cme": "layer-sun",
  "overview-1-imagery": "layer-sun",
  "overview-1-plasma": "layer-solar-wind",
  "overview-1-imf": "layer-solar-wind",
  "overview-1-kp": "layer-geomagnetic",
  "overview-1-dst": "layer-geomagnetic",
  "overview-1-tec": "layer-ionosphere",
  "overview-1-gnss": "layer-ionosphere",
  "overview-1-contributors": "layer-system",
  "overview-1-reference": "layer-system",
  "overview-1-status": "layer-system",
  "overview-1-api": "layer-system",
  "overview-1-data": "layer-system",
  "overview-1-sources": "layer-system",
  "overview-1-about": "layer-system"
};

type GlossaryCategory =
  | "All"
  | "Sun"
  | "Solar Wind & IMF"
  | "Geomagnetic Field"
  | "Ionosphere"
  | "GNSS"
  | "Data & Sources";

type GlossaryEntry = {
  term: string;
  category: Exclude<GlossaryCategory, "All">;
  layer: string;
  definition: string;
  impact: string;
  source: string;
  related: string[];
};

const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "All",
  "Sun",
  "Solar Wind & IMF",
  "Geomagnetic Field",
  "Ionosphere",
  "GNSS",
  "Data & Sources"
];

const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: "Space Weather",
    category: "Data & Sources",
    layer: "Overview",
    definition: "Conditions on the Sun, in the solar wind, magnetosphere, ionosphere, and near-Earth space that can affect technology and operations.",
    impact: "It can disturb GNSS positioning, HF radio links, satellites, power systems, and aviation or research operations.",
    source: "Provided glossary; NOAA SWPC aligned",
    related: ["NOAA SWPC", "DONKI", "Kp", "TEC"]
  },
  {
    term: "X-ray Flux",
    category: "Sun",
    layer: "Sun / X-ray Flux",
    definition: "Soft X-ray irradiance from the Sun, commonly used to classify solar flares into A, B, C, M, and X classes.",
    impact: "Strong X-ray bursts can ionize the daylight ionosphere and cause sudden HF radio blackouts.",
    source: "Provided glossary; NOAA SWPC GOES X-ray product",
    related: ["GOES", "Solar Flare", "R scale"]
  },
  {
    term: "Solar Flare",
    category: "Sun",
    layer: "Sun / Solar Flares",
    definition: "A sudden burst of electromagnetic radiation from an active solar region, classified by peak X-ray flux.",
    impact: "M and X class flares can affect radio communication, GNSS signal quality, and near-Earth radiation conditions.",
    source: "Provided glossary; NASA DONKI",
    related: ["X-ray Flux", "Active Region", "R scale"]
  },
  {
    term: "Solar Flare Classes",
    category: "Sun",
    layer: "Sun / X-ray Flux",
    definition: "A and B are background levels, C is minor, M is moderate, and X is major flare activity.",
    impact: "The higher the class, the more likely the flare is to produce radio blackouts and operational impacts.",
    source: "Provided glossary; NOAA SWPC",
    related: ["A", "B", "C", "M", "X"]
  },
  {
    term: "Coronal Mass Ejection",
    category: "Sun",
    layer: "Sun / Coronal Mass Ejections",
    definition: "A large expulsion of plasma and magnetic field from the solar corona into interplanetary space.",
    impact: "Earth-directed CMEs are a major driver of geomagnetic storms and ionospheric disturbance.",
    source: "Provided glossary; NASA DONKI",
    related: ["CME", "Geomagnetic Storm", "Solar Wind"]
  },
  {
    term: "Sunspot",
    category: "Sun",
    layer: "Sun / Sunspots",
    definition: "A darker, magnetically active region on the solar photosphere where flares and eruptions may originate.",
    impact: "Large or complex sunspot groups can indicate elevated flare and CME potential.",
    source: "Provided glossary; NASA SDO/HMI",
    related: ["HMI", "Active Region", "Solar Cycle"]
  },
  {
    term: "AIA",
    category: "Sun",
    layer: "Sun / Solar Imagery",
    definition: "The Atmospheric Imaging Assembly on NASA SDO, providing multi-wavelength images of the solar atmosphere.",
    impact: "AIA imagery helps identify active regions, coronal holes, hot plasma, and eruptive structures.",
    source: "Provided glossary; NASA SDO",
    related: ["AIA 171", "AIA 304", "EUV"]
  },
  {
    term: "Solar Wind",
    category: "Solar Wind & IMF",
    layer: "Solar Wind & IMF / Plasma",
    definition: "A continuous stream of charged particles flowing outward from the Sun and measured near Earth by spacecraft.",
    impact: "Fast, dense solar wind can compress Earth's magnetosphere and strengthen geomagnetic activity.",
    source: "Provided glossary; NOAA SWPC DSCOVR",
    related: ["Speed", "Density", "IMF"]
  },
  {
    term: "IMF",
    category: "Solar Wind & IMF",
    layer: "Solar Wind & IMF / IMF Bz + Bt",
    definition: "The interplanetary magnetic field carried outward from the Sun by the solar wind.",
    impact: "Its strength and direction control how efficiently solar wind energy couples into Earth's magnetosphere.",
    source: "Provided glossary; NOAA SWPC",
    related: ["Bz", "Bt", "Solar Wind"]
  },
  {
    term: "IMF Bz",
    category: "Solar Wind & IMF",
    layer: "Solar Wind & IMF / IMF Bz + Bt",
    definition: "The north-south component of the interplanetary magnetic field in GSM coordinates.",
    impact: "Sustained southward, negative Bz is one of the most important warning signs for geomagnetic storm development.",
    source: "Provided glossary; NOAA SWPC",
    related: ["IMF", "Bt", "Geomagnetic Storm"]
  },
  {
    term: "IMF Bt",
    category: "Solar Wind & IMF",
    layer: "Solar Wind & IMF / IMF Bz + Bt",
    definition: "The total magnitude of the interplanetary magnetic field vector.",
    impact: "Higher Bt means the magnetic field is stronger; storm potential rises when strong Bt includes sustained southward Bz.",
    source: "Provided glossary; NOAA SWPC",
    related: ["IMF", "Bz"]
  },
  {
    term: "Kp Index",
    category: "Geomagnetic Field",
    layer: "Geomagnetic Field / Kp Index",
    definition: "A global 0 to 9 index describing geomagnetic disturbance, derived from ground magnetometer observations.",
    impact: "Higher Kp values indicate stronger geomagnetic activity and greater risk to GNSS accuracy and radio systems.",
    source: "Provided glossary; NOAA SWPC",
    related: ["G scale", "Geomagnetic Storm"]
  },
  {
    term: "Dst Index",
    category: "Geomagnetic Field",
    layer: "Geomagnetic Field / Dst Index",
    definition: "An index of the globally averaged magnetic depression caused mainly by the ring current during storms.",
    impact: "More negative Dst values indicate stronger storm-time ring current and deeper geomagnetic disturbance.",
    source: "Provided glossary",
    related: ["Ring Current", "Geomagnetic Storm"]
  },
  {
    term: "Geomagnetic Storm",
    category: "Geomagnetic Field",
    layer: "Geomagnetic Field",
    definition: "A temporary disturbance of Earth's magnetosphere driven by solar wind structures or CMEs.",
    impact: "Storms can cause GNSS errors, auroral-current disturbances, satellite drag changes, and radio variability.",
    source: "Provided glossary; NOAA SWPC",
    related: ["Kp", "Dst", "G scale"]
  },
  {
    term: "Ionosphere",
    category: "Ionosphere",
    layer: "Ionosphere / TEC",
    definition: "The ionized upper atmosphere, roughly 60 to 1000 km altitude, that refracts and delays radio signals.",
    impact: "It is the main space-weather region affecting GNSS positioning, timing, and HF propagation.",
    source: "Provided glossary",
    related: ["TEC", "Scintillation", "GNSS"]
  },
  {
    term: "TEC",
    category: "Ionosphere",
    layer: "Ionosphere / TEC",
    definition: "Total Electron Content, the integrated number of free electrons along a signal path, measured in TECU.",
    impact: "Large TEC gradients can delay GNSS signals and increase positioning uncertainty.",
    source: "Provided glossary; NOAA GloTEC",
    related: ["TECU", "VTEC", "STEC"]
  },
  {
    term: "TECU",
    category: "Ionosphere",
    layer: "Ionosphere / TEC",
    definition: "TEC unit; 1 TECU equals 10^16 electrons per square meter.",
    impact: "TECU values give a readable scale for ionospheric electron content and GNSS delay risk.",
    source: "Provided glossary",
    related: ["TEC", "GNSS Delay"]
  },
  {
    term: "Scintillation",
    category: "Ionosphere",
    layer: "Ionosphere / GNSS Impacts",
    definition: "Rapid fluctuations in GNSS signal amplitude or phase caused by small-scale ionospheric irregularities.",
    impact: "Strong scintillation can reduce signal quality, cause cycle slips, or lead to loss of lock.",
    source: "Provided glossary",
    related: ["S4", "Phase Scintillation", "Loss of Lock"]
  },
  {
    term: "GNSS",
    category: "GNSS",
    layer: "Ionosphere / GNSS Impacts",
    definition: "Global Navigation Satellite Systems such as GPS, GLONASS, Galileo, BeiDou, QZSS, IRNSS, and SBAS.",
    impact: "GNSS positioning, navigation, and timing can degrade when ionospheric delay or scintillation increases.",
    source: "Provided glossary",
    related: ["PNT", "TEC", "Carrier Phase"]
  },
  {
    term: "Cycle Slip",
    category: "GNSS",
    layer: "Ionosphere / GNSS Impacts",
    definition: "A sudden jump in the GNSS carrier-phase measurement caused by temporary tracking interruption.",
    impact: "Cycle slips can reduce precision positioning quality and require detection or repair in GNSS processing.",
    source: "Provided glossary",
    related: ["Carrier Phase", "Scintillation", "Loss of Lock"]
  },
  {
    term: "DONKI",
    category: "Data & Sources",
    layer: "System / Sources",
    definition: "NASA's Database Of Notifications, Knowledge, Information, used for solar events, CMEs, flares, and model runs.",
    impact: "DONKI gives event context for CME timelines, flare reports, and potential Earth-directed activity.",
    source: "Provided glossary; NASA DONKI",
    related: ["CME", "Solar Flare", "ENLIL"]
  },
  {
    term: "NOAA SWPC",
    category: "Data & Sources",
    layer: "System / Sources",
    definition: "NOAA's Space Weather Prediction Center, an operational source for space-weather data, alerts, and scales.",
    impact: "Live feeds support current Kp, solar wind, X-ray flux, alerts, and G/R/S scale interpretation.",
    source: "Provided glossary; NOAA SWPC",
    related: ["GOES", "Kp", "Alerts"]
  },
  {
    term: "Data Freshness",
    category: "Data & Sources",
    layer: "System / API Status",
    definition: "A status describing how recently each data source updated compared with its expected cadence.",
    impact: "Freshness labels help users distinguish live observations from stale or temporarily unavailable feeds.",
    source: "Provided glossary",
    related: ["API", "Source Health"]
  }
];

type SiteRoute = "home" | "observatory" | "explore" | "solar" | "solar-wind" | "geomagnetic" | "ionosphere" | "radio" | "sources";

type LearningTopic = {
  key: Exclude<SiteRoute, "home" | "observatory" | "explore" | "sources">;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  imageAlt: string;
  dashboardLinks: string[];
  concepts: Array<{ title: string; body: string; source: string; href: string }>;
  visualNote: string;
};

const SITE_NAV: Array<{ route: SiteRoute; label: string }> = [
  { route: "home", label: "Home" },
  { route: "explore", label: "Explore" },
  { route: "solar", label: "Sun" },
  { route: "solar-wind", label: "Solar Wind & IMF" },
  { route: "geomagnetic", label: "Geomagnetic Field" },
  { route: "ionosphere", label: "Ionosphere & GNSS" },
  { route: "sources", label: "Glossary" }
];

const ROUTE_PATHS: Record<SiteRoute, string> = {
  home: "/",
  observatory: "/observatory",
  explore: "/explore",
  solar: "/explore/solar-activity",
  "solar-wind": "/explore/solar-wind-imf",
  geomagnetic: "/explore/geomagnetic-activity",
  ionosphere: "/explore/ionosphere-gnss",
  radio: "/explore/radio-hf",
  sources: "/glossary"
};

function getInitialObservatorySection() {
  if (window.location.pathname !== "/observatory") return "overview";
  return new URLSearchParams(window.location.search).get("section") || "overview";
}

function observatoryHref(section = "overview") {
  return section === "overview" ? "/observatory" : `/observatory?section=${encodeURIComponent(section)}`;
}

const LANDING_NAV_ITEMS: Array<{
  label: string;
  section: string;
  children?: Array<{ label: string; section: string }>;
}> = [
  { label: "Overview", section: "overview" },
  {
    label: "Sun",
    section: "layer-sun",
    children: [
      { label: "X-ray Flux", section: "overview-1-xray" },
      { label: "Solar Flares", section: "overview-1-flares" },
      { label: "Sunspots", section: "overview-1-sunspots" },
      { label: "Coronal Mass Ejections", section: "overview-1-cme" },
      { label: "Solar Imagery", section: "overview-1-imagery" }
    ]
  },
  {
    label: "Solar Wind",
    section: "layer-solar-wind",
    children: [
      { label: "Solar Wind Plasma", section: "overview-1-plasma" },
      { label: "IMF Bz + Bt", section: "overview-1-imf" }
    ]
  },
  {
    label: "Geomagnetic Field",
    section: "layer-geomagnetic",
    children: [
      { label: "Kp Index", section: "overview-1-kp" },
      { label: "Dst Index", section: "overview-1-dst" }
    ]
  },
  {
    label: "Ionosphere",
    section: "layer-ionosphere",
    children: [
      { label: "Ionosphere & TEC", section: "overview-1-tec" },
      { label: "GNSS Impacts", section: "overview-1-gnss" }
    ]
  },
  {
    label: "Contributors",
    section: "overview-1-contributors",
    children: [
      { label: "Contributors", section: "overview-1-contributors" },
      { label: "Scale Page", section: "overview-1-reference" },
      { label: "Observatory Status", section: "overview-1-status" },
      { label: "API Status", section: "overview-1-api" },
      { label: "Sources & Attribution", section: "overview-1-sources" },
      { label: "About", section: "overview-1-about" }
    ]
  },
  { label: "Glossary", section: "overview-1-glossary" }
];

const LEARNING_TOPICS: LearningTopic[] = [
  {
    key: "solar",
    title: "Solar Activity",
    eyebrow: "Sun to dashboard",
    summary: "Solar flares, X-ray flux, sunspots, coronal mass ejections, and solar imagery explain why the Sun is the first layer of the observatory.",
    image: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0131.jpg",
    imageAlt: "NASA SDO AIA 131 latest solar image",
    dashboardLinks: ["X-ray Flux", "Solar Flares", "Sunspots", "Coronal Mass Ejections", "Solar Imagery"],
    visualNote: "Use AIA and HMI imagery to compare active regions, flare loops, coronal holes, and the visible photosphere.",
    concepts: [
      {
        title: "X-ray flux",
        body: "X-ray flux tracks soft X-ray emission from the Sun. GOES is the observing satellite system behind this channel, and the dashboard turns it into the current flare class and trend plot.",
        source: "Reference",
        href: "https://www.spaceweather.gov/products/goes-x-ray-flux"
      },
      {
        title: "Solar flares",
        body: "Flares are rapid releases of electromagnetic energy. Strong flares can disturb the sunlit ionosphere and drive radio blackout conditions.",
        source: "Reference",
        href: "https://www.spaceweather.gov/phenomena/solar-flares-radio-blackouts"
      },
      {
        title: "CMEs",
        body: "Coronal mass ejections are large expulsions of plasma and magnetic field. Earth-directed CMEs are important because they can drive geomagnetic storms.",
        source: "Reference",
        href: "https://www.spaceweather.gov/phenomena/coronal-mass-ejections"
      }
    ]
  },
  {
    key: "solar-wind",
    title: "Solar Wind & IMF",
    eyebrow: "Upstream plasma",
    summary: "Solar wind speed, density, temperature, and IMF Bz/Bt describe the material and magnetic field arriving near Earth.",
    image: "/landing/solar-wind.svg",
    imageAlt: "Solar wind and interplanetary magnetic field illustration",
    dashboardLinks: ["Solar Wind Plasma", "IMF Bz + Bt"],
    visualNote: "The dashboard separates plasma and magnetic field because speed alone does not define storm potential; magnetic orientation matters.",
    concepts: [
      {
        title: "Solar wind plasma",
        body: "Solar wind is a stream of charged particles flowing outward from the Sun. Speed, density, and temperature help describe incoming conditions.",
        source: "Reference",
        href: "https://www.spaceweather.gov/content/data-access"
      },
      {
        title: "IMF Bz",
        body: "A southward Bz component can connect more efficiently with Earth’s magnetic field, raising the chance of geomagnetic activity.",
        source: "Reference",
        href: "https://www.spaceweather.gov/phenomena/geomagnetic-storms"
      },
      {
        title: "IMF Bt",
        body: "Bt is total interplanetary magnetic-field strength. Higher Bt can make Bz changes more consequential for magnetospheric coupling.",
        source: "Reference",
        href: "https://www.spaceweather.gov/homepage"
      }
    ]
  },
  {
    key: "geomagnetic",
    title: "Geomagnetic Activity",
    eyebrow: "Earth response",
    summary: "Geomagnetic pages explain Kp, G-scale context, storm impacts, and why magnetic disturbances matter for technology.",
    image: "/landing/hero-magnetosphere.svg",
    imageAlt: "Magnetosphere and geomagnetic activity illustration",
    dashboardLinks: ["Geomagnetic Activity", "Kp Index", "Dst Index"],
    visualNote: "Kp shows planetary magnetic activity on a 0 to 9 scale, while G-scale translates storm severity into operational language.",
    concepts: [
      {
        title: "Kp index",
        body: "Kp summarizes global geomagnetic activity. The dashboard uses it for the current condition, Kp trend, and G-scale interpretation.",
        source: "Reference",
        href: "https://www.spaceweather.gov/phenomena/geomagnetic-storms"
      },
      {
        title: "G-scale",
        body: "The G-scale communicates storm intensity and expected effects, making raw geomagnetic measurements easier to interpret.",
        source: "Reference",
        href: "https://www.spaceweather.gov/noaa-scales-explanation"
      },
      {
        title: "System impacts",
        body: "Geomagnetic storms can affect satellite operations, power systems, navigation accuracy, and aurora visibility.",
        source: "Reference",
        href: "https://www.spaceweather.gov/noaa-scales-explanation"
      }
    ]
  },
  {
    key: "ionosphere",
    title: "Ionosphere & GNSS",
    eyebrow: "Navigation layer",
    summary: "The ionosphere changes radio propagation and GNSS signal travel time. TEC maps help explain where navigation delays can grow.",
    image: "/landing/ionosphere.svg",
    imageAlt: "Ionosphere and GNSS signal illustration",
    dashboardLinks: ["Ionosphere & TEC", "GNSS Impacts"],
    visualNote: "TEC is shown on a globe so users can connect spatial ionospheric structure with navigation and timing effects.",
    concepts: [
      {
        title: "TEC",
        body: "Total Electron Content estimates the number of free electrons along a signal path. Higher TEC can increase GNSS delay and positioning uncertainty.",
        source: "Reference",
        href: "https://www.spaceweather.gov/homepage"
      },
      {
        title: "GNSS delay",
        body: "GNSS signals pass through the ionosphere, so structure and gradients in electron content can degrade precision navigation.",
        source: "Reference",
        href: "https://www.spaceweather.gov/noaa-scales-explanation"
      },
      {
        title: "Radio connection",
        body: "Large solar X-ray flares can change the ionosphere and block HF radio on the sunlit side of Earth.",
        source: "Reference",
        href: "https://www.spaceweather.gov/products/goes-x-ray-flux"
      }
    ]
  },
  {
    key: "radio",
    title: "Radio & HF Conditions",
    eyebrow: "Communication layer",
    summary: "Radio and HF pages connect solar flares, the ionosphere, R-scale conditions, and communication impacts.",
    image: "/landing/radio.svg",
    imageAlt: "Radio propagation illustration",
    dashboardLinks: ["Radio / HF Conditions", "G/R/S Scales", "Active Alerts"],
    visualNote: "The R-scale is paired with explanatory text so users understand what radio blackout levels mean operationally.",
    concepts: [
      {
        title: "Radio blackouts",
        body: "Radio blackouts are associated with solar X-ray flares and can degrade HF communication on the sunlit side of Earth.",
        source: "Reference",
        href: "https://www.spaceweather.gov/phenomena/solar-flares-radio-blackouts"
      },
      {
        title: "R-scale",
        body: "The R-scale describes radio blackout severity from minor to extreme, including likely communication and navigation effects.",
        source: "Reference",
        href: "https://www.spaceweather.gov/noaa-scales-explanation"
      },
      {
        title: "Alerts and warnings",
        body: "Operational alerts summarize what is happening, where impacts may occur, and what systems are most relevant.",
        source: "Reference",
        href: "https://www.spaceweather.gov/products/alerts-watches-and-warnings"
      }
    ]
  }
];

export default function App() {
  const [route, setRoute] = useState(() => (window.location.pathname === "/observatory" ? "observatory" : "landing"));
  const [launchSection, setLaunchSection] = useState(getInitialObservatorySection);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("6h");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const isDarkMode = themeMode === "dark";

  async function loadDashboard(nextRange = range) {
    setIsLoading(true);
    setError(null);

    try {
      const [summary, impacts, solarWind, magneticField, kp, scales, alerts, events, solarActivity, glotec] = await Promise.all([
        fetchJson<DashboardSummary>("/api/dashboard/summary"),
        fetchJson<ImpactResponse>("/api/impact-summary"),
        fetchJson<SolarWindResponse>(`/api/solar-wind?range=${nextRange}`),
        fetchJson<MagneticFieldResponse>(`/api/magnetic-field?range=${nextRange}`),
        fetchJson<KpResponse>("/api/kp"),
        fetchJson<ScalesResponse>("/api/scales"),
        fetchJson<AlertsResponse>("/api/alerts"),
        fetchJson<EventsResponse>("/api/events?limit=8"),
        fetchJson<SolarActivityResponse>("/api/solar-activity"),
        fetchJson<GloTecResponse>("/api/ionosphere/glotec")
      ]);
      const sourceHealth = await fetchJson<SourceHealthResponse>("/api/source-health");

      setData({ summary, impacts, solarWind, magneticField, kp, scales, alerts, events, solarActivity, glotec, sourceHealth });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }

  function changeRange(nextRange: string) {
    setRange(nextRange);
    void loadDashboard(nextRange);
  }

  useEffect(() => {
    if (data || error) return;
    void loadDashboard(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(routeFromPath(window.location.pathname));
      setLaunchSection(getInitialObservatorySection());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (route === "landing" && window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }
  }, [route]);

  function launchObservatory(section = "overview") {
    setLaunchSection(section);
    window.history.pushState({}, "", observatoryHref(section));
    setRoute("observatory");
  }

  if (route === "landing") {
    return <LandingPage data={data} isLoading={isLoading} onLaunch={launchObservatory} />;
  }

  const appTheme = {
    algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      borderRadius: 8,
      colorPrimary: "#38bdf8",
      fontFamily:
        "\"Fira Sans\", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    }
  };

  if (isLoading && !data) {
    return (
      <ConfigProvider theme={appTheme}>
        <main className={`app-shell loading-shell theme-${themeMode}`}>
          <section className="space-loader" role="status" aria-live="polite">
            <div className="space-loader-scene" aria-hidden="true">
              <div className="space-loader-stars" />
              <div className="space-loader-galaxy" />
              <div className="space-loader-orbit orbit-one" />
              <div className="space-loader-orbit orbit-two" />
              <div className="space-loader-earth">
                <span className="space-loader-clouds" />
                <span className="space-loader-aurora" />
              </div>
            </div>
            <div className="space-loader-copy">
              <h1>Loading Live Space Weather Snapshot</h1>
              <span className="space-loader-progress">
                <span />
              </span>
            </div>
          </section>
        </main>
      </ConfigProvider>
    );
  }

  if (error || !data) {
    return (
      <ConfigProvider theme={appTheme}>
        <main className={`app-shell loading-shell theme-${themeMode}`}>
        <section className="error-panel" aria-live="polite">
          <AlertTriangle aria-hidden="true" size={30} />
          <h1>Space Weather Monitor</h1>
          <p>{error ?? "Data unavailable"}</p>
          <Button className="control-button" type="default" onClick={() => void loadDashboard()}>
            <RefreshCw aria-hidden="true" size={18} />
            Retry
          </Button>
        </section>
        </main>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={appTheme}>
      <Dashboard
        data={data}
        isRefreshing={isLoading}
        range={range}
        themeMode={themeMode}
        initialSection={launchSection}
        onRangeChange={changeRange}
        onRefresh={() => void loadDashboard(range)}
        onGoHome={() => {
          window.history.pushState({}, "", "/");
          setRoute("landing");
        }}
        onToggleTheme={() => setThemeMode(isDarkMode ? "light" : "dark")}
      />
    </ConfigProvider>
  );
}

function routeFromPath(pathname: string) {
  return pathname === "/observatory" ? "observatory" : "landing";
}

function LandingPage({
  data,
  isLoading,
  onLaunch
}: {
  data: DashboardData | null;
  isLoading: boolean;
  onLaunch: (section?: string) => void;
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const currentHero = HERO_IMAGES[heroIndex];
  const [utcNow, setUtcNow] = useState(() => new Date());

  useEffect(() => {
    const clock = window.setInterval(() => setUtcNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const heroRotation = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, 8000);

    return () => window.clearInterval(heroRotation);
  }, []);

  const summary = data?.summary;
  const latestWind = data?.solarWind.data.at(-1);
  const latestField = data?.magneticField.data.at(-1);
  const gnssImpact = data?.impacts.impacts.find((impact) => impact.sector.toLowerCase().includes("gnss"));
  const currentClass = data?.solarActivity.xray.currentClass ?? summary?.latestFlare ?? "B-class";
  const solarSeverity = flareClassToLandingStatus(currentClass);
  const hasLiveSummary = Boolean(summary?.lastUpdated);
  const solarWindSpeed = formatOptional(latestWind?.speedKmPerSec ?? summary?.solarWindSpeed, "km/s", 0);
  const solarWindBz = formatSigned(latestField?.bzGsmNt ?? summary?.bz, "nT");
  const xrayFlux = data?.solarActivity.xray.currentFluxWm2;
  const meanTec = data?.glotec.summary.meanTec;
  const maxTec = data?.glotec.summary.maxTec;
  const healthySources = data?.sourceHealth.sources.filter((source) => source.status === "healthy").length;
  const totalSources = data?.sourceHealth.sources.length;
  const statusItems = [
    {
      label: "TEC Max",
      value: maxTec === null || maxTec === undefined ? "Pending" : `${maxTec.toFixed(1)} TECU`,
      detail: data?.glotec.summary.pointCount ? `${data.glotec.summary.pointCount.toLocaleString()} points` : "GloTEC",
      icon: Satellite,
      tone: "low" as SeverityLevel,
      accent: "cyan",
      section: "overview-1-tec"
    },
    {
      label: "Active Alerts",
      value: String(summary?.activeAlerts ?? data?.alerts.alerts.filter((alert) => alert.status === "active").length ?? 0),
      detail: "Live alert feed",
      icon: AlertTriangle,
      tone: (summary?.activeAlerts ?? 0) > 0 ? "moderate" as SeverityLevel : "low" as SeverityLevel,
      accent: "rose",
      section: "overview-1-alerts"
    },
    {
      label: "Live Sources",
      value: healthySources === undefined || totalSources === undefined ? "Checking" : `${healthySources}/${totalSources}`,
      detail: "API health",
      icon: DatabaseZap,
      tone: healthySources !== undefined && totalSources !== undefined && healthySources < totalSources ? "moderate" as SeverityLevel : "low" as SeverityLevel,
      accent: "green",
      section: "overview-1-api"
    },
    {
      label: "Solar Activity",
      value: solarSeverity.label,
      detail: currentClass,
      icon: Sun,
      tone: solarSeverity.tone,
      accent: "orange",
      section: "layer-sun"
    },
    {
      label: "Solar Wind",
      value: solarWindSpeed === "Unavailable" ? "Pending" : solarWindSpeed,
      detail: "Plasma speed",
      icon: Waves,
      tone: "low" as SeverityLevel,
      accent: "blue",
      section: "layer-solar-wind"
    },
    {
      label: "X-ray Flux",
      value: xrayFlux === null || xrayFlux === undefined ? "Pending" : formatScientific(xrayFlux, "W/m2"),
      detail: currentClass,
      icon: Activity,
      tone: solarSeverity.tone,
      accent: "amber",
      section: "overview-1-xray"
    },
    {
      label: "IMF Bz",
      value: solarWindBz === "Unavailable" ? "Pending" : solarWindBz,
      detail: latestField?.btNt === null || latestField?.btNt === undefined ? "Bt pending" : `Bt ${latestField.btNt.toFixed(1)} nT`,
      icon: Magnet,
      tone: latestField?.bzGsmNt !== null && latestField?.bzGsmNt !== undefined && latestField.bzGsmNt < -5 ? "moderate" as SeverityLevel : "low" as SeverityLevel,
      accent: "violet",
      section: "overview-1-imf"
    },
    {
      label: "GNSS Impact",
      value: gnssImpact?.level ? severityLabels[gnssImpact.level] : "Monitored",
      detail: meanTec === null || meanTec === undefined ? "TEC ready" : `${meanTec.toFixed(1)} TECU`,
      icon: Satellite,
      tone: gnssImpact?.level ?? "low",
      accent: "lime",
      section: "layer-ionosphere"
    },
    {
      label: "Kp Index",
      value: summary?.kp === null || summary?.kp === undefined ? "Pending" : `${summary.kp.toFixed(1)} ${summary.condition}`,
      detail: summary?.gScale ?? "G0",
      icon: Gauge,
      tone: summary?.overallSeverity ?? "low",
      accent: "teal",
      section: "overview-1-kp"
    }
  ];
  const heroSummaryCards = [
    {
      type: "condition",
      label: "Current Condition",
      value: summary?.condition ?? "Pending",
      badge: summary?.freshness === "fresh" ? "Fresh" : summary?.freshness === "stale" ? "Stale" : "Pending",
      detail: summary?.kp === null || summary?.kp === undefined
        ? "Waiting for live Kp conditions."
        : `Kp ${summary.kp.toFixed(1)} indicates ${summary.condition === "Quiet" ? "quiet geomagnetic" : summary.condition.toLowerCase()} conditions.`,
      icon: Activity,
      tone: summary?.overallSeverity ?? "low",
      section: "overview",
      facts: [
        ["G scale", summary?.gScale ?? "G0"],
        ["R scale", summary?.rScale ?? "R0"],
        ["S scale", summary?.sScale ?? "S0"]
      ],
      footer: summary?.lastUpdated ? `Updated ${formatDateTime(summary.lastUpdated)} UTC` : "Update pending"
    },
    {
      label: "IMF Bz",
      value: solarWindBz === "Unavailable" ? "Pending" : solarWindBz,
      badge: latestField?.bzGsmNt !== null && latestField?.bzGsmNt !== undefined && latestField.bzGsmNt < -5 ? "Moderate" : "Low",
      detail: "Interplanetary Magnetic Field",
      icon: Magnet,
      tone: latestField?.bzGsmNt !== null && latestField?.bzGsmNt !== undefined && latestField.bzGsmNt < -5 ? "moderate" as SeverityLevel : "low" as SeverityLevel,
      section: "overview-1-imf"
    },
    {
      label: "Kp Index",
      value: summary?.kp === null || summary?.kp === undefined ? "Pending" : `Kp ${summary.kp.toFixed(1)}`,
      badge: severityLabels[summary?.overallSeverity ?? "low"],
      detail: `${summary?.gScale ?? "G0"} geomagnetic scale`,
      icon: Gauge,
      tone: summary?.overallSeverity ?? "low",
      section: "overview-1-kp"
    },
    {
      label: "TEC Value",
      value: meanTec === null || meanTec === undefined ? "Pending" : `${meanTec.toFixed(1)} TECU`,
      badge: maxTec === null || maxTec === undefined ? "Pending" : "Live",
      detail: maxTec === null || maxTec === undefined ? "Ionosphere grid pending" : `Max ${maxTec.toFixed(1)} TECU`,
      icon: Satellite,
      tone: "low" as SeverityLevel,
      section: "overview-1-tec"
    }
  ];

  return (
    <main className="landing-page theme-dark">
      <header className="landing-topbar">
        <button className="landing-brand" type="button" onClick={() => onLaunch("overview")} aria-label="Open live dashboard">
          <img src={BRAND_LOGO_DARK_SRC} alt={`${LANDING_APP_NAME} - ${HEADER_AFFILIATIONS.join(" - ")}`} />
        </button>
        <nav className="landing-nav" aria-label="Landing navigation">
          <a className="active" href="/">
            Home
          </a>
          {LANDING_NAV_ITEMS.map((item) => (
            <div className={item.children?.length ? "landing-nav-item has-dropdown" : "landing-nav-item"} key={item.section}>
              <a
                href={observatoryHref(item.section)}
                onClick={(event) => {
                  event.preventDefault();
                  onLaunch(item.section);
                }}
              >
                {item.label}
              </a>
              {item.children?.length ? (
                <div className="landing-nav-dropdown" role="menu" aria-label={`${item.label} sub pages`}>
                  {item.children.map((child) => (
                    <a
                      href={observatoryHref(child.section)}
                      key={child.section}
                      role="menuitem"
                      onClick={(event) => {
                        event.preventDefault();
                        onLaunch(child.section);
                      }}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="landing-system">
          <TimeDropdown now={utcNow} />
          <span className={data ? "landing-online is-online" : "landing-online"}>
            <span />
            {isLoading ? "Syncing Data" : data ? "System Online" : "Data Pending"}
          </span>
        </div>
      </header>

      <section
        className="landing-hero"
        aria-label="Space Weather Observatory landing hero"
        style={{ "--hero-image": `url(${currentHero.url})` } as CSSProperties}
      >
        <div className="landing-hero-content">
          <p className="landing-eyebrow">Real-Time Space Environment Monitoring</p>
          <h1>
            <span className="landing-hero-first-line"><span className="landing-hero-ncgsa">NCGSA</span> Space</span>
            <span>Weather</span>
            <span>Observatory</span>
          </h1>
          <p className="landing-hero-copy">
            Observing solar activity, geomagnetic dynamics, ionospheric variability, and their impacts on the
            near-Earth environment.
          </p>
          <div className="landing-actions">
            <a className="landing-primary-link" href={observatoryHref("overview")} onClick={(event) => { event.preventDefault(); onLaunch("overview"); }}>
              <Gauge aria-hidden="true" size={18} />
              Live Dashboard
            </a>
          </div>
          <div className="landing-hero-summary-grid" aria-label="Live hero condition cards">
            {heroSummaryCards.map((card, index) => {
              const Icon = card.icon;
              const isConditionCard = card.type === "condition";

              return (
                <button
                  className={`landing-hero-summary-card landing-hero-summary-card-${index + 1} severity-${card.tone} ${isConditionCard ? "is-condition" : ""}`}
                  key={card.label}
                  type="button"
                  onClick={() => onLaunch(card.section)}
                >
                  <span className={`landing-summary-icon severity-${card.tone}`}>
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <span className="landing-summary-body">
                    <span className="landing-summary-topline">
                      <span className="landing-summary-label">{card.label}</span>
                      <span className={`landing-summary-badge severity-${card.tone}`}>{card.badge}</span>
                    </span>
                    <strong>{card.value}</strong>
                    <span className="landing-summary-detail">{card.detail}</span>
                    {isConditionCard && "facts" in card ? (
                      <span className="landing-summary-facts">
                        {card.facts.map(([label, value]) => (
                          <span key={label}>
                            <small>{label}</small>
                            <b>{value}</b>
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {isConditionCard && "footer" in card ? <span className="landing-summary-footer">{card.footer}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="landing-live-strip" aria-label="Live space weather snapshot">
            <div className="landing-live-track">
              {[0, 1].map((copyIndex) => (
                <div className="landing-live-group" key={copyIndex} aria-hidden={copyIndex === 1}>
                  {statusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        className={`landing-live-item status-${item.tone} live-accent-${item.accent}`}
                        key={`${item.label}-${copyIndex}`}
                        type="button"
                        tabIndex={copyIndex === 1 ? -1 : 0}
                        onClick={() => onLaunch(item.section)}
                      >
                        <span className="landing-live-icon">
                          <Icon aria-hidden="true" size={25} />
                        </span>
                        <span className="landing-live-text">
                          <strong>{item.label}</strong>
                          <b>{item.value}</b>
                          <small>{item.detail}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <span className="landing-updated">
              {summary?.lastUpdated ? `Updated ${formatDateTime(summary.lastUpdated)} UTC` : "Live update pending"}
            </span>
          </div>
        </div>
      </section>

      <section className="phenomena-section" id="phenomena" aria-labelledby="phenomena-title">
        <div className="phenomena-heading">
          <h2 id="phenomena-title">Explore the Space Weather Observatory</h2>
          <p>
            Monitor the Sun-Earth environment through four dedicated observation portals.
          </p>
          <a href={observatoryHref("overview")} onClick={(event) => { event.preventDefault(); onLaunch("overview"); }}>
            View All Sections
            <ExternalLink aria-hidden="true" size={15} />
          </a>
        </div>
        <div className="phenomena-grid" role="list" aria-label="Space weather phenomena">
          {LANDING_CARDS.map((card) => (
            <article
              className="phenomenon-card"
              key={card.title}
              role="listitem"
              style={{ "--card-accent": card.accent } as CSSProperties}
            >
              <img src={card.image} alt={card.imageAlt} />
              <div className="phenomenon-card-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="landing-subfolder-links" aria-label={`${card.title} dashboard sub folders`}>
                  {card.links.map((link) => (
                    <a
                      href={observatoryHref(link.section)}
                      key={link.section}
                      onClick={(event) => {
                        event.preventDefault();
                        onLaunch(link.section);
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
              <a
                className="landing-card-explore"
                aria-label={`Explore ${card.title}`}
                href={observatoryHref(card.section)}
                onClick={(event) => {
                  event.preventDefault();
                  onLaunch(card.section);
                }}
              >
                <ArrowRight aria-hidden="true" size={20} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <InstitutionalFooter onNavigate={onLaunch} />
    </main>
  );
}

function TimeDropdown({ now }: { now?: Date }) {
  const currentTime = now ?? new Date();
  const utcTime = formatClockTime(currentTime, "UTC");
  const pktTime = formatClockTime(currentTime, "Asia/Karachi");

  return (
    <div className="time-dropdown">
      <div className="time-dropdown-trigger" aria-label={`${utcTime} UTC and ${pktTime} PKT`}>
        <Clock aria-hidden="true" size={19} />
        <span>{utcTime} UTC</span>
        <span>{pktTime} PKT</span>
      </div>
    </div>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" height={size} viewBox="0 0 24 24" width={size}>
      <path
        d="M14.2 8.5V6.9c0-.7.5-.9.9-.9h2.3V2.2L14 2.1c-3.8 0-4.7 2.8-4.7 4.7v1.7H6.4v4.2h2.9V22h4.5v-9.3h3.2l.5-4.2h-3.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ObservatoryFooter({ onNavigate }: { onNavigate: (section: string) => void }) {
  function handleFooterNav(event: MouseEvent<HTMLAnchorElement>, section: string) {
    event.preventDefault();
    onNavigate(section);
  }

  const quickLinks = [
    { label: "Overview", section: "overview" },
    { label: "Sun", section: "layer-sun" },
    { label: "Solar Wind & IMF", section: "layer-solar-wind" },
    { label: "Geomagnetic Field", section: "layer-geomagnetic" },
    { label: "Ionosphere", section: "layer-ionosphere" },
    { label: "Glossary", section: "overview-1-glossary" }
  ];

  return (
    <footer className="observatory-footer" aria-label="Institutional footer">
      <div className="footer-supported">
        <div className="footer-logo-row" aria-label="Institutional logos">
          {FOOTER_LOGOS.map((logo) => (
            <a className="footer-logo-card" href={logo.href} key={logo.name} target="_blank" rel="noreferrer" aria-label={`Open ${logo.name} website`}>
              <img src={logo.src} alt={logo.name} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer-body-shell">
      <div className="footer-content">
        <div className="footer-panel footer-identity">
          <p className="footer-eyebrow">GNSS Research Lab</p>
          <h2>NCGSA Space Weather Observatory</h2>
          <a href={FOOTER_LINKS.gnssWebsite} target="_blank" rel="noreferrer">
            <span className="footer-social-icon">
              <Globe2 aria-hidden="true" size={18} />
            </span>
            GNSS Research Lab Website
          </a>
          <div className="footer-socials" aria-label="GNSS social links">
            <a href={FOOTER_LINKS.gnssLinkedin} target="_blank" rel="noreferrer">
              <Linkedin aria-hidden="true" size={18} />
              LinkedIn
            </a>
          </div>
        </div>

        <address className="footer-contact">
          <p className="footer-section-label">NCGSA</p>
          <h2>National Center of GIS and Space Applications</h2>
          <p>Institute of Space Technology</p>
          <span>
            <MapPin aria-hidden="true" size={18} />
            1, Islamabad Highway, Islamabad 44000
          </span>
          <a href={FOOTER_LINKS.ncgsaLinkedin} target="_blank" rel="noreferrer">
            <Linkedin aria-hidden="true" size={18} />
            LinkedIn
          </a>
          <a href={FOOTER_LINKS.ncgsaWebsite} target="_blank" rel="noreferrer">
            <Globe2 aria-hidden="true" size={18} />
            Website
          </a>
        </address>

        <nav className="footer-quick-links" aria-label="Footer quick links">
          <span>Quick Links</span>
          {quickLinks.map((link) => (
            <a href={`/observatory?section=${link.section}`} key={link.section} onClick={(event) => handleFooterNav(event, link.section)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      </div>
    </footer>
  );
}

function InstitutionalFooter({ onNavigate }: { onNavigate: (section: string) => void }) {
  function handleFooterNav(event: MouseEvent<HTMLAnchorElement>, section: string) {
    event.preventDefault();
    onNavigate(section);
  }

  const quickLinks = [
    { label: "Overview", section: "overview" },
    { label: "Sun", section: "layer-sun" },
    { label: "Solar Wind & IMF", section: "layer-solar-wind" },
    { label: "Geomagnetic Field", section: "layer-geomagnetic" },
    { label: "Ionosphere", section: "layer-ionosphere" },
    { label: "Glossary", section: "overview-1-glossary" }
  ];

  return (
    <footer className="observatory-footer" aria-label="Institutional footer">
      <div className="footer-supported">
        <div className="footer-logo-row" aria-label="Institutional logos">
          {FOOTER_LOGOS.map((logo) => (
            <a className="footer-logo-card" href={logo.href} key={logo.name} target="_blank" rel="noreferrer" aria-label={`Open ${logo.name} website`}>
              <img src={logo.src} alt={logo.name} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer-body-shell">
        <div className="footer-content">
          <section className="footer-panel footer-identity" aria-labelledby="footer-observatory-title">
            <p className="footer-section-label">GNSS Research Lab</p>
            <h2 id="footer-observatory-title">NCGSA Space Weather Observatory</h2>
            <a className="footer-contact-row" href={FOOTER_LINKS.gnssWebsite} target="_blank" rel="noreferrer">
              <span className="footer-social-icon">
                <Globe2 aria-hidden="true" size={20} />
              </span>
              GNSS Research Lab Website
            </a>
            <div className="footer-socials footer-identity-socials" aria-label="GNSS social links">
              <a href={FOOTER_LINKS.gnssLinkedin} target="_blank" rel="noreferrer">
                <span className="footer-social-icon">
                  <Linkedin aria-hidden="true" size={20} />
                </span>
                LinkedIn
              </a>
            </div>
          </section>

          <address className="footer-panel footer-contact">
            <p className="footer-section-label">NCGSA</p>
            <h2>National Center of GIS and Space Applications</h2>
            <p className="footer-affiliation">Institute of Space Technology</p>
            <span className="footer-contact-row">
              <MapPin aria-hidden="true" size={20} />
              1, Islamabad Highway, Islamabad 44000
            </span>
            <div className="footer-socials" aria-label="NCGSA social links">
              <a href={FOOTER_LINKS.ncgsaLinkedin} target="_blank" rel="noreferrer">
                <span className="footer-social-icon">
                  <Linkedin aria-hidden="true" size={20} />
                </span>
                LinkedIn
              </a>
              <a href={FOOTER_LINKS.ncgsaWebsite} target="_blank" rel="noreferrer">
                <span className="footer-social-icon">
                  <Globe2 aria-hidden="true" size={20} />
                </span>
                Website
              </a>
            </div>
          </address>

          <nav className="footer-panel footer-quick-links" aria-label="Footer quick links">
            <p className="footer-section-label">Explore</p>
            {quickLinks.map((link) => (
              <a href={`/observatory?section=${link.section}`} key={link.section} onClick={(event) => handleFooterNav(event, link.section)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NCGSA Space Weather Observatory</span>
          <span className="footer-quote">"Somewhere, something incredible is waiting to be known." - Carl Sagan</span>
        </div>
      </div>
    </footer>
  );
}

function formatClockTime(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(value);
}

function flareClassToLandingStatus(currentClass: string): { label: string; tone: SeverityLevel } {
  const normalized = currentClass.trim().toUpperCase();
  if (normalized.startsWith("X")) return { label: "Severe", tone: "severe" };
  if (normalized.startsWith("M")) return { label: "High", tone: "high" };
  if (normalized.startsWith("C")) return { label: "Moderate", tone: "moderate" };
  return { label: "Low", tone: "low" };
}

function LearningSiteShell({
  route,
  onNavigate,
  children
}: {
  route: SiteRoute;
  onNavigate: (route: SiteRoute) => void;
  children: ReactNode;
}) {
  return (
    <main className="learning-site theme-dark">
      <header className="site-header">
        <a className="site-brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("home"); }}>
          <img src={BRAND_LOGO_DARK_SRC} alt={`${LANDING_APP_NAME} - ${HEADER_AFFILIATIONS.join(" - ")}`} />
        </a>
        <nav className="site-nav" aria-label="Website navigation">
          {SITE_NAV.map((item) => (
            <a
              className={route === item.route ? "active" : ""}
              href={ROUTE_PATHS[item.route]}
              key={item.route}
              onClick={(event) => { event.preventDefault(); onNavigate(item.route); }}
            >
              {item.label}
            </a>
          ))}
          <a className="site-dashboard-link" href="/observatory" onClick={(event) => { event.preventDefault(); onNavigate("observatory"); }}>
            Dashboard
          </a>
        </nav>
      </header>
      {children}
    </main>
  );
}

function LearnHub({ onNavigate }: { onNavigate: (route: SiteRoute) => void }) {
  return (
    <>
      <section className="learning-hero">
        <p className="eyebrow">Explore hub</p>
        <h1>Understand every signal in the dashboard.</h1>
        <p>
          This research guide explains the science behind the observatory: what each parameter means, why it matters,
          where it appears in the live dashboard, and which NASA or NOAA source supports it.
        </p>
      </section>
      <section className="learning-topic-grid" aria-label="Explore topics">
        {LEARNING_TOPICS.map((topic) => (
          <article className="learning-topic-card" key={topic.key}>
            <img src={topic.image} alt={topic.imageAlt} />
            <div>
              <p className="eyebrow">{topic.eyebrow}</p>
              <h2>{topic.title}</h2>
              <p>{topic.summary}</p>
              <button type="button" onClick={() => onNavigate(topic.key)}>
                Open topic
                <ExternalLink aria-hidden="true" size={15} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function LearningTopicPage({ topic, onNavigate }: { topic: LearningTopic; onNavigate: (route: SiteRoute) => void }) {
  return (
    <>
      <section className="learning-hero topic-hero">
        <div>
          <p className="eyebrow">{topic.eyebrow}</p>
          <h1>{topic.title}</h1>
          <p>{topic.summary}</p>
          <div className="topic-actions">
            <button type="button" onClick={() => onNavigate("observatory")}>Open dashboard</button>
            <button type="button" className="secondary" onClick={() => onNavigate("sources")}>View sources</button>
          </div>
        </div>
        <img src={topic.image} alt={topic.imageAlt} />
      </section>

      <section className="learning-section-grid">
        <article className="learning-panel wide">
          <p className="eyebrow">Dashboard scenario</p>
          <h2>How this topic is used operationally</h2>
          <p>{topic.visualNote}</p>
          <div className="dashboard-link-chips" aria-label="Related dashboard panels">
            {topic.dashboardLinks.map((link) => <span key={link}>{link}</span>)}
          </div>
        </article>
        {topic.concepts.map((concept) => (
          <article className="learning-panel" key={concept.title}>
            <p className="eyebrow">Concept</p>
            <h2>{concept.title}</h2>
            <p>{concept.body}</p>
            <a href={concept.href} target="_blank" rel="noreferrer">
              {concept.source}
              <ExternalLink aria-hidden="true" size={15} />
            </a>
          </article>
        ))}
      </section>

      <section className="learning-cta-panel">
        <div>
          <p className="eyebrow">Next step</p>
          <h2>Move From Explanation To Live Monitoring.</h2>
          <p>Open the dashboard and compare these concepts with current live monitoring data.</p>
        </div>
        <button type="button" onClick={() => onNavigate("observatory")}>Launch Observatory</button>
      </section>
    </>
  );
}

function SourcesPage() {
  const sources = LEARNING_TOPICS.flatMap((topic) => topic.concepts.map((concept) => ({
    topic: topic.title,
    source: concept.source,
    href: concept.href
  })));
  const uniqueSources = sources.filter((source, index, list) => list.findIndex((item) => item.href === source.href) === index);

  return (
    <>
      <section className="learning-hero">
        <p className="eyebrow">Sources and attribution</p>
        <h1>Official references behind the exploration site.</h1>
        <p>
          The website explains dashboard concepts in original language and links users to official NASA and NOAA pages
          for deeper scientific and operational detail.
        </p>
      </section>
      <section className="source-directory">
        {uniqueSources.map((source) => (
          <a href={source.href} key={source.href} target="_blank" rel="noreferrer">
            <span>{source.topic}</span>
            <strong>{source.source}</strong>
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        ))}
      </section>
    </>
  );
}

const DASHBOARD_HEADER_TITLES: Record<string, string> = {
  overview: "Space Weather Observatory",
  "layer-sun": "Sun",
  "overview-1-xray": "X-Ray Flux",
  "overview-1-flares": "Solar Flares",
  "overview-1-sunspots": "Sunspots",
  "overview-1-cme": "Coronal Mass Ejections",
  "overview-1-imagery": "Solar Imagery",
  "layer-solar-wind": "Solar Wind & IMF",
  "overview-1-plasma": "Solar Wind Plasma",
  "overview-1-imf": "IMF Bz + Bt",
  "layer-geomagnetic": "Geomagnetic Field",
  "overview-1-geomagnetic": "Geomagnetic Activity",
  "overview-1-kp": "Kp Index",
  "overview-1-dst": "Dst Index",
  "layer-ionosphere": "Ionosphere",
  "overview-1-tec": "Ionosphere & TEC",
  "overview-1-gnss": "GNSS Impacts",
  "layer-radio": "Radio",
  "overview-1-radio": "Radio / HF Conditions",
  "layer-outlook": "Outlook",
  "overview-1-alerts": "Active Alerts",
  "overview-1-forecasts": "Space Weather Forecasts",
  "overview-1-events": "Event Timeline",
  "layer-reference": "References",
  "overview-1-reference": "Scale Page",
  "overview-1-glossary": "Glossary",
  "overview-1-contributors": "Contributors",
  "layer-system": "Contributors",
  "overview-1-status": "Observatory Status",
  "overview-1-api": "API Status",
  "overview-1-data": "Data Explorer",
  "overview-1-sources": "Sources & Attribution",
  "overview-1-about": "About"
};

function getDashboardHeaderTitle(section: string) {
  return DASHBOARD_HEADER_TITLES[section] ?? "Space Weather Observatory";
}

function Dashboard({
  data,
  isRefreshing,
  range,
  themeMode,
  initialSection,
  onRangeChange,
  onRefresh,
  onGoHome,
  onToggleTheme
}: {
  data: DashboardData;
  isRefreshing: boolean;
  range: string;
  themeMode: "dark" | "light";
  initialSection: string;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
  onGoHome: () => void;
  onToggleTheme: () => void;
}) {
  const { summary, impacts, solarWind, magneticField, kp, scales, alerts, events, solarActivity, glotec, sourceHealth } = data;
  const activeAlerts = alerts.alerts.filter((alert) => alert.status === "active");
  const latestOverviewField = magneticField.data.at(-1);
  const overviewBz = latestOverviewField?.bzGsmNt ?? summary.bz;
  const initialParentSection = SUBSECTION_PARENT[initialSection] ?? initialSection;
  const [selectedSection, setSelectedSection] = useState(initialParentSection);
  const [activeSubsection, setActiveSubsection] = useState<string | null>(SUBSECTION_PARENT[initialSection] ? initialSection : null);
  const [openMenuKeys, setOpenMenuKeys] = useState(LAYER_MENU_KEYS);
  const [dashboardNow, setDashboardNow] = useState(() => new Date());
  const isDarkMode = themeMode === "dark";
  const isNotebookSection = selectedSection.startsWith("layer-") || selectedSection.startsWith("overview-1-");
  const headerTitle = getDashboardHeaderTitle(selectedSection);
  const layerTitle = (key: string, label: string) => (
    <span
      className="mission-layer-title"
      onClick={(event) => {
        event.stopPropagation();
        navigateToSection(key);
      }}
    >
      {label}
    </span>
  );
  const menuItems: MenuProps["items"] = [
    { key: "overview", icon: <Activity size={17} />, label: "Overview" },
    {
      key: "layer-sun",
      icon: <Sun size={17} />,
      label: layerTitle("layer-sun", "Sun"),
      children: [
        { key: "overview-1-xray", className: "mission-subitem", label: "X-ray Flux" },
        { key: "overview-1-flares", className: "mission-subitem", label: "Solar Flares" },
        { key: "overview-1-sunspots", className: "mission-subitem", label: "Sunspots" },
        { key: "overview-1-cme", className: "mission-subitem", label: "Coronal Mass Ejections" },
        { key: "overview-1-imagery", className: "mission-subitem", label: "Solar Imagery" }
      ]
    },
    {
      key: "layer-solar-wind",
      icon: <Waves size={17} />,
      label: layerTitle("layer-solar-wind", "Solar Wind & IMF"),
      children: [
        { key: "overview-1-plasma", className: "mission-subitem", label: "Solar Wind Plasma" },
        { key: "overview-1-imf", className: "mission-subitem", label: "IMF Bz + Bt" }
      ]
    },
    {
      key: "layer-geomagnetic",
      icon: <Magnet size={17} />,
      label: layerTitle("layer-geomagnetic", "Geomagnetic Field"),
      children: [
        { key: "overview-1-kp", className: "mission-subitem", label: "Kp Index" },
        { key: "overview-1-dst", className: "mission-subitem", label: "Dst Index" }
      ]
    },
    {
      key: "layer-ionosphere",
      icon: <Satellite size={17} />,
      label: layerTitle("layer-ionosphere", "Ionosphere"),
      children: [
        { key: "overview-1-tec", className: "mission-subitem", label: "Ionosphere & TEC" },
        { key: "overview-1-gnss", className: "mission-subitem", label: "GNSS Impacts" }
      ]
    },
    {
      key: "layer-system",
      icon: <UsersRound size={17} />,
      label: layerTitle("layer-system", "Contributors"),
      children: [
        { key: "overview-1-contributors", className: "mission-subitem", label: "Contributors" },
        { key: "overview-1-reference", className: "mission-subitem", label: "Scale Page" },
        { key: "overview-1-status", className: "mission-subitem", label: "Observatory Status" },
        { key: "overview-1-api", className: "mission-subitem", label: "API Status" },
        { key: "overview-1-data", className: "mission-subitem", label: "Data Explorer" },
        { key: "overview-1-sources", className: "mission-subitem", label: "Sources & Attribution" },
        { key: "overview-1-about", className: "mission-subitem", label: "About" }
      ]
    },
    {
      key: "overview-1-glossary",
      icon: <Info size={17} />,
      label: layerTitle("overview-1-glossary", "Glossary")
    }
  ];

  useEffect(() => {
    setSelectedSection(SUBSECTION_PARENT[initialSection] ?? initialSection);
    setActiveSubsection(SUBSECTION_PARENT[initialSection] ? initialSection : null);
  }, [initialSection]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const target = activeSubsection ? document.getElementById(activeSubsection) : null;
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  }, [activeSubsection, selectedSection]);

  useEffect(() => {
    const clock = window.setInterval(() => setDashboardNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  function navigateToSection(section: string) {
    const parent = SUBSECTION_PARENT[section] ?? section;
    setSelectedSection(parent);
    setActiveSubsection(SUBSECTION_PARENT[section] ? section : null);
    window.history.pushState({}, "", observatoryHref(section));
  }

  function changeOpenMenuKeys(keys: string[]) {
    setOpenMenuKeys(keys);
  }

  return (
    <Layout className={`mission-layout theme-${themeMode}`}>
      <InteractiveStarField />
      <Sider className="mission-sider" width={248} breakpoint="lg" collapsedWidth="0">
        <nav aria-label="Mission navigation">
          <button className="mission-brand" type="button" onClick={onGoHome} aria-label="Open landing page">
            <img src={getBrandLogoSrc(themeMode)} alt={`${LANDING_APP_NAME} - ${HEADER_AFFILIATIONS.join(" - ")}`} />
          </button>
          <Menu
            className="mission-menu"
            mode="inline"
            selectedKeys={[selectedSection]}
            openKeys={openMenuKeys}
            items={menuItems}
            onClick={({ key }) => navigateToSection(key)}
            onOpenChange={changeOpenMenuKeys}
          />
        </nav>
      </Sider>
      <Layout className="mission-main">
        <Header className="mission-header">
          <div className={selectedSection === "overview" ? "mission-header-title mission-header-title-home" : "mission-header-title"}>
            <Title level={1}>{headerTitle}</Title>
            {selectedSection === "overview" ? (
              <div className="mission-header-affiliations" aria-label="Institutional affiliations">
                {HEADER_AFFILIATIONS.map((affiliation) => (
                  <p key={affiliation}>{affiliation}</p>
                ))}
              </div>
            ) : null}
          </div>
          <Space className="topbar-controls" wrap>
            <TimeDropdown now={dashboardNow} />
            <RangeSelector value={range} onChange={onRangeChange} />
            <button
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`theme-toggle-switch ${isDarkMode ? "is-dark" : "is-light"}`}
              type="button"
              onClick={onToggleTheme}
            >
              <span className="theme-toggle-thumb" aria-hidden="true" />
              <span className="theme-toggle-icon">
                <Moon aria-hidden="true" size={16} />
              </span>
              <span className="theme-toggle-icon">
                <Sun aria-hidden="true" size={16} />
              </span>
            </button>
            <Button type="primary" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw aria-hidden="true" size={18} className={isRefreshing ? "spin" : ""} />
              Refresh
            </Button>
          </Space>
        </Header>
        <Content className="mission-content">
          {isNotebookSection ? (
            <NotebookTabPage
              section={selectedSection}
              summary={summary}
              impacts={impacts.impacts}
              solarWind={solarWind}
              magneticField={magneticField}
              kp={kp}
              scales={scales}
              alerts={activeAlerts}
              events={events}
              solarActivity={solarActivity}
              glotec={glotec}
              sourceHealth={sourceHealth}
              activeSubsection={activeSubsection}
              onNavigate={navigateToSection}
            />
          ) : (
            <>
              <section id="overview" className="overview-snapshot-section" aria-labelledby="overview-snapshot-title">
                <div className="snapshot-source-card">
                  <div>
                    <h2 id="overview-snapshot-title">Current Space Weather Conditions</h2>
                  </div>
                  <div className="snapshot-source-meta">
                    <span className="observation-time">Observation Time {formatDateTime(summary.lastUpdated)} UTC</span>
                    <span className="source-meta-copy">Live operational feeds connected</span>
                  </div>
                </div>
                <div className="summary-grid overview-summary-grid" aria-label="Current overview cards">
                  <ConditionPanel summary={summary} onOpen={() => navigateToSection("overview-1-status")} />
                  <MetricPanel
                    icon={Gauge}
                    title="Kp index"
                    value={summary.kp === null ? "Kp --" : `Kp ${summary.kp.toFixed(1)}`}
                    detail={`${summary.gScale} geomagnetic scale`}
                    severity={summary.overallSeverity}
                    onOpen={() => navigateToSection("overview-1-kp")}
                  />
                  <MetricPanel
                    icon={Magnet}
                    title="IMF Bz"
                    value={formatSigned(overviewBz, "nT")}
                    detail="Southward values raise storm potential"
                    severity={overviewBz !== null && overviewBz !== undefined && overviewBz < 0 ? "moderate" : "low"}
                    onOpen={() => navigateToSection("overview-1-imf")}
                  />
                  <MetricPanel
                    icon={AlertTriangle}
                    title="Active alerts"
                    value={String(summary.activeAlerts)}
                    detail="Live alert feed"
                    severity={summary.activeAlerts > 0 ? "moderate" : "low"}
                    onOpen={() => navigateToSection("overview-1-alerts")}
                  />
                </div>
                <OverviewVisualPanels
                  summary={summary}
                  solarActivity={solarActivity}
                  solarWind={solarWind}
                  magneticField={magneticField}
                  kp={kp}
                  onNavigate={navigateToSection}
                />
              </section>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

function OverviewOnePortal({
  summary,
  impacts,
  solarWind,
  magneticField,
  kp,
  scales,
  alerts,
  events,
  solarActivity,
  sourceHealth
}: {
  summary: DashboardSummary;
  impacts: ImpactItem[];
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  scales: ScalesResponse;
  alerts: AlertRecord[];
  events: EventsResponse;
  solarActivity: SolarActivityResponse;
  sourceHealth: SourceHealthResponse;
}) {
  const latestWind = solarWind.data.at(-1);
  const latestField = magneticField.data.at(-1);
  const latestEvent = events.events[0];
  const sourceStatus = sourceHealth.sources.filter((source) => source.status === "healthy").length;
  const gnssImpact = impacts.find((impact) => impact.sector === "GNSS and navigation");
  const sunCards = [
    ["overview-1-xray", "X-ray Flux", solarActivity.xray.currentClass ?? "Flux unavailable", "X-ray flux and current flare class."],
    ["overview-1-flares", "Solar Flares", summary.latestFlare ?? "No major flare", "Recent flare state and flare event records."],
    ["overview-1-sunspots", "Sunspots", "Active regions", "Sunspot and active-region context for flare and CME monitoring."],
    ["overview-1-cme", "Coronal Mass Ejections", latestEvent?.type === "cme" ? latestEvent.title : "CME watch", latestEvent?.summary ?? "Recent CME event records."],
    ["overview-1-imagery", "Solar Imagery", "Latest image", "Daily solar imagery supports quick solar-disk inspection."]
  ];

  return (
    <section id="overview-1" className="overview-one" aria-labelledby="overview-one-title">
      <div className="overview-one-hero">
        <h2 id="overview-one-title">Overview 1</h2>
        <p>
          Experimental grouped view for scanning Sun, solar wind, geomagnetic, ionosphere, and system information from one page.
        </p>
      </div>

      <div className="overview-one-grid">
        <OverviewOneBlock id="overview-1-sun" icon={Sun} title="Sun" eyebrow="Solar activity" span="wide">
          <div className="overview-one-card-grid">
            {sunCards.map(([id, title, value, detail]) => (
              <OverviewOneMiniCard id={id} key={id} title={title} value={value} detail={detail} />
            ))}
          </div>
        </OverviewOneBlock>

        <OverviewOneBlock id="overview-1-solar-wind-field" icon={Waves} title="Solar Wind & IMF" eyebrow="Plasma and IMF" span="wide">
          <div className="overview-one-card-grid three">
            <OverviewOneMiniCard
              id="overview-1-plasma"
              title="Solar Wind Plasma"
              value={formatOptional(latestWind?.speedKmPerSec, "km/s")}
              detail={`${formatOptional(latestWind?.densityPerCc, "/cc", 1)} density, ${formatOptional(latestWind?.temperatureK, "K")} temperature`}
            />
            <OverviewOneMiniCard
              id="overview-1-imf"
              title="IMF Bz + Bt"
              value={`${formatSigned(latestField?.bzGsmNt, "nT")} / ${formatOptional(latestField?.btNt, "nT", 1)}`}
              detail="Bz southward coupling and total magnetic-field strength."
            />
          </div>
        </OverviewOneBlock>

        <OverviewOneBlock id="overview-1-geomagnetic" icon={Magnet} title="Geomagnetic Field" eyebrow="Storm context">
          <OverviewOneFact label="Geomagnetic Activity" value={summary.condition} />
          <OverviewOneFact id="overview-1-kp" label="Kp Index" value={kp.current === null ? "Unavailable" : `Kp ${kp.current.toFixed(2)}`} />
          <OverviewOneFact id="overview-1-dst" label="Dst Index" value="Connected in data layer" />
        </OverviewOneBlock>

        <OverviewOneBlock id="overview-1-tec" icon={Satellite} title="Ionosphere" eyebrow="TEC and navigation">
          <OverviewOneFact label="Ionosphere & TEC" value="Pakistan AOI layer ready" />
          <OverviewOneFact id="overview-1-gnss" label="GNSS Impacts" value={gnssImpact?.level ? severityLabels[gnssImpact.level] : "Monitored"} />
          <p>{gnssImpact?.reason ?? "GNSS positioning, timing, and survey operations are tracked through ionospheric conditions."}</p>
        </OverviewOneBlock>

        <OverviewOneBlock id="overview-1-status" icon={UsersRound} title="Contributors" eyebrow="Credits and references" span="wide">
          <div className="overview-one-card-grid">
            <OverviewOneMiniCard
              id="overview-1-reference"
              title="Scale Page"
              value={`${scales.current.gScale} / ${scales.current.rScale} / ${scales.current.sScale}`}
              detail="G/R/S scale definitions and current status labels."
            />
            <OverviewOneMiniCard
              id="overview-1-contributors"
              title="Contributors"
              value="Project credits"
              detail="Mock credit layout for research, engineering, data, and QA contributors."
            />
            <OverviewOneMiniCard title="Observatory Status" value={summary.freshness} detail={`Updated ${formatDateTime(summary.lastUpdated)} UTC`} />
            <OverviewOneMiniCard id="overview-1-api" title="API Status" value={`${sourceStatus}/${sourceHealth.sources.length} healthy`} detail="Live adapters and proxy health." />
            <OverviewOneMiniCard id="overview-1-data" title="Data Explorer" value="Live tables" detail="Solar wind, IMF, Kp, alerts, events, and source health." />
            <OverviewOneMiniCard id="overview-1-sources" title="Sources & Attribution" value="Live feeds" detail="Operational public data streams used by the portal." />
            <OverviewOneMiniCard id="overview-1-about" title="About" value="GNSS Research Lab" detail="National Center of GIS & Space Applications, IST Islamabad." />
          </div>
        </OverviewOneBlock>
      </div>
    </section>
  );
}

type ObservatoryLayerCard = {
  key: string;
  title: string;
  eyebrow: string;
  icon: typeof Activity;
  image: string;
  value: string;
  detail: string;
  links: Array<{ key: string; label: string; value: string; detail: string }>;
};

function buildObservatoryLayerCards({
  summary,
  impacts,
  solarWind,
  magneticField,
  kp,
  scales,
  alerts,
  events,
  solarActivity,
  glotec,
  sourceHealth
}: {
  summary: DashboardSummary;
  impacts: ImpactItem[];
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  scales: ScalesResponse;
  alerts: AlertRecord[];
  events: EventsResponse;
  solarActivity: SolarActivityResponse;
  glotec: GloTecResponse;
  sourceHealth: SourceHealthResponse;
}): ObservatoryLayerCard[] {
  const latestWind = solarWind.data.at(-1);
  const latestField = magneticField.data.at(-1);
  const gnssImpact = impacts.find((impact) => impact.sector === "GNSS and navigation");
  const radioImpact = impacts.find((impact) => impact.sector === "HF radio communication");
  const healthySources = sourceHealth.sources.filter((source) => source.status === "healthy").length;
  const flareEvents = events.events.filter((event) => event.type === "flare");
  const cmeEvents = events.events.filter((event) => event.type === "cme");
  const xray = solarActivity.xray;
  const regions = solarActivity.regions?.data ?? [];
  const images = solarActivity.images?.images ?? [];

  return [
    {
      key: "layer-sun",
      title: "Sun",
      eyebrow: "Solar activity",
      icon: Sun,
      image: "/landing/solar-flares.svg",
      value: xray?.currentClass ?? summary.latestFlare ?? "Quiet",
      detail: "X-ray flux, flare events, sunspot context, CME watch, and latest solar imagery.",
      links: [
        { key: "overview-1-xray", label: "X-ray Flux", value: xray?.currentClass ?? "Unavailable", detail: "1-8 A and 0.5-4 A flux channels." },
        { key: "overview-1-flares", label: "Solar Flares", value: summary.latestFlare ?? "No major flare", detail: `${flareEvents.length} flare event records in view.` },
        { key: "overview-1-sunspots", label: "Sunspots", value: `${regions.length} records`, detail: "Active-region and sunspot productivity context." },
        { key: "overview-1-cme", label: "Coronal Mass Ejections", value: `${cmeEvents.length} CME records`, detail: "CME event summaries and arrival context." },
        { key: "overview-1-imagery", label: "Solar Imagery", value: images[0]?.label ?? "Latest image", detail: "Latest solar disk imagery for visual inspection." }
      ]
    },
    {
      key: "layer-solar-wind",
      title: "Solar Wind & IMF",
      eyebrow: "Plasma and IMF",
      icon: Waves,
      image: "/landing/solar-wind.svg",
      value: formatOptional(latestWind?.speedKmPerSec, "km/s"),
      detail: "Solar wind speed, density, temperature, and IMF Bz/Bt coupling for storm potential.",
      links: [
        { key: "overview-1-plasma", label: "Solar Wind Plasma", value: formatOptional(latestWind?.densityPerCc, "/cc", 1), detail: "Speed, density, and temperature from upstream plasma." },
        { key: "overview-1-imf", label: "IMF Bz + Bt", value: `${formatSigned(latestField?.bzGsmNt, "nT")} / ${formatOptional(latestField?.btNt, "nT", 1)}`, detail: "Southward Bz and total field strength." }
      ]
    },
    {
      key: "layer-geomagnetic",
      title: "Geomagnetic Field",
      eyebrow: "Storm context",
      icon: Magnet,
      image: "/landing/hero-magnetosphere.svg",
      value: kp.current === null ? "Kp unavailable" : `Kp ${kp.current.toFixed(2)}`,
      detail: "Current geomagnetic condition, Kp index, and Dst storm-intensity placeholder.",
      links: [
        { key: "overview-1-kp", label: "Kp Index", value: kp.current === null ? "Unavailable" : `Kp ${kp.current.toFixed(2)}`, detail: "Planetary K index on a fixed 0 to 9 scale." },
        { key: "overview-1-dst", label: "Dst Index", value: "Data layer ready", detail: "Ring-current storm intensity placeholder." }
      ]
    },
    {
      key: "layer-ionosphere",
      title: "Ionosphere",
      eyebrow: "TEC and navigation",
      icon: Satellite,
      image: "/landing/ionosphere.svg",
      value: gnssImpact?.level ? severityLabels[gnssImpact.level] : "Monitored",
      detail: "TEC awareness and GNSS navigation impacts for positioning, timing, and survey users.",
      links: [
        { key: "overview-1-tec", label: "Ionosphere & TEC", value: glotec.summary.meanTec === null ? "GloTEC ready" : `${glotec.summary.meanTec.toFixed(1)} TECU`, detail: `${glotec.summary.pointCount.toLocaleString()} GloTEC grid points.` },
        { key: "overview-1-gnss", label: "GNSS Impacts", value: gnssImpact?.level ? severityLabels[gnssImpact.level] : "Monitored", detail: gnssImpact?.reason ?? "Navigation and timing risk summary." }
      ]
    },
    {
      key: "layer-system",
      title: "Contributors",
      eyebrow: "Credits and references",
      icon: UsersRound,
      image: "/landing/gnss.svg",
      value: "Credits + sources",
      detail: "Contributor credits, references, source health, attribution, and mission details for the observatory.",
      links: [
        { key: "overview-1-contributors", label: "Contributors", value: "Project credits", detail: "Research, engineering, data, and QA contributor board." },
        { key: "overview-1-reference", label: "Scale Page", value: `${scales.current.gScale} / ${scales.current.rScale} / ${scales.current.sScale}`, detail: "G, S, and R definitions with current scale values." },
        { key: "overview-1-status", label: "Observatory Status", value: summary.freshness, detail: `Updated ${formatDateTime(summary.lastUpdated)} UTC.` },
        { key: "overview-1-api", label: "API Status", value: `${healthySources}/${sourceHealth.sources.length} healthy`, detail: "Live adapters and proxy health." },
        { key: "overview-1-data", label: "Data Explorer", value: "Live tables", detail: "Telemetry, alerts, events, and source records." },
        { key: "overview-1-sources", label: "Sources & Attribution", value: "Live feeds", detail: "Operational public data streams used by the portal." },
        { key: "overview-1-about", label: "About", value: "GNSS Research Lab", detail: "National Center of GIS & Space Applications, IST Islamabad." }
      ]
    }
  ];
}

function OverviewLayerCards({
  onNavigate,
  ...props
}: Parameters<typeof buildObservatoryLayerCards>[0] & { onNavigate: (section: string) => void }) {
  const cards = buildObservatoryLayerCards(props);

  return (
    <section className="layer-overview-section" aria-labelledby="layer-overview-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Layer panel overview</p>
          <h2 id="layer-overview-title">Observatory layers</h2>
        </div>
        <p>Each layer opens a clear page with its related sub-links aligned below.</p>
      </div>
      <div className="layer-card-grid">
        {cards.map((card) => (
          <LayerSummaryCard card={card} key={card.key} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

function LayerSummaryCard({ card, onNavigate }: { card: ObservatoryLayerCard; onNavigate: (section: string) => void }) {
  const Icon = card.icon;

  return (
    <article className="panel layer-summary-card">
      <div className="layer-card-media">
        <img src={card.image} alt="" />
        <span className="layer-card-icon"><Icon aria-hidden="true" size={20} /></span>
      </div>
      <div className="layer-card-body">
        <div className="layer-card-topline">
          <span className="eyebrow">{card.eyebrow}</span>
        </div>
        <h3>{card.title}</h3>
        <strong>{card.value}</strong>
        <p>{card.detail}</p>
        <div className="layer-chip-row" aria-label={`${card.title} sub-links`}>
          {card.links.slice(0, 4).map((link) => (
            <span key={link.key}>{link.label}</span>
          ))}
        </div>
        <Button type="primary" onClick={() => onNavigate(card.key)}>
          View more
        </Button>
      </div>
    </article>
  );
}

function NotebookTabPage({
  section,
  summary,
  impacts,
  solarWind,
  magneticField,
  kp,
  scales,
  alerts,
  events,
  solarActivity,
  glotec,
  sourceHealth,
  activeSubsection,
  onNavigate
}: {
  section: string;
  summary: DashboardSummary;
  impacts: ImpactItem[];
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  scales: ScalesResponse;
  alerts: AlertRecord[];
  events: EventsResponse;
  solarActivity: SolarActivityResponse;
  glotec: GloTecResponse;
  sourceHealth: SourceHealthResponse;
  activeSubsection: string | null;
  onNavigate: (section: string) => void;
}) {
  const latestWind = solarWind.data.at(-1);
  const latestField = magneticField.data.at(-1);
  const latestEvent = events.events[0];
  const gnssImpact = impacts.find((impact) => impact.sector === "GNSS and navigation");
  const radioImpact = impacts.find((impact) => impact.sector === "HF radio communication");
  const healthySources = sourceHealth.sources.filter((source) => source.status === "healthy").length;
  const xray = solarActivity.xray ?? {
    source: "NOAA_SWPC_GOES_XRAY",
    lastUpdated: null,
    freshness: "unavailable" as Freshness,
    currentClass: null,
    currentFluxWm2: null,
    primarySatellite: null,
    data: []
  };
  const layerCards = buildObservatoryLayerCards({
    summary,
    impacts,
    solarWind,
    magneticField,
    kp,
    scales,
    alerts,
    events,
    solarActivity,
    glotec,
    sourceHealth
  });

  const pages: Record<string, {
    eyebrow: string;
    title: string;
    icon: typeof Activity;
    summary: string;
    body: ReactNode;
  }> = {
    "overview-1-xray": {
      eyebrow: "Sun",
      title: "X-ray Flux",
      icon: Sun,
      summary: "X-ray flux shows the current soft X-ray class and measured flux.",
      body: (
        <>
          <XrayFluxProductPanel solarActivity={solarActivity} />
          <div className="overview-one-card-grid three">
            <OverviewOneMiniCard
              title="Current X-ray class"
              value={xray.currentClass ?? "Unavailable"}
              detail="Latest 0.1-0.8 nm flare class derived from X-ray flux."
            />
            <OverviewOneMiniCard
              title="Current X-ray flux"
              value={formatScientific(xray.currentFluxWm2, "W/m2")}
              detail={`Satellite ${xray.primarySatellite ?? "unknown"} measurement.`}
            />
            <OverviewOneMiniCard
              title="X-ray update"
              value={xray.lastUpdated ? `${formatDateTime(xray.lastUpdated)} UTC` : "Unavailable"}
              detail="This tab is limited to X-ray flux, while flare events stay under Solar Flares."
            />
          </div>
        </>
      )
    },
    "overview-1-flares": {
      eyebrow: "Sun",
      title: "Solar Flares",
      icon: Zap,
      summary: "Recent flare context from the live summary and event feed.",
      body: (
        <>
          <OverviewOneMiniCard title="Latest flare" value={summary.latestFlare ?? "No major flare"} detail="Displayed with current R-scale awareness." />
          <OverviewOneMiniCard title="Current X-ray class" value={xray.currentClass ?? "Unavailable"} detail="Flare class context from X-ray flux." />
          <EventSummaryList
            emptyText="No flare events are active in this window."
            events={events.events.filter((event) => event.type === "flare")}
            title="Flare events"
          />
        </>
      )
    },
    "overview-1-sunspots": {
      eyebrow: "Sun",
      title: "Sunspots",
      icon: Sun,
      summary: "Active-region context for flare productivity and Earth-facing solar activity.",
      body: <SunspotCyclePanel solarActivity={solarActivity} />
    },
    "overview-1-cme": {
      eyebrow: "Sun",
      title: "Coronal Mass Ejections",
      icon: Compass,
      summary: "CME entries and linked events describe ejecta speed, direction, and arrival context.",
      body: <EventTimelinePanel events={events} initialFilter="cme" title="CME event timeline" />
    },
    "overview-1-imagery": {
      eyebrow: "Sun",
      title: "Solar Imagery",
      icon: Satellite,
      summary: "Latest available solar imagery supports quick solar disk inspection.",
      body: <SolarImageryGallery solarActivity={solarActivity} />
    },
    "overview-1-plasma": {
      eyebrow: "Solar wind & field",
      title: "Solar Wind Plasma",
      icon: Waves,
      summary: "Plasma speed, density, and temperature from upstream measurements.",
      body: <SolarWindPanel summary={summary} solarWind={solarWind} />
    },
    "overview-1-imf": {
      eyebrow: "Solar wind & field",
      title: "IMF Bz + Bt",
      icon: Magnet,
      summary: "Bz southward coupling and total magnetic-field strength.",
      body: <MagneticFieldPanel magneticField={magneticField} />
    },
    "overview-1-geomagnetic": {
      eyebrow: "Geomagnetic",
      title: "Geomagnetic Activity",
      icon: Magnet,
      summary: "Current condition, Kp activity, and storm-scale context.",
      body: (
        <>
          <ConditionPanel summary={summary} />
          <KpPanel kp={kp} />
        </>
      )
    },
    "overview-1-kp": {
      eyebrow: "Geomagnetic",
      title: "Kp Index",
      icon: BarChart3,
      summary: "Planetary K index trend on the fixed 0 to 9 scientific scale.",
      body: <KpPanel kp={kp} />
    },
    "overview-1-dst": {
      eyebrow: "Geomagnetic",
      title: "Dst Index",
      icon: Gauge,
      summary: "Dst disturbance index placeholder for ring-current storm intensity.",
      body: <OverviewOneMiniCard title="Dst status" value="Connected in data layer" detail="Reserved for live Dst readings when the source is available." />
    },
    "overview-1-tec": {
      eyebrow: "Ionosphere",
      title: "Ionosphere & TEC",
      icon: Satellite,
      summary: "TEC awareness for ionospheric structure and navigation signal delay.",
      body: <GloTecGlobePanel glotec={glotec} />
    },
    "overview-1-gnss": {
      eyebrow: "Ionosphere",
      title: "GNSS Impacts",
      icon: Compass,
      summary: "Navigation and timing risk derived from ionospheric and geomagnetic conditions.",
      body: (
        <ImpactPanel impacts={gnssImpact ? [gnssImpact] : impacts.filter((impact) => impact.sector.includes("GNSS"))} />
      )
    },
    "overview-1-radio": {
      eyebrow: "Radio",
      title: "Radio / HF Conditions",
      icon: Radio,
      summary: "HF conditions are driven by flare radio blackouts and ionospheric state.",
      body: (
        <>
          <OverviewOneMiniCard title="Radio condition" value={radioImpact?.level ? severityLabels[radioImpact.level] : scales.current.rScale} detail={radioImpact?.reason ?? "HF propagation is summarized through flare/radio blackout status."} />
          <ScalesPanel scales={scales} />
        </>
      )
    },
    "overview-1-alerts": {
      eyebrow: "Alerts",
      title: "Active Alerts",
      icon: AlertTriangle,
      summary: "Operational watches, warnings, and alerts currently active.",
      body: <AlertsPanel alerts={alerts} />
    },
    "overview-1-forecasts": {
      eyebrow: "Alerts",
      title: "Space Weather Forecasts",
      icon: Clock,
      summary: "Forecast context using the current G, R, and S scales.",
      body: <ScalesPanel scales={scales} />
    },
    "overview-1-events": {
      eyebrow: "Alerts",
      title: "Event Timeline",
      icon: ListFilter,
      summary: "Event timeline for CME, flare, storm, and SEP context.",
      body: <EventTimelinePanel events={events} />
    },
    "overview-1-reference": {
      eyebrow: "Reference",
      title: "Space Weather Scales",
      icon: Gauge,
      summary: "Reference scale cards for geomagnetic, radio blackout, and radiation storm categories.",
      body: <ScalesPanel scales={scales} />
    },
    "overview-1-glossary": {
      eyebrow: "Glossary",
      title: "Glossary",
      icon: Info,
      summary: "Definitions for the main space-weather and GNSS terms used throughout the observatory.",
      body: <GlossaryPanel />
    },
    "overview-1-contributors": {
      eyebrow: "Contributors",
      title: "Contributors",
      icon: UsersRound,
      summary: "Project credit board for the people, teams, and public data providers behind the observatory.",
      body: <ContributorsPanel />
    },
    "overview-1-status": {
      eyebrow: "System",
      title: "Observatory Status",
      icon: DatabaseZap,
      summary: "Current freshness and operational state for the observatory.",
      body: <OverviewOneMiniCard title="Observatory freshness" value={summary.freshness} detail={`Updated ${formatDateTime(summary.lastUpdated)} UTC`} />
    },
    "overview-1-api": {
      eyebrow: "System",
      title: "API Status",
      icon: DatabaseZap,
      summary: "Health of API adapters and proxied source requests.",
      body: <OverviewOneMiniCard title="Healthy sources" value={`${healthySources}/${sourceHealth.sources.length}`} detail="Live adapters and proxy health." />
    },
    "overview-1-data": {
      eyebrow: "System",
      title: "Data Explorer",
      icon: DatabaseZap,
      summary: "Quick access to recent telemetry tables and event records.",
      body: (
        <>
          <TelemetryTable
            caption="Recent solar wind readings"
            columns={["Time", "Speed", "Density", "Temp"]}
            rows={solarWind.data.slice(-6).map((point) => [
              formatTime(point.timestamp),
              formatOptional(point.speedKmPerSec, "km/s"),
              formatOptional(point.densityPerCc, "/cc", 1),
              formatOptional(point.temperatureK, "K", 0)
            ])}
          />
          <OverviewOneMiniCard title="Latest IMF" value={`${formatSigned(latestField?.bzGsmNt, "nT")} / ${formatOptional(latestField?.btNt, "nT", 1)}`} detail={`${solarWind.data.length} solar wind points in view.`} />
        </>
      )
    },
    "overview-1-sources": {
      eyebrow: "System",
      title: "Sources & Attribution",
      icon: DatabaseZap,
      summary: "Operational live feed attribution.",
      body: <SourceHealthPanel sourceHealth={sourceHealth} />
    },
    "overview-1-about": {
      eyebrow: "System",
      title: "About",
      icon: Satellite,
      summary: "Mission and institutional attribution.",
      body: (
        <div className="overview-one-card-grid three">
          <OverviewOneMiniCard title="GNSS Research Lab" value="Space Weather Observatory" detail="Operational space weather and GNSS awareness dashboard." />
          <OverviewOneMiniCard title="NCGSA" value="National Center of GIS & Space Applications" detail="Research and operational geospatial context." />
          <OverviewOneMiniCard title="Institute" value="IST Islamabad" detail="Institute of Space Technology, Islamabad, Pakistan." />
        </div>
      )
    }
  };

  const layerCard = layerCards.find((card) => card.key === section);
  const page = layerCard
    ? {
        eyebrow: layerCard.eyebrow,
        title: layerCard.title,
        icon: layerCard.icon,
        summary: layerCard.detail,
        body: (
          <LayerDetailPage
            card={layerCard}
            section={section}
            onNavigate={onNavigate}
            summary={summary}
            impacts={impacts}
            solarWind={solarWind}
            magneticField={magneticField}
            kp={kp}
            scales={scales}
            alerts={alerts}
            events={events}
            solarActivity={solarActivity}
            glotec={glotec}
            sourceHealth={sourceHealth}
            activeSubsection={activeSubsection}
          />
        )
      }
    : pages[section] ?? pages["overview-1-xray"];
  const Icon = page.icon;

  return (
    <section className="focused-page notebook-tab-page" aria-labelledby="notebook-tab-title">
      <div className="overview-one-hero notebook-tab-hero">
        <h2 id="notebook-tab-title">
          <Icon aria-hidden="true" size={28} /> {page.title}
        </h2>
        <p>{page.summary}</p>
      </div>
      <div className="focused-grid">
        {page.body}
      </div>
    </section>
  );
}

function LayerDetailPage({
  card,
  section,
  onNavigate,
  summary,
  impacts,
  solarWind,
  magneticField,
  kp,
  scales,
  alerts,
  events,
  solarActivity,
  glotec,
  sourceHealth,
  activeSubsection
}: {
  card: ObservatoryLayerCard;
  section: string;
  onNavigate: (section: string) => void;
  summary: DashboardSummary;
  impacts: ImpactItem[];
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  scales: ScalesResponse;
  alerts: AlertRecord[];
  events: EventsResponse;
  solarActivity: SolarActivityResponse;
  glotec: GloTecResponse;
  sourceHealth: SourceHealthResponse;
  activeSubsection: string | null;
}) {
  const gnssImpact = impacts.find((impact) => impact.sector === "GNSS and navigation");
  const radioImpact = impacts.find((impact) => impact.sector === "HF radio communication");
  const layerSection = (id: string, title: string, body: ReactNode) => (
    <section id={id} className={`layer-detail-section ${activeSubsection === id ? "is-active" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="layer-detail-section-heading">
        <h3 id={`${id}-title`}>{title}</h3>
      </div>
      {body}
    </section>
  );

  const layerBody: Record<string, ReactNode> = {
    "layer-sun": (
      <>
        {layerSection("overview-1-xray", "X-ray Flux", <XrayFluxProductPanel solarActivity={solarActivity} />)}
        {layerSection("overview-1-flares", "Solar Flares", (
          <>
            <OverviewOneMiniCard title="Latest flare" value={summary.latestFlare ?? "No major flare"} detail="Displayed with current R-scale awareness." />
            <EventSummaryList emptyText="No flare events are active in this window." events={events.events.filter((event) => event.type === "flare")} title="Flare events" />
          </>
        ))}
        {layerSection("overview-1-sunspots", "Sunspots", <SunspotCyclePanel solarActivity={solarActivity} />)}
        {layerSection("overview-1-cme", "Coronal Mass Ejections", <EventTimelinePanel events={events} initialFilter="cme" title="CME event timeline" />)}
        {layerSection("overview-1-imagery", "Solar Imagery", <SolarImageryGallery solarActivity={solarActivity} />)}
      </>
    ),
    "layer-solar-wind": (
      <>
        {layerSection("overview-1-plasma", "Solar Wind Plasma", <SolarWindPanel summary={summary} solarWind={solarWind} />)}
        {layerSection("overview-1-imf", "IMF Bz + Bt", <MagneticFieldPanel magneticField={magneticField} />)}
      </>
    ),
    "layer-geomagnetic": (
      <>
        {layerSection("overview-1-kp", "Kp Index", <KpPanel kp={kp} />)}
        {layerSection("overview-1-dst", "Dst Index", <OverviewOneMiniCard title="Dst status" value="Connected in data layer" detail="Reserved for live Dst readings when the source is available." />)}
      </>
    ),
    "layer-ionosphere": (
      <>
        {layerSection("overview-1-tec", "Ionosphere & TEC", <GloTecGlobePanel glotec={glotec} />)}
        {layerSection("overview-1-gnss", "GNSS Impacts", <ImpactPanel impacts={gnssImpact ? [gnssImpact] : impacts.filter((impact) => impact.sector.includes("GNSS"))} />)}
      </>
    ),
    "layer-radio": (
      <>
        <OverviewOneMiniCard title="Radio condition" value={radioImpact?.level ? severityLabels[radioImpact.level] : scales.current.rScale} detail={radioImpact?.reason ?? "HF propagation is summarized through flare/radio blackout status."} />
        <ScalesPanel scales={scales} />
      </>
    ),
    "layer-outlook": (
      <>
        <AlertsPanel alerts={alerts} />
        <ScalesPanel scales={scales} />
        <EventTimelinePanel events={events} />
      </>
    ),
    "layer-reference": <ScalesPanel scales={scales} />,
    "layer-system": (
      <>
        {layerSection("overview-1-contributors", "Contributors", <ContributorsPanel compact />)}
        {layerSection("overview-1-reference", "Scale Page", <ScalesPanel scales={scales} />)}
        {layerSection("overview-1-status", "Observatory Status", <OverviewOneMiniCard title="Observatory freshness" value={summary.freshness} detail={`Updated ${formatDateTime(summary.lastUpdated)} UTC`} />)}
        {layerSection("overview-1-api", "API Status", <OverviewOneMiniCard title="Healthy sources" value={`${sourceHealth.sources.filter((source) => source.status === "healthy").length}/${sourceHealth.sources.length}`} detail="Live adapters and proxy health." />)}
        {layerSection("overview-1-data", "Data Explorer", <TelemetryTable caption="Recent solar wind readings" columns={["Time", "Speed", "Density", "Temp"]} rows={solarWind.data.slice(-6).map((point) => [formatTime(point.timestamp), formatOptional(point.speedKmPerSec, "km/s"), formatOptional(point.densityPerCc, "/cc", 1), formatOptional(point.temperatureK, "K", 0)])} />)}
        {layerSection("overview-1-sources", "Sources & Attribution", <SourceHealthPanel sourceHealth={sourceHealth} />)}
        {layerSection("overview-1-about", "About", <OverviewOneMiniCard title="GNSS Research Lab" value="Space Weather Observatory" detail="Operational space weather and GNSS awareness dashboard." />)}
      </>
    )
  };

  return (
    <>
      {layerBody[section]}
    </>
  );
}

function OverviewVisualPanels({
  summary,
  solarActivity,
  solarWind,
  magneticField,
  kp,
  onNavigate
}: {
  summary: DashboardSummary;
  solarActivity: SolarActivityResponse;
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
  kp: KpResponse;
  onNavigate: (section: string) => void;
}) {
  const xray = solarActivity.xray;
  const oneToEight = xray.data.filter((point) => point.energy === "0.1-0.8nm");
  const halfToFour = xray.data.filter((point) => point.energy === "0.05-0.4nm");
  const latestImage = solarActivity.images.images[0];
  const latestWind = solarWind.data.at(-1);
  const imageObservedAt = latestImage?.lastModified
    ? `${formatDateTime(latestImage.lastModified)} UTC`
    : solarActivity.lastUpdated
      ? `${formatDateTime(solarActivity.lastUpdated)} UTC`
      : "Observation time unavailable";
  const imageSource = "Live imagery";

  return (
    <div className="overview-visual-grid" aria-label="Main dashboard overview visuals">
      <section className="panel overview-visual-panel overview-visual-panel-wide" aria-labelledby="overview-combined-wind-title">
        <div className="overview-visual-heading">
          <div>
            <h3 id="overview-combined-wind-title">Solar Wind All-in-One Monitor</h3>
            <p>
              IMF Bz/Bt, density, speed, and temperature aligned on one time view for fast comparison.
            </p>
          </div>
          <Button type="default" onClick={() => onNavigate("layer-solar-wind")}>Open Solar Wind</Button>
        </div>
        <SolarWindCombinedChart solarWind={solarWind} magneticField={magneticField} />
      </section>

      <section className="panel overview-visual-panel overview-visual-panel-wide" aria-labelledby="overview-xray-title">
        <div className="overview-visual-heading">
          <div>
            <p className="eyebrow">Solar activity</p>
            <h3 id="overview-xray-title">X-ray flux</h3>
            <p>{xray.currentClass ?? summary.latestFlare ?? "Quiet"} · {formatScientific(xray.currentFluxWm2, "W/m2")}</p>
          </div>
          <Button type="default" onClick={() => onNavigate("overview-1-xray")}>Open X-ray Flux</Button>
        </div>
        <GoesXrayFluxChart oneToEight={oneToEight} halfToFour={halfToFour} primarySatellite={xray.primarySatellite === null ? null : String(xray.primarySatellite)} />
      </section>

      <section className="panel overview-visual-panel" aria-labelledby="overview-kp-title">
        <div className="overview-visual-heading">
          <div>
            <p className="eyebrow">Geomagnetic</p>
            <h3 id="overview-kp-title">Kp Index Trend</h3>
            <p>{summary.kp === null ? "Kp unavailable" : `Current Kp ${summary.kp.toFixed(1)}`} · {summary.gScale}</p>
          </div>
          <Button type="default" onClick={() => onNavigate("overview-1-kp")}>Open Kp</Button>
        </div>
        <KpBars points={kp.data.slice(-18)} />
      </section>

      <section className="panel overview-visual-panel" aria-labelledby="overview-solar-image-title">
        <div className="overview-visual-heading">
          <div>
            <p className="eyebrow">Solar imagery</p>
            <h3 id="overview-solar-image-title">{latestImage?.label ?? "Latest solar image"}</h3>
            <p>{latestImage?.wavelength ?? "Solar imagery"} visual context for active regions.</p>
          </div>
          <Button type="default" onClick={() => onNavigate("overview-1-imagery")}>Open Images</Button>
        </div>
        <figure className="overview-solar-image">
          {latestImage ? <img src={latestImage.url} alt={latestImage.label} /> : <img src="/landing/solar-flares.svg" alt="Solar activity illustration" />}
          <figcaption>
            <span className="solar-caption-title">
              <strong>{latestImage?.label ?? "Solar map"}</strong>
              <span>{latestImage?.wavelength ?? "Solar imagery"} visual context for active regions.</span>
            </span>
            <span className="solar-caption-meta">
              <span>
                <strong>Observed</strong>
                {imageObservedAt}
              </span>
              <span>
                <strong>Source</strong>
                {latestImage ? (
                  <a href={latestImage.url} target="_blank" rel="noreferrer">
                    {imageSource}
                  </a>
                ) : (
                  imageSource
                )}
              </span>
            </span>
          </figcaption>
        </figure>
      </section>

      <section className="panel overview-visual-panel overview-visual-panel-wide" aria-labelledby="overview-wind-title">
        <div className="overview-visual-heading">
          <div>
            <p className="eyebrow">Solar Wind And Field</p>
            <h3 id="overview-wind-title">Upstream Plasma Trend</h3>
            <p>{formatOptional(latestWind?.speedKmPerSec ?? summary.solarWindSpeed, "km/s")} speed - {formatOptional(latestWind?.densityPerCc, "/cc", 1)} density</p>
          </div>
          <Button type="default" onClick={() => onNavigate("overview-1-plasma")}>Open Solar Wind</Button>
        </div>
        <LineChart
          ariaLabel="Overview solar wind speed and density chart"
          series={[
            { label: "Speed", values: solarWind.data.map((point) => point.speedKmPerSec), className: "speed-line" },
            { label: "Density", values: solarWind.data.map((point) => point.densityPerCc), className: "density-line" }
          ]}
        />
      </section>
    </div>
  );
}

function SolarWindCombinedChart({
  solarWind,
  magneticField
}: {
  solarWind: SolarWindResponse;
  magneticField: MagneticFieldResponse;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dataMode, setDataMode] = useState<"live" | "past">("live");
  const [zoomLevel, setZoomLevel] = useState(1);
  const baseWindow = dataMode === "live" ? 360 : 720;
  const visibleLength = Math.max(24, Math.ceil(baseWindow / zoomLevel));
  const selectWindow = <T,>(points: T[]) => {
    if (dataMode === "past" && points.length > visibleLength) {
      const end = Math.max(visibleLength, points.length - visibleLength);
      return points.slice(Math.max(0, end - visibleLength), end);
    }
    return points.slice(-visibleLength);
  };
  const plasmaPoints = selectWindow(solarWind.data);
  const fieldPoints = selectWindow(magneticField.data);
  const maxLength = Math.max(plasmaPoints.length, fieldPoints.length);
  const latestWind = plasmaPoints.at(-1);
  const latestField = fieldPoints.at(-1);
  const canZoomIn = zoomLevel < 8 && maxLength > 36;
  const canZoomOut = zoomLevel > 1;
  const lanes = [
    {
      key: "imf",
      title: "IMF GSM",
      unit: "nT",
      height: 118,
      series: [
        { label: "Bt", color: "#e5e7eb", values: fieldPoints.map((point) => point.btNt) },
        { label: "Bz", color: "#ef4444", values: fieldPoints.map((point) => point.bzGsmNt) }
      ],
      centerZero: true
    },
    {
      key: "density",
      title: "Density",
      unit: "/cm3",
      height: 92,
      series: [
        { label: "Density", color: "#f97316", values: plasmaPoints.map((point) => point.densityPerCc) }
      ]
    },
    {
      key: "speed",
      title: "Speed",
      unit: "km/s",
      height: 92,
      series: [
        { label: "Speed", color: "#facc15", values: plasmaPoints.map((point) => point.speedKmPerSec) }
      ]
    },
    {
      key: "temperature",
      title: "Temperature",
      unit: "K",
      height: 92,
      series: [
        { label: "Temp", color: "#22c55e", values: plasmaPoints.map((point) => point.temperatureK) }
      ]
    }
  ];
  const chartWidth = 1000;
  const leftPad = 78;
  const rightPad = 26;
  const rowGap = 16;
  const totalHeight = lanes.reduce((sum, lane) => sum + lane.height, 0) + rowGap * (lanes.length - 1);
  let offsetY = 0;
  const activeIndex = hoverIndex ?? Math.max(maxLength - 1, 0);
  const activeX = maxLength > 1
    ? leftPad + (activeIndex / Math.max(maxLength - 1, 1)) * (chartWidth - leftPad - rightPad)
    : leftPad;

  const getDomain = (values: Array<number | null>, centerZero?: boolean) => {
    const numericValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (!numericValues.length) return { min: 0, max: 1 };
    const maxAbs = Math.max(...numericValues.map(Math.abs), 1);
    return {
      min: centerZero ? -maxAbs : Math.min(...numericValues),
      max: centerZero ? maxAbs : Math.max(...numericValues)
    };
  };

  const getAlignedValue = (values: Array<number | null>, index: number) => {
    const offset = maxLength - values.length;
    const value = values[index - offset];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };

  const getAlignedPoint = <T,>(points: T[], index: number) => {
    const offset = maxLength - points.length;
    return points[index - offset] ?? null;
  };

  const yForValue = (value: number, laneHeight: number, min: number, max: number) => {
    const span = max - min || 1;
    const innerPad = 18;
    return innerPad + (1 - (value - min) / span) * (laneHeight - innerPad * 2);
  };

  const makePath = (values: Array<number | null>, laneHeight: number, centerZero?: boolean) => {
    const numericValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (numericValues.length < 2 || maxLength < 2) return "";
    const { min, max } = getDomain(values, centerZero);
    const offset = maxLength - values.length;
    return values
      .map((value, index) => {
        if (typeof value !== "number" || !Number.isFinite(value)) return "";
        const alignedIndex = index + offset;
        const x = leftPad + (alignedIndex / Math.max(maxLength - 1, 1)) * (chartWidth - leftPad - rightPad);
        const y = yForValue(value, laneHeight, min, max);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  };

  const latestTime = latestWind?.timestamp ?? latestField?.timestamp ?? solarWind.lastUpdated ?? magneticField.lastUpdated;
  const earliestTime = plasmaPoints[0]?.timestamp ?? fieldPoints[0]?.timestamp ?? null;
  const activeWind = getAlignedPoint(plasmaPoints, activeIndex);
  const activeField = getAlignedPoint(fieldPoints, activeIndex);
  const activeTime = activeWind?.timestamp ?? activeField?.timestamp ?? latestTime;
  const activePercent = maxLength > 1 ? ((activeX - leftPad) / (chartWidth - leftPad - rightPad)) * 100 : 100;

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (maxLength < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * chartWidth;
    const unclampedIndex = Math.round(((relativeX - leftPad) / (chartWidth - leftPad - rightPad)) * (maxLength - 1));
    setHoverIndex(Math.max(0, Math.min(maxLength - 1, unclampedIndex)));
  };

  const handleKeyboardMove = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || maxLength < 2) return;
    event.preventDefault();
    if (event.key === "Home") {
      setHoverIndex(0);
      return;
    }
    if (event.key === "End") {
      setHoverIndex(maxLength - 1);
      return;
    }
    const step = event.key === "ArrowLeft" ? -1 : 1;
    setHoverIndex((current) => Math.max(0, Math.min(maxLength - 1, (current ?? activeIndex) + step)));
  };

  return (
    <div className="combined-wind-chart" aria-label="Interactive all-in-one solar wind and IMF overview chart">
      <div className="combined-wind-chart-top">
        <span>{maxLength.toLocaleString()} aligned samples</span>
        <span>Hover or tap the plot to inspect aligned values</span>
        <span>
          {earliestTime && latestTime
            ? `${dataMode === "past" ? "Past" : "Live"} window ${formatDateTime(earliestTime)} - ${formatDateTime(latestTime)} UTC`
            : "Time window unavailable"}
        </span>
      </div>
      <div className="combined-wind-controls">
        <div className="combined-mode-toggle" aria-label="Solar wind data window">
          <button
            type="button"
            className={dataMode === "live" ? "is-active" : ""}
            onClick={() => {
              setDataMode("live");
              setHoverIndex(null);
            }}
          >
            Live
          </button>
          <button
            type="button"
            className={dataMode === "past" ? "is-active" : ""}
            onClick={() => {
              setDataMode("past");
              setHoverIndex(null);
            }}
          >
            Past
          </button>
        </div>
        <ChartZoomControls
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          onZoomIn={() => {
            setZoomLevel((level) => Math.min(8, level * 2));
            setHoverIndex(null);
          }}
          onZoomOut={() => {
            setZoomLevel((level) => Math.max(1, Math.floor(level / 2)));
            setHoverIndex(null);
          }}
          onReset={() => {
            setZoomLevel(1);
            setHoverIndex(null);
          }}
          label={`${maxLength.toLocaleString()} visible points`}
        />
      </div>
      <div className="combined-hover-readout" aria-live="polite">
        <strong>{activeTime ? `${formatDateTime(activeTime)} UTC` : "Selected sample"}</strong>
        <span><i className="legend-bt" />Bt {formatOptional(activeField?.btNt, "nT", 1)}</span>
        <span><i className="legend-bz" />Bz {formatSigned(activeField?.bzGsmNt, "nT")}</span>
        <span><i className="legend-density" />Density {formatOptional(activeWind?.densityPerCc, "/cm3", 1)}</span>
        <span><i className="legend-speed" />Speed {formatOptional(activeWind?.speedKmPerSec, "km/s", 0)}</span>
        <span><i className="legend-temp" />Temp {formatOptional(activeWind?.temperatureK, "K", 0)}</span>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${totalHeight}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Move across the chart to inspect aligned IMF, density, speed, and temperature values"
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        onKeyDown={handleKeyboardMove}
      >
        <defs>
          {lanes.map((lane) => (
            <clipPath key={lane.key} id={`combined-lane-clip-${lane.key}`}>
              <rect x={leftPad} y="2" width={chartWidth - leftPad - rightPad} height={lane.height - 4} rx="3" />
            </clipPath>
          ))}
        </defs>
        <rect
          x="0"
          y="0"
          width={chartWidth}
          height={totalHeight}
          fill="transparent"
          className="combined-hit-area"
        />
        {lanes.map((lane, laneIndex) => {
          const y = offsetY;
          offsetY += lane.height + rowGap;
          const numericValues = lane.series
            .flatMap((line) => line.values)
            .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
          const laneDomains = lane.series.map((line) => ({ label: line.label, ...getDomain(line.values, lane.centerZero) }));
          const min = numericValues.length ? Math.min(...numericValues) : 0;
          const max = numericValues.length ? Math.max(...numericValues) : 0;
          const zeroY = lane.centerZero
            ? y + 12 + (lane.height - 24) / 2
            : null;
          return (
            <g key={lane.key} transform={`translate(0 ${y})`}>
              <rect x="0" y="0" width={chartWidth} height={lane.height} rx="4" className="combined-lane-bg" />
              <text x="14" y="26" className="combined-lane-title">{lane.title}</text>
              <text x="14" y="45" className="combined-lane-unit">{lane.unit}</text>
              {[0.25, 0.5, 0.75].map((tick) => (
                <line
                  key={tick}
                  x1={leftPad}
                  x2={chartWidth - rightPad}
                  y1={tick * lane.height}
                  y2={tick * lane.height}
                  className="combined-grid-line"
                />
              ))}
              {laneIndex > 0 ? <line x1={0} x2={chartWidth} y1={-rowGap / 2} y2={-rowGap / 2} className="combined-section-line" /> : null}
              {zeroY ? <line x1={leftPad} x2={chartWidth - rightPad} y1={zeroY - y} y2={zeroY - y} className="combined-zero-line" /> : null}
              <text x={chartWidth - rightPad - 72} y="22" className="combined-range-label">
                {formatCompactNumber(min)} - {formatCompactNumber(max)}
              </text>
              <g clipPath={`url(#combined-lane-clip-${lane.key})`}>
                {lane.series.map((line) => (
                  <path
                    key={line.label}
                    d={makePath(line.values, lane.height, lane.centerZero)}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={lane.key === "imf" && line.label === "Bt" ? 1.65 : 2.05}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="combined-data-line"
                  />
                ))}
                <line x1={activeX} x2={activeX} y1={2} y2={lane.height - 2} className="combined-hover-line" />
                {lane.series.map((line) => {
                  const value = getAlignedValue(line.values, activeIndex);
                  if (value === null) return null;
                  const domain = laneDomains.find((item) => item.label === line.label) ?? getDomain(line.values, lane.centerZero);
                  return (
                    <circle
                      key={`${line.label}-active`}
                      cx={activeX}
                      cy={yForValue(value, lane.height, domain.min, domain.max)}
                      r="4"
                      className="combined-active-dot"
                      fill={line.color}
                    />
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
      <div
        className="combined-hover-tooltip"
        style={{ "--tooltip-x": `${activePercent}%` } as CSSProperties}
        aria-hidden="true"
      >
        <strong>{activeTime ? `${formatDateTime(activeTime)} UTC` : "Selected sample"}</strong>
        <span>Bt {formatOptional(activeField?.btNt, "nT", 1)} · Bz {formatSigned(activeField?.bzGsmNt, "nT")}</span>
        <span>Density {formatOptional(activeWind?.densityPerCc, "/cm3", 1)}</span>
        <span>Speed {formatOptional(activeWind?.speedKmPerSec, "km/s", 0)}</span>
        <span>Temp {formatOptional(activeWind?.temperatureK, "K", 0)}</span>
      </div>
      <div className="combined-wind-footer">
        <span><i className="legend-bt" />Bt {formatOptional(latestField?.btNt, "nT", 1)}</span>
        <span><i className="legend-bz" />Bz {formatSigned(latestField?.bzGsmNt, "nT")}</span>
        <span><i className="legend-density" />Density {formatOptional(latestWind?.densityPerCc, "/cm3", 1)}</span>
        <span><i className="legend-speed" />Speed {formatOptional(latestWind?.speedKmPerSec, "km/s", 0)}</span>
        <span><i className="legend-temp" />Temp {formatOptional(latestWind?.temperatureK, "K", 0)}</span>
      </div>
    </div>
  );
}

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 100000) return value.toExponential(1);
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function GloTecGlobePanel({ glotec }: { glotec: GloTecResponse }) {
  const [rotation, setRotation] = useState(-24);
  const [dragState, setDragState] = useState<{ startX: number; startRotation: number } | null>(null);
  const topPoints = [...glotec.points].sort((left, right) => right.tec - left.tec).slice(0, 4);
  const plottedPoints = useMemo(() => {
    const source = glotec.points.length > 320 ? glotec.points.filter((_point, index) => index % Math.ceil(glotec.points.length / 320) === 0) : glotec.points;
    return source
      .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
      .map((point) => {
        const latitude = (point.latitude * Math.PI) / 180;
        const longitude = (point.longitude * Math.PI) / 180;
        const x = Math.cos(latitude) * Math.sin(longitude);
        const y = -Math.sin(latitude);
        const z = Math.cos(latitude) * Math.cos(longitude);
        return { ...point, x, y, z };
      });
  }, [glotec.points]);
  const isDragging = dragState !== null;
  const globeStyle = { "--globe-rotate-y": `${rotation}deg` } as CSSProperties;
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({ startX: event.clientX, startRotation: rotation });
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;
    setRotation(dragState.startRotation + (event.clientX - dragState.startX) * 0.35);
  };
  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragState(null);
  };

  return (
    <section className="panel glotec-panel" aria-labelledby="glotec-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live TEC Globe</p>
          <h2 id="glotec-title">TEC On Globe</h2>
        </div>
        <FreshnessBadge freshness={glotec.freshness} />
      </div>
      <div className="glotec-layout">
        <div>
          <div className="glotec-meta">
            <strong>{glotec.lastUpdated ? `${formatDateTime(glotec.lastUpdated)} UTC` : "Latest GloTEC unavailable"}</strong>
            <span>{glotec.summary.pointCount.toLocaleString()} grid points</span>
          </div>
          <div
            className={`glotec-globe ${isDragging ? "is-dragging" : ""}`}
            role="img"
            aria-label="Interactive rotating GloTEC total electron content globe visualization"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div className="tec-globe-scene">
              <div className="tec-globe-shadow" />
              <div className="tec-globe-orbit" aria-hidden="true" />
              <div className="tec-globe-shell" style={globeStyle}>
                <div className="tec-globe-sphere" />
                <div className="tec-globe-grid" aria-hidden="true">
                  {[0, 30, 60, 90, 120, 150].map((rotation) => (
                    <span className="tec-meridian" style={{ "--rotation": `${rotation}deg` } as CSSProperties} key={`meridian-${rotation}`} />
                  ))}
                  {[-48, -24, 0, 24, 48].map((latitude) => (
                    <span
                      className="tec-parallel"
                      style={{
                        "--parallel-top": `${50 - latitude * 0.82}%`,
                        "--parallel-width": `${Math.max(34, Math.cos((latitude * Math.PI) / 180) * 84)}%`
                      } as CSSProperties}
                      key={`parallel-${latitude}`}
                    />
                  ))}
                </div>
                <div className="tec-point-layer">
                  {plottedPoints.map((point, index) => (
                    <span
                      className="tec-point"
                      key={`${point.latitude}-${point.longitude}-${index}`}
                      style={{
                        "--x": point.x.toFixed(4),
                        "--y": point.y.toFixed(4),
                        "--z": point.z.toFixed(4),
                        "--tec-color": tecColor(point.tec),
                        "--point-size": `${point.tec >= 60 ? 7 : point.tec >= 35 ? 6 : 5}px`
                      } as CSSProperties}
                      title={`${point.tec.toFixed(1)} TECU at ${point.latitude.toFixed(1)}°, ${point.longitude.toFixed(1)}°`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="glotec-scale" aria-label="TEC color scale">
            <span>Low</span>
            <i />
            <span>High</span>
          </div>
        </div>
        <div className="glotec-side">
          <div className="overview-one-card-grid three glotec-stat-grid">
            <OverviewOneMiniCard title="Mean TEC" value={formatOptional(glotec.summary.meanTec, "TECU", 1)} detail="Average total electron content in the latest grid." />
            <OverviewOneMiniCard title="Max TEC" value={formatOptional(glotec.summary.maxTec, "TECU", 1)} detail="Highest total electron content in the current product." />
            <OverviewOneMiniCard title="Observed coverage" value={glotec.summary.observedCoveragePercent === null ? "Unavailable" : `${glotec.summary.observedCoveragePercent}%`} detail="Quality flag 0 points in the live grid." />
          </div>
          <section className="glotec-impact-list" aria-labelledby="glotec-impact-title">
            <h3 id="glotec-impact-title">Highest TEC regions</h3>
            {topPoints.length > 0 ? topPoints.map((point) => (
              <article key={`${point.latitude}-${point.longitude}-${point.tec}`}>
                <strong>{formatOptional(point.tec, "TECU", 1)}</strong>
                <span>{point.latitude.toFixed(1)}°, {point.longitude.toFixed(1)}°</span>
                <small>Anomaly {formatSigned(point.anomaly, "TECU")} · quality flag {point.qualityFlag ?? "n/a"}</small>
              </article>
            )) : <p className="instrument-note">{glotec.errorMessage ?? "GloTEC points are unavailable right now."}</p>}
          </section>
        </div>
      </div>
    </section>
  );
}

function tecColor(tec: number): string {
  if (tec >= 60) return "#fb7185";
  if (tec >= 45) return "#f59e0b";
  if (tec >= 28) return "#84cc16";
  if (tec >= 14) return "#34d399";
  return "#38bdf8";
}

function SolarImageryGallery({ solarActivity }: { solarActivity: SolarActivityResponse }) {
  const featuredImage =
    solarActivity.images.images.find((image) => image.label.toLowerCase().includes("171")) ??
    solarActivity.images.images[0];
  const observedAt = featuredImage?.lastModified
    ? `${formatDateTime(featuredImage.lastModified)} UTC`
    : solarActivity.lastUpdated
      ? `${formatDateTime(solarActivity.lastUpdated)} UTC`
      : "Latest available";
  const featuredSource = "Live imagery";
  const imageryCards = [
    {
      title: "HMI Intensity",
      subtitle: "Photosphere continuum",
      imageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg",
    sourceLabel: "HMI",
      referenceUrl: "https://sdo.gsfc.nasa.gov/data/",
      detail: "Visible-light disk view for sunspot structure and photospheric context."
    },
    {
      title: "HMI Magnetogram",
      subtitle: "Magnetic field",
      imageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIB.jpg",
    sourceLabel: "HMI",
      referenceUrl: "https://hmi.stanford.edu/",
      detail: "Line-of-sight magnetic-field map for active-region polarity."
    },
    {
      title: "Coronal Holes",
      subtitle: "AIA 211",
      imageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0211.jpg",
    sourceLabel: "AIA",
      referenceUrl: "https://sdo.gsfc.nasa.gov/data/",
      detail: "Dark coronal-hole regions can indicate high-speed solar-wind sources."
    },
    {
      title: "AIA 131",
      subtitle: "Hot flare plasma",
      imageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0131.jpg",
    sourceLabel: "AIA",
      referenceUrl: "https://svs.gsfc.nasa.gov/3979/",
      detail: "Extreme ultraviolet channel useful for flare-temperature structures."
    },
    {
      title: "AIA 304",
      subtitle: "Chromosphere",
      imageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg",
    sourceLabel: "AIA",
      referenceUrl: "https://www.spaceweather.gov/products/goes-solar-ultraviolet-imager-suvi",
      detail: "304 Angstrom view highlights prominences and lower-corona structure."
    }
  ];

  return (
    <section className="panel solar-imagery-gallery" aria-labelledby="solar-imagery-gallery-title">
      {featuredImage ? (
        <article className="solar-imagery-feature" aria-label={`${featuredImage.label} featured solar imagery`}>
          <div className="solar-imagery-feature-copy">
            <div>
              <p className="eyebrow">Solar imagery</p>
              <h2>{featuredImage.label}</h2>
              <p>{featuredImage.wavelength} visual context for active regions.</p>
            </div>
            <a
              className="ghost-button compact"
              href="https://sdo.gsfc.nasa.gov/data/"
              target="_blank"
              rel="noreferrer"
            >
              Open Images
            </a>
          </div>
          <figure className="solar-imagery-feature-frame">
            <img src={featuredImage.url} alt={`${featuredImage.label} latest solar disk`} />
            <figcaption>
              <strong>{featuredImage.label}</strong>
              <span>{featuredImage.wavelength} visual context for active regions.</span>
              <span className="solar-imagery-feature-pills">
                <span>
                  <strong>Observed</strong>
                  {observedAt}
                </span>
                <span>
                  <strong>Source</strong>
                  <a href="https://sdo.gsfc.nasa.gov/data/" target="_blank" rel="noreferrer">
                    {featuredSource}
                  </a>
                </span>
              </span>
            </figcaption>
          </figure>
        </article>
      ) : null}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Current solar imagery</p>
          <h2 id="solar-imagery-gallery-title">Recent Sun Views</h2>
        </div>
        <span className="source-tag">{featuredImage?.label ?? "Solar image"} live references</span>
      </div>
      <div className="solar-imagery-grid">
        {imageryCards.map((card) => (
          <a className="solar-imagery-card" href={card.referenceUrl} key={card.title} target="_blank" rel="noreferrer">
            <span className="solar-imagery-thumb">
              <img src={card.imageUrl} alt={`${card.sourceLabel} latest ${card.title} solar image`} loading="eager" />
            </span>
            <span className="solar-imagery-content">
              <span className="solar-imagery-kicker">{card.sourceLabel}</span>
              <strong>{card.title}</strong>
              <span>{card.subtitle}</span>
              <small>{card.detail}</small>
              <span className="solar-imagery-meta">
                <span>
                  <strong>Observed</strong>
                  {observedAt}
                </span>
                <span>
                  <strong>Source</strong>
                  {card.sourceLabel}
                </span>
              </span>
              <em>
                Open reference
                <ExternalLink aria-hidden="true" size={14} />
              </em>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SunspotCyclePanel({ solarActivity }: { solarActivity: SolarActivityResponse }) {
  const observed = solarActivity.solarCycle?.observed ?? [];
  const predicted = solarActivity.solarCycle?.predicted ?? [];
  const recentObserved = observed.filter((point) => Number(point.month.slice(0, 4)) >= 2015);
  const recentPredicted = predicted.filter((point) => Number(point.month.slice(0, 4)) >= 2026);
  const chartData = [...recentObserved.map((point) => ({
    month: point.month,
    observed: point.ssn,
    smoothed: point.smoothedSsn,
    predicted: null,
    low: null,
    high: null,
    low75: null,
    high75: null
  })), ...recentPredicted.map((point) => ({
    month: point.month,
    observed: null,
    smoothed: null,
    predicted: point.predictedSsn,
    low: point.lowSsn,
    high: point.highSsn,
    low75: point.low75Ssn,
    high75: point.high75Ssn
  }))].sort((left, right) => left.month.localeCompare(right.month));
  const [zoomWindow, setZoomWindow] = useState<{ start: number; end: number } | null>(null);
  const visibleData = zoomWindow ? chartData.slice(zoomWindow.start, zoomWindow.end + 1) : chartData;
  const isZoomed = zoomWindow !== null;
  const latestObserved = [...observed].reverse().find((point) => point.ssn !== null);
  const latestSmoothed = [...observed].reverse().find((point) => point.smoothedSsn !== null);
  const firstPrediction = predicted.find((point) => point.predictedSsn !== null);
  const handleWheelZoom = (event: WheelEvent<HTMLDivElement>) => {
    if (chartData.length < 4) return;

    event.preventDefault();
    const currentStart = zoomWindow?.start ?? 0;
    const currentEnd = zoomWindow?.end ?? chartData.length - 1;
    const currentSize = currentEnd - currentStart + 1;
    const direction = event.deltaY > 0 ? 1 : -1;
    const nextSize = Math.round(direction > 0 ? currentSize * 1.25 : currentSize * 0.75);
    const clampedSize = Math.min(chartData.length, Math.max(12, nextSize));
    const rect = event.currentTarget.getBoundingClientRect();
    const cursorRatio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
    const cursorIndex = currentStart + Math.round(Math.max(0, Math.min(1, cursorRatio)) * Math.max(0, currentSize - 1));
    let nextStart = Math.round(cursorIndex - clampedSize * Math.max(0, Math.min(1, cursorRatio)));
    nextStart = Math.max(0, Math.min(chartData.length - clampedSize, nextStart));
    const nextEnd = nextStart + clampedSize - 1;

    setZoomWindow(clampedSize >= chartData.length ? null : { start: nextStart, end: nextEnd });
  };

  return (
    <section className="panel sunspot-cycle-panel" aria-labelledby="sunspot-cycle-title">
      <div className="section-heading">
        <div>
          <h2 id="sunspot-cycle-title">Solar Cycle Sunspot Number Progression</h2>
          <p>Observed monthly sunspot numbers and Solar Cycle 25 prediction ranges.</p>
        </div>
        <FreshnessBadge freshness={solarActivity.solarCycle?.freshness ?? "unavailable"} />
      </div>
      <div className="overview-one-card-grid three">
        <OverviewOneMiniCard title="Latest monthly SSN" value={latestObserved?.ssn === null || latestObserved?.ssn === undefined ? "Unavailable" : latestObserved.ssn.toFixed(1)} detail={latestObserved ? `Observed ${formatSolarCycleMonth(latestObserved.month)}` : "Monthly sunspot data pending."} />
        <OverviewOneMiniCard title="Smoothed SSN" value={latestSmoothed?.smoothedSsn === null || latestSmoothed?.smoothedSsn === undefined ? "Unavailable" : latestSmoothed.smoothedSsn.toFixed(1)} detail={latestSmoothed ? `Smoothed through ${formatSolarCycleMonth(latestSmoothed.month)}` : "Smoothed value pending."} />
        <OverviewOneMiniCard title="Prediction start" value={firstPrediction?.predictedSsn === null || firstPrediction?.predictedSsn === undefined ? "Unavailable" : firstPrediction.predictedSsn.toFixed(1)} detail={firstPrediction ? `Forecast from ${formatSolarCycleMonth(firstPrediction.month)}` : "Prediction pending."} />
      </div>
      <div className="sunspot-chart-actions">
        <span>{isZoomed ? `${visibleData.length} months in view` : "Scroll on chart to zoom"}</span>
        <button type="button" onClick={() => setZoomWindow(null)} disabled={!isZoomed}>
          Reset zoom
        </button>
      </div>
      <div
        className="sunspot-cycle-chart"
        role="img"
        aria-label="Solar cycle sunspot number chart with observed values and predicted range. Use mouse wheel to zoom in and out."
        onWheel={handleWheelZoom}
      >
        <ResponsiveContainer width="100%" height={420}>
          <RechartsAreaChart data={visibleData} margin={{ top: 20, right: 26, bottom: 40, left: 12 }}>
            <CartesianGrid stroke="var(--sunspot-grid-color, rgba(148, 163, 184, 0.22))" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              minTickGap={30}
              tick={{ fill: "currentColor", fontSize: 11 }}
              tickFormatter={(value) => String(value).slice(0, 4)}
              label={{ value: "Year", position: "insideBottom", offset: -22, fill: "currentColor", fontSize: 12 }}
            />
            <YAxis
              width={54}
              domain={[0, "dataMax + 20"]}
              tick={{ fill: "currentColor", fontSize: 11 }}
              label={{ value: "Sunspot Number", angle: -90, position: "insideLeft", fill: "currentColor", fontSize: 12 }}
            />
            <RechartsTooltip content={<SunspotCycleTooltip />} cursor={{ stroke: "rgba(56, 189, 248, 0.45)", strokeWidth: 1 }} />
            <Area dataKey="high75" stackId="range75" stroke="none" fill="var(--sunspot-band-wide, rgba(236, 72, 153, 0.18))" connectNulls isAnimationActive={false} />
            <Area dataKey="low75" stackId="range75" stroke="none" fill="var(--sunspot-band-mask, rgba(4, 8, 18, 0.9))" connectNulls isAnimationActive={false} />
            <Area dataKey="high" stackId="range50" stroke="none" fill="var(--sunspot-band-narrow, rgba(168, 85, 247, 0.2))" connectNulls isAnimationActive={false} />
            <Area dataKey="low" stackId="range50" stroke="none" fill="var(--sunspot-band-mask, rgba(4, 8, 18, 0.9))" connectNulls isAnimationActive={false} />
            <Line dataKey="observed" name="Monthly SSN" stroke="var(--sunspot-observed, #334155)" strokeWidth={2} dot={{ r: 3, fill: "var(--sunspot-observed, #334155)" }} connectNulls isAnimationActive={false} />
            <Line dataKey="smoothed" name="Smoothed SSN" stroke="var(--sunspot-smoothed, #7c3aed)" strokeWidth={3} dot={false} connectNulls isAnimationActive={false} />
            <Line dataKey="predicted" name="Predicted SSN" stroke="var(--sunspot-predicted, #a21caf)" strokeWidth={3} dot={false} connectNulls isAnimationActive={false} />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
      <div className="sunspot-cycle-legend">
        <span><i className="dot-observed" /> Monthly SSN</span>
        <span><i className="dot-smoothed" /> Smoothed SSN</span>
        <span><i className="dot-predicted" /> Predicted SSN</span>
        <span><i className="band-predicted" /> Prediction range</span>
      </div>
    </section>
  );
}

function SunspotCycleTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: Record<string, unknown> }> }) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="xray-tooltip">
      <strong>{formatSolarCycleMonth(String(row.month ?? ""))}</strong>
      <span>Monthly SSN: {formatChartNumber(row.observed)}</span>
      <span>Smoothed SSN: {formatChartNumber(row.smoothed)}</span>
      <span>Predicted SSN: {formatChartNumber(row.predicted)}</span>
      <span>Range: {formatChartNumber(row.low)} - {formatChartNumber(row.high)}</span>
    </div>
  );
}

function OverviewOneBlock({
  id,
  icon: Icon,
  title,
  eyebrow,
  span,
  children
}: {
  id: string;
  icon: typeof Activity;
  title: string;
  eyebrow: string;
  span?: "wide";
  children: ReactNode;
}) {
  return (
    <article id={id} className={span === "wide" ? "panel overview-one-block wide" : "panel overview-one-block"}>
      <div className="overview-one-block-heading">
        <span className="icon-disc">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </article>
  );
}

function OverviewOneMiniCard({ id, title, value, detail }: { id?: string; title: string; value: string; detail: string }) {
  return (
    <article id={id} className="overview-one-mini-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function OverviewOneFact({ id, label, value }: { id?: string; label: string; value: string }) {
  return (
    <div id={id} className="overview-one-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function XrayFluxProductPanel({ solarActivity }: { solarActivity: SolarActivityResponse }) {
  const xray = solarActivity.xray;
  const oneToEight = xray.data.filter((point) => point.energy === "0.1-0.8nm");
  const halfToFour = xray.data.filter((point) => point.energy === "0.05-0.4nm");
  const latest = oneToEight.at(-1);
  const primarySatellite = xray.primarySatellite === null ? null : String(xray.primarySatellite);

  return (
    <section className="panel xray-product-panel" aria-labelledby="xray-product-title">
      <div className="section-heading">
        <div>
          <h2 id="xray-product-title">X-ray Flux Plot</h2>
        </div>
        <div className="source-stack">
          <FreshnessBadge freshness={xray.freshness} />
        </div>
      </div>

      <div className="xray-summary-grid">
        <InstrumentStat label="Current class" value={xray.currentClass ?? "Unavailable"} icon={Activity} />
        <InstrumentStat label="Primary satellite" value={primarySatellite ?? "Unknown"} icon={Satellite} />
        <InstrumentStat label="Flux" value={formatScientific(xray.currentFluxWm2, "W/m2")} icon={Sun} />
      </div>

      <GoesXrayFluxChart oneToEight={oneToEight} halfToFour={halfToFour} primarySatellite={primarySatellite} />

      <p className="instrument-note">
        GOES is the observing satellite system behind this X-ray channel. The chart separates the
        1-8 A and 0.5-4 A passbands for solar flare monitoring.
      </p>
    </section>
  );
}

function GoesXrayFluxChart({
  oneToEight,
  halfToFour,
  primarySatellite
}: {
  oneToEight: SolarActivityResponse["xray"]["data"];
  halfToFour: SolarActivityResponse["xray"]["data"];
  primarySatellite: string | null;
}) {
  const [zoomPreset, setZoomPreset] = useState<"6h" | "1d" | "3d" | "7d">("3d");
  const [isClassGuideOpen, setIsClassGuideOpen] = useState(false);
  const presetPointCounts = XRAY_ZOOM_POINT_COUNTS;
  const maxLength = Math.max(oneToEight.length, halfToFour.length);
  const visibleLength = maxLength === 0 ? 0 : Math.min(maxLength, presetPointCounts[zoomPreset]);
  const longVisible = oneToEight.slice(-visibleLength);
  const shortVisible = halfToFour.slice(-visibleLength);
  const chartData = useMemo(() => {
    const length = Math.max(longVisible.length, shortVisible.length);
    return Array.from({ length }, (_unused, index) => {
      const longPoint = longVisible[index];
      const shortPoint = shortVisible[index];
      return {
        index,
        time: longPoint?.timestamp ?? shortPoint?.timestamp ?? "",
        longFlux: longPoint?.fluxWm2 ?? null,
        shortFlux: shortPoint?.fluxWm2 ?? null,
        longLog: typeof longPoint?.fluxWm2 === "number" ? Math.log10(Math.max(longPoint.fluxWm2, 1e-9)) : null,
        shortLog: typeof shortPoint?.fluxWm2 === "number" ? Math.log10(Math.max(shortPoint.fluxWm2, 1e-9)) : null,
        class: longPoint?.flareClass ?? "",
        satellite: longPoint?.satellite === null || longPoint?.satellite === undefined ? primarySatellite ?? "" : String(longPoint.satellite)
      };
    });
  }, [longVisible, primarySatellite, shortVisible]);

  return (
    <div className="xray-chart-card" role="region" aria-label="X-ray flux plot for 1-8 A and 0.5-4 A channels">
      <div className="xray-chart-toolbar">
        <span>Showing point {Math.max(1, maxLength - visibleLength + 1)} to {maxLength} of {maxLength}</span>
        <div className="xray-preset-controls" aria-label="X-ray zoom range">
          {(["6h", "1d", "3d", "7d"] as const).map((preset) => (
            <button
              type="button"
              className={zoomPreset === preset ? "active" : ""}
              key={preset}
              onClick={() => setZoomPreset(preset)}
              aria-pressed={zoomPreset === preset}
            >
              {preset === "1d" ? "1 Day" : preset === "3d" ? "3 Day" : preset === "7d" ? "7 Day" : "6 Hour"}
            </button>
          ))}
        </div>
      </div>
      <button
        className="xray-class-legend"
        type="button"
        onClick={() => setIsClassGuideOpen(true)}
        aria-label="Open X-ray flare class range guide"
      >
        <span>A</span>
        <span>B</span>
        <span>C</span>
        <span>M</span>
        <span>X</span>
      </button>
      <div className="xray-chart-stage">
        <ResponsiveContainer width="100%" height={390}>
          <RechartsLineChart data={chartData} margin={{ top: 26, right: 86, bottom: 42, left: 20 }}>
          <CartesianGrid stroke="rgba(170, 183, 204, 0.16)" strokeDasharray="5 7" />
          <XAxis
            dataKey="time"
            minTickGap={44}
            tick={{ fill: "currentColor", fontSize: 11 }}
            tickFormatter={(value) => (value ? formatDateTime(String(value)).replace(", ", " ") : "")}
            label={{ value: "Universal Time", position: "insideBottom", offset: -20, fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            domain={[-8, -2]}
            ticks={[-8, -7, -6, -5, -4, -3, -2]}
            width={72}
            tick={{ fill: "currentColor", fontSize: 11 }}
            tickFormatter={(value) => `10^${value}`}
            label={{ value: "Watts m^-2", angle: -90, position: "insideLeft", fill: "currentColor", fontSize: 12 }}
          />
          {[-7, -6, -5, -4, -3].map((value) => (
            <ReferenceLine key={value} y={value} stroke="rgba(148, 163, 184, 0.28)" strokeDasharray="8 6" />
          ))}
          <RechartsTooltip content={<XrayTooltip />} cursor={{ stroke: "rgba(248, 250, 252, 0.28)", strokeWidth: 1 }} />
          <Line
            dataKey="longLog"
            name="0.1-0.8 nm"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
            stroke="#f59e0b"
            strokeWidth={3}
            type="monotone"
            connectNulls
          />
          <Line
            dataKey="shortLog"
            name="0.05-0.4 nm"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
            isAnimationActive={false}
            stroke="#38bdf8"
            strokeWidth={2}
            type="monotone"
            connectNulls
          />
          </RechartsLineChart>
        </ResponsiveContainer>
        <div className="xray-class-axis" aria-hidden="true">
          <span>X</span>
          <span>M</span>
          <span>C</span>
          <span>B</span>
          <span>A</span>
        </div>
      </div>
      <div className="xray-channel-legend">
        <span><i className="legend-dot dot-orange" /> 0.1-0.8 nm</span>
        <span><i className="legend-dot dot-cyan" /> 0.05-0.4 nm</span>
        <strong>{visibleLength} visible points</strong>
        <a href="https://services.swpc.noaa.gov/json/goes/" target="_blank" rel="noreferrer">Open data endpoint</a>
      </div>
      <XrayClassGuideDrawer open={isClassGuideOpen} onClose={() => setIsClassGuideOpen(false)} />
    </div>
  );
}

function XrayClassGuideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      title="X-ray flare class guide"
      placement="right"
      width={430}
      open={open}
      onClose={onClose}
      className="read-drawer"
    >
      <div className="xray-guide-drawer">
        <p className="eyebrow">GOES 0.1-0.8 nm channel</p>
        <h3>How to read A, B, C, M, and X</h3>
        <p>
          The class letter shows the power of the solar soft X-ray flux measured in watts per square meter. Each
          class is ten times stronger than the class before it.
        </p>
        <div className="xray-range-chart" role="list" aria-label="X-ray flare class ranges">
          {XRAY_FLARE_CLASS_RANGES.map((item, index) => (
            <article className="xray-range-row" key={item.label} role="listitem">
              <span className="xray-range-letter" style={{ "--class-color": item.color } as CSSProperties}>
                {item.label}
              </span>
              <div>
                <strong>{item.range}</strong>
                <p>{item.meaning}</p>
              </div>
              <i style={{ "--range-width": `${18 + index * 18}%`, "--class-color": item.color } as CSSProperties} />
            </article>
          ))}
        </div>
        <div className="xray-guide-note">
          <strong>Example</strong>
          <p>C3.2 means a C-class flare with a multiplier of 3.2, or about 3.2e-6 W/m2 in the GOES long channel.</p>
        </div>
        <a href="https://www.spaceweather.gov/products/goes-x-ray-flux" target="_blank" rel="noreferrer">
          Open X-ray Flux Reference
          <ExternalLink aria-hidden="true" size={15} />
        </a>
      </div>
    </Drawer>
  );
}

function XrayTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: Record<string, unknown> }> }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="xray-tooltip">
      <strong>{typeof row.time === "string" && row.time ? formatDateTime(row.time) : "X-ray flux"}</strong>
      <span>0.1-0.8 nm: {formatScientific(typeof row.longFlux === "number" ? row.longFlux : null, "W/m2")}</span>
      <span>0.05-0.4 nm: {formatScientific(typeof row.shortFlux === "number" ? row.shortFlux : null, "W/m2")}</span>
      <span>Class: {typeof row.class === "string" && row.class ? row.class : "Unavailable"}</span>
      <span>Satellite: {typeof row.satellite === "string" && row.satellite ? row.satellite : "Unknown"}</span>
    </div>
  );
}

function EventSummaryList({ title, events, emptyText }: { title: string; events: TimelineEvent[]; emptyText: string }) {
  return (
    <section className="panel timeline-panel" aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-title`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Event feed</p>
          <h2 id={`${title.replaceAll(" ", "-").toLowerCase()}-title`}>{title}</h2>
        </div>
      </div>
      <div className="timeline-list">
        {events.length === 0 ? (
          <p className="empty-state">{emptyText}</p>
        ) : (
          events.map((event) => (
            <article className="timeline-row" key={event.id}>
              <span className={`event-type-pill event-${event.type}`}>{eventTypeLabels[event.type]}</span>
              <span className="timeline-row-body">
                <strong>{event.title}</strong>
                <span>{event.summary}</span>
                <span className="timeline-meta">
                  <Clock aria-hidden="true" size={14} />
                  {formatDateTime(event.timestamp)} UTC
                </span>
              </span>
              <span className={`status-pill severity-${event.severity}`}>{severityLabels[event.severity]}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function RangeSelector({ value, onChange }: { value: string; onChange: (range: string) => void }) {
  const ranges = ["2h", "6h", "24h", "3d"];

  return (
    <div className="range-controls" aria-label="Chart time range">
      {ranges.map((range) => (
        <button
          className={range === value ? "range-button active" : "range-button"}
          type="button"
          key={range}
          onClick={() => onChange(range)}
          aria-pressed={range === value}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

function ConditionPanel({ summary, onOpen }: { summary: DashboardSummary; onOpen?: () => void }) {
  const [isScaleViewOpen, setIsScaleViewOpen] = useState(false);
  const isUnavailable = summary.freshness === "unavailable";
  const conditionCopy = isUnavailable
    ? "Live geomagnetic inputs are unavailable. Default scale values are shown until the NOAA feed returns."
    : summary.mainCause;
  const updatedAt = formatOperationalDateTime(summary.lastUpdated);

  return (
    <article
      className={`panel condition-panel severity-${summary.overallSeverity} freshness-${summary.freshness} ${onOpen ? "clickable-panel" : ""}`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (!onOpen) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="panel-heading">
        <span className="icon-disc">
          <Activity aria-hidden="true" size={22} />
        </span>
        <div>
          <p className="eyebrow">Current condition</p>
          <h2>{isUnavailable ? "Data unavailable" : summary.condition}</h2>
        </div>
        <FreshnessBadge freshness={summary.freshness} />
      </div>
      <p className="condition-copy">{conditionCopy}</p>
      <dl className="inline-facts">
        <div>
          <dt>G scale</dt>
          <dd>{summary.gScale}</dd>
        </div>
        <div>
          <dt>R scale</dt>
          <dd>{summary.rScale}</dd>
        </div>
        <div>
          <dt>S scale</dt>
          <dd>{summary.sScale}</dd>
        </div>
      </dl>
      <button
        className="mini-read-button scale-view-all-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsScaleViewOpen(true);
        }}
      >
        View scales
      </button>
      <p className="timestamp">{updatedAt ? `Updated ${updatedAt} UTC` : "Update time unavailable"}</p>
      <ScaleViewDrawer open={isScaleViewOpen} onClose={() => setIsScaleViewOpen(false)} summary={summary} />
    </article>
  );
}

function ScaleViewDrawer({
  open,
  onClose,
  summary
}: {
  open: boolean;
  onClose: () => void;
  summary: DashboardSummary;
}) {
  const currentValues = {
    G: summary.gScale,
    R: summary.rScale,
    S: summary.sScale
  };
  const handleClose = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    onClose();
  };

  return (
    <Drawer
      className="read-drawer scale-view-drawer"
      title="Space Weather Scales"
      placement="right"
      open={open}
      onClose={handleClose}
      width={420}
    >
      <div className="scale-view-stack" onClick={(event) => event.stopPropagation()}>
        {SPACE_WEATHER_SCALE_GROUPS.map((group) => (
          <section className="scale-view-card" key={group.code}>
            <header>
              <span>{group.code}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.measure}</p>
              </div>
              <strong>{currentValues[group.code]}</strong>
            </header>
            <div className="scale-view-level-list">
              {group.levels.map((level) => (
                <article className="scale-view-level-row" key={level.level}>
                  <div>
                    <strong>{level.level}</strong>
                    <span>{level.label}</span>
                  </div>
                  <p>{level.trigger}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Drawer>
  );
}

function MetricPanel({
  icon: Icon,
  title,
  value,
  detail,
  severity,
  onOpen
}: {
  icon: typeof Gauge;
  title: string;
  value: string;
  detail: string;
  severity: SeverityLevel;
  onOpen?: () => void;
}) {
  const [isReadOpen, setIsReadOpen] = useState(false);
  const termInfo = getTermReadContent(title);
  return (
    <article
      className={`panel metric-panel ${onOpen ? "clickable-panel" : ""}`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (!onOpen) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="metric-header">
        <span className={`icon-disc severity-${severity}`}>
          <Icon aria-hidden="true" size={20} />
        </span>
        <span className={`status-pill severity-${severity}`}>{severityLabels[severity]}</span>
      </div>
      <button
        className="metric-read-pill"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsReadOpen(true);
        }}
      >
        Read
      </button>
      <p className="metric-title">{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
      <ReadDrawer
        open={isReadOpen}
        onClose={() => setIsReadOpen(false)}
        title={title}
        eyebrow="Snapshot card"
        body={termInfo?.definition ?? `${title} is part of the live overview summary. It helps users quickly judge current space weather state before opening detailed layers.`}
        bullets={[
          `Current value: ${value}`,
          termInfo?.impact ?? detail,
          termInfo?.risk ?? `Status level: ${severityLabels[severity]}`
        ]}
        references={termInfo?.references ?? getReadReferences(title)}
      />
    </article>
  );
}

function SolarWindPanel({
  summary,
  solarWind
}: {
  summary: DashboardSummary;
  solarWind: SolarWindResponse;
}) {
  const latest = solarWind.data.at(-1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <section id="solar-wind" className="panel wide-panel instrument-panel" aria-labelledby="solar-wind-title">
      <PanelTitle
        eyebrow="Upstream plasma"
        title="Solar wind"
        source={solarWind.source}
        freshness={solarWind.freshness}
        action={
          <Button size="small" onClick={() => setIsDetailsOpen(true)} aria-label="Inspect solar wind chart">
            Inspect
          </Button>
        }
      />
      <div className="wind-layout">
        <InstrumentStat label="Speed" value={formatOptional(latest?.speedKmPerSec ?? summary.solarWindSpeed, "km/s")} />
        <InstrumentStat label="Density" value={formatOptional(latest?.densityPerCc, "/cc", 1)} />
        <InstrumentStat label="Temperature" value={formatOptional(latest?.temperatureK, "K", 0)} icon={Thermometer} />
      </div>
      <LineChart
        ariaLabel="Combined solar wind speed and density chart"
        series={[
          { label: "Speed", values: solarWind.data.map((point) => point.speedKmPerSec), className: "speed-line" },
          { label: "Density", values: solarWind.data.map((point) => point.densityPerCc), className: "density-line" }
        ]}
      />
      <div className="split-chart-grid" aria-label="Individual solar wind charts">
        <article className="split-chart-card">
          <div className="split-chart-heading">
            <div>
              <p className="eyebrow">Speed Trend</p>
              <h3>Solar Wind Speed</h3>
            </div>
            <strong>{formatOptional(latest?.speedKmPerSec ?? summary.solarWindSpeed, "km/s")}</strong>
          </div>
          <LineChart
            ariaLabel="Individual solar wind speed chart"
            series={[
              { label: "Speed", values: solarWind.data.map((point) => point.speedKmPerSec), className: "speed-line" }
            ]}
          />
        </article>
        <article className="split-chart-card">
          <div className="split-chart-heading">
            <div>
              <p className="eyebrow">Density Trend</p>
              <h3>Plasma density</h3>
            </div>
            <strong>{formatOptional(latest?.densityPerCc, "/cc", 1)}</strong>
          </div>
          <LineChart
            ariaLabel="Individual solar wind density chart"
            series={[
              { label: "Density", values: solarWind.data.map((point) => point.densityPerCc), className: "density-line" }
            ]}
          />
        </article>
      </div>
      <Modal
        title="Solar wind chart details"
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={null}
        getContainer={false}
      >
        <div className="chart-detail-grid">
          <Card size="small">
            <Text type="secondary">Latest speed</Text>
            <strong>{formatOptional(latest?.speedKmPerSec ?? summary.solarWindSpeed, "km/s")}</strong>
          </Card>
          <Card size="small">
            <Text type="secondary">Latest density</Text>
            <strong>{formatOptional(latest?.densityPerCc, "/cc", 1)}</strong>
          </Card>
          <Card size="small">
            <Text type="secondary">Latest temperature</Text>
            <strong>{formatOptional(latest?.temperatureK, "K", 0)}</strong>
          </Card>
        </div>
        <AntAlert
          className="chart-detail-alert"
          type="info"
          showIcon
          message="Hover the chart in the browser to inspect individual readings with live tooltips."
        />
      </Modal>
      <TelemetryTable
        caption="Recent solar wind readings"
        columns={["Time", "Speed", "Density", "Temp"]}
        rows={solarWind.data.slice(-4).map((point) => [
          formatTime(point.timestamp),
          formatOptional(point.speedKmPerSec, "km/s"),
          formatOptional(point.densityPerCc, "/cc", 1),
          formatOptional(point.temperatureK, "K", 0)
        ])}
      />
    </section>
  );
}

function MagneticFieldPanel({ magneticField }: { magneticField: MagneticFieldResponse }) {
  const latest = magneticField.data.at(-1);
  const latestTimestamp = magneticField.lastUpdated ?? latest?.timestamp ?? null;
  const latestAge = latestTimestamp ? formatRelativeAge(latestTimestamp) : "age unavailable";
  const oldestTimestamp = magneticField.data.at(0)?.timestamp ?? null;
  const coverageLabel = oldestTimestamp && latestTimestamp
    ? `${formatDateTime(oldestTimestamp)} UTC to ${formatDateTime(latestTimestamp)} UTC`
    : "time coverage unavailable";

  return (
    <section id="magnetic-field" className="panel instrument-panel" aria-labelledby="magnetic-field-title">
      <PanelTitle
        eyebrow="Interplanetary magnetic field"
        title="Magnetic field"
        source={magneticField.source}
        freshness={magneticField.freshness}
        hideSourceTag
      />
      <div className="wind-layout compact-stats">
        <InstrumentStat label="Bz GSM" value={formatSigned(latest?.bzGsmNt, "nT")} icon={Magnet} />
        <InstrumentStat label="Bt" value={formatOptional(latest?.btNt, "nT", 2)} icon={Waves} />
      </div>
      <div className="telemetry-age-strip" aria-label="IMF data freshness">
        <span>
          <strong>{magneticField.data.length.toLocaleString()}</strong> IMF samples loaded
        </span>
        <span>
          Latest sample: <strong>{latestTimestamp ? `${formatDateTime(latestTimestamp)} UTC` : "Unavailable"}</strong>
        </span>
        <span>
          Data age: <strong>{latestAge}</strong>
        </span>
        <span>
          Coverage: <strong>{coverageLabel}</strong>
        </span>
      </div>
      <LineChart
        ariaLabel="IMF Bz and Bt chart"
        centerOnZero
        series={[
          { label: "Bz", values: magneticField.data.map((point) => point.bzGsmNt), className: "bz-line" },
          { label: "Bt", values: magneticField.data.map((point) => point.btNt), className: "bt-line" }
        ]}
      />
      <p className="instrument-note">Negative Bz is highlighted as a coupling factor for geomagnetic activity.</p>
    </section>
  );
}

function KpPanel({ kp }: { kp: KpResponse }) {
  return (
    <section id="kp" className="panel instrument-panel" aria-labelledby="kp-title">
      <PanelTitle eyebrow="Geomagnetic activity" title="Kp trend" source={kp.source} freshness={kp.freshness} />
      <div className="kp-summary-grid">
        <KpSummaryCard
          title="Current Kp"
          value={kp.current === null ? "Unavailable" : kp.current.toFixed(2)}
          icon={BarChart3}
          body="Kp is the planetary geomagnetic activity index. It is plotted on a fixed 0 to 9 scale and helps identify quiet, unsettled, or storm-level magnetic conditions."
          impact="Higher Kp values can indicate stronger geomagnetic activity, with Kp 5 and above corresponding to G-scale storm levels."
          risk="Watch for sustained Kp values at or above 5, especially when solar wind conditions and southward IMF Bz support coupling."
          references={getReadReferences("Kp index", kp.source)}
        />
        <KpSummaryCard
          title="G scale"
          value={kp.gScale}
          icon={Gauge}
          body="The G scale translates geomagnetic storm strength into an operational category, from G0 quiet conditions through higher storm levels."
          impact="The G scale helps operators quickly understand possible impacts to power systems, spacecraft operations, aurora visibility, and GNSS reliability."
          risk="G1 and higher indicate geomagnetic storm conditions. G0 means no storm category is currently indicated by the Kp value."
          references={getReadReferences("G scale", kp.source)}
        />
      </div>
      <KpBars points={kp.data.slice(-16)} />
      <p className="instrument-note">Bars use the fixed scientific Kp range from 0 to 9.</p>
    </section>
  );
}

function ScalesPanel({ scales }: { scales: ScalesResponse }) {
  const currentValues = {
    gScale: scales.current.gScale,
    rScale: scales.current.rScale,
    sScale: scales.current.sScale
  };

  return (
    <section className="panel instrument-panel scale-page-panel" aria-labelledby="scales-title">
      <div className="section-heading scale-page-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h2 id="scales-title">Space Weather Scales</h2>
          <p>
            The scale system groups space-weather impacts into geomagnetic storms, solar radiation storms,
            and radio blackouts. Each category runs from level 1 to level 5.
          </p>
        </div>
        <a
          className="reference-link-button"
          href="https://www.spaceweather.gov/noaa-scales-explanation"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={16} />
          Official Reference
        </a>
      </div>

      <div className="scale-card-grid scale-current-grid">
        <ScaleCard label="Geomagnetic storms" value={scales.current.gScale} />
        <ScaleCard label="Radiation storms" value={scales.current.sScale} />
        <ScaleCard label="Radio blackouts" value={scales.current.rScale} />
      </div>

      <div className="scale-definition-grid">
        {SPACE_WEATHER_SCALE_GROUPS.map((group) => (
          <article className="scale-definition-card" key={group.code}>
            <header>
              <span>{group.code}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.measure}</p>
              </div>
              <strong>{currentValues[group.currentKey]}</strong>
            </header>
            <div className="scale-level-list">
              {group.levels.map((level) => (
                <div className="scale-level-row" key={level.level}>
                  <div>
                    <strong>{level.level}</strong>
                    <span>{level.label}</span>
                  </div>
                  <p>{level.trigger}</p>
                  <small>{level.impact}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const CONTRIBUTOR_INTERNS = [
  { name: "Zain", role: "Research Intern", photo: "/assets/contributors/intern-zain.jpeg" },
  { name: "Ramsha", role: "Research Intern", photo: "/assets/contributors/intern-ramsha.jpeg" },
  { name: "Mubasir", role: "Research Intern", photo: "/assets/contributors/intern-mubasir.jpeg" }
];

const CONTRIBUTOR_TEAM = [
  {
    name: "Abdul Muteen",
    role: "Research Assistant",
    focus: "Project Supervisor",
    photo: "/assets/contributors/syed-muhammad-ali.jpeg"
  },
  {
    name: "Daniyal Raza",
    role: "Team Lead, NCGSA",
    focus: "GNSS Specialist",
    photo: "/assets/contributors/daniyal-raza.png"
  },
  {
    name: "Syed Muhammad Ali",
    role: "Research Associate",
    focus: "Web Developer",
    photo: "/assets/contributors/abdul-muteen.jpg"
  }
];

const CONTRIBUTOR_ADVISORS = [
  { name: "Dr. Najam Abbas", role: "Chairman, NCGSA", photo: "/assets/contributors/advisor-1.png" },
  { name: "Usama Ahmad", role: "NCGSA Coordinator", photo: "/assets/contributors/advisor-2.jpg" },
  { name: "Dr. Imran", role: "Assistant Professor", photo: "/assets/contributors/advisor-3.jpg" },
  { name: "Dr. Munawar Shah", role: "Assistant Professor", photo: "/assets/contributors/advisor-4.png" }
];

const SPACE_WEATHER_SCALE_GROUPS: Array<{
  code: "G" | "R" | "S";
  title: string;
  measure: string;
  currentKey: "gScale" | "rScale" | "sScale";
  levels: Array<{ level: string; label: string; trigger: string; impact: string }>;
}> = [
  {
    code: "G",
    title: "Geomagnetic Storms",
    measure: "Kp index",
    currentKey: "gScale" as const,
    levels: [
      { level: "G1", label: "Minor", trigger: "Kp 5", impact: "Weak grid fluctuations, minor spacecraft operations impact, aurora at high latitudes." },
      { level: "G2", label: "Moderate", trigger: "Kp 6", impact: "High-latitude voltage alarms, spacecraft orientation corrections, HF fade at high latitudes." },
      { level: "G3", label: "Strong", trigger: "Kp 7", impact: "Voltage corrections may be needed, satellite drag can increase, navigation issues may appear." },
      { level: "G4", label: "Severe", trigger: "Kp 8", impact: "Widespread voltage-control issues, spacecraft tracking problems, degraded navigation for hours." },
      { level: "G5", label: "Extreme", trigger: "Kp 9", impact: "Major power-system problems, satellite navigation degraded for days, HF radio may fail in many areas." }
    ]
  },
  {
    code: "S",
    title: "Solar Radiation Storms",
    measure: ">= 10 MeV proton flux",
    currentKey: "sScale" as const,
    levels: [
      { level: "S1", label: "Minor", trigger: "10 pfu", impact: "Minor HF radio impacts in polar regions." },
      { level: "S2", label: "Moderate", trigger: "100 pfu", impact: "Elevated radiation risk on high-latitude flights and possible polar navigation effects." },
      { level: "S3", label: "Strong", trigger: "1,000 pfu", impact: "Astronaut radiation avoidance recommended, satellite single-event effects likely." },
      { level: "S4", label: "Severe", trigger: "10,000 pfu", impact: "High radiation risk, satellite memory and imaging problems, polar HF blackout likely." },
      { level: "S5", label: "Extreme", trigger: "100,000 pfu", impact: "Extreme radiation hazard, severe satellite impacts, polar communication blackout possible." }
    ]
  },
  {
    code: "R",
    title: "Radio Blackouts",
    measure: "Solar X-ray flare class",
    currentKey: "rScale" as const,
    levels: [
      { level: "R1", label: "Minor", trigger: "M1", impact: "Weak HF radio degradation on the sunlit side and brief navigation-signal degradation." },
      { level: "R2", label: "Moderate", trigger: "M5", impact: "Limited HF blackout and low-frequency navigation degradation for tens of minutes." },
      { level: "R3", label: "Strong", trigger: "X1", impact: "Wide-area HF blackout and navigation signal degradation for about an hour." },
      { level: "R4", label: "Severe", trigger: "X10", impact: "HF blackout across most of the sunlit side for one to two hours." },
      { level: "R5", label: "Extreme", trigger: "X20", impact: "Complete HF blackout on the sunlit side for hours, with significant navigation disruption." }
    ]
  }
];

function GlossaryPanel({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory>("All");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntries = GLOSSARY_ENTRIES.filter((entry) => {
    if (entry.term.toLowerCase().includes("donki") || entry.term.toLowerCase().includes("noaa")) return false;
    const matchesCategory = category === "All" || entry.category === category;
    const searchable = [
      entry.term,
      entry.category,
      entry.layer,
      entry.definition,
      entry.impact,
      ...entry.related
    ].join(" ").toLowerCase();
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const entries = compact ? visibleEntries.slice(0, 8) : visibleEntries;

  return (
    <section className={`panel glossary-panel ${compact ? "glossary-panel-compact" : ""}`} aria-labelledby="glossary-title">
      <div className="section-heading glossary-panel-head">
        <div>
          <p className="eyebrow">Operational glossary</p>
          <h2 id="glossary-title">{compact ? "Glossary quick reference" : "Space weather and GNSS glossary"}</h2>
          <p>
            Terms from the supplied GNSS and space-weather glossary documents, mapped to the dashboard layers where
            users will meet them.
          </p>
        </div>
        <span className="source-tag">{visibleEntries.length} terms</span>
      </div>

      <div className="glossary-controls" aria-label="Glossary filters">
        <label className="glossary-search">
          <span>Search terms</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search IMF, Kp, TEC, CME..."
          />
        </label>
        <div className="glossary-category-row">
          {GLOSSARY_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`glossary-filter-chip ${category === item ? "active" : ""}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {entries.length ? (
        <div className="glossary-grid">
          {entries.map((entry) => (
            <article className="glossary-card" key={entry.term}>
              <div className="glossary-card-top">
                <span className="glossary-category">{entry.category}</span>
                <strong>{entry.layer}</strong>
              </div>
              <h3>{entry.term}</h3>
              <p>{entry.definition}</p>
              <div className="glossary-impact">
                <span>Impact</span>
                <p>{entry.impact}</p>
              </div>
              <div className="glossary-related">
                {entry.related.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="glossary-meta">
                <Info aria-hidden="true" size={14} />
                <span>Glossary note</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glossary-empty">No glossary terms match this filter.</div>
      )}
    </section>
  );
}

function ContributorsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`contributors-panel ${compact ? "contributors-panel-compact" : ""}`} aria-labelledby="contributors-title">
      <div className="contributors-breadcrumb" aria-label="Breadcrumb">
        <span>Dashboard</span>
        <span>/</span>
        <strong>Contributors</strong>
      </div>

      <header className="contributors-hero">
        <p className="eyebrow">NCGSA Space Weather Observatory</p>
        <h2 id="contributors-title">Meet the Team</h2>
        <p>The people behind the NCGSA Space Weather Observatory.</p>
      </header>

      <div className="contributors-layout">
        <section className="contributors-lead-section" aria-labelledby="contributors-lead-title">
          <h3 id="contributors-lead-title">Intern Team</h3>
          <div className="contributors-intern-grid">
            {CONTRIBUTOR_INTERNS.map((intern) => (
              <article className="contributors-intern-card" key={intern.name}>
                <div className="contributor-photo contributor-photo-small">
                  <img src={intern.photo} alt={intern.name} loading="lazy" />
                </div>
                <div>
                  <h4>{intern.name}</h4>
                  <p>{intern.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="ncgsa-team-title">
          <h3 id="ncgsa-team-title">NCGSA Team</h3>
          <div className="contributors-team-grid">
            {CONTRIBUTOR_TEAM.map((member, index) => (
              <article className="contributors-member-card" key={`${member.role}-${index}`}>
                <div className="contributor-photo contributor-photo-medium">
                  <img src={member.photo} alt={member.name} loading="lazy" />
                </div>
                <div>
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                  <small>{member.focus}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="advisors-title">
          <h3 id="advisors-title">Specialists & Advisors</h3>
          <div className="contributors-advisor-grid">
            {CONTRIBUTOR_ADVISORS.slice(0, 2).map((advisor) => (
              <article className="contributors-advisor-card" key={advisor.name}>
                <div className="contributor-photo contributor-photo-advisor">
                  <img src={advisor.photo} alt={advisor.name} loading="lazy" />
                </div>
                <div>
                  <h4>{advisor.name}</h4>
                  <p>{advisor.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="contributors-scale-title">
          <article className="contributors-scale-card">
            <div>
              <p className="eyebrow">Reference</p>
              <h3 id="contributors-scale-title">Space Weather Scales</h3>
              <p>Open the G, S, and R scale page for storm levels, physical triggers, and expected impacts.</p>
            </div>
            <a className="contributors-scale-link" href={observatoryHref("overview-1-reference")}>
              <Gauge size={16} />
              Open Scale Page
            </a>
          </article>
        </section>
      </div>
    </section>
  );
}

function SourceHealthPanel({ sourceHealth }: { sourceHealth: SourceHealthResponse }) {
  const [showSourceNames, setShowSourceNames] = useState(true);

  return (
    <section className="panel instrument-panel" aria-labelledby="source-health-title">
      <PanelTitle
        eyebrow="Data freshness"
        title="Source health"
        source="Live feeds"
        freshness="fresh"
        action={
          <Button
            size="small"
            className="read-button source-visibility-button"
            icon={showSourceNames ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setShowSourceNames((current) => !current)}
          >
            {showSourceNames ? "Hide" : "Show"}
          </Button>
        }
      />
      <div className="source-list">
        {sourceHealth.sources.map((source, index) => (
          <article className="source-row" key={source.sourceName}>
            <span className={`health-dot status-${source.status}`} aria-hidden="true" />
            <div>
              <h3>{showSourceNames ? source.sourceName.replaceAll("_", " ") : `Feed ${index + 1}`}</h3>
              <p>
                {source.status}
                {source.lastSuccessAt ? ` · ${formatDateTime(source.lastSuccessAt)} UTC` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PanelTitle({
  eyebrow,
  title,
  source,
  freshness,
  action,
  hideSourceTag = true
}: {
  eyebrow: string;
  title: string;
  source: string;
  freshness: Freshness;
  action?: ReactNode;
  hideSourceTag?: boolean;
}) {
  const [isReadOpen, setIsReadOpen] = useState(false);
  const termInfo = getTermReadContent(title, source);
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="source-stack">
        <div className="source-actions">
          <Button size="small" className="read-button" onClick={() => setIsReadOpen(true)}>
            Read
          </Button>
          {action}
        </div>
        <div className="source-meta">
          {hideSourceTag ? null : <span className="source-tag">{source}</span>}
          <FreshnessBadge freshness={freshness} />
        </div>
      </div>
      <ReadDrawer
        open={isReadOpen}
        onClose={() => setIsReadOpen(false)}
        title={title}
        eyebrow={eyebrow}
        body={termInfo?.definition ?? `${title} explains one operational part of the dashboard. Use this panel to understand what the card is showing, where the data comes from, and how it connects to space weather monitoring.`}
        bullets={[
          `Status: ${freshness}`,
          termInfo?.impact ?? `Freshness: ${freshness}`,
          termInfo?.risk ?? "Use the chart controls to zoom into recent samples or reset to the full range when available."
        ]}
        references={termInfo?.references ?? getReadReferences(title, source)}
      />
    </div>
  );
}

function ReadDrawer({
  open,
  onClose,
  title,
  eyebrow,
  body,
  bullets,
  references
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow: string;
  body: string;
  bullets: string[];
  references: Array<{ label: string; href: string }>;
}) {
  return (
    <Drawer
      className="read-drawer"
      title={title}
      placement="right"
      open={open}
      onClose={onClose}
      width={420}
    >
      <section className="read-info-card">
        <p className="eyebrow">{eyebrow}</p>
        <h3>Definition</h3>
        <p>{body}</p>
      </section>
      <section className="read-info-card">
        <p className="eyebrow">What it impacts</p>
        <p>{bullets[1] ?? "This value helps describe current operating conditions for the dashboard."}</p>
      </section>
      <section className="read-info-card">
        <p className="eyebrow">High-risk values</p>
        <p>{bullets[2] ?? "Higher values or degraded freshness may require closer inspection in the related dashboard layer."}</p>
      </section>
      <section className="read-info-card">
        <p className="eyebrow">References</p>
        {references.length > 0 ? (
          <ul>
            {references.map((reference) => (
              <li key={reference.href}>
                <a href={reference.href} target="_blank" rel="noreferrer">
                  {reference.label}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>Source link unavailable for this local derived panel.</p>
        )}
      </section>
    </Drawer>
  );
}

const FETCH_REFERENCE_LINKS = {
  noaaSolarWindPlasma: "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
  noaaSolarWindMag: "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
  noaaKp: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
  noaaScales: "https://services.swpc.noaa.gov/products/noaa-scales.json",
  noaaAlerts: "https://services.swpc.noaa.gov/products/alerts.json",
  noaaGloTec: "https://www.spaceweather.gov/products/glotec",
  noaaSolarWindProduct: "https://www.spaceweather.gov/products/solar-wind?layout=rtsw",
  noaaKpProduct: "https://www.spaceweather.gov/products/planetary-k-index",
  noaaScalesExplanation: "https://www.spaceweather.gov/noaa-scales-explanation",
  noaaTecPhenomena: "https://www.spaceweather.gov/phenomena/total-electron-content",
  noaaTecNcei: "https://www.ncei.noaa.gov/products/space-weather/ionospheric-program/total-electron-content",
  noaaCmePhenomena: "https://www.spaceweather.gov/phenomena/coronal-mass-ejections",
  noaaXrayFluxProduct: "https://www.spaceweather.gov/products/goes-x-ray-flux",
  nasaDonkiApi: "https://api.nasa.gov/DONKI",
  nasaDonkiCcmc: "https://kauai.ccmc.gsfc.nasa.gov/DONKI",
  nasaFlaresCmes: "https://svs.gsfc.nasa.gov/11667/",
  nasaSdoAia131: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0131.jpg",
  nasaSdoAia304: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg",
  nasaSdoHmiIntensity: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg",
  nasaSdoHmiMagnetogram: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIB.jpg"
};

function getTermReadContent(title: string, source = ""): {
  definition: string;
  impact: string;
  risk: string;
  references: Array<{ label: string; href: string }>;
} | null {
  const normalized = `${title} ${source}`.toLowerCase();

  if (normalized.includes("x-ray") || normalized.includes("xray") || normalized.includes("current class") || normalized === "flux") {
    return {
      definition: "GOES is the observing satellite system used for these X-ray measurements. The dashboard uses the 0.1-0.8 nm long channel to derive flare classes such as B, C, M, and X.",
      impact: "Strong X-ray flares can change the sunlit ionosphere quickly, raising the chance of HF radio blackout conditions and navigation-signal disturbance.",
      risk: "C-class is usually small, M-class can be operationally important, and X-class is the strongest class. The class strip on the chart explains exact W/m2 ranges.",
      references: [
        { label: "X-ray flux reference", href: FETCH_REFERENCE_LINKS.noaaXrayFluxProduct },
        { label: "X-ray data endpoint", href: "https://services.swpc.noaa.gov/json/goes/" }
      ]
    };
  }

  if (normalized.includes("solar wind") || normalized.includes("speed") || normalized.includes("density") || normalized.includes("temperature") || normalized.includes("plasma")) {
    return {
      definition: "Solar wind is charged plasma flowing outward from the Sun. Upwind spacecraft near L1 monitor speed, density, temperature, and magnetic-field changes before they reach Earth.",
      impact: "Fast or dense solar wind can compress Earth's magnetosphere. When it arrives with southward IMF Bz, geomagnetic activity and GNSS/radio impacts become more likely.",
      risk: "Sustained speed above about 650 km/s, elevated density, sudden jumps, or strong coupling with negative Bz deserve closer inspection.",
      references: [
        { label: "Solar wind reference", href: FETCH_REFERENCE_LINKS.noaaSolarWindProduct },
        { label: "Real-time plasma endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindPlasma }
      ]
    };
  }

  if (normalized.includes("imf") || normalized.includes("magnetic field") || normalized.includes("bz") || normalized.includes("bt")) {
    return {
      definition: "The interplanetary magnetic field, or IMF, is the magnetic field carried through space by the solar wind. Bz is its north-south component, while Bt is total magnetic-field strength.",
      impact: "Southward Bz couples efficiently with Earth's magnetic field, allowing solar-wind energy to enter the magnetosphere and raise storm potential.",
      risk: "Sustained negative Bz, especially below about -5 nT with elevated Bt or fast solar wind, is an important warning sign for geomagnetic response.",
      references: [
        { label: "Solar wind reference", href: FETCH_REFERENCE_LINKS.noaaSolarWindProduct },
        { label: "Real-time magnetic field endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindMag }
      ]
    };
  }

  if (normalized.includes("kp") || normalized.includes("geomagnetic")) {
    return {
      definition: "Kp is a planetary index that summarizes disturbances in Earth's magnetic field on a 0 to 9 scale. Kp values map to the G-scale for geomagnetic storm severity.",
      impact: "Higher Kp values indicate stronger geomagnetic activity that can affect satellites, power systems, HF communication, aurora visibility, and GNSS reliability.",
      risk: "Kp 5 and above corresponds to G1 storm conditions. Kp 6 is G2, Kp 7 is G3, Kp 8 is G4, and Kp 9 is G5.",
      references: [
        { label: "Planetary K-index reference", href: FETCH_REFERENCE_LINKS.noaaKpProduct },
        { label: "Scale explanation", href: FETCH_REFERENCE_LINKS.noaaScalesExplanation },
        { label: "K-index data endpoint", href: FETCH_REFERENCE_LINKS.noaaKp }
      ]
    };
  }

  if (normalized.includes("tec") || normalized.includes("ionosphere") || normalized.includes("gnss")) {
    return {
      definition: "Total Electron Content, or TEC, estimates how many free electrons are along a signal path through the ionosphere. One TECU equals 10^16 electrons per square meter.",
      impact: "Large TEC values and sharp TEC gradients can delay GNSS signals, reduce positioning accuracy, and change HF/radio propagation conditions.",
      risk: "High TEC, strong positive anomaly, poor coverage, or clustered high-TEC regions are most important for GNSS positioning, timing, and survey workflows.",
      references: [
        { label: "Total Electron Content explanation", href: FETCH_REFERENCE_LINKS.noaaTecPhenomena },
        { label: "TEC product reference", href: FETCH_REFERENCE_LINKS.noaaTecNcei },
        { label: "TEC map reference", href: FETCH_REFERENCE_LINKS.noaaGloTec }
      ]
    };
  }

  if (normalized.includes("cme") || normalized.includes("coronal mass")) {
    return {
      definition: "A coronal mass ejection, or CME, is a large expulsion of plasma and magnetic field from the Sun's corona.",
      impact: "Earth-directed CMEs can drive geomagnetic storms after the ejecta reaches Earth, especially when the embedded magnetic field is southward.",
      risk: "Fast CMEs, wide/halo CMEs, and events linked with shock arrivals or geomagnetic storms need closer monitoring.",
      references: [
        { label: "Coronal Mass Ejections explanation", href: FETCH_REFERENCE_LINKS.noaaCmePhenomena },
        { label: "Event catalog", href: FETCH_REFERENCE_LINKS.nasaDonkiCcmc },
        { label: "Flares and CMEs explainer", href: FETCH_REFERENCE_LINKS.nasaFlaresCmes }
      ]
    };
  }

  if (normalized.includes("flare") || normalized.includes("solar flares")) {
    return {
      definition: "A solar flare is a rapid burst of electromagnetic radiation from an active region on the Sun. The dashboard relates flare events to X-ray classes.",
      impact: "Large flares can cause sudden ionospheric changes on the sunlit side of Earth and can trigger radio-blackout conditions.",
      risk: "M-class and X-class events are most important operationally, especially when repeated or associated with a CME.",
      references: [
        { label: "X-ray flux reference", href: FETCH_REFERENCE_LINKS.noaaXrayFluxProduct },
        { label: "Flares and CMEs explainer", href: FETCH_REFERENCE_LINKS.nasaFlaresCmes },
        { label: "Event catalog", href: FETCH_REFERENCE_LINKS.nasaDonkiCcmc }
      ]
    };
  }

  return null;
}

function getReadReferences(title: string, source = ""): Array<{ label: string; href: string }> {
  const normalized = `${title} ${source}`.toLowerCase();

  if (normalized.includes("solar wind") || normalized.includes("plasma")) {
    return [
      { label: "Real-time plasma endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindPlasma },
      { label: "Real-time magnetic field endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindMag }
    ];
  }

  if (normalized.includes("imf") || normalized.includes("magnetic field") || normalized.includes("bz")) {
    return [{ label: "Real-time magnetic field endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindMag }];
  }

  if (normalized.includes("kp") || normalized.includes("geomagnetic")) {
    return [
      { label: "Planetary K-index endpoint", href: FETCH_REFERENCE_LINKS.noaaKp },
      { label: "Scale endpoint", href: FETCH_REFERENCE_LINKS.noaaScales }
    ];
  }

  if (normalized.includes("alert") || normalized.includes("forecast") || normalized.includes("scale")) {
    return [
      { label: "Alert endpoint", href: FETCH_REFERENCE_LINKS.noaaAlerts },
      { label: "Scale endpoint", href: FETCH_REFERENCE_LINKS.noaaScales }
    ];
  }

  if (normalized.includes("event") || normalized.includes("flare") || normalized.includes("cme")) {
    return [
      { label: "Event API endpoint", href: FETCH_REFERENCE_LINKS.nasaDonkiApi },
      { label: "Event fallback endpoint", href: FETCH_REFERENCE_LINKS.nasaDonkiCcmc }
    ];
  }

  if (normalized.includes("tec") || normalized.includes("ionosphere") || normalized.includes("gnss")) {
    return [{ label: "TEC map reference", href: FETCH_REFERENCE_LINKS.noaaGloTec }];
  }

  if (normalized.includes("imagery") || normalized.includes("source health")) {
    return [
      { label: "AIA 131 latest image", href: FETCH_REFERENCE_LINKS.nasaSdoAia131 },
      { label: "AIA 304 latest image", href: FETCH_REFERENCE_LINKS.nasaSdoAia304 },
      { label: "HMI intensity latest image", href: FETCH_REFERENCE_LINKS.nasaSdoHmiIntensity },
      { label: "HMI magnetogram latest image", href: FETCH_REFERENCE_LINKS.nasaSdoHmiMagnetogram }
    ];
  }

  return [
    { label: "Planetary K-index endpoint", href: FETCH_REFERENCE_LINKS.noaaKp },
    { label: "Real-time plasma endpoint", href: FETCH_REFERENCE_LINKS.noaaSolarWindPlasma },
    { label: "Alert endpoint", href: FETCH_REFERENCE_LINKS.noaaAlerts }
  ];
}

function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  return <span className={`freshness-badge freshness-${freshness}`}>{freshness}</span>;
}

function InstrumentStat({
  label,
  value,
  icon: Icon = DatabaseZap
}: {
  label: string;
  value: string;
  icon?: typeof DatabaseZap;
}) {
  const [isReadOpen, setIsReadOpen] = useState(false);
  const termInfo = getTermReadContent(label);
  return (
    <div className="wind-stat">
      <div className="wind-stat-label-row">
        <span>
          <Icon aria-hidden="true" size={15} /> {label}
        </span>
        {termInfo ? (
          <button className="mini-read-button" type="button" onClick={() => setIsReadOpen(true)} aria-label={`Read about ${label}`}>
            Read
          </button>
        ) : null}
      </div>
      <strong>{value}</strong>
      {termInfo ? (
        <ReadDrawer
          open={isReadOpen}
          onClose={() => setIsReadOpen(false)}
          title={label}
          eyebrow="Dashboard term"
          body={termInfo.definition}
          bullets={[`Current value: ${value}`, termInfo.impact, termInfo.risk]}
          references={termInfo.references}
        />
      ) : null}
    </div>
  );
}

function KpSummaryCard({
  title,
  value,
  icon: Icon,
  body,
  impact,
  risk,
  references
}: {
  title: string;
  value: string;
  icon: typeof DatabaseZap;
  body: string;
  impact: string;
  risk: string;
  references: Array<{ label: string; href: string }>;
}) {
  const [isReadOpen, setIsReadOpen] = useState(false);

  return (
    <article className="kp-summary-card">
      <div className="kp-summary-card-top">
        <span className="kp-summary-icon">
          <Icon aria-hidden="true" size={17} />
        </span>
        <Button size="small" className="read-button kp-read-button" icon={<Info size={14} />} onClick={() => setIsReadOpen(true)}>
          Read
        </Button>
      </div>
      <span className="kp-summary-label">{title}</span>
      <strong>{value}</strong>
      <ReadDrawer
        open={isReadOpen}
        onClose={() => setIsReadOpen(false)}
        title={title}
        eyebrow="Geomagnetic activity"
        body={body}
        bullets={[`Current value: ${value}`, impact, risk]}
        references={references}
      />
    </article>
  );
}

function ScaleCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="scale-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function LineChart({
  series,
  ariaLabel,
  centerOnZero = false
}: {
  series: Array<{ label: string; values: Array<number | null>; className: string }>;
  ariaLabel: string;
  centerOnZero?: boolean;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const maxLength = Math.max(...series.map((line) => line.values.length), 0);
  const visibleLength = maxLength === 0 ? 0 : Math.max(2, Math.ceil(maxLength / zoomLevel));
  const zoomedSeries = useMemo(
    () => series.map((line) => ({ ...line, values: line.values.slice(-visibleLength) })),
    [series, visibleLength]
  );
  const chartData = useMemo(() => {
    const length = Math.max(...zoomedSeries.map((line) => line.values.length), 0);
    return Array.from({ length }, (_unused, index) => {
      const row: Record<string, number | string | null> = { index };
      zoomedSeries.forEach((line) => {
        row[line.label] = line.values[index] ?? null;
      });
      return row;
    });
  }, [zoomedSeries]);
  const domain = useMemo(() => {
    const allValues = zoomedSeries.flatMap((line) => line.values).filter((value): value is number => typeof value === "number");
    if (allValues.length === 0) return ["auto", "auto"] as const;
    if (!centerOnZero) return ["auto", "auto"] as const;
    return [Math.min(0, ...allValues), Math.max(0, ...allValues)] as const;
  }, [centerOnZero, zoomedSeries]);
  const canZoomIn = zoomLevel < 4 && visibleLength > 2;
  const canZoomOut = zoomLevel > 1;
  const hasData = chartData.some((row) =>
    series.some((line) => typeof row[line.label] === "number")
  );

  return (
    <div className="sparkline recharts-panel" role="img" aria-label={ariaLabel}>
      <ChartZoomControls
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={() => setZoomLevel((level) => Math.min(4, level * 2))}
        onZoomOut={() => setZoomLevel((level) => Math.max(1, Math.floor(level / 2)))}
        onReset={() => setZoomLevel(1)}
        label={`${visibleLength || maxLength} of ${maxLength} points`}
      />
      {hasData ? (
        <ResponsiveContainer width="100%" height={190}>
          <RechartsLineChart data={chartData} margin={{ top: 16, right: 18, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="rgba(170, 183, 204, 0.16)" strokeDasharray="4 6" />
            <XAxis dataKey="index" hide />
            <YAxis domain={domain} width={42} tick={{ fill: "currentColor", fontSize: 11 }} />
            <RechartsTooltip
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(170, 183, 204, 0.25)" }}
              labelFormatter={(value) => `Point ${Number(value) + 1}`}
            />
            {centerOnZero ? <ReferenceLine y={0} stroke="rgba(248, 250, 252, 0.3)" strokeDasharray="4 5" /> : null}
            {series.map((line) => (
              <Line
                dataKey={line.label}
                dot={false}
                isAnimationActive={false}
                key={line.label}
                stroke={chartColor(line.className)}
                strokeWidth={3}
                type="monotone"
                connectNulls
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmptyState title="Live series unavailable" detail="The live feed returned an empty response. Check Source Health for upstream status details." />
      )}
    </div>
  );
}

function KpBars({ points }: { points: KpPoint[] }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const visibleLength = points.length === 0 ? 0 : Math.max(2, Math.ceil(points.length / zoomLevel));
  const visiblePoints = points.slice(-visibleLength);
  const canZoomIn = zoomLevel < 4 && visibleLength > 2;
  const canZoomOut = zoomLevel > 1;
  const hasData = visiblePoints.length > 0;

  return (
    <div className="sparkline recharts-panel" role="img" aria-label="Kp index bar chart from 0 to 9">
      <ChartZoomControls
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={() => setZoomLevel((level) => Math.min(4, level * 2))}
        onZoomOut={() => setZoomLevel((level) => Math.max(1, Math.floor(level / 2)))}
        onReset={() => setZoomLevel(1)}
        label={`${visibleLength || points.length} of ${points.length} points`}
      />
      {hasData ? (
        <ResponsiveContainer width="100%" height={190}>
          <RechartsBarChart data={visiblePoints} margin={{ top: 16, right: 18, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="rgba(170, 183, 204, 0.16)" strokeDasharray="4 6" />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 9]} width={42} tick={{ fill: "currentColor", fontSize: 11 }} />
            <RechartsTooltip
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(170, 183, 204, 0.25)" }}
              formatter={(value) => [`Kp ${Number(value).toFixed(2)}`, "Index"]}
              labelFormatter={(value) => formatDateTime(String(value))}
            />
            <ReferenceLine y={5} stroke="rgba(245, 158, 11, 0.85)" strokeDasharray="6 6" />
            <Bar dataKey="value" fill="var(--green)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </RechartsBarChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmptyState title="Kp series unavailable" detail="The live Kp feed returned an empty response. Check Source Health for upstream status details." />
      )}
    </div>
  );
}

function ChartEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="chart-empty-state" role="status">
      <AlertTriangle aria-hidden="true" size={22} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function ChartZoomControls({
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onReset,
  label
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  label: string;
}) {
  return (
    <div className="chart-zoom-controls" aria-label="Chart zoom controls">
      <span>{label}</span>
      <button type="button" onClick={onZoomOut} disabled={!canZoomOut} aria-label="Zoom out chart">
        -
      </button>
      <button type="button" onClick={onReset} disabled={!canZoomOut} aria-label="Reset chart zoom">
        Reset
      </button>
      <button type="button" onClick={onZoomIn} disabled={!canZoomIn} aria-label="Zoom in chart">
        +
      </button>
    </div>
  );
}

function TelemetryTable({
  caption,
  columns,
  rows
}: {
  caption: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <table className="data-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th scope="col" key={column}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.join("-")}`}>
            {row.map((cell, cellIndex) => (
              <td key={`${rowIndex}-${cellIndex}-${cell}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ImpactPanel({ impacts }: { impacts: ImpactItem[] }) {
  return (
    <section className="panel" aria-labelledby="impact-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sector awareness</p>
          <h2 id="impact-title">Impact summary</h2>
        </div>
      </div>
      <div className="impact-list">
        {impacts.map((impact) => {
          const Icon = sectorIcons[impact.sector] ?? Activity;

          return (
            <article className="impact-row" key={impact.sector}>
              <span className={`icon-disc severity-${impact.level}`}>
                <Icon aria-hidden="true" size={18} />
              </span>
              <div>
                <h3>{impact.sector}</h3>
                <p>{impact.reason}</p>
                <span>{impact.relatedParameter}</span>
              </div>
              <strong className={`status-pill severity-${impact.level}`}>{severityLabels[impact.level]}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AlertsPanel({ alerts }: { alerts: AlertRecord[] }) {
  return (
    <section id="alerts" className="panel" aria-labelledby="alerts-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Watches and warnings</p>
          <h2 id="alerts-title">Alerts</h2>
        </div>
      </div>
      <div className="alert-list">
        {alerts.length === 0 ? (
          <p className="empty-state">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <div>
                <span className="status-pill severity-moderate">{alert.scale}</span>
                <h3>{alert.title}</h3>
              </div>
              <p>{alert.summary}</p>
              <span>{alert.affectedSystems.join(", ")}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EventTimelinePanel({
  events,
  initialFilter = "all",
  title = "Event timeline"
}: {
  events: EventsResponse;
  initialFilter?: EventFilter;
  title?: string;
}) {
  const [filter, setFilter] = useState<EventFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(
    events.events.find((event) => initialFilter === "all" || event.type === initialFilter)?.id ?? events.events[0]?.id ?? null
  );
  const filteredEvents = events.events.filter((event) => filter === "all" || event.type === filter);
  const selectedEvent = filteredEvents.find((event) => event.id === selectedId) ?? filteredEvents[0] ?? null;
  const filters: EventFilter[] = ["all", "cme", "flare", "gst", "sep"];
  const filterCounts: Record<EventFilter, number> = {
    all: events.events.length,
    cme: events.events.filter((event) => event.type === "cme").length,
    flare: events.events.filter((event) => event.type === "flare").length,
    gst: events.events.filter((event) => event.type === "gst").length,
    sep: events.events.filter((event) => event.type === "sep").length
  };
  const filtersDisabled = events.freshness === "unavailable" || events.events.length === 0;

  function changeFilter(nextFilter: EventFilter) {
    setFilter(nextFilter);
    const nextEvent = events.events.find((event) => nextFilter === "all" || event.type === nextFilter);
    setSelectedId(nextEvent?.id ?? null);
  }

  return (
    <section id="events" className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Event timeline</p>
          <h2 id="timeline-title">{title}</h2>
        </div>
        <div className="source-stack">
          <FreshnessBadge freshness={events.freshness} />
        </div>
      </div>

      <div className="timeline-controls" aria-label="Timeline event filters">
        <ListFilter aria-hidden="true" size={16} />
        {filters.map((nextFilter) => (
          <button
            className={filter === nextFilter ? "timeline-filter-button active" : "timeline-filter-button"}
            type="button"
            key={nextFilter}
            onClick={() => changeFilter(nextFilter)}
            aria-pressed={filter === nextFilter}
            aria-label={`Filter ${eventTypeLabels[nextFilter]} events (${filterCounts[nextFilter]})`}
            disabled={filtersDisabled}
          >
            <span>{eventTypeLabels[nextFilter]}</span>
            <small>{filterCounts[nextFilter]}</small>
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className={events.freshness === "unavailable" ? "timeline-empty unavailable" : "timeline-empty"}>
          {events.freshness === "unavailable" ? <AlertTriangle aria-hidden="true" size={20} /> : null}
          <div>
            <strong>{events.freshness === "unavailable" ? "Events unavailable" : "No events in this window"}</strong>
            {events.freshness === "unavailable" ? <p>{events.errorMessage ?? "Event feed unavailable"}</p> : null}
          </div>
        </div>
      ) : (
        <div className="timeline-layout">
          <div className="timeline-list">
            {filteredEvents.map((event) => (
              <button
                className={selectedEvent?.id === event.id ? "timeline-row active" : "timeline-row"}
                type="button"
                key={event.id}
                onClick={() => setSelectedId(event.id)}
              >
                <span className={`event-type-pill event-${event.type}`}>{eventTypeLabels[event.type]}</span>
                <span className="timeline-row-body">
                  <strong>{event.title}</strong>
                  <span>{event.summary}</span>
                  <span className="timeline-meta">
                    <Clock aria-hidden="true" size={14} />
                    {formatDateTime(event.timestamp)} UTC
                  </span>
                </span>
                <span className={`status-pill severity-${event.severity}`}>{severityLabels[event.severity]}</span>
              </button>
            ))}
          </div>

          <EventDetailDrawer event={selectedEvent} onClear={() => setSelectedId(null)} />
        </div>
      )}
    </section>
  );
}

function EventDetailDrawer({ event, onClear }: { event: TimelineEvent | null; onClear: () => void }) {
  if (!event) {
    return (
      <aside className="event-detail-drawer">
        <p className="empty-state">Select an event to inspect details</p>
      </aside>
    );
  }

  const isCme = event.type === "cme";
  const detailTitle = `${eventTypeLabels[event.type]} details`;
  const detailRows = [
    ["Time", `${formatDateTime(event.timestamp)} UTC`],
    ["Severity", severityLabels[event.severity]],
    event.sourceLocation || isCme ? ["Source location", event.sourceLocation ?? "Unavailable"] : null,
    event.activeRegionNum || event.type === "flare" ? ["Active region", event.activeRegionNum ? String(event.activeRegionNum) : "Unavailable"] : null,
    event.flareClass || event.type === "flare" ? ["Flare class", event.flareClass ?? "Unavailable"] : null,
    event.speedKmPerSec || isCme ? ["CME speed", event.speedKmPerSec ? `${Math.round(event.speedKmPerSec)} km/s` : "Unavailable"] : null,
    event.halfAngleDeg || isCme ? ["Half angle", event.halfAngleDeg ? `${Math.round(event.halfAngleDeg)} degrees` : "Unavailable"] : null,
    event.earthDirected !== undefined || isCme ? ["Earth impact", event.earthDirected ? "Earth-directed" : "Not marked Earth-directed"] : null,
    event.estimatedShockArrivalTime || isCme ? ["Shock arrival", event.estimatedShockArrivalTime ? `${formatDateTime(event.estimatedShockArrivalTime)} UTC` : "No ENLIL arrival listed"] : null,
    event.kpIndex ? ["Predicted Kp", String(event.kpIndex)] : null
  ].filter((row): row is string[] => row !== null);

  return (
    <aside className={`event-detail-drawer event-detail-${event.type}`} aria-labelledby="event-detail-title">
      <p className="event-detail-kicker">{detailTitle}</p>
      <div className="event-detail-header">
        <div>
          <span className={`event-type-pill event-${event.type}`}>{eventTypeLabels[event.type]}</span>
          <h3 id="event-detail-title">{event.title}</h3>
        </div>
        <button className="icon-button" type="button" onClick={onClear} aria-label="Clear selected event">
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <p>{event.summary}</p>
      {isCme ? (
        <div className="cme-detail-strip" aria-label="CME quick facts">
          <span>
            <strong>{event.speedKmPerSec ? `${Math.round(event.speedKmPerSec)} km/s` : "Speed unavailable"}</strong>
            Speed
          </span>
          <span>
            <strong>{event.halfAngleDeg ? `${Math.round(event.halfAngleDeg)} degrees` : "Angle unavailable"}</strong>
            Half angle
          </span>
          <span>
            <strong>{event.earthDirected ? "Earth-directed" : "Not Earth-directed"}</strong>
            Impact flag
          </span>
        </div>
      ) : null}
      <dl className="event-detail-grid">
        {detailRows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {event.associatedEventIds.length > 0 ? (
        <div className="linked-events">
          <span>Linked events</span>
          <p>{event.associatedEventIds.join(", ")}</p>
        </div>
      ) : null}
      {event.instruments.length > 0 ? (
        <div className="linked-events">
          <span>Instruments</span>
          <p>{event.instruments.join(", ")}</p>
        </div>
      ) : null}
      {event.link ? (
        <a className="detail-link" href={event.link} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" size={16} />
          Open event record
        </a>
      ) : null}
    </aside>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(getApiUrl(url));

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildLinePath(values: Array<number | null>, allValues: number[], centerOnZero = false): string {
  if (values.length === 0 || allValues.length === 0) return "";
  const width = 320;
  const height = 120;
  const padding = 14;
  const min = centerOnZero ? Math.min(0, ...allValues) : Math.min(...allValues);
  const max = centerOnZero ? Math.max(0, ...allValues) : Math.max(...allValues);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      if (value === null) return "";
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
}

function formatOperationalDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp <= Date.UTC(2001, 0, 1)) return null;
  return formatDateTime(value);
}

function formatSolarCycleMonth(value: string): string {
  if (!/^\d{4}-\d{2}$/.test(value)) return value || "Unknown month";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));
}

function formatChartNumber(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "n/a";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatRelativeAge(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "age unavailable";

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (diffMinutes < 1) return "less than 1 minute old";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} old`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 48) return `${diffHours} hour${diffHours === 1 ? "" : "s"} old`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} old`;
}

function formatSigned(value: number | null | undefined, unit: string): string {
  if (typeof value !== "number") return "Unavailable";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

function formatOptional(value: number | null | undefined, unit: string, digits = 0): string {
  if (typeof value !== "number") return "Unavailable";
  return `${value.toFixed(digits)} ${unit}`;
}

function formatScientific(value: number | null | undefined, unit: string): string {
  if (typeof value !== "number") return "Unavailable";
  return `${value.toExponential(2)} ${unit}`;
}

function chartColor(className: string): string {
  const colors: Record<string, string> = {
    "xray-line": "#f97316",
    "speed-line": "#22c55e",
    "density-line": "#f59e0b",
    "bz-line": "#38bdf8",
    "bt-line": "#d946ef"
  };

  return colors[className] ?? "#38bdf8";
}

