/**
 * AssetFlow v1.0 - Deposit Management Dashboard
 * Overview of products in deposit with weekly reports and invoicing status
 */

import React, { useState, useEffect } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Chart from '../../components/Chart';
import Icon from '../../components/icon/Icon';
import Badge from '../../components/bootstrap/Badge';

interface DepositStats {
	totalProductsInDeposit: number;
	totalClients: number;
	pendingReports: number;
	pendingInvoices: number;
	soldThisWeek: number;
	revenueThisWeek: number;
}

const DepositDashboard = () => {
	const [stats, setStats] = useState<DepositStats>({
		totalProductsInDeposit: 0,
		totalClients: 0,
		pendingReports: 0,
		pendingInvoices: 0,
		soldThisWeek: 0,
		revenueThisWeek: 0,
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// TODO: Fetch real data from API
		setTimeout(() => {
			setStats({
				totalProductsInDeposit: 3240,
				totalClients: 18,
				pendingReports: 5,
				pendingInvoices: 3,
				soldThisWeek: 145,
				revenueThisWeek: 3697.5,
			});
			setLoading(false);
		}, 500);
	}, []);

	// Weekly Sales Chart
	const weeklySalesChartOptions = {
		chart: {
			type: 'bar',
			height: 350,
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent'],
		},
		xaxis: {
			categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		},
		yaxis: {
			title: {
				text: 'Units Sold',
			},
		},
		fill: {
			opacity: 1,
		},
		colors: ['#3B82F6', '#10B981'],
	};

	const weeklySalesChartSeries = [
		{
			name: 'Units Sold',
			data: [18, 25, 22, 19, 28, 21, 12],
		},
		{
			name: 'Revenue ($)',
			data: [459, 637.5, 561, 484.5, 714, 535.5, 306],
		},
	];

	// Client Distribution Chart
	const clientDistributionOptions = {
		chart: {
			type: 'pie',
		},
		labels: ['Distribuidor Norte', 'Distribuidor Sur', 'Distribuidor Este', 'Distribuidor Oeste', 'Others'],
		colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
	};

	const clientDistributionSeries = [850, 720, 650, 580, 440];

	return (
		<PageWrapper>
			<Page>
				<div className='row'>
					<div className='col-12'>
						<div className='display-4 fw-bold py-3'>Deposit Management Dashboard</div>
					</div>
				</div>

				{/* Stats Cards Row */}
				<div className='row g-4'>
					{/* Total Products in Deposit */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='Inventory2' size='3x' color='primary' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Products in Deposit</div>
									<div className='fw-bold fs-3'>{stats.totalProductsInDeposit.toLocaleString()}</div>
									<div className='text-muted small'>Across {stats.totalClients} clients</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Sold This Week */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='ShoppingCart' size='3x' color='success' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Sold This Week</div>
									<div className='fw-bold fs-3'>{stats.soldThisWeek}</div>
									<div className='text-success small'>
										<Icon icon='TrendingUp' /> +15% vs last week
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Revenue This Week */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='AttachMoney' size='3x' color='info' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Revenue This Week</div>
									<div className='fw-bold fs-3'>${stats.revenueThisWeek.toLocaleString()}</div>
									<div className='text-muted small'>From sold items</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Pending Actions */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='Notifications' size='3x' color='warning' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Pending</div>
									<div className='fw-bold fs-3'>
										{stats.pendingReports + stats.pendingInvoices}
									</div>
									<div className='text-warning small'>
										{stats.pendingReports} reports, {stats.pendingInvoices} invoices
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Charts Row */}
				<div className='row g-4 mt-2'>
					{/* Weekly Sales */}
					<div className='col-lg-8'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Weekly Sales Performance</CardTitle>
								</CardLabel>
								<div>
									<Button color='primary' size='sm' isLight>
										This Week
									</Button>
								</div>
							</CardHeader>
							<CardBody>
								<Chart
									series={weeklySalesChartSeries}
									options={weeklySalesChartOptions}
									type='bar'
									height={350}
								/>
							</CardBody>
						</Card>
					</div>

					{/* Client Distribution */}
					<div className='col-lg-4'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Products by Client</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<Chart
									series={clientDistributionSeries}
									options={clientDistributionOptions}
									type='pie'
									height={350}
								/>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Pending Reports & Recent Invoices */}
				<div className='row g-4 mt-2'>
					{/* Pending Weekly Reports */}
					<div className='col-lg-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Pending Weekly Reports</CardTitle>
								</CardLabel>
								<Button color='primary' size='sm' icon='CloudUpload'>
									Upload Report
								</Button>
							</CardHeader>
							<CardBody>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Client</th>
											<th>Week</th>
											<th>Status</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												<div className='fw-bold'>Distribuidor Norte S.L.</div>
												<div className='text-muted small'>CLI-001</div>
											</td>
											<td>Week 42 - 2025</td>
											<td>
												<Badge color='danger'>Pending Upload</Badge>
											</td>
											<td>
												<Button color='primary' size='sm' isLight icon='Upload'>
													Upload
												</Button>
											</td>
										</tr>
										<tr>
											<td>
												<div className='fw-bold'>Distribuidor Sur S.A.</div>
												<div className='text-muted small'>CLI-002</div>
											</td>
											<td>Week 42 - 2025</td>
											<td>
												<Badge color='warning'>Processing</Badge>
											</td>
											<td>
												<Button color='info' size='sm' isLight icon='Visibility'>
													View
												</Button>
											</td>
										</tr>
										<tr>
											<td>
												<div className='fw-bold'>Distribuidor Este Ltd.</div>
												<div className='text-muted small'>CLI-003</div>
											</td>
											<td>Week 41 - 2025</td>
											<td>
												<Badge color='success'>Processed</Badge>
											</td>
											<td>
												<Button color='success' size='sm' isLight icon='CheckCircle'>
													Invoice
												</Button>
											</td>
										</tr>
									</tbody>
								</table>
							</CardBody>
						</Card>
					</div>

					{/* Recent Invoices */}
					<div className='col-lg-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Recent Invoices</CardTitle>
								</CardLabel>
								<Button color='primary' size='sm' isLink>
									View All
								</Button>
							</CardHeader>
							<CardBody>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Invoice #</th>
											<th>Client</th>
											<th>Amount</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												<div className='fw-bold'>INV-2025-W41-001</div>
												<div className='text-muted small'>Oct 8, 2025</div>
											</td>
											<td>Distribuidor Norte S.L.</td>
											<td className='fw-bold'>$1,247.50</td>
											<td>
												<Badge color='success'>Paid</Badge>
											</td>
										</tr>
										<tr>
											<td>
												<div className='fw-bold'>INV-2025-W41-002</div>
												<div className='text-muted small'>Oct 8, 2025</div>
											</td>
											<td>Distribuidor Sur S.A.</td>
											<td className='fw-bold'>$865.00</td>
											<td>
												<Badge color='warning'>Pending</Badge>
											</td>
										</tr>
										<tr>
											<td>
												<div className='fw-bold'>INV-2025-W40-005</div>
												<div className='text-muted small'>Oct 1, 2025</div>
											</td>
											<td>Distribuidor Este Ltd.</td>
											<td className='fw-bold'>$1,485.00</td>
											<td>
												<Badge color='success'>Paid</Badge>
											</td>
										</tr>
									</tbody>
								</table>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Quick Actions */}
				<div className='row g-4 mt-2'>
					<div className='col-12'>
						<Card>
							<CardHeader>
								<CardLabel>
									<CardTitle>Quick Actions</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='primary'
											isLight
											className='w-100 py-3'
											icon='CloudUpload'>
											Upload Weekly Report
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='success'
											isLight
											className='w-100 py-3'
											icon='Receipt'>
											Generate Invoice
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='info'
											isLight
											className='w-100 py-3'
											icon='QrCode'>
											Manage QR Codes
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='warning'
											isLight
											className='w-100 py-3'
											icon='Assessment'>
											Export to Odoo
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Alerts */}
				<div className='row g-4 mt-2'>
					<div className='col-12'>
						<Card>
							<CardHeader>
								<CardLabel>
									<CardTitle>
										<Icon icon='Notifications' className='me-2' />
										Alerts & Reminders
									</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='list-group'>
									<div className='list-group-item list-group-item-action border-0 border-start border-danger border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Warning' color='danger' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Overdue Reports</div>
												<div className='text-muted small'>
													3 weekly reports are overdue and need immediate attention
												</div>
											</div>
										</div>
									</div>
									<div className='list-group-item list-group-item-action border-0 border-start border-warning border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Schedule' color='warning' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Week Ending Soon</div>
												<div className='text-muted small'>
													This week ends in 2 days - prepare reports
												</div>
											</div>
										</div>
									</div>
									<div className='list-group-item list-group-item-action border-0 border-start border-info border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Info' color='info' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Low Stock Alert</div>
												<div className='text-muted small'>
													2 clients have less than 50 products in deposit
												</div>
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default DepositDashboard;
