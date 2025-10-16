/**
 * AssetFlow v1.0 - Content Routes Configuration
 * Defines all application routes adapted from Facit template
 */

import React, { lazy } from 'react';
import { dashboardPagesMenu, assetManagementMenu, depositManagementMenu, reportsPagesMenu, adminPagesMenu } from '../menu';

// Lazy load pages for better performance
const AssetDashboard = lazy(() => import('../pages/AssetDashboard'));
const DepositDashboard = lazy(() => import('../pages/Deposit/DepositDashboard'));

// Asset Management Pages
const AssetList = lazy(() => import('../pages/Assets/AssetList'));
const AssetGrid = lazy(() => import('../pages/Assets/AssetGrid'));
const AssetDetail = lazy(() => import('../pages/Assets/AssetDetail'));
const AssetAdd = lazy(() => import('../pages/Assets/AssetAdd'));
const AssetCategories = lazy(() => import('../pages/Assets/AssetCategories'));
const AssetLocations = lazy(() => import('../pages/Assets/AssetLocations'));

// Maintenance Pages
const MaintenanceCalendar = lazy(() => import('../pages/Maintenance/MaintenanceCalendar'));
const MaintenanceList = lazy(() => import('../pages/Maintenance/MaintenanceList'));
const MaintenancePreventive = lazy(() => import('../pages/Maintenance/MaintenancePreventive'));
const MaintenanceCorrective = lazy(() => import('../pages/Maintenance/MaintenanceCorrective'));
const MaintenanceHistory = lazy(() => import('../pages/Maintenance/MaintenanceHistory'));

// Movement Pages
const MovementList = lazy(() => import('../pages/Movements/MovementList'));
const Transfers = lazy(() => import('../pages/Movements/Transfers'));
const Assignments = lazy(() => import('../pages/Movements/Assignments'));
const Disposal = lazy(() => import('../pages/Movements/Disposal'));

// Depreciation Pages
const DepreciationOverview = lazy(() => import('../pages/Depreciation/DepreciationOverview'));
const DepreciationCalculate = lazy(() => import('../pages/Depreciation/DepreciationCalculate'));
const DepreciationReports = lazy(() => import('../pages/Depreciation/DepreciationReports'));
const DepreciationMethods = lazy(() => import('../pages/Depreciation/DepreciationMethods'));

// Deposit Management Pages
const DepositList = lazy(() => import('../pages/Deposit/DepositList'));
const DepositClients = lazy(() => import('../pages/Deposit/DepositClients'));
const DepositClientDetail = lazy(() => import('../pages/Deposit/DepositClientDetail'));
const WeeklyReports = lazy(() => import('../pages/Deposit/WeeklyReports'));
const ReportUpload = lazy(() => import('../pages/Deposit/ReportUpload'));
const Invoicing = lazy(() => import('../pages/Deposit/Invoicing'));
const InvoiceDetail = lazy(() => import('../pages/Deposit/InvoiceDetail'));
const BoxesTracking = lazy(() => import('../pages/Deposit/BoxesTracking'));
const QRCodes = lazy(() => import('../pages/Deposit/QRCodes'));

// Reports & Analytics Pages
const InventoryReport = lazy(() => import('../pages/Reports/InventoryReport'));
const ValueReport = lazy(() => import('../pages/Reports/ValueReport'));
const DepreciationReport = lazy(() => import('../pages/Reports/DepreciationReport'));
const MaintenanceReport = lazy(() => import('../pages/Reports/MaintenanceReport'));
const LocationReport = lazy(() => import('../pages/Reports/LocationReport'));
const Analytics = lazy(() => import('../pages/Reports/Analytics'));
const ExportData = lazy(() => import('../pages/Reports/ExportData'));

// Administration Pages
const Users = lazy(() => import('../pages/Admin/Users'));
const UserDetail = lazy(() => import('../pages/Admin/UserDetail'));
const Roles = lazy(() => import('../pages/Admin/Roles'));
const CompanySettings = lazy(() => import('../pages/Admin/CompanySettings'));
const Departments = lazy(() => import('../pages/Admin/Departments'));
const AdminLocations = lazy(() => import('../pages/Admin/AdminLocations'));
const AdminCategories = lazy(() => import('../pages/Admin/AdminCategories'));
const GeneralSettings = lazy(() => import('../pages/Admin/GeneralSettings'));
const AuditLog = lazy(() => import('../pages/Admin/AuditLog'));

// Auth Pages
const Login = lazy(() => import('../pages/Auth/Login'));
const SignUp = lazy(() => import('../pages/Auth/SignUp'));
const Page404 = lazy(() => import('../pages/Auth/Page404'));

