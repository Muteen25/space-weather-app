# Product Requirements Document (PRD) and Technical Requirements Document (TRD)

# Space Weather Monitoring and Forecasting App

**Version:** 1.0  
**Prepared for:** Space Weather App Development  
**Prepared by:** Product and Technical Planning Team  
**Document Type:** Combined PRD + TRD  
**Target Platform:** Web Application, with future mobile extension  
**Primary Domain:** Space weather monitoring, forecasting, awareness, and decision support  

---

# PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Product Overview

The Space Weather App is a web-based monitoring and decision-support platform designed to provide real-time and forecasted information about solar and geomagnetic activity. The application will collect, process, visualize, and explain space weather parameters such as solar flares, coronal mass ejections, solar wind speed, interplanetary magnetic field conditions, geomagnetic indices, auroral activity, radiation storm levels, and radio blackout alerts.

The app will serve both technical and non-technical users by presenting scientific space weather data in a simplified, interactive, and visually understandable format. It will combine operational data from trusted public sources such as NOAA Space Weather Prediction Center, NASA DONKI, and NASA CCMC/iSWA with user-friendly dashboards, alerting, educational explanations, and impact-based summaries.

The product will not replace official operational warning services. Instead, it will act as an educational, research, and situational-awareness platform that helps students, researchers, satellite operators, GNSS users, aviation users, amateur radio operators, and space enthusiasts understand current space weather conditions and their possible impacts.

---

## 2. Product Vision

To build an accessible, visually rich, and scientifically reliable space weather platform that transforms complex solar-terrestrial data into meaningful insights for education, research, satellite mission awareness, GNSS reliability assessment, and public outreach.

---

## 3. Product Mission

The mission of the app is to provide a centralized interface where users can:

1. Monitor current solar and geomagnetic conditions.
2. Understand the severity of space weather using clear scales and color-coded indicators.
3. Track solar flares, CMEs, geomagnetic storms, radiation storms, and radio blackouts.
4. Receive alerts and notifications for significant space weather events.
5. Visualize space weather trends through charts, maps, timelines, and event cards.
6. Learn how space weather affects satellites, GNSS, aviation, radio communication, power grids, and auroras.
7. Support education and outreach activities through simplified explanations and interactive tools.

---

## 4. Background and Problem Statement

Space weather is caused by activity on the Sun and its interaction with Earth’s magnetosphere, ionosphere, and upper atmosphere. Solar flares, coronal mass ejections, high-speed solar wind streams, and energetic particles can affect satellite operations, GNSS positioning, HF radio communication, aviation routes, astronaut safety, aurora visibility, and electrical power infrastructure.

Although several official agencies provide space weather data, the information is often distributed across multiple platforms, technical pages, raw files, model outputs, and scientific dashboards. Many users find it difficult to interpret technical parameters such as Kp index, Bz component, proton flux, X-ray flux, CME speed, radio blackout levels, or geomagnetic storm scales.

This creates a need for a unified application that fetches official data, converts it into useful visual and impact-based summaries, and presents it in a way that is understandable for both experts and general users.

---

## 5. Target Users

### 5.1 Primary Users

| User Group | Needs |
|---|---|
| Space science students | Learn real-time space weather concepts through visual dashboards. |
| Researchers | Access recent solar and geomagnetic events for analysis. |
| Satellite mission students/operators | Understand space environment conditions affecting spacecraft. |
| GNSS users and researchers | Monitor geomagnetic disturbances that may affect positioning accuracy. |
| Amateur radio operators | Track radio blackout and ionospheric disturbance conditions. |
| Astronomy and aurora enthusiasts | View aurora forecasts and geomagnetic storm activity. |
| STEM educators | Use simplified visual content for classroom demonstrations. |

### 5.2 Secondary Users

| User Group | Needs |
|---|---|
| Aviation awareness users | Understand radiation storm and HF radio communication risks. |
| General public | Get simple explanations of solar storms and auroras. |
| Outreach teams | Use the app during space awareness events and workshops. |
| Policy and institutional users | View space weather impacts in a summarized format. |

---

## 6. User Personas

### Persona 1 — Space Science Student

**Name:** Ayesha  
**Background:** Undergraduate student in Space Science  
**Goal:** Understand current solar activity and geomagnetic storms for coursework.  
**Pain Point:** Official space weather pages are technical and scattered.  
**App Value:** Provides simplified explanations, live charts, and event timelines.

### Persona 2 — GNSS Researcher

**Name:** Hamza  
**Background:** Researcher working on GNSS positioning errors  
**Goal:** Check Kp index, solar wind conditions, and geomagnetic storm periods.  
**Pain Point:** Needs quick access to disturbance periods and historical event context.  
**App Value:** Offers geomagnetic dashboard, downloadable data, and event filtering.

### Persona 3 — Satellite Mission Engineer

**Name:** Sara  
**Background:** Small satellite mission team member  
**Goal:** Monitor radiation, geomagnetic disturbances, and solar activity.  
**Pain Point:** Needs event-based summaries instead of raw feeds.  
**App Value:** Shows severity levels, spacecraft impact summaries, and alert cards.

### Persona 4 — Amateur Radio Operator

**Name:** Bilal  
**Background:** HF radio hobbyist  
**Goal:** Know when solar flares or radio blackouts may affect communication.  
**Pain Point:** Does not want to interpret raw X-ray flux data manually.  
**App Value:** Provides R-scale alerts and plain-language communication impact.

### Persona 5 — STEM Educator

**Name:** Dr. Noor  
**Background:** Science teacher / outreach coordinator  
**Goal:** Demonstrate real-time solar activity during classroom sessions.  
**Pain Point:** Needs educational visuals and simple explanations.  
**App Value:** Provides teaching mode, glossary, diagrams, and simplified dashboards.

---

## 7. Product Goals

### 7.1 Functional Goals

1. Display real-time space weather conditions in a central dashboard.
2. Show solar wind parameters including speed, density, temperature, IMF strength, and Bz component.
3. Display NOAA space weather scales: G-scale, R-scale, and S-scale.
4. Show current and recent Kp index values.
5. Display solar flare activity using GOES X-ray flux data.
6. Track CME events from NASA DONKI.
7. Display geomagnetic storm events and warnings.
8. Provide aurora visibility forecast or aurora activity indicators.
9. Provide alerts, watches, and warnings in clear language.
10. Provide impact summaries for satellites, GNSS, radio, aviation, power systems, and auroras.
11. Allow users to view historical event timelines.
12. Provide educational explanations for space weather terms.
13. Allow users to download charts or data in CSV format.
14. Support configurable alert thresholds.
15. Support responsive design for desktop, tablet, and mobile browsers.

### 7.2 Non-Functional Goals

