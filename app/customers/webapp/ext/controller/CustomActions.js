sap.ui.define([], function () {
    "use strict";

    return {
        // Cross-app navigation to legacy BSP via FLP Navigation service
        openLegacyBSP: function (oContext, aSelectedContexts) {
            var ctx = oContext || (aSelectedContexts && aSelectedContexts[0]);
            var sId = ctx ? ctx.getProperty("ID") : "";
            sap.ushell.Container.getServiceAsync("Navigation").then(function (oNav) {
                oNav.navigate({
                    target: { semanticObject: "LegacyOrder", action: "display" },
                    params: { customerId: String(sId) }
                });
            });
        }
    };
});
