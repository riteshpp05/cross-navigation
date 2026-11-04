# SAP Fiori Launchpad Cross-App Navigation Enterprise Demo

A pristine, projector-ready demonstration of SAP Fiori Launchpad (FLP) Intent-Based Navigation across all three core enterprise topologies:

1. **Cloud to Cloud (BTP to BTP)**: Sales Orders (`crossn.orders`) &rarr; Customers (`crossn.customers`) via declarative CDS annotations.
2. **Cloud to On-Premise (Hybrid)**: Customers (`crossn.customers`) &rarr; Legacy ABAP BSP (`legacy-bsp`) via Shell Navigation Service and SAP Cloud Connector architecture.
3. **On-Premise to On-Premise (S/4HANA to Classic GUI)**: Sales Orders (`crossn.orders`) &rarr; SAP GUI for HTML WebGUI (`legacy-webgui`) displaying transaction `VA03`.

Runs completely locally with **Node.js + SAP CAP** (`npm install && npx cds watch`). Zero cloud costs, zero hardcoded URLs, and no SAP backend credentials needed.

---

## 4 Core Files to Show the Team on Projector

When presenting code architecture to senior stakeholders, focus on these files:

1. **Declarative Navigation (CDS Annotations)**:  
   `app/orders/annotations.cds`  
   Shows how `UI.DataFieldWithIntentBasedNavigation` maps local property `customer_ID` to semantic object `Customer`, action `display`, and target parameter `ID` with zero lines of JavaScript.
2. **Target Inbound & Contract (App B Manifest)**:  
   `app/customers/webapp/manifest.json`  
   Shows how App B registers its inbound intent `Customer-display` under `sap.app > crossNavigation > inbounds` with the `ID` parameter signature.
3. **Programmatic Cross-Navigation Controller**:  
   `app/customers/webapp/ext/controller/CustomActions.js`  
   Shows clean invocations of `sap.ushell.Container.getServiceAsync("Navigation")` for hybrid cross-system navigation.
4. **Launchpad Target Resolution & Bootstrap**:  
   `app/flp.html`  
   Demonstrates how `window["sap-ushell-config"]` configures the launchpad tiles and resolves semantic intents into components, ICF nodes, and WebGUI transactions.

---

## How to Run

1. Open a terminal in the `cross-navigation` directory:
   ```bash
   npm install
   npx cds watch
   ```
