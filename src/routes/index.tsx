import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/Skeleton'

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))

// Main pages
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const PipelinePage = lazy(() => import('@/features/pipeline/PipelinePage'))
const EngagementDetailPage = lazy(() => import('@/features/pipeline/EngagementDetailPage'))
const CompaniesPage = lazy(() => import('@/features/companies/CompaniesPage'))
const CompanyForm = lazy(() => import('@/features/companies/CompanyForm'))
const CompanyDetailPage = lazy(() => import('@/features/companies/CompanyDetailPage'))
const CompanyImportPage = lazy(() => import('@/features/companies/CompanyImportPage'))
const ContactsPage = lazy(() => import('@/features/contacts/ContactsPage'))
const ContactForm = lazy(() => import('@/features/contacts/ContactForm'))
const ContactDetailPage = lazy(() => import('@/features/contacts/ContactDetailPage'))
const DocumentCenterPage = lazy(() => import('@/features/documents/DocumentCenterPage'))
const ActivityPage = lazy(() => import('@/features/activity/ActivityPage'))
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'))
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'))
const PipelineReport = lazy(() => import('@/features/reports/PipelineReport'))
const RevenueReport = lazy(() => import('@/features/reports/RevenueReport'))
const TeamReport = lazy(() => import('@/features/reports/TeamReport'))
const DealAnalysisReport = lazy(() => import('@/features/reports/DealAnalysisReport'))
const AIHubPage = lazy(() => import('@/features/ai/AIHubPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const TeamManagement = lazy(() => import('@/features/settings/TeamManagement'))
const PipelineConfig = lazy(() => import('@/features/settings/PipelineConfig'))
const EmailTemplates = lazy(() => import('@/features/settings/EmailTemplates'))
const NotificationPrefs = lazy(() => import('@/features/settings/NotificationPrefs'))
const IntegrationsConfig = lazy(() => import('@/features/settings/IntegrationsConfig'))
const AuditLogPage = lazy(() => import('@/features/settings/AuditLogPage'))

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="engagements/new" element={<Navigate to="/pipeline" replace />} />
          <Route path="engagements/:id" element={<EngagementDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<CompanyForm />} />
          <Route path="companies/import" element={<CompanyImportPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/new" element={<ContactForm />} />
          <Route path="contacts/:id" element={<ContactDetailPage />} />
          <Route path="documents" element={<DocumentCenterPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/pipeline" element={<PipelineReport />} />
          <Route path="reports/revenue" element={<RevenueReport />} />
          <Route path="reports/team" element={<TeamReport />} />
          <Route path="reports/deals" element={<DealAnalysisReport />} />
          <Route path="ai" element={<AIHubPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/team" element={<TeamManagement />} />
          <Route path="settings/pipeline" element={<PipelineConfig />} />
          <Route path="settings/templates" element={<EmailTemplates />} />
          <Route path="settings/notifications" element={<NotificationPrefs />} />
          <Route path="settings/integrations" element={<IntegrationsConfig />} />
          <Route path="settings/audit" element={<AuditLogPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
