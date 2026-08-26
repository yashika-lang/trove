import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import RegisterPage from "./pages/auth/RegisterPage";
import RoleSelectPage from "./pages/auth/RoleSelectPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage";
import SalesDashboardPage from "./pages/dashboard/SalesDashboardPage";
import AccountantDashboardPage from "./pages/dashboard/AccountantDashboardPage";
import QuotationsPage from "./pages/quotations/QuotationsPage";
import InvoicesPage from "./pages/invoices/InvoicesPage";
import ProductsPage from "./pages/products/ProductsPage";
import CustomersPage from "./pages/customers/CustomersPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import BankDashboardPage from "./pages/bank/BankDashboardPage";
import LedgerPage from "./pages/ledger/LedgerPage";
import ReportsPage from "./pages/reports/ReportsPage";
import GSTPage from "./pages/gst/GSTPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ComingSoonPage from "./pages/placeholder/ComingSoonPage";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<RoleSelectPage />} />
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Admin gets the fully built experience — sidebar/topbar shell,
            real Dashboard and Quotations, matching the approved screenshots. */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin", "Sales", "Accountant"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="Admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales"]}>
                <QuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales", "Accountant"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales"]}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales", "Accountant"]}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <BankDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <LedgerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst/*"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <GSTPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/dashboard"
            element={
              <ProtectedRoute allowedRole="Sales">
                <SalesDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accountant/dashboard"
            element={
              <ProtectedRoute allowedRole="Accountant">
                <AccountantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales", "Accountant"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Sales", "Accountant"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <ProtectedRoute allowedRole="Admin">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/coming-soon/:module" element={<ComingSoonPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </ThemeProvider>
    </AuthProvider>
  );
}
