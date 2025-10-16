/**
 * AssetFlow v1.0 - Menu Configuration
 * Adapted from Facit Template
 * Asset Management System Menu Structure
 */

export const dashboardPagesMenu = {
	assetDashboard: {
		id: 'assetDashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
	},
	depositDashboard: {
		id: 'depositDashboard',
		text: 'Deposit Dashboard',
		path: 'deposit/dashboard',
		icon: 'Inventory2',
		notification: true,
		subMenu: null,
	},
};

export const assetManagementMenu = {
	assets: {
		id: 'assets',
		text: 'Asset Management',
		path: 'assets',
		icon: 'Inventory',
		subMenu: {
			dashboard: dashboardPagesMenu.assetDashboard,
			assetList: {
				id: 'assetList',
				text: 'Asset List',
				path: 'assets/list',
				icon: 'FactCheck',
			},
			assetGrid: {
				id: 'assetGrid',
				text: 'Asset Grid',
				path: 'assets/grid',
				icon: 'CalendarViewMonth',
			},
			assetID: {
				id: 'assetID',
				text: 'assetID',
				path: 'assets/asset',
				hide: true,
			},
			asset: {
				id: 'asset',
				text: 'Asset Detail',
				path: 'assets/asset/1',
				icon: 'QrCode2',
			},
			addAsset: {
				id: 'addAsset',
				text: 'Add Asset',
				path: 'assets/add',
				icon: 'AddCircle',
			},
			categories: {
				id: 'categories',
				text: 'Categories',
				path: 'assets/categories',
				icon: 'Category',
			},
			locations: {
				id: 'locations',
				text: 'Locations',
				path: 'assets/locations',
				icon: 'LocationOn',
			},
		},
	},
	maintenance: {
		id: 'maintenance',
		text: 'Maintenance',
		path: 'maintenance',
		icon: 'Build',
		notification: true,
		subMenu: {
			calendar: {
				id: 'calendar',
				text: 'Maintenance Calendar',
				path: 'maintenance/calendar',
				icon: 'EditCalendar',
				notification: true,
			},
			maintenanceList: {
				id: 'maintenanceList',
				text: 'Maintenance List',
				path: 'maintenance/list',
				icon: 'Event',
			},
			preventive: {
				id: 'preventive',
				text: 'Preventive',
				path: 'maintenance/preventive',
				icon: 'Schedule',
			},
			corrective: {
				id: 'corrective',
				text: 'Corrective',
				path: 'maintenance/corrective',
				icon: 'Warning',
			},
			history: {
				id: 'history',
				text: 'History',
				path: 'maintenance/history',
				icon: 'History',
			},
		},
	},
	movements: {
		id: 'movements',
		text: 'Movements',
		path: 'movements',
		icon: 'SwapHoriz',
		subMenu: {
			movementList: {
				id: 'movementList',
				text: 'Movement List',
				path: 'movements/list',
				icon: 'List',
			},
			transfers: {
				id: 'transfers',
				text: 'Transfers',
				path: 'movements/transfers',
				icon: 'CompareArrows',
			},
			assignments: {
				id: 'assignments',
				text: 'Assignments',
				path: 'movements/assignments',
				icon: 'AssignmentInd',
			},
			disposal: {
				id: 'disposal',
				text: 'Disposal',
				path: 'movements/disposal',
				icon: 'Delete',
			},
		},
	},
	depreciation: {
		id: 'depreciation',
		text: 'Depreciation',
		path: 'depreciation',
		icon: 'TrendingDown',
		subMenu: {
			overview: {
				id: 'overview',
				text: 'Overview',
				path: 'depreciation/overview',
				icon: 'Summarize',
			},
			calculate: {
				id: 'calculate',
				text: 'Calculate',
				path: 'depreciation/calculate',
				icon: 'Calculate',
			},
			reports: {
				id: 'reports',
				text: 'Reports',
				path: 'depreciation/reports',
				icon: 'Assessment',
			},
			methods: {
				id: 'methods',
				text: 'Methods',
				path: 'depreciation/methods',
				icon: 'Functions',
			},
		},
	},
};

