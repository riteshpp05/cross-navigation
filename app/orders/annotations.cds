using CrossService as service from '../../srv/service';

annotate service.Orders with @(
    UI.HeaderInfo : {
        TypeName : 'Order',
        TypeNamePlural : 'Orders',
        Title : {
            $Type : 'UI.DataField',
            Value : ID
        }
    },
    UI.SelectionFields : [
        customer_ID,
        status
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'Order ID'
        },
        {
            $Type : 'UI.DataFieldWithIntentBasedNavigation',
            Value : customer_ID,
            Label : 'Customer ID',
            SemanticObject : 'Customer',
            Action : 'display',
            Mapping : [
                {
                    $Type : 'Common.SemanticObjectMappingType',
                    LocalProperty : customer_ID,
                    SemanticObjectProperty : 'ID'
                }
            ]
        },
        {
            $Type : 'UI.DataFieldWithIntentBasedNavigation',
            Value : customer.name,
            Label : 'Customer Name',
            SemanticObject : 'Customer',
            Action : 'display',
            Mapping : [
                {
                    $Type : 'Common.SemanticObjectMappingType',
                    LocalProperty : customer_ID,
                    SemanticObjectProperty : 'ID'
                }
            ]
        },
        {
            $Type : 'UI.DataField',
            Value : amount,
            Label : 'Amount'
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : 'Status'
        }
    ]
);
