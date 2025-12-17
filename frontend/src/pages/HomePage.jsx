import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Filter, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { propertyService } from '../api/propertyService';

export default function HomePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Data State
    const [allProperties, setAllProperties] = useState([]);
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [displayProperties, setDisplayProperties] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter Data State
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [amenities, setAmenities] = useState([]);

    // Search Form State
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // View State
    const isSearchView = searchParams.get('view') === 'all' || searchParams.get('search') === 'true';

    // Initial Data Load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch Filter Options
                const [statesData, amenitiesData] = await Promise.all([
                    propertyService.fetchStates(),
                    propertyService.fetchAmenities()
                ]);
                setStates(statesData);
                setAmenities(amenitiesData);

                // Fetch Featured (Random 3)
                const all = await propertyService.fetchProperties();
                setAllProperties(all);

                // Shuffle and pick 3 for featured
                const shuffled = [...all].sort(() => 0.5 - Math.random());
                setFeaturedProperties(shuffled.slice(0, 3));

            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Handle Search Execution
    useEffect(() => {
        const executeSearch = async () => {
            const view = searchParams.get('view');
            const search = searchParams.get('search');

            if (view === 'all' || search === 'true') {
                setLoading(true);
                try {
                    // Parse params from URL state (or use local state if we just navigated)
                    // Ideally we encode params in URL, but for complex arrays/IDs, 
                    // using a POST endpoint is cleaner. We will use the form state 
                    // matched with URL indicators.

                    // If view=all, search with empty params
                    const payload = {};

                    if (search === 'true') {
                        if (selectedState) payload.states = [selectedState];
                        if (selectedCity) payload.cities = [selectedCity];
                        if (selectedAmenities.length > 0) payload.amenities = selectedAmenities;
                    }

                    const results = await propertyService.searchPlaces(payload);
                    setDisplayProperties(results);
                    setCurrentPage(1); // Reset to first page on new search
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        // We only trigger this useEffect if the URL changes to search mode
        // For 'View All', it triggers. For specific search, handleSearch will push state.
        if (isSearchView) {
            executeSearch();
        }
    }, [searchParams, selectedState, selectedCity, selectedAmenities]);


    // Fetch Cities when State Changes
    useEffect(() => {
        if (selectedState) {
            const loadCities = async () => {
                const citiesData = await propertyService.fetchCities(selectedState);
                setCities(citiesData);
            };
            loadCities();
        } else {
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedState]);


    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Update URL to trigger search view
        setSearchParams({ search: 'true' });
    };

    const handleAmenityToggle = (amenityId) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    // Pagination Logic
    const totalPages = Math.ceil(displayProperties.length / ITEMS_PER_PAGE);
    const paginatedProperties = displayProperties.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-primary py-16 md:py-24">
                <div className="relative z-10 container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Find Your Perfect Long-Term Stay
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Flexible leases. Fully furnished. Ready for living.
                        </p>
                    </div>

                    {/* Advanced Search Bar */}
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-5xl mx-auto">
                        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            {/* State Selection */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">State</label>
                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-2">
                                    <MapPin className="text-slate-400 w-5 h-5 mr-2" />
                                    <select
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        className="w-full bg-transparent outline-none text-slate-800"
                                    >
                                        <option value="">Any State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* City Selection */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">City</label>
                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-2">
                                    <Building className="text-slate-400 w-5 h-5 mr-2" />
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        disabled={!selectedState}
                                        className={`w-full bg-transparent outline-none text-slate-800 ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Any City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Amenities Selection (Dropdown style for simplicity or multi-select UI) */}
                            <div className="relative md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Amenities</label>
                                <div className="group relative">
                                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-2 cursor-pointer hover:border-primary transition-colors">
                                        <Filter className="text-slate-400 w-5 h-5 mr-2" />
                                        <span className="text-slate-800 truncate">
                                            {selectedAmenities.length > 0 ? `${selectedAmenities.length} selected` : 'Any Amenities'}
                                        </span>
                                    </div>

                                    {/* Dropdown Content */}
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden group-hover:block p-3 max-h-60 overflow-y-auto w-64">
                                        <div className="space-y-2">
                                            {amenities.map(amenity => (
                                                <label key={amenity.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAmenities.includes(amenity.id)}
                                                        onChange={() => handleAmenityToggle(amenity.id)}
                                                        className="rounded text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-slate-700">{amenity.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="flex items-end">
                                <button type="submit" className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Search className="w-5 h-5" />
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1448630360428-65456885c650?w=1600&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">

                {/* Section Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {isSearchView ? `Search Results(${displayProperties.length})` : 'Featured Leases'}
                    </h2>

                    {!isSearchView && (
                        <button
                            onClick={() => setSearchParams({ view: 'all' })}
                            className="bg-white border border-slate-300 text-slate-700 hover:text-primary hover:border-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading properties...</p>
                    </div>
                )}

                {/* Property Grid */}
                {!loading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {(isSearchView ? paginatedProperties : featuredProperties).map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>

                        {/* Empty State */}
                        {isSearchView && displayProperties.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
                                <p className="text-slate-500 mb-6">Try adjusting your filters or search criteria.</p>
                                <button
                                    onClick={() => {
                                        setSelectedState('');
                                        setSelectedCity('');
                                        setSelectedAmenities([]);
                                        setSearchParams({});
                                    }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {isSearchView && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p - 2 rounded - lg border ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-50'} `}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <span className="text-slate-600 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p - 2 rounded - lg border ${currentPage === totalPages ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-50'} `}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