export const depositManagementMenu = {
	deposit: {
		id: 'deposit',
		text: 'Deposit Management',
		path: 'deposit',
		icon: 'Store',
		notification: true,
		subMenu: {
			dashboard: dashboardPagesMenu.depositDashboard,
			depositList: {
				id: 'depositList',
				text: 'Products in Deposit',
				path: 'deposit/list',
				icon: 'Inventory2',
			},
			clients: {
				id: 'clients',
				text: 'Clients',
				path: 'deposit/clients',
				icon: 'Group',
			},
			clientID: {
				id: 'clientID',
				text: 'clientID',
				path: 'deposit/client',
				hide: true,
			},
			client: {
				id: 'client',
				text: 'Client Detail',
				path: 'deposit/client/1',
				icon: 'Person',
			},
			weeklyReports: {
				id: 'weeklyReports',
				text: 'Weekly Reports',
				path: 'deposit/weekly-reports',
				icon: 'DateRange',
			},
			reportUpload: {
				id: 'reportUpload',
				text: 'Upload Report',
				path: 'deposit/upload-report',
				icon: 'CloudUpload',
			},
			invoicing: {
				id: 'invoicing',
				text: 'Invoicing',
				path: 'deposit/invoicing',
				icon: 'Receipt',
			},
			invoiceID: {
				id: 'invoiceID',
				text: 'invoiceID',
				path: 'deposit/invoice',
				hide: true,
			},
			invoice: {
				id: 'invoice',
				text: 'Invoice',
				path: 'deposit/invoice/1',
				icon: 'Description',
			},
			boxes: {
				id: 'boxes',
				text: 'Boxes Tracking',
				path: 'deposit/boxes',
				icon: 'Widgets',
			},
			qrCodes: {
				id: 'qrCodes',
				text: 'QR Codes',
				path: 'deposit/qr-codes',
				icon: 'QrCode',
			},
		},
	},
};

export const reportsPagesMenu = {
	reports: {
		id: 'reports',
		text: 'Reports & Analytics',
		path: 'reports',
		icon: 'Assessment',
		subMenu: {
			inventory: {
				id: 'inventory',
				text: 'Inventory Report',
				path: 'reports/inventory',
				icon: 'ListAlt',
			},
			valueReport: {
				id: 'valueReport',
				text: 'Asset Value',
				path: 'reports/value',
				icon: 'AttachMoney',
			},
			depreciationReport: {
				id: 'depreciationReport',
				text: 'Depreciation',
				path: 'reports/depreciation',
				icon: 'TrendingDown',
			},
			maintenanceReport: {
				id: 'maintenanceReport',
				text: 'Maintenance',
				path: 'reports/maintenance',
				icon: 'Build',
			},
			locationReport: {
				id: 'locationReport',
				text: 'By Location',
				path: 'reports/location',
				icon: 'LocationOn',
			},
			analytics: {
				id: 'analytics',
				text: 'Analytics',
				path: 'reports/analytics',
				icon: 'Analytics',
			},
			exportData: {
				id: 'exportData',
				text: 'Export Data',
				path: 'reports/export',
				icon: 'CloudDownload',
			},
		},
	},
};

export const adminPagesMenu = {
	administration: {
		id: 'administration',
		text: 'Administration',
		path: 'admin',
		icon: 'AdminPanelSettings',
		subMenu: {
			users: {
				id: 'users',
				text: 'Users',
				path: 'admin/users',
				icon: 'People',
			},
			userID: {
				id: 'userID',
				text: 'userID',
				path: 'admin/user',
				hide: true,
			},
			user: {
				id: 'user',
				text: 'User',
				path: 'admin/user/1',
				icon: 'Person',
			},
			roles: {
				id: 'roles',
				text: 'Roles & Permissions',
				path: 'admin/roles',
				icon: 'Security',
			},
			company: {
				id: 'company',
				text: 'Company Settings',
				path: 'admin/company',
				icon: 'Business',
			},
			departments: {
				id: 'departments',
				text: 'Departments',
				path: 'admin/departments',
				icon: 'CorporateFare',
			},
			locations: {
				id: 'locations',
				text: 'Locations',
				path: 'admin/locations',
				icon: 'LocationCity',
			},
			categories: {
				id: 'categories',
				text: 'Asset Categories',
				path: 'admin/categories',
				icon: 'Category',
			},
			settings: {
				id: 'settings',
				text: 'General Settings',
				path: 'admin/settings',
				icon: 'Settings',
			},
			auditLog: {
				id: 'auditLog',
				text: 'Audit Log',
				path: 'admin/audit-log',
				icon: 'HistoryEdu',
			},
		},
	},
};

export const authPagesMenu = {
	auth: {
		id: 'auth',
		text: 'Auth Pages',
		icon: 'Extension',
	},
	login: {
		id: 'login',
		text: 'Login',
		path: 'auth/login',
		icon: 'Login',
	},
	signUp: {
		id: 'signUp',
		text: 'Sign Up',
		path: 'auth/sign-up',
		icon: 'PersonAdd',
	},
	page404: {
		id: 'Page404',
		text: '404 Page',
		path: 'auth/404',
		icon: 'ReportGmailerrorred',
	},
};

/**
 * Main Menu Export
 * This defines the structure of the sidebar menu
 */
export const mainMenu = {
	dashboard: dashboardPagesMenu,
	assetManagement: assetManagementMenu,
	depositManagement: depositManagementMenu,
	reports: reportsPagesMenu,
	admin: adminPagesMenu,
	auth: authPagesMenu,
};
