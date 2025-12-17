import { API_BASE_URL } from './config';

// Helper to create headers with ngrok bypass
const getHeaders = (includeAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    };
    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

// Helper to adapt backend data to frontend model
const adaptPlace = (place) => ({
    id: place.id,
    title: place.name,
    location: place.city_id, // In real app, would fetch city name
    type: "Apartment", // Backend doesn't have type field, defaulting
    bedrooms: place.number_rooms,
    bathrooms: place.number_bathrooms,
    // Use placeholder image since backend doesn't store images yet
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop"],
    prices: {
        monthly: place.price_by_month,
        yearly: place.price_by_year
    },
    amenities: place.amenities || [], // Assuming amenities are included or separate call needed
    featured: false,
    description: place.description,
    user_id: place.user_id,
    max_guest: place.max_guest,
    price_by_night: place.price_by_night,
    number_of_units: place.number_of_units || 1,
    latitude: place.latitude,
    longitude: place.longitude
});

export const propertyService = {
    fetchProperties: async (filters = {}) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch properties');

            const data = await response.json();
            let places = data.map(adaptPlace);

            // Enrich with City Names (N+1 Fetch)
            // Note: This is inefficient for large datasets but per user request to use existing endpoints
            places = await Promise.all(places.map(async (place) => {
                if (place.location) {
                    const city = await propertyService.getCity(place.location);
                    if (city) place.location = city.name;
                }
                return place;
            }));

            // Apply frontend filters
            if (filters.search) {
                const term = filters.search.toLowerCase();
                places = places.filter(p => p.title.toLowerCase().includes(term));
            }
            if (filters.minPrice) {
                places = places.filter(p => p.prices[12] >= filters.minPrice);
            }
            if (filters.maxPrice) {
                places = places.filter(p => p.prices[12] <= filters.maxPrice);
            }

            return places;
        } catch (error) {
            console.error("API Error:", error);
            return []; // Return empty array on error to prevent crash
        }
    },

    getPropertyDetails: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch property details');
            const data = await response.json();
            return adaptPlace(data);
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    },

    userLogin: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return await response.json();
    },



    registerUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return await response.json();
    },

    fetchAmenities: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/amenities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch amenities');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    createAmenity: async (name) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/amenities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create amenity');
        return await response.json();
    },

    linkAmenityToPlace: async (placeId, amenityId) => {
        const token = localStorage.getItem('token');
        try {
            console.log(`Linking amenity ${amenityId} to place ${placeId}`);
            const response = await fetch(`${API_BASE_URL}/places/${placeId}/amenities/${amenityId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({}) // Empty body as per API
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to link amenity. Status: ${response.status}, Response: ${errorText}`);
                throw new Error(`Failed to link amenity: ${response.status} ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    fetchPlaceAmenities: async (placeId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places/${placeId}/amenities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch place amenities');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    fetchReviews: async (placeId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places/${placeId}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch reviews');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return []; // Return empty array to verify safe fallback
        }
    },

    fetchStates: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/states`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch states');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    fetchCities: async (stateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/states/${stateId}/cities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch cities');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    createState: async (name) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/states`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create state');
        return await response.json();
    },

    createCity: async (stateId, name) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/states/${stateId}/cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create city');
        return await response.json();
    },

    searchPlaces: async (searchParams) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places_search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(searchParams)
            });

            if (!response.ok) throw new Error('Failed to search properties');

            const data = await response.json();
            let places = data.map(adaptPlace);

            // Enrich with City Names
            places = await Promise.all(places.map(async (place) => {
                if (place.location) {
                    const city = await propertyService.getCity(place.location);
                    if (city) place.location = city.name;
                }
                return place;
            }));

            return places;
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    updatePlace: async (placeId, updates) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update property');

            const data = await response.json();
            return adaptPlace(data);
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    // Updated createListing to include token
    createListing: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/cities/${data.city_id}/places`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create listing');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    getCity: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch city');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    },

    getUser: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch user');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    }
};
