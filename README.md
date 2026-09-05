# ORCA Marine Insights

ORCA – Marine Intelligence



COMPLETE FUNCTIONAL WEBSITE BUILD



Build the complete ORCA – Marine Intelligence web application as one polished, production-style responsive application.



IMPORTANT BUILD RULES



1. Build the entire application in this implementation.

2. Do NOT create static mockups, dead buttons, fake navigation, placeholder pages, unfinished sections, or “coming soon” screens.

3. Every sidebar item, button, dropdown, tab, filter, search field, profile action, Analyze button, Save button, chat action, report action, map control, alert filter, role selector and mobile menu must actually work.

4. Use reusable components + centralized application state + demo data/service abstractions so the application works immediately even without external APIs.

5. Structure the data/service layer so real marine, weather, satellite and map APIs can be connected later without rebuilding the UI.

6. Do NOT delete, overwrite, expose, reset, replace or break any existing credentials, API keys, environment variables, integrations, authentication configuration or working backend configuration.

7. If credentials/integrations already exist, preserve them exactly and use them where appropriate.

8. Never put secret/API credentials directly into frontend source code.

9. Do not waste implementation time creating unnecessary infrastructure. Prioritize a fast, complete working UI with clean reusable components.

10. The application must run immediately after generation.

11. Avoid excessive dependencies. Prefer lightweight existing libraries and native React functionality where possible.

12. Do not generate separate unfinished pages. All requested pages must be connected to the main application.

13. Use realistic demo marine data rather than lorem ipsum.

14. All data should update when the selected region changes.

15. Persist profile/settings/selected region using appropriate client-side persistence such as localStorage where suitable.



---



DESIGN DIRECTION



Create a professional, modern LIGHT marine-intelligence dashboard.



Do NOT strictly follow the previous pale-blue/pale-green requirement.



Instead use a refined light interface:



- White and very-light neutral backgrounds

- Soft blue marine accents

- Subtle green accents

- Deep navy/dark blue text

- Light gray borders

- White elevated cards

- Soft shadows

- Rounded but professional surfaces

- Raised buttons and controls

- Clean modern typography

- Excellent spacing

- Clear visual hierarchy

- Professional dashboard appearance

- Avoid excessive gradients

- Avoid excessive glassmorphism

- Avoid neon colors

- Avoid overly dark UI

- Avoid clutter



The result should feel like a real marine intelligence platform, not a generic admin dashboard.



---



MAP DESIGN – VERY IMPORTANT



Maps are a major part of ORCA.



DO NOT use one generic map everywhere.



Every map must visually match its page.



Maps must be:



- Clear

- Static

- Professional

- Responsive

- Easy to understand

- Properly labeled

- Light themed

- Clearly bordered

- Equipped with readable legends

- Equipped with useful zoom/layer controls

- Have visible coastline and geographic context

- Have readable markers and zones



NO MAP ANIMATIONS



Do NOT use:



- Animated ripples

- Moving fish

- Animated currents

- Pulsing markers

- Moving routes

- Animated cyclone tracks

- Flashing zones

- Continuously moving particles



Maps should remain static and clean.



---



ANDHRA PRADESH MAP PRIORITY



The detailed marine maps should be primarily focused on Andhra Pradesh and its coastline.



Use realistic geographic context and labels such as:



- ఆంధ్రప్రదేశ్ / Andhra Pradesh

- విశాఖపట్నం / Visakhapatnam

- శ్రీకాకుళం / Srikakulam

- విజయనగరం / Vizianagaram

- కాకినాడ / Kakinada

- అమలాపురం / Amalapuram

- మచిలీపట్నం / Machilipatnam

- బాపట్ల / Bapatla

- ఒంగోలు / Ongole

- నెల్లూరు / Nellore

- విజయవాడ / Vijayawada

- రాజమండ్రి / Rajahmundry



Use Telugu + English labels selectively so the map stays readable.



Show:



- Andhra Pradesh coastline

- Bay of Bengal

- Major coastal cities

- Marine zones

- Relevant fishing/risk/weather regions

- Clear geographic boundaries



India remains the default region.



When another region is selected, update the dashboard data and map context accordingly.



---



FIRST SCREEN – PROFILE CREATION



When the application opens for the first time, display a centered profile popup.



Show:



ORCA logo



Marine Intelligence



Then:



Name



Text input



Role



Two selectable options:



- Fisherman

- Others (Marine Intelligence User)



Button



Create Profile



The Create Profile button must:



1. Validate the name.

2. Validate the selected role.

3. Save the profile locally.

4. Open the correct dashboard.

5. Remember the profile on future visits.



If a profile already exists, do not repeatedly show the profile popup unless the user chooses to reset/change the profile.



---



GLOBAL TOPBAR



Create a sticky responsive topbar containing:



- ORCA logo

- Current page title

- Region/context indicator

- Language selector

- Light/dark theme control

- Reports

- Profile menu



Use a hamburger button on tablet/mobile.



The hamburger must open and close a proper slide-in sidebar.



---



FISHERMAN DASHBOARD



After selecting Fisherman, show:



SIDEBAR



- Home

- Ask ORCA

- Fish Zones

- Weather

- Risk Map

- Alerts

- Settings



Every item must navigate to its real page.



---



FISHERMAN – HOME



Create:



Region Selector



Default:



India



Allow changing region.



Fishing Status Card



Show:



- Current fishing status

- Safety status

- Best time indicator



Best Fishing Zone



Show:



- Zone name

- Fishing probability %

- Distance

- Direction

- Recommended fishing time



Marine Summary Cards



Include:



- Sea condition

- Weather

- Wind

- Tide

- Safety

- Temperature



Marine Map



Show:



- Andhra Pradesh/Bay of Bengal context

- User position

- Fishing zones

- Recommended fishing zone

- Clear legend

- Geographic labels

- Static route visualization



---



FISHERMAN – ASK ORCA



Create a contextual multi-turn marine AI assistant.



Include quick prompts such as:



- Where is the best fishing zone today?

- Is the sea safe?

- What is the weather?

- Should I go fishing now?

- Which area has high fish productivity?

- What are today's risks?



The chat must actually work using a local/demo intelligence service when no AI API is available.



Responses can contain:



- Text

- Recommendations

- Risk scores

- Weather information

- Marine conditions

- Mini data cards

- Map context

- Simple charts



The assistant must remember:



- Current user role

- Selected region

- Current page/context

- Previous messages



---



FISHERMAN – FISH ZONES



Create:



Trip Setup



Fields:



- Region

- Date

- Time

- Purpose



Purpose examples:



- Fishing

- Survey

- Research

- Transport



Analyze Button



The Analyze button must calculate/update the marine analysis.



Display:



2/3 Analytics + 1/3 Map



Analytics:



- Best fishing zone

- Fishing probability %

- Distance

- Direction

- Recommended time

- Weather

- Sea conditions

- Risk %

- AI reason



Map:



- User marker

- Fishing zones

- Best zone

- Recommended route

- Legend

- Labels



Keep the map static.



---



FISHERMAN – WEATHER



Create:



Region selector



Dynamic Current Weather Hero



Show:



- Temperature

- Condition

- Wind

- Humidity

- Visibility

- Pressure



Add:



Past | Today | Future



Charts:



- Temperature

- Rainfall

- Wind



Add:



ORCA AI Insight



Generate a useful one-line interpretation from the current demo data.



---



FISHERMAN – RISK MAP



Show:



- Region selector

- Overall risk

- Weather risk

- Ocean risk

- Wave risk

- Wind risk

- Cyclone risk

- Lightning risk



Map must clearly show:



- High-risk zones

- Medium-risk zones

- Low-risk zones

- Restricted zones



Use a clear legend.



---



FISHERMAN – ALERTS



Tabs/filters:



- All

- Critical

- High

- Medium

- Resolved



Display:



2/3 Alert List + 1/3 Alert Map



Each alert should contain:



- Severity

- Location

- Time

- Description

- Recommended action

- Status



Clicking an alert must open its details.



---



FISHERMAN – SETTINGS



Create working settings for:



Profile



- Name

- Role



Default Region



Language



Notifications



Alert Settings



Map Settings



Save Button



Save must actually persist the settings.



---



MARINE INTELLIGENCE USER DASHBOARD



When role is:



Others (Marine Intelligence User)



show this sidebar:



- Home

- Ask ORCA

- Weather Status

- Analysis

  - SST Analysis

  - Chlorophyll Analysis

  - Weather Analysis

  - Ocean Analysis

  - Spatial Analysis

- Productivity

- Period & Disaster Analysis

- Risk/Danger Zones

- Alerts

- Reports

- Settings



Analysis must be expandable/collapsible.



---



OTHER USER – HOME



Default region:



India



Create:



2/3 Marine Map + 1/3 Top Risk Insights



Map should show relevant marine intelligence.



Top Risk Insights:



- Highest-risk zone

- Risk %

- Main cause

- Severity



Below:



2/3 High Productivity Zones



1/3 Weather



Then:



Daily Insights



Changing the region must update all relevant sections.



---



ALL ANALYSIS PAGES



Use a reusable Analysis Dashboard component.



Every analysis page must contain:



Region Selector



Default:



India



Main Layout



2/3 Analytics + 1/3 Context-Specific Map



Analytics should contain:



- Main statistics

- Trend/chart

- Top Regions/Zones

- Percentages

- Circular score

- Comparison where relevant



Map must specifically match the analysis.



End with:



ORCA AI Insight



A one-line intelligent interpretation.



Changing region must update the entire page.



---



SST ANALYSIS



Show:



- Current SST

- SST anomaly

- SST trend

- Historical comparison

- Top SST regions

- Condition score



SST Map



Create a thermal-style static map.



Low temperature:



cool/light tones



High temperature:



warm/orange/red tones



Clearly show the temperature legend.



---



CHLOROPHYLL ANALYSIS



Show:



- Chlorophyll concentration

- Distribution

- Trend

- Productivity relationship

- Top productive regions

- Condition score



Chlorophyll Map



Use concentration zones with a clear legend.



Do NOT animate fish.



---



WEATHER ANALYSIS



Show:



- Temperature

- Rainfall

- Wind

- Humidity

- Pressure

- Visibility



Include useful charts.



Weather Map



Show relevant weather conditions and markers.



---



OCEAN ANALYSIS



Show:



- Wave height

- Swell

- Currents

- Sea state

- Tides



Ocean Map



Show:



- Wave zones

- Current direction indicators

- Tide information



Keep all visualization static.



---



SPATIAL ANALYSIS



Show:



- Hotspots

- Risk clusters

- SST/chlorophyll relationship

- Zone comparison



Spatial Map



Use multiple static layers:



- SST

- Chlorophyll

- Risk

- Productivity

- Marine zones



Provide layer controls.



---



PRODUCTIVITY



Show:



- Productivity score

- High productivity %

- Medium productivity %

- Low productivity %

- SST influence

- Chlorophyll influence

- Ocean influence

- Historical trend



Productivity Map



Show clear productivity zones and fishing/productivity markers.



No animated fish.



---



PERIOD & DISASTER ANALYSIS



Controls:



- Region

- Period

- Disaster Type



Disaster types:



- Cyclone

- Flood

- High Waves

- Lightning

- Storm

- Other Marine Events



Show:



2/3 Analytics



- Total events

- Severe events

- Disaster trend

- Disaster distribution

- Severity comparison

- Historical comparison



1/3 Disaster Map



Show static:



- Cyclone tracks

- Flood areas

- High-wave zones

- Lightning zones

- Affected areas



Below:



Top Affected Regions



For each region show:



- Impact %

- Event count

- Circular risk %



Then:



ORCA AI Insight



---



RISK / DANGER ZONES



Show:



Region selector



2/3 Risk Analytics



- Overall risk

- Weather risk

- Ocean risk

- Wave risk

- Wind risk

- Cyclone risk

- Lightning risk



1/3 Risk Map



Show:



- High

- Medium

- Low

- Restricted



Below:



Top High-Risk Zones



Include circular risk scores.



Then:



ORCA AI Insight



---



RISK AUTOMATION ENGINE



Create a functional simulated automation pipeline:



Region



↓



Live Marine Data



- Weather

- Ocean

- SST

- Waves

- Wind

- Cyclone

- Lightning

- Geofence



↓



Risk Detection



↓



Risk Score



↓



Automatic Alert Trigger



Create a visible dashboard/card explaining:



- Current monitoring status

- Detected risks

- Current score

- Threshold

- Trigger status



Use demo data/service abstraction so it works without external APIs.



---



ALERTS – MARINE INTELLIGENCE USER



Controls:



Region



Filters



- All

- Critical

- High

- Medium

- Resolved



Layout:



2/3 Active Alerts + 1/3 Alert Map



Show:



- Severity summary

- Top alert regions

- Alert details

- Recommended action

- Current status



---



ALERT AUTOMATION



Create a visible functional flow:



Live Data



↓



Risk Engine



↓



Threshold Crossed



↓



Generate / Classify Alert



↓



Notify



Allow settings to control whether automation is enabled.



---



REPORTS



Create a functional Reports page/menu.



Allow users to:



- View available reports

- Filter by region/type/date

- Open report summaries

- Generate a demo report from current dashboard data

- Download/export a simple report where supported



Do not create dead download buttons.



---



SETTINGS – MARINE INTELLIGENCE USER



Include working controls for:



Default Region



Risk Automation



Enable/disable.



Detection Controls



- Cyclone detection

- Wave detection

- Lightning detection

- Wind detection

- Rain detection

- Geofence detection



Risk Threshold



Adjustable slider/input.



Alert Preferences



- Critical

- High

- Medium

- Resolved



Language



Display Settings



Map Settings



Save



All settings must persist.



---



REGION STATE



Create a centralized region state.



Default:



India



The selected region must propagate across relevant pages.



For Andhra Pradesh-focused marine views, show detailed Andhra Pradesh/Bay of Bengal data.



When the user changes region:



- Maps update

- Statistics update

- Charts update

- Alerts update

- Risk scores update

- Weather updates

- AI insights update

- Top zones update