1. Ensure fast dashboard loading.
2. Use official and reliable public data sources.
3. Clearly show data source and timestamp.
4. Handle missing or delayed data gracefully.
5. Provide intuitive visualization and color-coded severity indicators.
6. Maintain modular architecture for future extension.
7. Ensure accessibility and readability.
8. Support scalable backend data ingestion.
9. Keep the platform secure and maintainable.
10. Avoid presenting the app as an official emergency warning system.

---

## 8. Product Scope

### 8.1 In Scope for Version 1.0

1. Web-based dashboard.
2. Real-time solar wind panel.
3. Kp index and geomagnetic activity panel.
4. NOAA space weather scale panel.
5. Solar flare and X-ray flux visualization.
6. CME event list using NASA DONKI.
7. Alerts, watches, and warnings page.
8. Impact summary page.
9. Educational glossary.
10. Historical event timeline.
11. Data refresh system.
12. User alert preferences.
13. CSV export for selected datasets.
14. Basic admin panel for monitoring ingestion status.

### 8.2 Out of Scope for Version 1.0

1. Native Android and iOS mobile applications.
2. Operational satellite command decision automation.
3. Paid subscription system.
4. User-generated public posts or forums.
5. Advanced machine learning forecast engine.
6. Integration with private satellite telemetry.
7. Direct emergency notification authority.
8. Full 3D heliospheric simulation environment.

### 8.3 Future Scope

1. Native mobile app.
2. AI-based storm summarization.
3. Machine learning-based Kp and solar wind forecasting.
4. GNSS scintillation map integration.
5. TEC map integration.
6. Personalized location-based aurora visibility forecast.
7. Educational classroom mode.
8. Research workspace for event comparison.
9. API access for institutional users.
10. Satellite risk mode based on orbit altitude and inclination.

---

## 9. Key Product Modules

## 9.1 Home Dashboard

The home dashboard will provide a quick situational overview of current space weather conditions.

### Features

1. Current space weather summary.
2. Current Kp index.
3. Current G, R, and S scale levels.
4. Solar wind speed.
5. IMF Bz value.
6. Latest solar flare class.
7. Recent CME count.
8. Active alerts and warnings.
9. Overall condition label: Quiet, Unsettled, Active, Storm, Severe.
10. Data last updated timestamp.

### User Story

As a user, I want to open one dashboard and immediately understand whether current space weather conditions are quiet or disturbed.

### Acceptance Criteria

1. Dashboard loads within 3 seconds under normal network conditions.
2. Dashboard displays data source and last updated time.
3. If a feed fails, the affected card shows “Data unavailable” instead of breaking the page.
4. Severity colors remain consistent across the app.

---

## 9.2 Solar Activity Module

This module focuses on solar flares, X-ray flux, sunspot activity, and solar eruption events.

### Features

1. GOES X-ray flux chart.
2. Latest flare class indicator.
3. Solar flare event table.
4. Solar flare severity explanation.
5. CME event list from NASA DONKI.
6. CME details including start time, source location, speed, half angle, and Earth-directed status when available.
7. Solar images section for future integration with SDO/SUVI imagery.

### User Story

As a student, I want to see whether the Sun has produced recent flares or CMEs so that I can relate solar activity to geomagnetic disturbances on Earth.

### Acceptance Criteria

1. Solar flare classes are shown using A, B, C, M, and X class labels.
2. CME events are sorted by most recent first.
3. Event details open in a modal or detail page.
4. Associated events are linked where source data provides relationships.

---

## 9.3 Solar Wind Module

This module displays real-time solar wind conditions measured upstream of Earth.

### Features

1. Solar wind speed chart.
2. Proton density chart.
3. Solar wind temperature chart.
4. Interplanetary magnetic field total strength.
5. IMF Bz component chart.
6. Data freshness indicator.
7. Disturbance interpretation card.
8. Short explanation of why southward Bz can increase geomagnetic activity.

### User Story

As a researcher, I want to monitor solar wind speed and Bz so that I can identify periods when Earth’s magnetosphere may become disturbed.

### Acceptance Criteria

1. Charts support at least 2-hour, 6-hour, 24-hour, and 3-day views.
2. Negative Bz values are visually identifiable.
3. Data gaps are shown clearly.
4. The module indicates whether data is real-time, delayed, or unavailable.

---

## 9.4 Geomagnetic Activity Module

This module tracks disturbances in Earth’s magnetic field using Kp and related geomagnetic indicators.

### Features

1. Kp index chart.
2. Current Kp value card.
3. G-scale geomagnetic storm interpretation.
4. Recent geomagnetic storm events.
5. Estimated storm level: G0 to G5.
6. Impact explanation for satellites, GNSS, aurora, and power systems.

### User Story

As a GNSS user, I want to know whether geomagnetic conditions are active or storm-level because this can affect GNSS accuracy and reliability.

### Acceptance Criteria

1. Kp values are mapped to severity labels.
2. Geomagnetic storm thresholds are clearly explained.
3. Current and historical Kp are visually separated.
4. Users can download Kp data as CSV.

---

## 9.5 Alerts, Watches, and Warnings Module

This module displays official space weather alerts and summarizes their meaning.

### Features

1. Active alerts list.
2. Watch and warning categories.
3. Severity level indicators.
4. Plain-language explanation.
5. Impact categories.
6. Time issued and valid period.
7. Source link/reference label.
8. Push/email notification support in future version.

### User Story

As a user, I want alerts explained in simple language so that I know what the warning means and which systems may be affected.

### Acceptance Criteria

1. Alerts are sorted by active status and time.
2. Expired alerts are separated from active alerts.
3. Each alert has a severity label and affected systems.
4. No alert is displayed without a timestamp.

---

## 9.6 Impact Summary Module

This module translates technical space weather parameters into sector-wise impact summaries.

### Impact Areas

1. Satellites.
2. GNSS and navigation.
3. HF radio communication.
4. Aviation.
5. Power grids.
6. Aurora visibility.
7. Human spaceflight radiation awareness.

### Features

1. Impact cards.
2. Current risk level for each sector.
3. Explanation of why risk is high or low.
4. Recommended awareness notes.
5. Link to relevant data source card.

### User Story

As a non-technical user, I want to understand what current space weather means for real-world systems instead of only seeing scientific numbers.

### Acceptance Criteria

1. Impact summaries are generated using deterministic rules in Version 1.0.
2. The app must not give operational instructions for critical systems.
3. Each impact card must show the data factor that contributed to the risk level.

---

## 9.7 Event Timeline Module

This module presents space weather events in chronological form.

### Features

1. Timeline of solar flares, CMEs, SEPs, geomagnetic storms, and alerts.
2. Filters by event type.
3. Date range selector.
4. Event detail drawer.
5. Associated event linking.
6. Export timeline as CSV.

### User Story

As a researcher, I want to view a timeline of space weather events so that I can understand cause-and-effect relationships between solar eruptions and geomagnetic responses.

### Acceptance Criteria

1. Timeline supports at least 30 days of events in Version 1.0.
2. Events are filterable by type.
3. Each event includes timestamp, type, source, and summary.
4. Event details are accessible without leaving the timeline page.

