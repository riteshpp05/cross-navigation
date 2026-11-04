sap.ui.define([], function () {
    "use strict";

    return {
        // Cross-app navigation to legacy BSP via FLP Navigation service
        openLegacyBSP: function (oContext, aSelectedContexts) {
            var ctx = oContext || (aSelectedContexts && aSelectedContexts[0]);
            if (!ctx) {
                try {
                    var oTable = sap.ui.getCore().byId("crossn.customers::CustomersList--fe::table::Customers::LineItem-innerTable");
                    if (oTable && oTable.getSelectedItems && oTable.getSelectedItems().length > 0) {
                        ctx = oTable.getSelectedItems()[0].getBindingContext();
                    }
                } catch (e) {}
            }
            var sId = ctx ? ctx.getProperty("ID") : "";
            if (!sId) {
                var m = (window.location.hash || "").match(/[?&]ID=([^&]+)/);
                if (m) sId = m[1];
            }
            if (!sId) sId = "1";

            sap.ushell.Container.getServiceAsync("Navigation").then(function (oNav) {
                oNav.navigate({
                    target: { semanticObject: "LegacyOrder", action: "display" },
                    params: { customerId: String(sId) }
                });
            });
        }
    };
});
