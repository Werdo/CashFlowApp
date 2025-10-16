/**
 * AssetFlow v1.0 - Asset List Page
 * List view of all assets with filtering and search
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import Input from '../../components/bootstrap/forms/Input';
import Badge from '../../components/bootstrap/Badge';
import Dropdown, { DropdownToggle, DropdownMenu, DropdownItem } from '../../components/bootstrap/Dropdown';

interface Asset {
	id: string;
	assetCode: string;
	name: string;
	category: string;
	location: string;
	department: string;
	purchaseValue: number;
	currentValue: number;
	status: 'Active' | 'Maintenance' | 'Disposed' | 'Inactive';
	condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
	purchaseDate: string;
	responsiblePerson: string;
}

const AssetList = () => {
	const navigate = useNavigate();
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCategory, setFilterCategory] = useState('All');
	const [filterStatus, setFilterStatus] = useState('All');

	useEffect(() => {
		// TODO: Fetch real data from API
		// Simulating API call
		setTimeout(() => {
			setAssets([
				{
					id: '1',
					assetCode: 'AST-2025-001',
					name: 'CNC Machine Model X500',
					category: 'Machinery',
					location: 'Plant A - Production Floor',
					department: 'Manufacturing',
					purchaseValue: 125000,
					currentValue: 105000,
					status: 'Active',
					condition: 'Excellent',
					purchaseDate: '2024-01-15',
					responsiblePerson: 'John Smith',
				},
				{
					id: '2',
					assetCode: 'AST-2025-002',
					name: 'Forklift Toyota 8FGU25',
					category: 'Vehicles',
					location: 'Warehouse 1',
					department: 'Logistics',
					purchaseValue: 35000,
					currentValue: 28000,
					status: 'Active',
					condition: 'Good',
					purchaseDate: '2023-06-20',
					responsiblePerson: 'Maria Garcia',
				},
				{
					id: '3',
					assetCode: 'AST-2025-003',
					name: 'Industrial 3D Printer',
					category: 'Equipment',
					location: 'R&D Lab',
					department: 'Research',
					purchaseValue: 45000,
					currentValue: 35000,
					status: 'Maintenance',
					condition: 'Good',
					purchaseDate: '2023-11-10',
					responsiblePerson: 'Dr. Chen Wei',
				},
				{
					id: '4',
					assetCode: 'AST-2025-004',
					name: 'Dell Precision 7920 Workstation',
					category: 'IT Assets',
					location: 'Office Building - 3rd Floor',
					department: 'Engineering',
					purchaseValue: 5500,
					currentValue: 3200,
					status: 'Active',
					condition: 'Good',
					purchaseDate: '2023-03-15',
					responsiblePerson: 'Sarah Johnson',
				},
				{
					id: '5',
					assetCode: 'AST-2024-125',
					name: 'Conference Table Oak 12-seater',
					category: 'Furniture',
					location: 'Meeting Room A',
					department: 'Administration',
					purchaseValue: 2800,
					currentValue: 2000,
					status: 'Active',
					condition: 'Excellent',
					purchaseDate: '2024-08-01',
					responsiblePerson: 'Admin Office',
				},
			]);
			setLoading(false);
		}, 500);
	}, []);

	const getStatusBadge = (status: Asset['status']) => {
		const colors = {
			Active: 'success',
			Maintenance: 'warning',
			Disposed: 'danger',
			Inactive: 'secondary',
		};
		return <Badge color={colors[status]}>{status}</Badge>;
	};

	const getConditionBadge = (condition: Asset['condition']) => {
		const colors = {
			Excellent: 'success',
			Good: 'info',
			Fair: 'warning',
			Poor: 'danger',
		};
		return <Badge color={colors[condition]} isLight>{condition}</Badge>;
	};

	const filteredAssets = assets.filter((asset) => {
		const matchesSearch =
			asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
			asset.category.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
		const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const categories = ['All', 'Machinery', 'Vehicles', 'Equipment', 'IT Assets', 'Furniture'];
	const statuses = ['All', 'Active', 'Maintenance', 'Disposed', 'Inactive'];

	return (
		<PageWrapper>
			<Page>
				<div className='row mb-4'>
					<div className='col-12'>
						<div className='d-flex justify-content-between align-items-center'>
							<div className='display-5 fw-bold'>Asset List</div>
							<Button
								color='primary'
								icon='AddCircle'
								onClick={() => navigate('/assets/add')}>
								Add New Asset
							</Button>
						</div>
					</div>
				</div>

				{/* Filters */}
				<Card className='mb-4'>
					<CardBody>
						<div className='row g-3 align-items-end'>
							{/* Search */}
							<div className='col-lg-4'>
								<Input
									placeholder='Search assets...'
									value={searchTerm}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setSearchTerm(e.target.value)
									}
									icon='Search'
								/>
							</div>

							{/* Category Filter */}
							<div className='col-lg-3'>
								<label className='form-label'>Category</label>
								<Dropdown>
									<DropdownToggle hasIcon={false}>
										<Button color='light' className='w-100 text-start'>
											{filterCategory}
											<Icon icon='ExpandMore' className='float-end' />
										</Button>
									</DropdownToggle>
									<DropdownMenu className='w-100'>
										{categories.map((cat) => (
											<DropdownItem
												key={cat}
												onClick={() => setFilterCategory(cat)}>
												{cat}
											</DropdownItem>
										))}
									</DropdownMenu>
								</Dropdown>
							</div>

							{/* Status Filter */}
							<div className='col-lg-3'>
								<label className='form-label'>Status</label>
								<Dropdown>
									<DropdownToggle hasIcon={false}>
										<Button color='light' className='w-100 text-start'>
											{filterStatus}
											<Icon icon='ExpandMore' className='float-end' />
										</Button>
									</DropdownToggle>
									<DropdownMenu className='w-100'>
										{statuses.map((status) => (
											<DropdownItem
												key={status}
												onClick={() => setFilterStatus(status)}>
												{status}
											</DropdownItem>
										))}
									</DropdownMenu>
								</Dropdown>
							</div>

							{/* Clear Filters */}
							<div className='col-lg-2'>
								<Button
									color='secondary'
									isLight
									className='w-100'
									onClick={() => {
										setSearchTerm('');
										setFilterCategory('All');
										setFilterStatus('All');
									}}>
									Clear Filters
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Asset Table */}
				<Card>
					<CardHeader>
						<CardLabel>
							<CardTitle>
								{filteredAssets.length} Asset{filteredAssets.length !== 1 ? 's' : ''} Found
							</CardTitle>
						</CardLabel>
						<div>
							<Button color='info' size='sm' isLight icon='GridView'>
								Grid View
							</Button>
							<Button color='primary' size='sm' isLight icon='CloudDownload' className='ms-2'>
								Export
							</Button>
						</div>
					</CardHeader>
					<CardBody>
						{loading ? (
							<div className='text-center py-5'>
								<div className='spinner-border text-primary' role='status'>
									<span className='visually-hidden'>Loading...</span>
								</div>
							</div>
						) : (
							<div className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Asset Code</th>
											<th>Name</th>
											<th>Category</th>
											<th>Location</th>
											<th>Status</th>
											<th>Condition</th>
											<th>Purchase Value</th>
											<th>Current Value</th>
											<th>Responsible</th>
											<th className='text-end'>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredAssets.map((asset) => (
											<tr
												key={asset.id}
												onClick={() => navigate(`/assets/asset/${asset.id}`)}
												style={{ cursor: 'pointer' }}>
												<td>
													<div className='d-flex align-items-center'>
														<Icon icon='QrCode2' className='me-2' color='primary' />
														<span className='fw-bold'>{asset.assetCode}</span>
													</div>
												</td>
												<td>
													<div className='fw-bold'>{asset.name}</div>
													<div className='text-muted small'>{asset.department}</div>
												</td>
												<td>
													<Badge color='info' isLight>
														{asset.category}
													</Badge>
												</td>
												<td>
													<div className='small'>
														<Icon icon='LocationOn' size='sm' className='me-1' />
														{asset.location}
													</div>
												</td>
												<td>{getStatusBadge(asset.status)}</td>
												<td>{getConditionBadge(asset.condition)}</td>
												<td className='text-end'>
													${asset.purchaseValue.toLocaleString()}
												</td>
												<td className='text-end'>
													<div className='fw-bold'>
														${asset.currentValue.toLocaleString()}
													</div>
													<div className='text-muted small'>
														{(
															((asset.currentValue - asset.purchaseValue) /
																asset.purchaseValue) *
															100
														).toFixed(1)}
														%
													</div>
												</td>
												<td>
													<div className='d-flex align-items-center'>
														<Icon icon='Person' size='sm' className='me-2' />
														{asset.responsiblePerson}
													</div>
												</td>
												<td className='text-end'>
													<Button
														color='primary'
														size='sm'
														isLight
														icon='Visibility'
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/assets/asset/${asset.id}`);
														}}>
														View
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default AssetList;