---

## 9.8 Aurora Module

This module provides aurora activity and visibility awareness.

### Features

1. Aurora activity card.
2. Kp-based aurora possibility explanation.
3. Map placeholder for future aurora oval integration.
4. Current geomagnetic conditions.
5. Simplified aurora viewing explanation.

### User Story

As an astronomy enthusiast, I want to know whether geomagnetic conditions are favorable for auroras.

### Acceptance Criteria

1. Aurora likelihood is linked to Kp and geomagnetic data.
2. The app explains that actual visibility depends on location, darkness, weather, and light pollution.
3. Aurora module must not overpromise visibility.

---

## 9.9 Education and Glossary Module

This module explains space weather terms for students and the public.

### Features

1. Glossary of key terms.
2. Simple diagrams and text explanations.
3. “Why it matters” explanation for each term.
4. Beginner and advanced explanation toggles.
5. Classroom-friendly mode.

### Glossary Topics

1. Space weather.
2. Solar flare.
3. Coronal mass ejection.
4. Solar wind.
5. Interplanetary magnetic field.
6. Bz component.
7. Kp index.
8. Geomagnetic storm.
9. Radiation storm.
10. Radio blackout.
11. Aurora.
12. Magnetosphere.
13. Ionosphere.
14. Solar energetic particles.
15. GNSS scintillation.
16. Total electron content.
17. HF communication.
18. Satellite drag.

### Acceptance Criteria

1. Every dashboard parameter links to glossary entry.
2. Definitions must be concise and scientifically correct.
3. Education mode must avoid excessive jargon.

---

## 10. User Roles and Permissions

| Role | Permissions |
|---|---|
| Guest User | View public dashboard, charts, glossary, and alerts. |
| Registered User | Save preferences, set alert thresholds, download data. |
| Research User | Access extended historical views and export tools. |
| Admin | Monitor ingestion jobs, manage sources, update educational content. |

---

## 11. Functional Requirements

### FR-01: Dashboard Summary

The system shall display a real-time summary of current space weather conditions using cards and charts.

### FR-02: Data Source Integration

The system shall integrate with public data sources for solar wind, Kp index, NOAA scales, alerts, and NASA DONKI event data.

### FR-03: Data Refresh

The system shall refresh near-real-time data automatically based on source-specific update intervals.

### FR-04: Data Timestamp

The system shall display the timestamp of the latest available data for every major data card.

### FR-05: Solar Wind Visualization

The system shall display solar wind speed, density, temperature, IMF magnitude, and Bz component.

### FR-06: Geomagnetic Monitoring

The system shall display Kp index and geomagnetic storm level.

### FR-07: Solar Flare Monitoring

The system shall display current and recent solar flare activity using X-ray flux data.

### FR-08: CME Event Tracking

The system shall list CME events from NASA DONKI and provide event details.

### FR-09: Alert Display

The system shall show active space weather alerts, watches, and warnings.

### FR-10: Impact Interpretation

The system shall translate technical conditions into sector-wise impact summaries.

### FR-11: Historical Timeline

The system shall display historical space weather events in a timeline view.

### FR-12: User Preferences

The system shall allow registered users to set display preferences and alert thresholds.

### FR-13: Data Export

The system shall allow CSV export for selected datasets.

### FR-14: Educational Glossary

The system shall include educational explanations linked to dashboard terms.

### FR-15: Admin Monitoring

The system shall allow admins to monitor API health, ingestion status, and failed jobs.

---

## 12. Non-Functional Requirements

### NFR-01: Performance

The dashboard should load key summary cards within 3 seconds under normal network conditions.

### NFR-02: Availability

The system should target 99% monthly availability for public dashboard access.

### NFR-03: Scalability

The backend should support increased user traffic through caching and scheduled ingestion.

### NFR-04: Reliability

The app should continue working even if one or more external feeds are temporarily unavailable.

### NFR-05: Security

The app must protect user accounts, preferences, and admin functions using secure authentication and authorization.

### NFR-06: Maintainability

The codebase must be modular, documented, and easy to extend.

### NFR-07: Accessibility

The interface should follow accessibility principles including contrast, keyboard navigation, and readable typography.

### NFR-08: Responsiveness

The app must work on desktop, tablet, and mobile browsers.

### NFR-09: Data Integrity

The system must preserve source timestamps and avoid overwriting historical records incorrectly.

### NFR-10: Transparency

The app must clearly identify its data sources and limitations.

---

## 13. Data Sources

### 13.1 NOAA Space Weather Prediction Center

Purpose:

1. Operational space weather observations.
2. Kp index.
3. Solar wind data.
4. Alerts, watches, and warnings.
5. Space weather scales.
6. GOES X-ray flux and proton flux products.

### 13.2 NASA DONKI

Purpose:

1. CME events.
2. Solar flare events.
3. Solar energetic particle events.
4. Geomagnetic storm events.
5. Interplanetary shock events.
6. Notifications and event linkages.

### 13.3 NASA CCMC/iSWA

Purpose:

1. Integrated space weather analysis.
2. Real-time space environment information.
3. Model outputs and visualization products.
4. Future advanced dashboard integration.

### 13.4 Optional Future Sources

1. SDO imagery.
2. SOHO/LASCO coronagraph images.
3. GNSS TEC map services.
4. Local magnetometer data.
5. IGS GNSS data products.
6. ESA Space Weather Service Network products.

---

## 14. Main Dashboard KPIs

| KPI | Description | Source |
|---|---|---|
| Current Kp | Current planetary geomagnetic index | NOAA SWPC |
| Solar wind speed | Speed of solar wind near L1 | NOAA SWPC |
| IMF Bz | North-south magnetic field component | NOAA SWPC |
| X-ray flux | Solar flare intensity indicator | NOAA GOES/SWPC |
| G-scale | Geomagnetic storm level | NOAA SWPC |
| R-scale | Radio blackout level | NOAA SWPC |
| S-scale | Solar radiation storm level | NOAA SWPC |
| Recent CMEs | CME events in selected time period | NASA DONKI |
| Active alerts | Current warnings, watches, alerts | NOAA SWPC |

---

## 15. Severity Mapping

### 15.1 Overall Condition Labels

| Condition | Example Criteria |
|---|---|
| Quiet | Kp 0–2, no major alerts, low flare activity |
| Unsettled | Kp 3, mild solar wind disturbance |
| Active | Kp 4, elevated solar wind or southward Bz |
| Minor Storm | Kp 5 or G1 condition |
| Moderate Storm | Kp 6 or G2 condition |
| Strong Storm | Kp 7 or G3 condition |
| Severe Storm | Kp 8 or G4 condition |
| Extreme Storm | Kp 9 or G5 condition |

### 15.2 Solar Flare Severity

