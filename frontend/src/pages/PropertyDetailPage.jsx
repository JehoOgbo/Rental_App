import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { propertyService } from '../api/propertyService';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';

export default function PropertyDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    useEffect(() => {
        // Parallel fetching property details, reviews, and amenities
        const fetchData = async () => {
            try {
                setLoading(true);
                const [propData, reviewsData, amenitiesData] = await Promise.all([
                    propertyService.getPropertyDetails(id),
                    propertyService.fetchReviews(id),
                    propertyService.fetchPlaceAmenities(id)
                ]);

                // Enrich Property with City Name
                if (propData && propData.location) {
                    const city = await propertyService.getCity(propData.location);
                    if (city) propData.locationName = city.name;
                }

                // Fetch Owner Details for Payment Info
                if (propData && propData.user_id) {
                    const owner = await propertyService.getUser(propData.user_id);
                    if (owner) {
                        propData.ownerWallet = owner.wallet_address;
                        propData.ownerEscrow = owner.escrow_no;
                    }
                }

                // Enrich Reviews with User Names
                const reviewsWithNames = await Promise.all(reviewsData.map(async (review) => {
                    const user = await propertyService.getUser(review.user_id);
                    return {
                        ...review,
                        userName: user ? `${user.first_name} ${user.last_name}` : 'Unknown User'
                    };
                }));

                setProperty(propData);
                setReviews(reviewsWithNames);
                setAmenities(amenitiesData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (!property) return <div className="p-8 text-center text-red-500">Property not found</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-slate-900">{property.title}</h1>
            <img src={property.images[0]} alt={property.title} className="w-full h-96 object-cover rounded-xl mb-8 shadow-sm" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-2 text-slate-800">Description</h2>
                    <p className="text-slate-600 mb-4">{property.description || `Beautiful ${property.type} located in ${property.locationName || property.location}.`}</p>

                    <div className="flex gap-4 mb-6 text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-lg inline-flex">
                        <span>{property.bedrooms} Bedrooms</span>
                        <span className="w-px bg-slate-200"></span>
                        <span>{property.bathrooms} Bathrooms</span>
                        <span className="w-px bg-slate-200"></span>
                        <span className="w-px bg-slate-200"></span>
                        <span className="transition-all duration-500 transform key={property.number_of_units} animate-pulse font-bold text-primary">
                            {property.number_of_units} Units
                        </span>
                    </div>

                    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-2">Location</h3>
                        <p className="text-slate-600 text-sm mb-1">Latitude: {property.latitude}</p>
                        <p className="text-slate-600 text-sm">Longitude: {property.longitude}</p>
                    </div>

                    <h3 className="font-bold mb-2 text-slate-800">Amenities</h3>
                    <ul className="grid grid-cols-2 gap-2 mb-8">
                        {amenities.length > 0 ? (
                            amenities.map((a, i) => (
                                <li key={i} className="text-slate-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                    {/* Handle if amenity is string or object based on API */}
                                    {typeof a === 'string' ? a : a.name}
                                </li>
                            ))
                        ) : (
                            <li className="text-slate-400 italic">No amenities listed</li>
                        )}
                    </ul>

                    {/* Reviews Section */}
                    <div className="border-t pt-8">
                        <h3 className="font-bold text-xl mb-4 text-slate-800">Reviews ({reviews.length})</h3>
                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold text-slate-900">{review.userName}</span>
                                            {/* Date could be formatted here */}
                                        </div>
                                        <p className="text-slate-600">{review.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">No reviews yet for this property.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-fit sticky top-24">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Lease Options</h3>
                        <div className="space-y-3">
                            <div
                                onClick={() => setSelectedPlan('yearly')}
                                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-colors ${selectedPlan === 'yearly' ? 'bg-blue-50 border-accent ring-1 ring-accent' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-accent' : 'border-slate-400'}`}>
                                        {selectedPlan === 'yearly' && <div className="w-2 h-2 rounded-full bg-accent"></div>}
                                    </div>
                                    <span className="text-slate-600">Yearly</span>
                                </div>
                                <span className="font-bold text-slate-900">₦{property.prices.yearly.toLocaleString()}/yr</span>
                            </div>

                            <div
                                onClick={() => setSelectedPlan('monthly')}
                                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-colors ${selectedPlan === 'monthly' ? 'bg-blue-50 border-accent ring-1 ring-accent' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-accent' : 'border-slate-400'}`}>
                                        {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-accent"></div>}
                                    </div>
                                    <span className="text-slate-600">Monthly</span>
                                </div>
                                <span className="font-bold text-slate-900">₦{property.prices.monthly.toLocaleString()}/mo</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (user && user.id === property.user_id) return;
                                setShowPaymentModal(true);
                            }}
                            disabled={user && user.id === property.user_id}
                            className={`w-full mt-6 py-3 rounded-lg font-bold transition-colors ${user && user.id === property.user_id
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-slate-800'
                                }`}
                        >
                            {user && user.id === property.user_id ? 'You own this property' : 'Request to Book'}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            {user && user.id === property.user_id ? 'Owners cannot book their own listings' : "You won't be charged yet"}
                        </p>
                    </div>
                </div>
            </div>
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={selectedPlan === 'yearly' ? property.prices.yearly : property.prices.monthly}
                propertyTitle={property.title || property.name}
                propertyId={property.id}
                currentUnits={property.number_of_units}
                availableMethods={{
                    cardano: !!property.ownerWallet,
                    escrow: !!property.ownerEscrow
                }}
                onPaymentSuccess={() => {
                    // Animate and update local units
                    setProperty(prev => ({ ...prev, number_of_units: prev.number_of_units - 1 }));
                }}
            />
        </div >
    );
}
