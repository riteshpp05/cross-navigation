# SAP Fiori Launchpad Cross-App Navigation Demo

A minimal, projector-ready demonstration of SAP Fiori Launchpad (FLP) intent-based cross-app navigation:
1. **Cloud to Cloud (Fiori Elements to Fiori Elements)**: App A (`crossn.orders`) &rarr; App B (`crossn.customers`)
2. **Cloud to Standard ABAP BSP**: App B (`crossn.customers`) &rarr; Legacy BSP Mock (`legacy-bsp`)

Runs completely locally with **Node.js + SAP CAP** (`npm install && npx cds watch`). No SAP backend, no cloud deployment, and no login required.

---

## 3 Core Files to Show the Team on Projector

When presenting, focus on these three concise files:

1. **Target Mapping (App B Inbound)**:  
   [`app/customers/webapp/manifest.json`](file:///c:/Users/Admin/Downloads/Project/SAP_Cross_Navigation/cross-navigation/app/customers/webapp/manifest.json)  
   Shows how App B registers its inbound intent `Customer-display` under `sap.app > crossNavigation > inbounds` with the `ID` parameter.
2. **Intent-Based Navigation Link (App A Annotations)**:  
   [`app/orders/annotations.cds`](file:///c:/Users/Admin/Downloads/Project/SAP_Cross_Navigation/cross-navigation/app/orders/annotations.cds)  
   Shows `UI.DataFieldWithIntentBasedNavigation` on the Orders table mapping local property `customer_ID` to semantic object `Customer`, action `display`, and target parameter `ID`.
3. **Launchpad Target Resolution & Bootstrap**:  
   [`app/flp.html`](file:///c:/Users/Admin/Downloads/Project/SAP_Cross_Navigation/cross-navigation/app/flp.html)  
   Shows `window["sap-ushell-config"]` configuring the "Demo" group, the 2 tiles (Sales Orders, Customers), and the target mapping entries (`Order-manage`, `Customer-display`, `LegacyOrder-display`).

---

## How to Run

1. Open a terminal in the `cross-navigation` folder:
   ```bash
   npm install
   npx cds watch
   ```
2. Open the Fiori Launchpad in your browser:
   - **Exact FLP URL**: [http://localhost:4004/flp.html](http://localhost:4004/flp.html)
   - **CAP Index URL**: [http://localhost:4004/](http://localhost:4004/) (links to `flp.html` under *Web Applications*)

*(Optional verification check: `node test-e2e.cjs` runs a headless browser automation testing all 4 steps.)*

---

## 4-Step Presentation Demo Script

### Step 1: Open Fiori Launchpad
- Navigate to [http://localhost:4004/flp.html](http://localhost:4004/flp.html).
- **What to show**: The Launchpad displays a single group titled **Demo** with two standard tiles:
  - **Sales Orders** (App A - Source)
  - **Customers** (App B - Target)
- Click the **Sales Orders** tile.

### Step 2: Source App A (Orders List Report)
- App A opens at `#Order-manage`.
- **What to show**: The table displays 5 orders loaded from SQLite memory database. Point out the **Customer ID** column:
  - Each customer ID (e.g. `1`, `2`, `3`) is rendered as a clickable link.
  - Explain to the team that this is purely declarative CDS metadata: `UI.DataFieldWithIntentBasedNavigation`. No UI controller code was written for App A.

### Step 3: Intent-Based Navigation to App B (Customers)
- Click on Customer ID **1** (Acme Corp).
- **What to show**: The launchpad resolves the intent `#Customer-display?ID=1` and transitions smoothly to App B (`crossn.customers`).
- App B opens displaying the Customer Object Page for **Acme Corp** (ID `1`, City `Mumbai`).
- Explain that App B's `manifest.json` inbound filter automatically processed parameter `ID=1`.

### Step 4: Navigate to Standard/Legacy BSP App
- In App B's Object Page header (or List Report), click the custom button **"Open in legacy BSP"**.
- **What to show**: A new browser window/tab opens displaying the **Legacy BSP Application (mock)** at `http://localhost:4004/legacy-bsp/index.html?customerId=1`.
- The page shows: `Received Customer ID parameter: 1`.
- Explain that this was triggered by less than 15 lines of JavaScript in [`CustomActions.js`](file:///c:/Users/Admin/Downloads/Project/SAP_Cross_Navigation/cross-navigation/app/customers/webapp/ext/controller/CustomActions.js) using the official FLP `Navigation` service (`sap.ushell.Container.getServiceAsync("Navigation")`).

---

## SAP Architecture Concepts Mapping

| Demo Step / Artifact | SAP Enterprise Concept | Production SAP S/4HANA & BTP Equivalent |
|---|---|---|
| **FLP Tiles (`#Order-manage`, `#Customer-display`)** | **Fiori Launchpad Catalogs & Tiles** | Assigned via FLP Content Manager / Launchpad Spaces & Pages to the user's PFCG business role. |
| **Semantic Object (`Customer`, `Order`, `LegacyOrder`)** | **Semantic Object** | Defined in transaction `/UI2/SEMOBJ` or BTP FLP Configuration. Represents a business entity independently of physical endpoints. |
| **Action (`display`, `manage`)** | **Semantic Action** | Standard verbs (`display`, `manage`, `create`, `change`) defining what operation is performed on the semantic object. |
| **`app/flp.html` `applications` block** | **Target Mapping** | In FLP Designer / Launchpad Content Manager, maps the combination of `SemanticObject-Action` to a physical component or URL. |
| **App B Manifest `inbounds`** | **Inbound Navigation & Signature** | Declared in `sap.app > crossNavigation > inbounds` with allowed/required parameters (`ID`). Tells FLP this app satisfies `Customer-display`. |
| **App A Manifest `outbounds`** | **Outbound Navigation** | Declared in `sap.app > crossNavigation > outbounds`. Required by SAP Fiori Elements runtime to authorize outbound link generation. |
| **`app/orders/annotations.cds`** | **`UI.DataFieldWithIntentBasedNavigation`** | CDS annotation that binds a table column to an intent and uses `Common.SemanticObjectMappingType` to map local fields (`customer_ID`) to intent parameters (`ID`). |
| **`CustomActions.js` (`getServiceAsync("Navigation")`)** | **FLP Navigation Service API** | The official UI5 shell service (`sap.ushell.services.Navigation`) for programmatic intent navigation (`nav.navigate({ target, params })`). |
| **`LegacyOrder-display` (`applicationType: "URL"`)** | **BSP / Web Dynpro Target Mapping** | Points to `/sap/bc/bsp/sap/<bsp_app>` or `/sap/bc/webdynpro/sap/<wda_app>` on the ABAP system. |
| **Legacy Mock HTML Page** | **ICF Service Node** | Hosted under the Internet Communication Framework (`SICF`) in the ABAP application server. Must be activated in transaction `SICF`. |
| **Local URL Resolution** | **System Alias & RFC Destination** | Target mappings in production specify a System Alias (e.g. `S4FIN`), mapped in `/UI2/V_ALIASMAP` or `SM59` to the backend server. |
| **Direct Browser Access** | **SAP Cloud Connector & Destination Service** | In SAP BTP Launchpad, requests to on-premise ABAP ICF services traverse the SAP Cloud Connector reverse tunnel via a BTP HTTP Destination. |

---

## Project Structure Overview

```
cross-navigation/
├── app/
│   ├── flp.html                     # Local Fiori Launchpad sandbox page
│   ├── services.cds                 # Aggregates CDS UI annotations
│   ├── orders/
│   │   ├── annotations.cds          # UI.LineItem & UI.DataFieldWithIntentBasedNavigation
│   │   └── webapp/
│   │       ├── Component.js         # Fiori Elements AppComponent (crossn.orders)
│   │       ├── manifest.json        # Outbounds declaration & List Report routing
│   │       └── i18n/i18n.properties
│   ├── customers/
│   │   ├── annotations.cds          # LineItem, HeaderInfo & FieldGroup facets
│   │   └── webapp/
│   │       ├── Component.js         # Fiori Elements AppComponent (crossn.customers)
│   │       ├── manifest.json        # Inbounds (Customer-display) & Object Page action
│   │       ├── ext/controller/
│   │       │   └── CustomActions.js # < 15 line Navigation service controller code
│   │       └── i18n/i18n.properties
│   └── legacy-bsp/
│       └── index.html               # Plain HTML mock of an on-premise ABAP BSP app
├── db/                              # (Untouched) schema.cds & CSV sample data
├── srv/                             # (Untouched) service.cds (CrossService)
├── test-e2e.cjs                     # Headless Chrome verification test runner
└── README.md                        # Presentation guide & concept mapping
```