| Class | Meaning |
|---|---|
| A/B | Very low activity |
| C | Small flare |
| M | Medium flare with possible radio impact |
| X | Major flare with possible significant radio blackout impact |

### 15.3 Impact Severity

| Level | Meaning |
|---|---|
| Low | Normal or quiet conditions |
| Moderate | Increased awareness recommended |
| High | Significant disturbance possible |
| Severe | Strong disturbance or official warning active |

---

## 16. User Experience Requirements

### 16.1 Design Principles

1. Scientific but simple.
2. Visual-first dashboard.
3. Clear severity colors.
4. Minimal jargon on main screens.
5. Detailed explanation available on demand.
6. Every chart must show units and timestamps.
7. Alerts must be written in plain language.
8. Educational content should support classroom use.

### 16.2 Suggested Navigation

1. Dashboard.
2. Solar Activity.
3. Solar Wind.
4. Geomagnetic Activity.
5. Alerts.
6. Impact Summary.
7. Event Timeline.
8. Aurora.
9. Learn.
10. Settings.
11. Admin.

### 16.3 Visual Identity

Suggested theme:

1. Dark space-themed background.
2. Solar orange accents for solar activity.
3. Magnetic blue/purple accents for geomagnetic activity.
4. Red/yellow severity colors for warnings.
5. Clean card-based layout.
6. Interactive charts with hover tooltips.
7. Responsive side navigation.

---

## 17. MVP Definition

The Minimum Viable Product should include:

1. Public dashboard.
2. NOAA current conditions cards.
3. Kp index chart.
4. Solar wind chart.
5. NOAA alert list.
6. NASA DONKI CME list.
7. Solar flare chart.
8. Impact summary cards.
9. Glossary page.
10. Admin ingestion health page.

---

## 18. Success Metrics

### 18.1 Product Metrics

1. Dashboard load time under 3 seconds.
2. 95% successful data refresh rate.
3. At least 80% of users can understand current condition without external explanation.
4. At least 70% repeat usage among target educational users after first demo.
5. Less than 2% frontend error rate.

### 18.2 Educational Metrics

1. Number of glossary views.
2. Number of classroom-mode sessions.
3. Number of data exports for research/assignments.
4. Number of event timeline views.
5. User feedback rating on clarity of explanations.

---

## 19. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| External API downtime | Use caching, retries, and fallback display. |
| Misinterpretation of alerts | Use plain-language summaries and disclaimers. |
| Data latency | Show timestamps and freshness status. |
| Overload from frequent polling | Use scheduled backend ingestion and cache. |
| Scientific inaccuracies | Validate logic with official scale definitions. |
| UI complexity | Use progressive disclosure and beginner/advanced modes. |
| User treats app as official warning system | Display clear disclaimer and source links. |

---

## 20. Product Disclaimer

The Space Weather App is intended for educational, research, and situational-awareness purposes. It should not be used as the sole source for operational decisions, emergency response, aviation routing, satellite maneuvering, or power grid protection. Users requiring official warnings should consult the relevant operational agencies directly.

---

# PART B — TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 1. Technical Overview

The Space Weather App will be implemented as a full-stack web application with a modular frontend, backend API server, scheduled data ingestion system, database storage layer, caching layer, alert processing engine, and admin monitoring interface.

The system will fetch data from official public APIs and data feeds, normalize the data into internal schemas, store current and historical records, compute derived indicators, and expose processed data to the frontend through REST APIs. The frontend will provide real-time dashboards, charts, event timelines, alerts, and educational pages.

---

## 2. Proposed Technology Stack

### 2.1 Frontend

| Component | Recommended Technology |
|---|---|
| Framework | React.js or Next.js |
| Language | JavaScript or TypeScript |
| UI Library | Ant Design, Material UI, or Tailwind CSS |
| Charts | Recharts, ECharts, Chart.js, or Plotly |
| Maps | Leaflet or Mapbox GL JS |
| State Management | React Query, Redux Toolkit, or Zustand |
| Routing | React Router or Next.js Router |
| HTTP Client | Axios or Fetch API |
| Authentication UI | JWT-based login flow |

### 2.2 Backend

| Component | Recommended Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js or NestJS |
| Language | JavaScript or TypeScript |
| Authentication | JWT + bcrypt |
| Scheduling | node-cron, BullMQ, or Agenda |
| API Documentation | Swagger/OpenAPI |
| Validation | Joi or Zod |
| Logging | Winston or Pino |

### 2.3 Database and Storage

| Component | Recommended Technology |
|---|---|
| Primary Database | MongoDB Atlas or PostgreSQL |
| Time-Series Data | MongoDB time-series collections or TimescaleDB |
| Cache | Redis |
| File Export | Server-generated CSV files or streaming response |
| Object Storage | Optional S3-compatible storage for generated reports/images |

### 2.4 Deployment

| Component | Recommended Platform |
|---|---|
| Frontend | Vercel, Netlify, or Nginx server |
| Backend | Render, Railway, DigitalOcean, AWS, or institutional server |
| Database | MongoDB Atlas or managed PostgreSQL |
| Cache | Redis Cloud or self-hosted Redis |
| Monitoring | UptimeRobot, Grafana, Prometheus, Sentry |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```text
External Data Sources
(NOAA SWPC, NASA DONKI, NASA CCMC/iSWA)
        |
        v
Data Ingestion Services
(Scheduled Fetchers + Parsers + Validators)
        |
        v
Normalization Layer
(Unit Conversion + Schema Mapping + Quality Checks)
        |
        v
Database + Cache
(Historical Records + Latest Snapshot + Redis Cache)
        |
        v
Backend API Layer
(REST APIs + Auth + Alert Engine + Export Service)
        |
        v
Frontend Application
(Dashboard + Charts + Timeline + Alerts + Education)
```

### 3.2 Core Backend Services

1. API Gateway / Express Server.
2. Data ingestion worker.
3. Source adapter layer.
4. Data normalization service.
5. Alert processing service.
6. Impact scoring service.
7. Cache service.
8. Export service.
9. Admin monitoring service.
10. Authentication service.

---

## 4. External Data Integration Requirements

## 4.1 NOAA SWPC Integration

### Purpose

The NOAA SWPC integration will provide real-time and operational space weather observations and warnings.

### Required Data Categories

1. Planetary Kp index.
2. Real-time solar wind plasma data.
3. Real-time magnetic field data.
4. Space weather scales.
5. Alerts, watches, and warnings.
6. GOES X-ray flux.
7. GOES proton flux.
8. Satellite environment products where available.

### Technical Requirements

1. The system shall fetch NOAA data through public JSON, text, or CSV endpoints where available.
2. The system shall parse timestamped values into UTC ISO 8601 format.
3. The system shall store raw response snapshots for debugging.
4. The system shall normalize fields into internal schema.
5. The system shall detect stale data based on timestamp difference.
6. The system shall retry failed requests using exponential backoff.
7. The system shall not exceed reasonable polling frequency.

