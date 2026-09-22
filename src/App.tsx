import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InstallPrompt } from './components/InstallPrompt';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BudgetEstimatorPage } from './pages/BudgetEstimatorPage';
import { DigitalQuotePage } from './pages/DigitalQuotePage';
import { TrackingPage } from './pages/TrackingPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { CookiesPage } from './pages/CookiesPage';
import { LegalNoticePage } from './pages/LegalNoticePage';
import { LoginPage } from './pages/LoginPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRepairsPage } from './pages/admin/AdminRepairsPage';
import { AdminQuotesPage } from './pages/admin/AdminQuotesPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminSuppliersPage } from './pages/admin/AdminSuppliersPage';
import { AdminPricingCatalogPage } from './pages/admin/AdminPricingCatalogPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminSecurityPage } from './pages/admin/AdminSecurityPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

// Layout wrapper to conditionally hide Navbar & Footer on /admin routes
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark text-slate-100 selection:bg-brand-green selection:text-black">
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
      <InstallPrompt />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/presupuesto" element={<BudgetEstimatorPage />} />
            <Route path="/presupuesto/:id" element={<DigitalQuotePage />} />
            <Route path="/seguimiento" element={<TrackingPage />} />
            <Route path="/seguimiento/:id" element={<TrackingPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/privacidad" element={<PrivacyPolicyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/aviso-legal" element={<LegalNoticePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/reparaciones" element={<AdminRepairsPage />} />
            <Route path="/admin/presupuestos" element={<AdminQuotesPage />} />
            <Route path="/admin/clientes" element={<AdminCustomersPage />} />
            <Route path="/admin/inventario" element={<AdminInventoryPage />} />
            <Route path="/admin/proveedores" element={<AdminSuppliersPage />} />
            <Route path="/admin/precios" element={<AdminPricingCatalogPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/configuracion" element={<AdminSettingsPage />} />
            <Route path="/admin/seguridad" element={<AdminSecurityPage />} />
            <Route path="/admin/perfil" element={<AdminSecurityPage />} />

            {/* Fallback route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
