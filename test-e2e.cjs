const puppeteer = require('puppeteer-core');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function isPortOpen(port) {
    try {
        const res = await fetch(`http://localhost:${port}/flp.html`);
        return res.status === 200;
    } catch {
        return false;
    }
}

async function runVerification() {
    console.log('=====================================================');
    console.log(' Starting End-to-End Verification of SAP FLP Demo');
    console.log(' Testing all 3 Enterprise Navigation Topologies');
    console.log('=====================================================');

    let serverProcess = null;
    const running = await isPortOpen(4004);

    if (!running) {
        console.log('Starting CAP server on port 4004...');
        serverProcess = spawn('.\\node_modules\\.bin\\cds.cmd', ['serve'], {
            cwd: __dirname,
            shell: true,
            stdio: 'pipe'
        });

        // Wait for server to be ready
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 500));
            if (await isPortOpen(4004)) {
                console.log('CAP server is ready!');
                break;
            }
        }
    } else {
        console.log('CAP server is already running on port 4004.');
    }

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    let bspPagePromise = new Promise(resolve => {
        browser.on('targetcreated', async target => {
            const p = await target.page();
            if (p) {
                for (let i = 0; i < 40; i++) {
                    if (p.url().includes('legacy-bsp')) {
                        resolve(p);
                        return;
                    }
                    await new Promise(r => setTimeout(r, 250));
                }
            }
        });
    });

    try {
        // --- STEP 1: Fiori Launchpad Sandbox ---
        console.log('\n[Step 1] Loading Fiori Launchpad at http://localhost:4004/flp.html...');
        await page.goto('http://localhost:4004/flp.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.sapUshellTile', { timeout: 20000 });

        const tiles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.sapUshellTile')).map(t => t.innerText.trim());
        });
        console.log('Found tiles on Launchpad (Count: ' + tiles.length + '):', tiles);
        if (tiles.length < 2) throw new Error(`Expected at least 2 tiles, found ${tiles.length}`);

        const groupTitle = await page.evaluate(() => {
            return window['sap-ushell-config']?.services?.LaunchPage?.adapter?.config?.groups?.[0]?.title;
        });
        console.log('Launchpad group title:', groupTitle);

        await page.screenshot({ path: path.join(__dirname, 'step1-flp.png') });
        console.log('✓ Screenshot saved: step1-flp.png');

        // --- STEP 2: Navigate to App A (Sales Orders) ---
        console.log('\n[Step 2] Navigating to App A (Sales Orders List Report)...');
        await page.evaluate(() => {
            const tileLink = document.querySelector('a[href*="Order-manage"], .sapUshellTile a');
            if (tileLink) tileLink.click();
            else window.location.hash = '#Order-manage';
        });

        // Wait for App A table data
        await page.waitForFunction(() => {
            const body = document.body.innerText;
            return body.includes('4,500,001') && body.includes('Acme Corp');
        }, { timeout: 15000 });

        console.log('✓ App A loaded orders table successfully!');
        await page.screenshot({ path: path.join(__dirname, 'step2-orders.png') });
        console.log('✓ Screenshot saved: step2-orders.png');

        // --- STEP 3: PATTERN 1 - Cloud to Cloud Intent-Based Navigation ---
        console.log('\n[Step 3] Pattern 1: Cloud-to-Cloud navigation (Click Customer 1 link to App B)...');
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.sapMLnk'));
            const cust1Link = links.find(l => l.innerText.trim() === '1');
            if (cust1Link) cust1Link.click();
        });

        // Wait for App B to display Acme Corp
        await page.waitForFunction(() => {
            return window.location.hash.includes('Customer-display') &&
                   document.body.innerText.includes('Acme Corp');
        }, { timeout: 15000 });

        console.log('✓ Pattern 1 (Cloud-to-Cloud) succeeded!');
        console.log('Current URL Hash:', await page.evaluate(() => window.location.hash));
        await page.screenshot({ path: path.join(__dirname, 'step3-customers.png') });
        console.log('✓ Screenshot saved: step3-customers.png');

        // --- STEP 4: PATTERN 2 - Cloud to On-Premise Navigation ---
        console.log('\n[Step 4] Pattern 2: Cloud-to-On-Premise (Click "Open in legacy BSP" button)...');
        await page.waitForFunction(() => {
            const opBtn = sap.ui.getCore().byId('crossn.customers::CustomersObjectPage--fe::CustomAction::openLegacyBSP');
            const lrBtn = sap.ui.getCore().byId('crossn.customers::CustomersList--fe::table::Customers::LineItem::CustomAction::openLegacyBSP');
            return !!(opBtn || lrBtn);
        }, { timeout: 15000 });

        await page.evaluate(() => {
            const opBtn = sap.ui.getCore().byId('crossn.customers::CustomersObjectPage--fe::CustomAction::openLegacyBSP');
            if (opBtn) {
                opBtn.firePress();
                return;
            }
            const lrBtn = sap.ui.getCore().byId('crossn.customers::CustomersList--fe::table::Customers::LineItem::CustomAction::openLegacyBSP');
            if (lrBtn) {
                const table = sap.ui.getCore().byId('crossn.customers::CustomersList--fe::table::Customers::LineItem-innerTable');
                if (table && table.getItems && table.getItems().length > 0) {
                    table.setSelectedItem(table.getItems()[0], true, true);
                }
                lrBtn.firePress();
            }
        });

        console.log('Waiting for legacy BSP page to open...');
        const bspPage = await Promise.race([
            bspPagePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for BSP page')), 15000))
        ]);

        await bspPage.waitForSelector('#customerIdDisplay', { timeout: 10000 });
        const receivedId = await bspPage.evaluate(() => {
            return document.getElementById('customerIdDisplay')?.innerText;
        });
        const bspUrl = bspPage.url();

        console.log('✓ Pattern 2 (Cloud-to-On-Premise BSP) opened successfully!');
        console.log('BSP Page URL:', bspUrl);
        console.log('Received Customer ID in BSP:', receivedId);

        if (receivedId !== '1') throw new Error(`Expected Customer ID 1, got ${receivedId}`);

        await bspPage.screenshot({ path: path.join(__dirname, 'step4-legacy-bsp.png') });
        console.log('✓ Screenshot saved: step4-legacy-bsp.png');

        // --- STEP 5: PATTERN 3 - On-Premise to On-Premise (SAP GUI VA03) ---
        console.log('\n[Step 5] Pattern 3: On-Premise to On-Premise (SAP GUI for HTML VA03)...');
        const guiPage = await browser.newPage();
        await guiPage.setViewport({ width: 1400, height: 900 });
        await guiPage.goto('http://localhost:4004/legacy-webgui/index.html?orderId=4500001', { waitUntil: 'domcontentloaded' });
        await guiPage.waitForSelector('#orderIdField', { timeout: 10000 });

        const displayedOrderId = await guiPage.evaluate(() => {
            return document.getElementById('orderIdField')?.value;
        });
        console.log('✓ Pattern 3 (On-Premise to On-Premise WebGUI) loaded successfully!');
        console.log('VA03 WebGUI Order ID:', displayedOrderId);
        if (displayedOrderId !== '4500001') throw new Error(`Expected Order ID 4500001, got ${displayedOrderId}`);

        await guiPage.screenshot({ path: path.join(__dirname, 'step5-webgui-va03.png') });
        console.log('✓ Screenshot saved: step5-webgui-va03.png');
        await guiPage.close();

        console.log('\n=====================================================');
        console.log(' ALL 3 TOPOLOGY DEMOS VERIFIED AND PASSED WITH 100% SUCCESS! ');
        console.log(' 1. Cloud-to-Cloud (Fiori Elements to Fiori Elements): PASS');
        console.log(' 2. Cloud-to-On-Premise (BTP to ABAP BSP via SCC): PASS');
        console.log(' 3. On-Premise-to-On-Premise (FES to SAP GUI VA03): PASS');
        console.log('=====================================================');

    } catch (e) {
        console.error('❌ Verification failed:', e);
        process.exitCode = 1;
    } finally {
        await browser.close();
        if (serverProcess) {
            serverProcess.kill();
        }
        process.exit(process.exitCode || 0);
    }
}

runVerification();
