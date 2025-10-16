/**
 * AssetFlow v1.0 - Asset Dashboard
 * Main dashboard for asset management overview
 */

import React, { useState, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Page from '../layout/Page/Page';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../components/bootstrap/Card';
import Button from '../components/bootstrap/Button';
import Chart from '../components/Chart';
import Icon from '../components/icon/Icon';

interface DashboardStats {
	totalAssets: number;
	totalValue: number;
	accumulatedDepreciation: number;
	pendingMaintenance: number;
	assetsInDepot: number;
	monthlyTrend: number;
}

const AssetDashboard = () => {
	const [stats, setStats] = useState<DashboardStats>({
		totalAssets: 0,
		totalValue: 0,
		accumulatedDepreciation: 0,
		pendingMaintenance: 0,
		assetsInDepot: 0,
		monthlyTrend: 0,
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// TODO: Fetch real data from API
		// Simulating API call
		setTimeout(() => {
			setStats({
				totalAssets: 1250,
				totalValue: 2450000,
				accumulatedDepreciation: 450000,
				pendingMaintenance: 15,
				assetsInDepot: 320,
				monthlyTrend: 5.2,
			});
			setLoading(false);
		}, 500);
	}, []);

	// Chart data
	const assetValueChartOptions = {
		chart: {
			type: 'area',
			height: 350,
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: 'smooth',
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		colors: ['#3B82F6', '#10B981'],
	};

	const assetValueChartSeries = [
		{
			name: 'Asset Value',
			data: [2400000, 2420000, 2380000, 2410000, 2435000, 2450000, 2430000, 2445000, 2460000, 2450000, 2465000, 2480000],
		},
		{
			name: 'Book Value',
			data: [2100000, 2080000, 2050000, 2020000, 2000000, 1980000, 1960000, 1950000, 1930000, 1910000, 1890000, 1870000],
		},
	];

	const categoryDistributionOptions = {
		chart: {
			type: 'donut',
		},
		labels: ['Machinery', 'Vehicles', 'Equipment', 'Furniture', 'IT Assets', 'Others'],
		colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'],
	};

	const categoryDistributionSeries = [450, 280, 220, 150, 100, 50];

	return (
		<PageWrapper>
			<Page>
				<div className='row'>
					<div className='col-12'>
						<div className='display-4 fw-bold py-3'>Asset Dashboard</div>
					</div>
				</div>

				{/* Stats Cards Row */}
				<div className='row g-4'>
					{/* Total Assets */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='Inventory' size='3x' color='primary' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Total Assets</div>
									<div className='fw-bold fs-3'>{stats.totalAssets.toLocaleString()}</div>
									<div className='text-success small'>
										<Icon icon='TrendingUp' /> +{stats.monthlyTrend}% this month
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Total Value */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='AttachMoney' size='3x' color='success' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Total Value</div>
									<div className='fw-bold fs-3'>${(stats.totalValue / 1000000).toFixed(2)}M</div>
									<div className='text-muted small'>Purchase Value</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Accumulated Depreciation */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='TrendingDown' size='3x' color='warning' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Depreciation</div>
									<div className='fw-bold fs-3'>${(stats.accumulatedDepreciation / 1000).toFixed(0)}K</div>
									<div className='text-muted small'>Accumulated</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Pending Maintenance */}
					<div className='col-lg-3 col-md-6'>
						<Card stretch>
							<CardBody className='d-flex align-items-center'>
								<div className='flex-shrink-0'>
									<Icon icon='Build' size='3x' color='danger' />
								</div>
								<div className='flex-grow-1 ms-3'>
									<div className='text-muted small'>Maintenance</div>
									<div className='fw-bold fs-3'>{stats.pendingMaintenance}</div>
									<div className='text-danger small'>Pending</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Charts Row */}
				<div className='row g-4 mt-2'>
					{/* Asset Value Trend */}
					<div className='col-lg-8'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Asset Value Trend</CardTitle>
								</CardLabel>
								<div>
									<Button color='primary' size='sm' isLight>
										This Year
									</Button>
								</div>
							</CardHeader>
							<CardBody>
								<Chart
									series={assetValueChartSeries}
									options={assetValueChartOptions}
									type='area'
									height={350}
								/>
							</CardBody>
						</Card>
					</div>

					{/* Category Distribution */}
					<div className='col-lg-4'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Asset Distribution</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<Chart
									series={categoryDistributionSeries}
									options={categoryDistributionOptions}
									type='donut'
									height={350}
								/>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Recent Activity & Alerts */}
				<div className='row g-4 mt-2'>
					{/* Recent Movements */}
					<div className='col-lg-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Recent Movements</CardTitle>
								</CardLabel>
								<Button color='primary' size='sm' isLink>
									View All
								</Button>
							</CardHeader>
							<CardBody>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Asset</th>
											<th>Type</th>
											<th>From</th>
											<th>To</th>
											<th>Date</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>CNC Machine #42</td>
											<td>
												<span className='badge bg-info'>Transfer</span>
											</td>
											<td>Plant A</td>
											<td>Plant B</td>
											<td>Today</td>
										</tr>
										<tr>
											<td>Forklift #15</td>
											<td>
												<span className='badge bg-success'>Assignment</span>
											</td>
											<td>-</td>
											<td>John Doe</td>
											<td>Yesterday</td>
										</tr>
										<tr>
											<td>Computer #201</td>
											<td>
												<span className='badge bg-danger'>Disposal</span>
											</td>
											<td>IT Dept</td>
											<td>Retired</td>
											<td>2 days ago</td>
										</tr>
									</tbody>
								</table>
							</CardBody>
						</Card>
					</div>

					{/* Alerts & Notifications */}
					<div className='col-lg-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel>
									<CardTitle>Alerts & Notifications</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='list-group'>
									<div className='list-group-item list-group-item-action border-0 border-start border-danger border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Warning' color='danger' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Maintenance Due</div>
												<div className='text-muted small'>
													15 assets require maintenance this week
												</div>
											</div>
										</div>
									</div>
									<div className='list-group-item list-group-item-action border-0 border-start border-warning border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Schedule' color='warning' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Warranty Expiring</div>
												<div className='text-muted small'>
													8 asset warranties expire next month
												</div>
											</div>
										</div>
									</div>
									<div className='list-group-item list-group-item-action border-0 border-start border-info border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='Inventory2' color='info' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>Deposit Report Ready</div>
												<div className='text-muted small'>
													Weekly deposit report for Client A is ready
												</div>
											</div>
										</div>
									</div>
									<div className='list-group-item list-group-item-action border-0 border-start border-success border-4'>
										<div className='d-flex align-items-center'>
											<Icon icon='CheckCircle' color='success' size='2x' className='me-3' />
											<div className='flex-grow-1'>
												<div className='fw-bold'>New Assets Added</div>
												<div className='text-muted small'>
													5 new assets registered today
												</div>
											</div>
										</div>
									</div>
								</div>
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
											icon='AddCircle'>
											Add New Asset
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='success'
											isLight
											className='w-100 py-3'
											icon='Schedule'>
											Schedule Maintenance
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='info'
											isLight
											className='w-100 py-3'
											icon='SwapHoriz'>
											Transfer Asset
										</Button>
									</div>
									<div className='col-lg-3 col-md-6'>
										<Button
											color='warning'
											isLight
											className='w-100 py-3'
											icon='Assessment'>
											Generate Report
										</Button>
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

export default AssetDashboard;
