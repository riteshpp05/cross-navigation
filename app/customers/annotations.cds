using CrossService as service from '../../srv/service';

annotate service.Customers with @(
    UI.HeaderInfo : {
        TypeName : 'Customer',
        TypeNamePlural : 'Customers',
        Title : {
            $Type : 'UI.DataField',
            Value : name
        },
        Description : {
            $Type : 'UI.DataField',
            Value : city
        }
    },
    UI.SelectionFields : [
        ID,
        name,
        city
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'Customer ID'
        },
        {
            $Type : 'UI.DataField',
            Value : name,
            Label : 'Customer Name'
        },
        {
            $Type : 'UI.DataField',
            Value : city,
            Label : 'City'
        }
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneralInfoFacet',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneralInfo'
        }
    ],
    UI.FieldGroup #GeneralInfo : {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
                Label : 'Customer ID'
            },
            {
                $Type : 'UI.DataField',
                Value : name,
                Label : 'Customer Name'
            },
            {
                $Type : 'UI.DataField',
                Value : city,
                Label : 'City'
            }
        ]
    }
);