### Suggested Polling Frequency

| Product | Frequency |
|---|---|
| Real-time solar wind | Every 1–5 minutes |
| Magnetic field | Every 1–5 minutes |
| Kp index | Every 5–15 minutes |
| Alerts/warnings | Every 2–5 minutes |
| X-ray flux | Every 1–5 minutes |
| Proton flux | Every 5 minutes |

---

## 4.2 NASA DONKI Integration

### Purpose

NASA DONKI will be used to retrieve structured space weather events and event relationships.

### Required Event Types

1. Coronal Mass Ejection.
2. Solar Flare.
3. Solar Energetic Particle.
4. Geomagnetic Storm.
5. Interplanetary Shock.
6. Radiation Belt Enhancement.
7. High Speed Stream.
8. Notifications.

### Technical Requirements

1. The system shall query DONKI by date range.
2. The system shall store event IDs and avoid duplication.
3. The system shall map DONKI event types to internal event categories.
4. The system shall preserve linked events where available.
5. The system shall support backfilling historical events.
6. The system shall handle missing optional fields.
7. The system shall support API key configuration through environment variables where needed.

### Suggested Polling Frequency

| Event Type | Frequency |
|---|---|
| CME | Every 30–60 minutes |
| Solar Flare | Every 10–30 minutes |
| SEP | Every 30 minutes |
| Geomagnetic Storm | Every 30 minutes |
| Notifications | Every 10 minutes |

---

## 4.3 NASA CCMC/iSWA Integration

### Purpose

NASA CCMC/iSWA may be used for advanced model outputs, visualizations, and future extensions.

### Version 1.0 Use

1. Optional source reference.
2. Future-ready adapter structure.
3. Link-out or embedded visual product if technically permitted.

### Future Use

1. WSA-ENLIL solar wind prediction products.
2. Magnetosphere model outputs.
3. Simulation images.
4. Space environment visualization layers.

---

## 5. Internal Data Models

