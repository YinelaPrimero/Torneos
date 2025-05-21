// Helper para hacer llamadas a la API
const api = {
  baseUrl: 'https://tu-backend-api.com/api',
  
  get: async function(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  },
  
  post: async function(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  },
  
  put: async function(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  },
  
  delete: async function(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  },
  
  getHeaders: function() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Agregar token de autenticación si existe
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return headers;
  },
  
  handleResponse: async function(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }
    return data;
  },
  
  handleError: function(error) {
    console.error('API Error:', error);
    alert(error.message || 'Ocurrió un error al comunicarse con el servidor');
    throw error;
  }
};