2. Open the Fiori Launchpad Sandbox in your browser:
   * **Exact FLP URL**: [http://localhost:4004/flp.html](http://localhost:4004/flp.html)
   * **CAP Welcome Page**: [http://localhost:4004/](http://localhost:4004/) (links to `flp.html` under *Web Applications*)

3. Run automated end-to-end verification (headless browser test covering all 3 topologies):
   ```bash
   node test-e2e.cjs
   ```

---

## 5-Step Presentation Demo Script

### Step 1: Open Fiori Launchpad
* Navigate to `http://localhost:4004/flp.html`.
* **What to show**: The Launchpad displays the **Demo** group with three enterprise tiles:
  * **Sales Orders** (App A - Source Cloud App)
  * **Customers** (App B - Target Cloud App)
  * **VA03 - Sales Order** (On-Premise Classic Transaction Tile)
* Click the **Sales Orders** tile.

### Step 2: Source App A (Orders List Report)
* Sales Orders opens at `#Order-manage`.
* **What to show**:
  * Point out the **Customer ID** column: each ID (`1`, `2`, `3`) is rendered as a clean hyperlink.
  * Highlight that this is **100% declarative zero-code navigation** defined via CDS annotation `@UI.DataFieldWithIntentBasedNavigation`.
  * Also point out the toolbar actions: `"Display Customer"` and `"Open in SAP GUI (VA03)"`.

### Step 3: Pattern 1 — Cloud to Cloud Intent-Based Navigation
* Click on Customer ID **1** (or select row 1 and click `"Display Customer"`).
* **What to show**: The launchpad resolves `#Customer-display?ID=1` and transitions seamlessly to the Customers app.
* The Customers app opens displaying **Acme Corp** (ID `1`, City `Mumbai`).
* Explain that App B's `manifest.json` inbound filter automatically ingested the parameter `ID=1`.

### Step 4: Pattern 2 — Cloud to On-Premise (Hybrid Navigation)
* In the Customers app, click the header/toolbar button **"Open in legacy BSP"**.
* **What to show**: A new browser window opens displaying the **Legacy BSP Application (mock)** at `legacy-bsp/index.html?customerId=1`.
* The page displays: `Received Customer ID parameter: 1`.
* **Architectural Point**: In production, this request routes from SAP BTP via **SAP Cloud Connector** through the corporate firewall into the on-premise ABAP ICF node `/sap/bc/bsp/sap/...`.

### Step 5: Pattern 3 — On-Premise to On-Premise (Classic SAP GUI WebGUI)
* Back in Sales Orders, select order `4500001` and click **"Open in SAP GUI (VA03)"** (or click the **"VA03 - Sales Order"** tile from the Launchpad).
* **What to show**: A new window opens displaying **SAP GUI for HTML (WebGUI)** for transaction `VA03` with Sales Order `4500001` pre-filled.
* **Architectural Point**: In an on-premise S/4HANA landscape, classic transactions run in the browser via WebGUI without requiring desktop software. Routing stays inside the intranet via SAP Web Dispatcher with system alias `LOCAL`.

---

## SAP Architecture Concepts Mapping

| Demo Component | SAP Enterprise Concept | Production Equivalent (S/4HANA & BTP) |
| :--- | :--- | :--- |
| **FLP Tiles (`#Order-manage`, `#Customer-display`)** | **Fiori Catalogs & Groups** | Assigned via FLP Content Manager or SAP Build Work Zone to business roles (PFCG / IAS). |
| **Semantic Object (`Customer`, `Order`, `LegacyOrder`)** | **Semantic Object** | Defined in transaction `/UI2/SEMOBJ` or BTP Site Manager. Decouples business entities from technical URLs. |
| **Semantic Action (`display`, `manage`, `displayGUI`)** | **Semantic Action** | Standard operations performed on business objects. |
| **`app/flp.html` `applications` block** | **Target Mapping** | Configured in `/UI2/FLPD_CUST` or BTP Content Manager to resolve intents into physical targets. |
| **App B Manifest `inbounds`** | **Inbound Navigation Contract** | Declared in `sap.app > crossNavigation > inbounds` with parameter signatures (`ID`). |
| **App A Manifest `outbounds`** | **Outbound Intent Declaration** | Declared in `sap.app > crossNavigation > outbounds`. Authorizes the Fiori Elements runtime to generate links. |
| **`app/orders/annotations.cds`** | **`UI.DataFieldWithIntentBasedNavigation`** | CDS annotation that binds a table column to an intent and maps local properties to intent parameters. |
| **`CustomActions.js` (`getServiceAsync("Navigation")`)** | **FLP Shell Navigation Service API** | The official UI5 shell service (`sap.ushell.services.Navigation`) for programmatic navigation (`nav.navigate({ target, params })`). |
| **`legacy-bsp` mock** | **ABAP ICF BSP Application** | Hosted under `/sap/bc/bsp/sap/<app>` on the NetWeaver ABAP stack, accessed via SAP Cloud Connector. |
| **`legacy-webgui` mock** | **SAP GUI for HTML (Transaction VA03)** | Internet Transaction Server (ITS) service `/sap/bc/gui/sap/its/webgui` accessed via SAP Web Dispatcher. |

---

## Clean Project Structure

```text
cross-navigation/
├── app/
│   ├── flp.html                     # Local Fiori Launchpad sandbox page (3 tiles, 4 target mappings)
│   ├── services.cds                 # Aggregates CDS UI annotations
│   ├── orders/
│   │   ├── annotations.cds          # UI.LineItem & UI.DataFieldWithIntentBasedNavigation
│   │   └── webapp/
│   │       ├── Component.js         # Fiori Elements AppComponent (crossn.orders)
│   │       ├── manifest.json        # Outbounds & List Report routing configuration
│   │       ├── ext/controller/
│   │       │   └── CustomActions.js # Programmatic actions (displayCustomer, displayGUI)
│   │       └── i18n/i18n.properties # Localized strings for Sales Orders
│   ├── customers/
│   │   ├── annotations.cds          # LineItem, HeaderInfo & FieldGroup facets
│   │   └── webapp/
│   │       ├── Component.js         # Fiori Elements AppComponent (crossn.customers)
│   │       ├── manifest.json        # Inbound (Customer-display) & custom action configuration
│   │       ├── ext/controller/
│   │       │   └── CustomActions.js # Programmatic hybrid action (openLegacyBSP)
│   │       └── i18n/i18n.properties # Localized strings for Customers
│   ├── legacy-bsp/
│   │   └── index.html               # Simulation of on-premise ABAP BSP order app
│   └── legacy-webgui/
│       └── index.html               # Simulation of classic SAP GUI for HTML (VA03)
├── db/                              # schema.cds & initial CSV test data
├── srv/                             # service.cds (CrossService OData V4)
├── test-e2e.cjs                     # Headless Chrome 5-step automated verification suite
├── SAP_Cross_Navigation.pptx        # Executive 16:9 presentation deck (11 slides)
└── README.md                        # Architectural guide & demo walkthrough
```
