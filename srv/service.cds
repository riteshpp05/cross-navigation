using crossn from '../db/schema';

service CrossService {
  entity Customers as projection on crossn.Customers;
  entity Orders    as projection on crossn.Orders;
}
