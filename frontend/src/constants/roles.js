import { Shield, Building2, Calculator } from "lucide-react";

// Keys mirror the backend `role` enum on User (backend/src/models/user.model.js)
// exactly: "Admin" | "Sales" | "Accountant". The `param` is the lowercase
// value used in the URL (/login/:role) and is mapped back to the backend
// value before any API call.
export const ROLES = [
  {
    param: "admin",
    value: "Admin",
    label: "Admin",
    description: "Full access to all features and analytics",
    icon: Shield,
  },
  {
    param: "sales",
    value: "Sales",
    label: "Sales",
    description: "Manage quotations and invoices",
    icon: Building2,
  },
  {
    param: "accountant",
    value: "Accountant",
    label: "Accountant",
    description: "Handle financial records and GST",
    icon: Calculator,
  },
];

export const getRoleByParam = (param) =>
  ROLES.find((r) => r.param === param?.toLowerCase());

export const getRoleByValue = (value) =>
  ROLES.find((r) => r.value.toLowerCase() === value?.toLowerCase());