## 5.1 User Model

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "guest | user | researcher | admin",
  "preferences": {
    "theme": "dark | light",
    "defaultTimeRange": "2h | 6h | 24h | 3d | 7d",
    "units": "metric",
    "alertThresholds": {
      "kp": 5,
      "flareClass": "M",
      "solarWindSpeed": 600,
      "bzSouthward": -10
    }
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 5.2 Solar Wind Data Model

```json
{
  "_id": "ObjectId",
  "timestamp": "Date",
  "source": "NOAA_SWPC",
  "speedKmPerSec": 450.2,
  "densityPerCc": 6.4,
  "temperatureK": 120000,
  "qualityFlag": "valid | estimated | missing",
  "raw": {},
  "createdAt": "Date"
}
```

## 5.3 IMF Magnetic Field Model

```json
{
  "_id": "ObjectId",
  "timestamp": "Date",
  "source": "NOAA_SWPC",
  "btNt": 8.5,
  "bxNt": 1.2,
  "byNt": -3.4,
  "bzNt": -7.8,
  "phiDeg": 175.2,
  "thetaDeg": -21.4,
  "qualityFlag": "valid | estimated | missing",
  "raw": {},
  "createdAt": "Date"
}
```

## 5.4 Kp Index Model

```json
{
  "_id": "ObjectId",
  "timestamp": "Date",
  "source": "NOAA_SWPC",
  "kp": 4.67,
  "ap": 32,
  "stormLevel": "G0 | G1 | G2 | G3 | G4 | G5",
  "condition": "quiet | unsettled | active | storm | severe",
  "raw": {},
  "createdAt": "Date"
}
```

## 5.5 Space Weather Scale Model

```json
{
  "_id": "ObjectId",
  "timestamp": "Date",
  "source": "NOAA_SWPC",
  "gScale": "G0 | G1 | G2 | G3 | G4 | G5",
  "rScale": "R0 | R1 | R2 | R3 | R4 | R5",
  "sScale": "S0 | S1 | S2 | S3 | S4 | S5",
  "observedMax24h": {
    "g": "G1",
    "r": "R2",
    "s": "S0"
  },
  "latestObserved": {
    "g": "G0",
    "r": "R1",
    "s": "S0"
  },
  "raw": {},
  "createdAt": "Date"
}
```

## 5.6 Solar Flare Model

```json
{
  "_id": "ObjectId",
  "eventId": "string",
  "source": "NASA_DONKI | NOAA_SWPC",
  "beginTime": "Date",
  "peakTime": "Date",
  "endTime": "Date",
  "classType": "C3.2 | M1.5 | X2.1",
  "sourceLocation": "string",
  "activeRegionNum": "string",
  "linkedEvents": [],
  "raw": {},
  "createdAt": "Date"
}
```

## 5.7 CME Model

```json
{
  "_id": "ObjectId",
  "eventId": "string",
  "source": "NASA_DONKI",
  "startTime": "Date",
  "sourceLocation": "string",
  "speedKmPerSec": 900,
  "halfAngleDeg": 45,
  "type": "C | S | R",
  "earthDirected": true,
  "enlilList": [],
  "linkedEvents": [],
  "notes": "string",
  "raw": {},
  "createdAt": "Date"
}
```

## 5.8 Alert Model

```json
{
  "_id": "ObjectId",
  "source": "NOAA_SWPC",
  "alertId": "string",
  "title": "string",
  "category": "alert | watch | warning | summary",
  "severity": "low | moderate | high | severe",
  "scale": "G | R | S | general",
  "level": "G2",
  "issuedAt": "Date",
  "validFrom": "Date",
  "validTo": "Date",
  "status": "active | expired",
  "plainLanguageSummary": "string",
  "affectedSystems": ["satellite", "GNSS", "radio"],
  "raw": {},
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 5.9 Event Timeline Model

```json
{
  "_id": "ObjectId",
  "eventId": "string",
  "eventType": "flare | cme | sep | gst | ips | alert | hss",
  "timestamp": "Date",
  "title": "string",
  "summary": "string",
  "severity": "low | moderate | high | severe",
  "source": "NOAA_SWPC | NASA_DONKI | NASA_CCMC",
  "linkedEventIds": [],
  "metadata": {},
  "createdAt": "Date"
}
```

## 5.10 Data Source Health Model

```json
{
  "_id": "ObjectId",
  "sourceName": "NOAA_SWPC_SOLAR_WIND",
  "lastFetchAt": "Date",
  "lastSuccessAt": "Date",
  "lastFailureAt": "Date",
  "status": "healthy | degraded | down",
  "latencyMs": 850,
  "recordsFetched": 120,
  "errorMessage": "string",
  "updatedAt": "Date"
}
```

---

## 6. Backend API Requirements

## 6.1 Public APIs

### GET /api/dashboard/summary

Returns current condition summary.

Response:

```json
{
  "condition": "Active",
  "overallSeverity": "moderate",
  "lastUpdated": "2026-05-14T07:00:00Z",
  "kp": 4.3,
  "gScale": "G0",
  "rScale": "R1",
  "sScale": "S0",
  "solarWindSpeed": 520,
  "bz": -6.2,
  "latestFlare": "M1.2",
  "activeAlerts": 2
}
```

### GET /api/solar-wind

Query parameters:

1. range: 2h, 6h, 24h, 3d, 7d.
2. resolution: raw, 1m, 5m, 15m.

Response:

```json
{
  "range": "24h",
  "source": "NOAA_SWPC",
  "lastUpdated": "Date",
  "data": [
    {
      "timestamp": "Date",
      "speedKmPerSec": 450,
      "densityPerCc": 5.4,
      "temperatureK": 110000
    }
  ]
}
```

### GET /api/magnetic-field

Returns IMF data including Bt, Bx, By, and Bz.

### GET /api/kp

Returns current and historical Kp index data.

### GET /api/scales

Returns latest NOAA G, R, and S scale information.

### GET /api/alerts

Returns alerts, watches, and warnings.

Query parameters:

1. status: active, expired, all.
2. scale: G, R, S, general.
3. limit.

### GET /api/events

Returns timeline events.

Query parameters:

1. type: flare, cme, sep, gst, ips, hss, alert.
2. startDate.
3. endDate.
4. severity.
5. limit.

### GET /api/events/:id

Returns detailed event information.

### GET /api/cme

Returns CME events.

### GET /api/flares

Returns solar flare events.

### GET /api/impact-summary

Returns current sector-wise impact levels.

### GET /api/glossary

Returns glossary terms.

### GET /api/export/csv

Exports selected dataset as CSV.

Query parameters:

1. dataset: solarWind, kp, alerts, events, flares, cme.
2. startDate.
3. endDate.

---

## 6.2 Authenticated APIs

### POST /api/auth/register

Registers a user.

### POST /api/auth/login

Authenticates a user and returns JWT.

### GET /api/user/preferences

Returns user preferences.

### PUT /api/user/preferences

Updates user preferences.

### GET /api/user/alerts/preferences

Returns alert threshold preferences.

### PUT /api/user/alerts/preferences

Updates alert thresholds.

---

## 6.3 Admin APIs

### GET /api/admin/source-health

Returns source ingestion health.

### POST /api/admin/ingestion/run

Manually triggers ingestion job.

### GET /api/admin/logs

Returns recent system logs.

### PUT /api/admin/glossary/:id

Updates glossary entry.

---

## 7. Data Ingestion Architecture

## 7.1 Source Adapter Pattern

Each external data source will have a separate adapter.

```text
/adapters
  noaaSolarWindAdapter.js
  noaaMagneticFieldAdapter.js
  noaaKpAdapter.js
  noaaAlertsAdapter.js
  noaaXrayAdapter.js
  nasaDonkiCmeAdapter.js
  nasaDonkiFlareAdapter.js
  nasaDonkiGstAdapter.js
  nasaCcmcAdapter.js
```

Each adapter must implement:

1. fetchData().
2. parseData().
3. normalizeData().
4. validateData().
5. saveData().
6. updateHealthStatus().

## 7.2 Ingestion Flow

```text
Cron Trigger
   ↓
Fetch external source
   ↓
Validate response status
   ↓
Parse source format
   ↓
Normalize units and timestamps
   ↓
Check duplicates
   ↓
Save new records
   ↓
Update latest snapshot cache
   ↓
Run alert and impact rules
   ↓
Update source health
```

## 7.3 Error Handling

The ingestion system shall:

1. Retry failed requests up to 3 times.
2. Use exponential backoff.
3. Log response codes and errors.
4. Mark source as degraded after repeated failures.
5. Continue other ingestion jobs even if one source fails.
6. Notify admin for persistent failures.

---

## 8. Derived Logic and Impact Rules

## 8.1 Overall Severity Calculation

The app will calculate an overall space weather condition using deterministic rules.

Example logic:

```text
If any active G4/G5, R4/R5, or S4/S5 alert exists → Extreme/Severe
Else if Kp >= 8 → Severe
Else if Kp >= 7 → Strong Storm
Else if Kp >= 6 → Moderate Storm
Else if Kp >= 5 → Minor Storm
Else if Kp >= 4 → Active
Else if Kp >= 3 → Unsettled
Else → Quiet
```

## 8.2 GNSS Impact Rule

Inputs:

1. Kp index.
2. G-scale.
3. Solar flare R-scale.
4. Bz.
5. Solar wind speed.

Example:

```text
Low: Kp < 4 and no R-scale alert
Moderate: Kp 4–5 or R1/R2
High: Kp 6–7 or G2/G3
Severe: Kp >= 8 or G4/G5
```

## 8.3 Satellite Impact Rule

Inputs:

1. Geomagnetic storm level.
2. Radiation storm level.
3. Solar wind speed.
4. Proton flux.
5. CME Earth-directed status.

Example:

```text
Low: no active storm, normal solar wind
Moderate: G1/G2 or elevated solar wind
High: G3 or S2/S3
Severe: G4/G5 or S4/S5
```

## 8.4 HF Radio Impact Rule

Inputs:

1. R-scale.
2. Solar flare class.
3. X-ray flux.

Example:

```text
Low: no R alert, flare below M class
Moderate: M-class flare or R1
High: R2/R3
Severe: R4/R5
```

## 8.5 Aurora Likelihood Rule

Inputs:

1. Kp index.
2. G-scale.
3. Geographic latitude in future version.

Example:

```text
Low: Kp <= 3
Moderate: Kp 4–5
High: Kp 6–7
Very High: Kp >= 8
```

---

## 9. Frontend Requirements

## 9.1 Frontend Page Structure

```text
/src
  /components
    /cards
    /charts
    /layout
    /tables
    /modals
    /maps
  /pages
    Dashboard.jsx
    SolarActivity.jsx
    SolarWind.jsx
    GeomagneticActivity.jsx
    Alerts.jsx
    ImpactSummary.jsx
    EventTimeline.jsx
    Aurora.jsx
    Learn.jsx
    Settings.jsx
    Admin.jsx
  /services
    api.js
    dashboardService.js
    solarWindService.js
    eventService.js
    alertService.js
  /hooks
    useDashboardData.js
    useSolarWind.js
    useAlerts.js
  /utils
    severityMapper.js
    dateFormatter.js
    unitFormatter.js
```

## 9.2 Dashboard Components

### CurrentConditionCard

Displays:

1. Overall condition.
2. Severity label.
3. Timestamp.
4. Main cause.

### KpCard

Displays:

1. Current Kp.
2. Storm level.
3. Short interpretation.

### SolarWindCard

Displays:

1. Speed.
2. Density.
3. Bz.
4. Freshness.

### AlertCard

Displays:

1. Alert title.
2. Severity.
3. Issued time.
4. Affected systems.

### ImpactCard

Displays:

1. Sector name.
2. Risk level.
3. Reason.
4. Related parameter.

## 9.3 Chart Requirements

All charts must include:

1. Axis labels.
2. Units.
3. Tooltip.
4. Time range selector.
5. Loading state.
6. Empty state.
7. Error state.
8. Last updated timestamp.

## 9.4 UI States

Every data component must support:

1. Loading.
2. Loaded.
3. Empty.
4. Error.
5. Stale.
6. Partial data.

---

## 10. Database Requirements

## 10.1 Collection List for MongoDB

1. users.
2. solar_wind.
3. magnetic_field.
4. kp_index.
5. space_weather_scales.
6. solar_flares.
7. cme_events.
8. sep_events.
9. geomagnetic_storm_events.
10. alerts.
11. event_timeline.
12. glossary_terms.
13. source_health.
14. ingestion_logs.
15. user_alert_preferences.

## 10.2 Indexing Requirements

| Collection | Index |
|---|---|
| solar_wind | timestamp descending |
| magnetic_field | timestamp descending |
| kp_index | timestamp descending |
| alerts | status, issuedAt |
| cme_events | eventId unique, startTime |
| solar_flares | eventId unique, peakTime |
| event_timeline | eventType, timestamp |
| source_health | sourceName unique |
| users | email unique |

## 10.3 Data Retention

| Dataset | Suggested Retention |
|---|---|
| 1-minute solar wind | 90 days |
| Aggregated solar wind | Long-term |
| Alerts | Long-term |
| DONKI events | Long-term |
| Kp index | Long-term |
| Raw API snapshots | 7–30 days |
| Logs | 30–90 days |

---

## 11. Caching Requirements

Redis or in-memory caching should be used for:

1. Dashboard summary.
2. Latest solar wind.
3. Latest Kp.
4. Latest alerts.
5. Space weather scales.
6. Glossary terms.

Suggested cache TTL:

| Data | TTL |
|---|---|
| Dashboard summary | 60 seconds |
| Solar wind | 60 seconds |
| Alerts | 60–120 seconds |
| Kp | 5 minutes |
| Glossary | 24 hours |
| DONKI events | 10–30 minutes |

---

## 12. Authentication and Authorization

## 12.1 Authentication

1. JWT-based authentication.
2. Password hashing using bcrypt.
3. Token expiration.
4. Refresh token optional for Version 1.0.

## 12.2 Authorization

Role-based access control:

1. Guest: public pages only.
2. User: saved preferences and exports.
3. Researcher: extended data access.
4. Admin: source health and content management.

## 12.3 Security Controls

1. Helmet middleware.
2. CORS configuration.
3. Rate limiting.
4. Input validation.
5. Sanitization.
6. Secure environment variables.
7. HTTPS deployment.
8. No API keys in frontend.

---

## 13. Alert Engine Requirements

## 13.1 Alert Sources

1. Official NOAA alerts.
2. Internal threshold-based alerts.
3. User-configured alerts.

## 13.2 Internal Alert Types

1. Kp threshold exceeded.
2. Solar wind speed exceeded.
3. Southward Bz threshold exceeded.
4. M-class or X-class flare detected.
5. Earth-directed CME detected.
6. Radiation storm threshold detected.

## 13.3 Alert Processing Flow

```text
New data ingested
   ↓
Run threshold checks
   ↓
Compare with existing active alerts
   ↓
Create new internal alert if threshold crossed
   ↓
Mark alert resolved if condition returns to normal
   ↓
Notify subscribed users in future version
```

## 13.4 Notification Channels

Version 1.0:

1. In-app alert cards.
2. User preference storage.

Future versions:

1. Email notifications.
2. Browser push notifications.
3. SMS or WhatsApp institutional alerts.

---

## 14. Data Quality Requirements

The system shall evaluate data quality using:

1. Timestamp freshness.
2. Missing values.
3. Duplicate records.
4. Outlier checks.
5. Source response status.
6. Unit consistency.

Quality flags:

1. valid.
2. stale.
3. partial.
4. missing.
5. estimated.
6. invalid.

---

## 15. Logging and Monitoring

## 15.1 Application Logs

The backend shall log:

1. API requests.
2. API errors.
3. Ingestion job start and completion.
4. External source failures.
5. Authentication failures.
6. Admin actions.

## 15.2 Monitoring Dashboard

Admin page should show:

1. Source name.
2. Last fetch time.
3. Last success time.
4. Last failure time.
5. Current status.
6. Records fetched.
7. Error message.
8. Average latency.

## 15.3 Error Tracking

Use Sentry or equivalent to capture:

1. Frontend runtime errors.
2. Backend exceptions.
3. Failed network requests.
4. Unhandled promise rejections.

---

## 16. Testing Requirements

## 16.1 Unit Testing

Test:

1. Severity mapping.
2. Data parsers.
3. API controllers.
4. User preference logic.
5. Impact scoring rules.
6. Date/time conversion.
7. Alert generation.

## 16.2 Integration Testing

Test:

1. External API fetchers.
2. Database write/read operations.
3. Cache update flow.
4. Full ingestion pipeline.
5. Authentication flow.
6. Dashboard API response.

## 16.3 Frontend Testing

Test:

1. Dashboard rendering.
2. Chart rendering.
3. Loading states.
4. Error states.
5. Timeline filters.
6. Responsive layout.
7. User preference update.

## 16.4 End-to-End Testing

Test user flows:

1. Open dashboard.
2. View current Kp.
3. Open alert details.
4. View CME timeline.
5. Export data.
6. Login and save preferences.
7. Admin checks source health.

## 16.5 Data Validation Testing

Test:

1. Missing values.
2. Malformed external data.
3. Duplicate event IDs.
4. Stale data.
5. Large data response.
6. API timeout.

---

## 17. Deployment Requirements

## 17.1 Environment Variables

```text
PORT=5000
NODE_ENV=production
MONGO_URI=...
REDIS_URL=...
JWT_SECRET=...
NASA_API_KEY=...
NOAA_BASE_URL=https://services.swpc.noaa.gov
DONKI_BASE_URL=https://api.nasa.gov/DONKI
FRONTEND_URL=...
```

## 17.2 Deployment Environments

1. Development.
2. Staging.
3. Production.

## 17.3 CI/CD Pipeline

Pipeline steps:

1. Install dependencies.
2. Run linting.
3. Run tests.
4. Build frontend.
5. Build backend.
6. Run migration or schema check.
7. Deploy to staging.
8. Manual approval.
9. Deploy to production.

---

## 18. Performance Requirements

| Requirement | Target |
|---|---|
| Dashboard initial load | Less than 3 seconds |
| API response for summary | Less than 500 ms from cache |
| Historical chart API | Less than 2 seconds |
| Ingestion job runtime | Less than source-specific interval |
| Frontend bundle | Optimized with lazy loading |
| Concurrent public users | Minimum 500 for MVP target |

Optimization methods:

1. Cache latest summary.
2. Use pagination for events.
3. Aggregate time-series data.
4. Lazy load heavy pages.
5. Compress responses.
6. Use CDN for static assets.
7. Avoid frontend polling from every client directly to official APIs.

---

## 19. Accessibility Requirements

1. Minimum readable font size.
2. High contrast text.
3. Keyboard navigable menus.
4. Chart data available in table form.
5. Color not used as the only severity indicator.
6. Alt text for images.
7. ARIA labels for interactive elements.
8. Responsive layout for small screens.

---

## 20. Privacy Requirements

The app should collect minimum user data.

Stored user data:

1. Name.
2. Email.
3. Password hash.
4. Preferences.
5. Alert thresholds.

The app should not collect sensitive personal data unless explicitly required in a future institutional version.

---

## 21. API Rate and Source Protection

The system must avoid excessive calls to public data providers.

Requirements:

1. Backend scheduled ingestion instead of frontend direct polling.
2. Cache repeated requests.
3. Backoff on source errors.
4. Respect API usage guidelines.
5. Use API keys where required.
6. Store latest snapshots for public dashboard.

---

## 22. Suggested Folder Structure

```text
space-weather-app/
  client/
    src/
      components/
      pages/
      hooks/
      services/
      utils/
      assets/
      styles/
  server/
    src/
      adapters/
      controllers/
      models/
      routes/
      services/
      jobs/
      middleware/
      utils/
      config/
    tests/
  docs/
    PRD.md
    TRD.md
    API.md
    DATA_SOURCES.md
```

---

## 23. Development Roadmap

## Phase 1 — Foundation

Duration: 2–3 weeks

Deliverables:

1. Project setup.
2. Frontend layout.
3. Backend server.
4. Database connection.
5. Basic dashboard.
6. NOAA data ingestion proof of concept.

## Phase 2 — Core Space Weather Dashboard

Duration: 3–4 weeks

Deliverables:

1. Solar wind charts.
2. Magnetic field charts.
3. Kp chart.
4. Space weather scale cards.
5. Alert list.
6. Data freshness indicators.

## Phase 3 — Event Integration

Duration: 3 weeks

Deliverables:

1. NASA DONKI integration.
2. CME list.
3. Flare list.
4. Event timeline.
5. Event detail page.

## Phase 4 — Impact and Education Layer

Duration: 2–3 weeks

Deliverables:

1. Impact scoring engine.
2. Sector-wise impact cards.
3. Glossary.
4. Learn page.
5. Plain-language alert summaries.

## Phase 5 — User Preferences and Admin

Duration: 2–3 weeks

Deliverables:

1. User login.
2. Saved preferences.
3. Alert thresholds.
4. Admin ingestion health page.
5. Logs and monitoring.

## Phase 6 — Testing and Deployment

Duration: 2 weeks

Deliverables:

1. Testing.
2. Performance optimization.
3. Deployment.
4. Documentation.
5. Final review.

---

## 24. MVP Acceptance Checklist

| Requirement | Status |
|---|---|
| Dashboard shows live condition summary | Required |
| Kp chart works | Required |
| Solar wind chart works | Required |
| IMF Bz chart works | Required |
| NOAA alerts displayed | Required |
| DONKI CME events displayed | Required |
| Solar flare events displayed | Required |
| Event timeline works | Required |
| Impact summary generated | Required |
| Glossary available | Required |
| Data timestamps shown | Required |
| External source failures handled | Required |
| CSV export available | Recommended |
| User preferences available | Recommended |
| Admin source health page | Required |

---

## 25. Technical Risks and Mitigation

| Risk | Technical Mitigation |
|---|---|
| API format changes | Use adapter abstraction and validation layer. |
| Data feed downtime | Cache last valid data and show stale badge. |
| Large time-series data | Use aggregation and indexed queries. |
| Slow dashboard | Cache summary and lazy load charts. |
| Duplicate events | Use source event IDs and unique indexes. |
| Incorrect severity mapping | Centralize rules and test them thoroughly. |
| Security issues | Use authentication, validation, rate limiting, and secure headers. |
| High traffic | Use CDN, Redis cache, and scalable deployment. |

---

## 26. Recommended Initial Implementation Strategy

For an academic or institutional prototype, the best implementation strategy is:

1. Build the frontend in React with a dark dashboard theme.
2. Build backend in Node.js and Express.
3. Use MongoDB Atlas for flexible event and time-series storage.
4. Use scheduled backend jobs for data ingestion.
5. Use Redis or in-memory cache for the latest dashboard summary.
6. Begin with NOAA SWPC feeds for current conditions.
7. Add NASA DONKI after the core dashboard is stable.
8. Add educational and impact interpretation after data reliability is achieved.
9. Add user login only after public dashboard functions are complete.
10. Add admin monitoring before public deployment.

---

## 27. Final Deliverable Definition

The final delivered Space Weather App should include:

1. A public dashboard showing current space weather conditions.
2. Real-time solar wind and magnetic field charts.
3. Kp index and geomagnetic storm indicators.
4. Solar flare and CME event tracking.
5. Official alerts and warnings display.
6. Sector-wise impact summaries.
7. Event timeline with filters.
8. Educational glossary and learning content.
9. User preferences and threshold settings.
10. Admin source monitoring and ingestion health page.
11. Clear data source attribution and timestamp visibility.
12. Production-ready deployment with documentation.

---

# Appendix A — Example Dashboard Summary Copy

**Current Space Weather Condition: Active**

Solar wind speed is elevated and the interplanetary magnetic field has shown periods of southward Bz. Geomagnetic activity may increase if these conditions persist. GNSS and HF communication users should remain aware of possible disturbances. No severe radiation storm is currently indicated.

---

# Appendix B — Example Educational Explanation

## What is the Kp Index?

The Kp index is a global indicator of geomagnetic activity. It describes how disturbed Earth’s magnetic field is on a scale from 0 to 9. Low values usually mean quiet conditions, while values of 5 or above indicate geomagnetic storm conditions.

## Why does Bz matter?

Bz is the north-south component of the interplanetary magnetic field. When Bz turns strongly southward for a sustained period, it can connect more efficiently with Earth’s magnetic field and allow more energy from the solar wind to enter the magnetosphere. This can increase the chance of geomagnetic storms.

---

# Appendix C — Suggested Future AI Features

1. Natural language event summaries.
2. CME arrival prediction explanation.
3. AI-based storm severity classification.
4. GNSS impact nowcasting.
5. Personalized user alerts.
6. Educational chatbot for space weather concepts.
7. Automatic weekly space weather reports.
8. Pattern detection in historical storm events.

---

# Appendix D — Source Reference Notes

The design assumes use of official public space-weather information sources such as NOAA Space Weather Prediction Center, NASA DONKI, and NASA CCMC/iSWA. Final implementation should verify endpoint URLs, rate limits, update intervals, and usage permissions during development.

