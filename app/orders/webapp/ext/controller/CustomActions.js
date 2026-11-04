sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        /**
         * Triggered when user selects an order and clicks "Display Customer"
         * Uses SAP Fiori Launchpad Navigation service to cross-navigate to App B
         */
        displayCustomer: function (oBindingContext, aSelectedContexts) {
            const context = (aSelectedContexts && aSelectedContexts.length > 0)
                ? aSelectedContexts[0]
                : oBindingContext;

            if (!context) {
                MessageToast.show("Please select an order first.");
                return;
            }

            const customerId = context.getProperty("customer_ID");
            if (!customerId) {
                MessageToast.show("No customer associated with this order.");
                return;
            }

            // Cross-app navigation via FLP Shell Navigation Service
            sap.ushell.Container.getServiceAsync("Navigation").then(function (oNavService) {
                oNavService.navigate({
                    target: {
                        semanticObject: "Customer",
                        action: "display"
                    },
                    params: {
                        ID: String(customerId)
                    }
                });
            }).catch(function (err) {
                console.error("Navigation failed:", err);
            });
        },

        /**
         * Triggered when user selects an order and clicks "Open in SAP GUI (VA03)"
         * Pattern 3: On-Premise to On-Premise navigation to classic ABAP WebGUI
         */
        displayGUI: function (oBindingContext, aSelectedContexts) {
            const context = (aSelectedContexts && aSelectedContexts.length > 0)
                ? aSelectedContexts[0]
                : oBindingContext;

            if (!context) {
                MessageToast.show("Please select an order first.");
                return;
            }

            const orderId = context.getProperty("ID");

            sap.ushell.Container.getServiceAsync("Navigation").then(function (oNavService) {
                oNavService.navigate({
                    target: {
                        semanticObject: "Order",
                        action: "displayGUI"
                    },
                    params: {
                        orderId: String(orderId)
                    }
                });
            }).catch(function (err) {
                console.error("Navigation failed:", err);
            });
        }
    };
});
