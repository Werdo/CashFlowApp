import { PostalOffice } from '../types';

/**
 * Oficinas de Correos de España
 * Base de datos de las principales oficinas para el sistema AssetFlow
 */
export const postalOffices: PostalOffice[] = [
  {
    id: 'po-001',
    officeCode: '28001',
    name: 'Oficina Principal de Madrid',
    type: 'postal-office',
    address: 'Calle Alcalá, 45',
    city: 'Madrid',
    province: 'Madrid',
    postalCode: '28014',
    country: 'España',
    coordinates: {
      lat: 40.4168,
      lng: -3.7038
    },
    capacity: 500,
    currentOccupancy: 350,
    manager: 'Carlos Rodríguez García',
    phone: '+34 915 555 001',
    email: 'madrid.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:30, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía', 'Burofax']
  },
  {
    id: 'po-002',
    officeCode: '08001',
    name: 'Oficina Central Barcelona',
    type: 'postal-office',
    address: 'Plaça Antoni López, 1',
    city: 'Barcelona',
    province: 'Barcelona',
    postalCode: '08002',
    country: 'España',
    coordinates: {
      lat: 41.3851,
      lng: 2.1734
    },
    capacity: 450,
    currentOccupancy: 380,
    manager: 'Marta Sánchez Pérez',
    phone: '+34 933 555 002',
    email: 'barcelona.central@correos.es',
    operatingHours: 'L-V: 8:30-20:30, S: 9:30-14:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos', 'Burofax']
  },
  {
    id: 'po-003',
    officeCode: '46001',
    name: 'Oficina Principal Valencia',
    type: 'postal-office',
    address: 'Plaza del Ayuntamiento, 24',
    city: 'Valencia',
    province: 'Valencia',
    postalCode: '46002',
    country: 'España',
    coordinates: {
      lat: 39.4699,
      lng: -0.3763
    },
    capacity: 350,
    currentOccupancy: 280,
    manager: 'Vicente Martínez López',
    phone: '+34 963 555 003',
    email: 'valencia.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:30',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía']
  },
  {
    id: 'po-004',
    officeCode: '41001',
    name: 'Oficina Central Sevilla',
    type: 'postal-office',
    address: 'Avenida de la Constitución, 32',
    city: 'Sevilla',
    province: 'Sevilla',
    postalCode: '41001',
    country: 'España',
    coordinates: {
      lat: 37.3886,
      lng: -5.9823
    },
    capacity: 300,
    currentOccupancy: 220,
    manager: 'Ana María Fernández',
    phone: '+34 954 555 004',
    email: 'sevilla.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-005',
    officeCode: '48001',
    name: 'Oficina Principal Bilbao',
    type: 'postal-office',
    address: 'Alameda Urquijo, 19',
    city: 'Bilbao',
    province: 'Vizcaya',
    postalCode: '48008',
    country: 'España',
    coordinates: {
      lat: 43.2627,
      lng: -2.9253
    },
    capacity: 280,
    currentOccupancy: 190,
    manager: 'Iñaki Etxebarria',
    phone: '+34 944 555 005',
    email: 'bilbao.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-006',
    officeCode: '50001',
    name: 'Oficina Central Zaragoza',
    type: 'postal-office',
    address: 'Paseo de la Independencia, 33',
    city: 'Zaragoza',
    province: 'Zaragoza',
    postalCode: '50004',
    country: 'España',
    coordinates: {
      lat: 41.6488,
      lng: -0.8891
    },
    capacity: 320,
    currentOccupancy: 240,
    manager: 'Javier González Ruiz',
    phone: '+34 976 555 006',
    email: 'zaragoza.central@correos.es',
    operatingHours: 'L-V: 8:30-20:30, S: 9:30-13:30',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía', 'Burofax']
  },
  {
    id: 'po-007',
    officeCode: '29001',
    name: 'Oficina Principal Málaga',
    type: 'postal-office',
    address: 'Avenida de Andalucía, 1',
    city: 'Málaga',
    province: 'Málaga',
    postalCode: '29007',
    country: 'España',
    coordinates: {
      lat: 36.7213,
      lng: -4.4214
    },
    capacity: 260,
    currentOccupancy: 200,
    manager: 'Francisco Jiménez Moreno',
    phone: '+34 952 555 007',
    email: 'malaga.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-008',
    officeCode: '15001',
    name: 'Oficina Central A Coruña',
    type: 'postal-office',
    address: 'Calle Durán Loriga, 3',
    city: 'A Coruña',
    province: 'A Coruña',
    postalCode: '15003',
    country: 'España',
    coordinates: {
      lat: 43.3623,
      lng: -8.4115
    },
    capacity: 240,
    currentOccupancy: 170,
    manager: 'María del Carmen López',
    phone: '+34 981 555 008',
    email: 'coruna.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-009',
    officeCode: '03001',
    name: 'Oficina Principal Alicante',
    type: 'postal-office',
    address: 'Avenida Alfonso X El Sabio, 7',
    city: 'Alicante',
    province: 'Alicante',
    postalCode: '03002',
    country: 'España',
    coordinates: {
      lat: 38.3452,
      lng: -0.4815
    },
    capacity: 230,
    currentOccupancy: 180,
    manager: 'Juan Carlos Vera',
    phone: '+34 965 555 009',
    email: 'alicante.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-010',
    officeCode: '47001',
    name: 'Oficina Central Valladolid',
    type: 'postal-office',
    address: 'Plaza de la Rinconada, 8',
    city: 'Valladolid',
    province: 'Valladolid',
    postalCode: '47003',
    country: 'España',
    coordinates: {
      lat: 41.6523,
      lng: -4.7245
    },
    capacity: 220,
    currentOccupancy: 160,
    manager: 'Luis Alberto Martín',
    phone: '+34 983 555 010',
    email: 'valladolid.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía']
  },
  {
    id: 'po-011',
    officeCode: '33001',
    name: 'Oficina Principal Oviedo',
    type: 'postal-office',
    address: 'Calle Alonso Quintanilla, 1',
    city: 'Oviedo',
    province: 'Asturias',
    postalCode: '33001',
    country: 'España',
    coordinates: {
      lat: 43.3614,
      lng: -5.8494
    },
    capacity: 210,
    currentOccupancy: 150,
    manager: 'Covadonga Álvarez',
    phone: '+34 985 555 011',
    email: 'oviedo.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-012',
    officeCode: '30001',
    name: 'Oficina Central Murcia',
    type: 'postal-office',
    address: 'Gran Vía Escultor Salzillo, 21',
    city: 'Murcia',
    province: 'Murcia',
    postalCode: '30004',
    country: 'España',
    coordinates: {
      lat: 37.9922,
      lng: -1.1307
    },
    capacity: 200,
    currentOccupancy: 140,
    manager: 'Pedro Antonio García',
    phone: '+34 968 555 012',
    email: 'murcia.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-013',
    officeCode: '07001',
    name: 'Oficina Principal Palma de Mallorca',
    type: 'postal-office',
    address: 'Carrer de la Constitució, 5',
    city: 'Palma de Mallorca',
    province: 'Islas Baleares',
    postalCode: '07001',
    country: 'España',
    coordinates: {
      lat: 39.5696,
      lng: 2.6502
    },
    capacity: 250,
    currentOccupancy: 210,
    manager: 'Catalina Ferrer Moll',
    phone: '+34 971 555 013',
    email: 'palma.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos', 'Burofax']
  },
  {
    id: 'po-014',
    officeCode: '35001',
    name: 'Oficina Principal Las Palmas de Gran Canaria',
    type: 'postal-office',
    address: 'Avenida Primero de Mayo, 62',
    city: 'Las Palmas de Gran Canaria',
    province: 'Las Palmas',
    postalCode: '35002',
    country: 'España',
    coordinates: {
      lat: 28.1235,
      lng: -15.4363
    },
    capacity: 230,
    currentOccupancy: 190,
    manager: 'Antonio Suárez Hernández',
    phone: '+34 928 555 014',
    email: 'laspalmas.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía']
  },
  {
    id: 'po-015',
    officeCode: '38001',
    name: 'Oficina Principal Santa Cruz de Tenerife',
    type: 'postal-office',
    address: 'Plaza de España, 2',
    city: 'Santa Cruz de Tenerife',
    province: 'Santa Cruz de Tenerife',
    postalCode: '38001',
    country: 'España',
    coordinates: {
      lat: 28.4682,
      lng: -16.2546
    },
    capacity: 220,
    currentOccupancy: 180,
    manager: 'Rosa María Díaz',
    phone: '+34 922 555 015',
    email: 'santacruz.principal@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-016',
    officeCode: '36001',
    name: 'Oficina Central Vigo',
    type: 'postal-office',
    address: 'Calle García Barbón, 64',
    city: 'Vigo',
    province: 'Pontevedra',
    postalCode: '36201',
    country: 'España',
    coordinates: {
      lat: 42.2406,
      lng: -8.7207
    },
    capacity: 200,
    currentOccupancy: 150,
    manager: 'Manuel Rodríguez Silva',
    phone: '+34 986 555 016',
    email: 'vigo.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-017',
    officeCode: '18001',
    name: 'Oficina Central Granada',
    type: 'postal-office',
    address: 'Puerta Real, 2',
    city: 'Granada',
    province: 'Granada',
    postalCode: '18009',
    country: 'España',
    coordinates: {
      lat: 37.1773,
      lng: -3.5986
    },
    capacity: 190,
    currentOccupancy: 140,
    manager: 'Isabel García Morales',
    phone: '+34 958 555 017',
    email: 'granada.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-018',
    officeCode: '37001',
    name: 'Oficina Central Salamanca',
    type: 'postal-office',
    address: 'Gran Vía, 25',
    city: 'Salamanca',
    province: 'Salamanca',
    postalCode: '37001',
    country: 'España',
    coordinates: {
      lat: 40.9652,
      lng: -5.6640
    },
    capacity: 180,
    currentOccupancy: 130,
    manager: 'Roberto Hernández Torres',
    phone: '+34 923 555 018',
    email: 'salamanca.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía']
  },
  {
    id: 'po-019',
    officeCode: '45001',
    name: 'Oficina Central Toledo',
    type: 'postal-office',
    address: 'Plaza de Zocodover, 5',
    city: 'Toledo',
    province: 'Toledo',
    postalCode: '45001',
    country: 'España',
    coordinates: {
      lat: 39.8628,
      lng: -4.0273
    },
    capacity: 170,
    currentOccupancy: 120,
    manager: 'Carmen López Muñoz',
    phone: '+34 925 555 019',
    email: 'toledo.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-020',
    officeCode: '19001',
    name: 'Oficina Central Guadalajara',
    type: 'postal-office',
    address: 'Calle Mayor, 32',
    city: 'Guadalajara',
    province: 'Guadalajara',
    postalCode: '19001',
    country: 'España',
    coordinates: {
      lat: 40.6296,
      lng: -3.1668
    },
    capacity: 160,
    currentOccupancy: 110,
    manager: 'Ángel Gómez Pérez',
    phone: '+34 949 555 020',
    email: 'guadalajara.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-021',
    officeCode: '20001',
    name: 'Oficina Central San Sebastián',
    type: 'postal-office',
    address: 'Calle Urdaneta, 9',
    city: 'San Sebastián',
    province: 'Guipúzcoa',
    postalCode: '20006',
    country: 'España',
    coordinates: {
      lat: 43.3183,
      lng: -1.9812
    },
    capacity: 210,
    currentOccupancy: 160,
    manager: 'Ainhoa Sarasola',
    phone: '+34 943 555 021',
    email: 'donostia.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax', 'Telegrafía']
  },
  {
    id: 'po-022',
    officeCode: '11001',
    name: 'Oficina Central Cádiz',
    type: 'postal-office',
    address: 'Plaza de las Flores, 1',
    city: 'Cádiz',
    province: 'Cádiz',
    postalCode: '11004',
    country: 'España',
    coordinates: {
      lat: 36.5297,
      lng: -6.2920
    },
    capacity: 190,
    currentOccupancy: 145,
    manager: 'José Luis Domínguez',
    phone: '+34 956 555 022',
    email: 'cadiz.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Lista de Correos']
  },
  {
    id: 'po-023',
    officeCode: '39001',
    name: 'Oficina Central Santander',
    type: 'postal-office',
    address: 'Avenida Alfonso XIII, 2',
    city: 'Santander',
    province: 'Cantabria',
    postalCode: '39002',
    country: 'España',
    coordinates: {
      lat: 43.4623,
      lng: -3.8100
    },
    capacity: 195,
    currentOccupancy: 155,
    manager: 'Elena Ruiz Casares',
    phone: '+34 942 555 023',
    email: 'santander.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Burofax']
  },
  {
    id: 'po-024',
    officeCode: '14001',
    name: 'Oficina Central Córdoba',
    type: 'postal-office',
    address: 'Calle Cruz Conde, 21',
    city: 'Córdoba',
    province: 'Córdoba',
    postalCode: '14001',
    country: 'España',
    coordinates: {
      lat: 37.8882,
      lng: -4.7794
    },
    capacity: 185,
    currentOccupancy: 135,
    manager: 'Rafael Moreno Cabrera',
    phone: '+34 957 555 024',
    email: 'cordoba.central@correos.es',
    operatingHours: 'L-V: 8:30-20:00, S: 9:30-13:00',
    services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía']
  }
];

// Función de ayuda para obtener oficina por código
export const getPostalOfficeByCode = (code: string): PostalOffice | undefined => {
  return postalOffices.find(office => office.officeCode === code);
};

// Función para obtener oficinas por provincia
export const getPostalOfficesByProvince = (province: string): PostalOffice[] => {
  return postalOffices.filter(office => office.province === province);
};

// Obtener todas las provincias únicas
export const getProvinces = (): string[] => {
  const provinces = postalOffices.map(office => office.province);
  return Array.from(new Set(provinces)).sort();
};

// Calcular estadísticas de capacidad
export const getCapacityStats = () => {
  const totalCapacity = postalOffices.reduce((sum, office) => sum + office.capacity, 0);
  const totalOccupancy = postalOffices.reduce((sum, office) => sum + office.currentOccupancy, 0);
  const averageOccupancy = (totalOccupancy / totalCapacity) * 100;

  return {
    totalOffices: postalOffices.length,
    totalCapacity,
    totalOccupancy,
    averageOccupancy: Math.round(averageOccupancy),
    availableSpace: totalCapacity - totalOccupancy
  };
};
