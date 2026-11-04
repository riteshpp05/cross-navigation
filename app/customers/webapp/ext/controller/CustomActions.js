sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        /**
         * Triggered from Customers List Report or Object Page
         * Pattern 2: Cloud-to-On-Premise cross-navigation to Legacy ABAP BSP
         * In production: BTP Launchpad -> SAP Cloud Connector -> ABAP ICF node (/sap/bc/bsp/sap/...)
         */
        openLegacyBSP: function (oBindingContext, aSelectedContexts) {
            // Support both Object Page header action (oBindingContext)
            // and List Report table selection (aSelectedContexts)
            const context = (aSelectedContexts && aSelectedContexts.length > 0)
                ? aSelectedContexts[0]
                : oBindingContext;

            if (!context) {
                MessageToast.show("Please select a customer first.");
                return;
            }

            const customerId = context.getProperty("ID");
            if (!customerId) {
                MessageToast.show("No customer ID available for navigation.");
                return;
            }

            // Cross-app navigation via FLP Shell Navigation Service
            sap.ushell.Container.getServiceAsync("Navigation").then(function (oNavService) {
                oNavService.navigate({
                    target: {
                        semanticObject: "LegacyOrder",
                        action: "display"
                    },
                    params: {
                        customerId: String(customerId)
                    }
                });
            }).catch(function (err) {
                console.error("Navigation to Legacy BSP failed:", err);
                MessageToast.show("Navigation service error.");
            });
        }
    };
});