Do not leave old-region information visible after switching regions.



---



DEMO DATA ARCHITECTURE



Create realistic structured demo data for:



- Regions

- Weather

- SST

- Chlorophyll

- Ocean

- Waves

- Tides

- Productivity

- Risks

- Alerts

- Disasters

- Fishing zones

- Spatial layers



Create a service/data abstraction such as:



"marineDataService"



or an equivalent clean architecture.



The UI should call this service rather than hard-coding unrelated values throughout components.



This makes future API integration easy.



---



MAP IMPLEMENTATION



If an existing map integration/library is already configured, preserve and use it.



If no external map API is available, create a lightweight responsive marine map component using available frontend technology and realistic geographic SVG/data visualization.



Do not require a paid API just to make the application work.



If using a map library:



- Keep the implementation lightweight.

- Preserve existing map credentials/configuration.

- Do not expose secret keys.

- Use environment variables for public API configuration where appropriate.



Every map needs:



- Zoom controls

- Legend

- Labels

- Markers

- Clear coastline

- Context-specific layers



---



RESPONSIVE DESIGN



Desktop:



- Full sidebar

- Sticky topbar

- 2/3 + 1/3 analytical layouts



Tablet:



- Compact sidebar/navigation

- Responsive cards



Mobile:



- Hamburger menu

- Slide-in sidebar

- Single-column analytics

- Maps sized correctly

- Cards stacked vertically

- No horizontal overflow

- Touch-friendly controls



The entire application must remain usable at mobile width.



---



ACCESSIBILITY & UX



Use:



- Clear labels

- Keyboard-accessible controls

- Visible focus states

- Good contrast

- Helpful empty/error states

- Tooltips where useful

- Responsive controls



Do not sacrifice usability for visual effects.



---



ORCA BRANDING



Create a clean abstract marine/orca logo using CSS/SVG/iconography.



Brand:



ORCA



Subtitle:



Marine Intelligence



Keep the logo professional and simple.



Do not use copyrighted third-party logos.



---



ICONS



Use a consistent icon system already available in the project or a lightweight icon library.



Icons should represent:



- Fish

- Ocean

- Weather

- Risk

- Alerts

- Reports

- Settings

- Analysis

- Location

- Wind

- Waves

- Temperature

- Satellite

- Disaster



---



INTERACTIONS THAT MUST WORK



Verify all of these:



- Profile creation

- Role selection

- Dashboard switching

- Sidebar navigation

- Expand/collapse Analysis

- Mobile hamburger

- Region dropdown

- Date selection

- Time selection

- Purpose selection

- Analyze

- Tabs

- Alert filters

- Map layer controls

- Map markers

- Map zoom

- Settings changes

- Save settings

- Theme control

- Language control

- Reports

- Report generation

- Chat quick prompts

- Multi-turn chat

- Chat context

- Risk automation toggle

- Alert automation

- Risk threshold

- Notification controls



No dead controls.



---



PERFORMANCE PRIORITY



This application should build and load efficiently.



Prefer:



- Reusable components

- Local demo data

- Lightweight calculations

- Lazy loading for large pages/components where useful

- Minimal dependencies

- CSS-based UI

- SVG-based map visualization when a real map service is unavailable



Do not introduce heavy libraries unless they materially improve functionality.



---



FINAL QUALITY CHECK



Before considering the implementation complete, verify:



1. First-screen profile popup works.

2. Fisherman dashboard works.

3. Marine Intelligence dashboard works.

4. Every sidebar item opens a real page.

5. Every page has meaningful content.

6. Every requested map is context-specific.

7. Maps have clear labels and legends.

8. Maps contain no animations.

9. Andhra Pradesh is the primary detailed geographic context.

10. Telugu + English labels are used where appropriate.

11. Region selection propagates throughout the application.

12. Ask ORCA works as a multi-turn contextual assistant.

13. Settings actually save.

14. Alerts and risk automation work with demo data.

15. Reports work.

16. Mobile navigation works.

17. No horizontal overflow on mobile.

18. No placeholder pages.

19. No dead buttons.

20. No broken routes.

21. Existing credentials/API keys/environment variables/integrations are preserved.

22. No secrets are hard-coded into frontend code.

23. The entire UI uses a polished light theme.

24. The application works immediately without requiring unavailable external APIs.



MOST IMPORTANT



Build the complete ORCA Marine Intelligence application now, in one coherent implementation.



Do not stop after creating the homepage.



Do not provide a design-only prototype.



Do not leave sections unfinished.



Do not replace existing credentials or integrations.



Prioritize a fast, clean, complete and functional implementation using realistic demo data and reusable components, while keeping the architecture ready for real marine/weather/satellite APIs later.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://orca-sea-sense.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9040cd46-e0ae-46a4-a326-245ef0add1df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
