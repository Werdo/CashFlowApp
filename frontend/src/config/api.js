// CashFlow v4.0 - API Configuration
// Environment-aware API URL configuration

const API_URL = process.env.REACT_APP_API_URL || window.location.origin + '/api';

export default API_URL;