const contentRoutes = [
	/**
	 * Dashboard Routes
	 */
	{
		path: dashboardPagesMenu.assetDashboard.path,
		element: <AssetDashboard />,
		exact: true,
	},
	{
		path: dashboardPagesMenu.depositDashboard.path,
		element: <DepositDashboard />,
	},

	/**
	 * Asset Management Routes
	 */
	{
		path: assetManagementMenu.assets.subMenu.assetList.path,
		element: <AssetList />,
	},
	{
		path: assetManagementMenu.assets.subMenu.assetGrid.path,
		element: <AssetGrid />,
	},
	{
		path: `${assetManagementMenu.assets.subMenu.assetID.path}/:id`,
		element: <AssetDetail />,
	},
	{
		path: assetManagementMenu.assets.subMenu.addAsset.path,
		element: <AssetAdd />,
	},
	{
		path: assetManagementMenu.assets.subMenu.categories.path,
		element: <AssetCategories />,
	},
	{
		path: assetManagementMenu.assets.subMenu.locations.path,
		element: <AssetLocations />,
	},

	/**
	 * Maintenance Routes
	 */
	{
		path: assetManagementMenu.maintenance.subMenu.calendar.path,
		element: <MaintenanceCalendar />,
	},
	{
		path: assetManagementMenu.maintenance.subMenu.maintenanceList.path,
		element: <MaintenanceList />,
	},
	{
		path: assetManagementMenu.maintenance.subMenu.preventive.path,
		element: <MaintenancePreventive />,
	},
	{
		path: assetManagementMenu.maintenance.subMenu.corrective.path,
		element: <MaintenanceCorrective />,
	},
	{
		path: assetManagementMenu.maintenance.subMenu.history.path,
		element: <MaintenanceHistory />,
	},

	/**
	 * Movement Routes
	 */
	{
		path: assetManagementMenu.movements.subMenu.movementList.path,
		element: <MovementList />,
	},
	{
		path: assetManagementMenu.movements.subMenu.transfers.path,
		element: <Transfers />,
	},
	{
		path: assetManagementMenu.movements.subMenu.assignments.path,
		element: <Assignments />,
	},
	{
		path: assetManagementMenu.movements.subMenu.disposal.path,
		element: <Disposal />,
	},

	/**
	 * Depreciation Routes
	 */
	{
		path: assetManagementMenu.depreciation.subMenu.overview.path,
		element: <DepreciationOverview />,
	},
	{
		path: assetManagementMenu.depreciation.subMenu.calculate.path,
		element: <DepreciationCalculate />,
	},
	{
		path: assetManagementMenu.depreciation.subMenu.reports.path,
		element: <DepreciationReports />,
	},
	{
		path: assetManagementMenu.depreciation.subMenu.methods.path,
		element: <DepreciationMethods />,
	},

	/**
	 * Deposit Management Routes
	 */
	{
		path: depositManagementMenu.deposit.subMenu.depositList.path,
		element: <DepositList />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.clients.path,
		element: <DepositClients />,
	},
	{
		path: `${depositManagementMenu.deposit.subMenu.clientID.path}/:id`,
		element: <DepositClientDetail />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.weeklyReports.path,
		element: <WeeklyReports />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.reportUpload.path,
		element: <ReportUpload />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.invoicing.path,
		element: <Invoicing />,
	},
	{
		path: `${depositManagementMenu.deposit.subMenu.invoiceID.path}/:id`,
		element: <InvoiceDetail />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.boxes.path,
		element: <BoxesTracking />,
	},
	{
		path: depositManagementMenu.deposit.subMenu.qrCodes.path,
		element: <QRCodes />,
	},

	/**
	 * Reports & Analytics Routes
	 */
	{
		path: reportsPagesMenu.reports.subMenu.inventory.path,
		element: <InventoryReport />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.valueReport.path,
		element: <ValueReport />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.depreciationReport.path,
		element: <DepreciationReport />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.maintenanceReport.path,
		element: <MaintenanceReport />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.locationReport.path,
		element: <LocationReport />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.analytics.path,
		element: <Analytics />,
	},
	{
		path: reportsPagesMenu.reports.subMenu.exportData.path,
		element: <ExportData />,
	},

	/**
	 * Administration Routes
	 */
	{
		path: adminPagesMenu.administration.subMenu.users.path,
		element: <Users />,
	},
	{
		path: `${adminPagesMenu.administration.subMenu.userID.path}/:id`,
		element: <UserDetail />,
	},
	{
		path: adminPagesMenu.administration.subMenu.roles.path,
		element: <Roles />,
	},
	{
		path: adminPagesMenu.administration.subMenu.company.path,
		element: <CompanySettings />,
	},
	{
		path: adminPagesMenu.administration.subMenu.departments.path,
		element: <Departments />,
	},
	{
		path: adminPagesMenu.administration.subMenu.locations.path,
		element: <AdminLocations />,
	},
	{
		path: adminPagesMenu.administration.subMenu.categories.path,
		element: <AdminCategories />,
	},
	{
		path: adminPagesMenu.administration.subMenu.settings.path,
		element: <GeneralSettings />,
	},
	{
		path: adminPagesMenu.administration.subMenu.auditLog.path,
		element: <AuditLog />,
	},

	/**
	 * Auth Routes
	 */
	{
		path: '/auth/login',
		element: <Login />,
	},
	{
		path: '/auth/sign-up',
		element: <SignUp />,
	},
	{
		path: '/auth/404',
		element: <Page404 />,
	},
];

export default contentRoutes;
