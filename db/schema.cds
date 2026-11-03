namespace crossn;

entity Customers {
  key ID   : Integer;
  name     : String;
  city     : String;
}

entity Orders {
  key ID   : Integer;
  customer : Association to Customers;
  amount   : Decimal(9,2);
  status   : String;
}
