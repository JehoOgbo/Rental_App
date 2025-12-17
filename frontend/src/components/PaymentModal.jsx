import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { propertyService } from '../api/propertyService';

export default function PaymentModal({ isOpen, onClose, amount, propertyTitle, propertyId, currentUnits, onPaymentSuccess }) {
    const [step, setStep] = useState('select'); // select, details, success
    const [method, setMethod] = useState(null); // cardano, escrow
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const ADA_RATE = 500; // 1 ADA = 500 Naira
    const adaAmount = (amount / ADA_RATE).toFixed(2);

    const handleSelect = (m) => {
        setMethod(m);
        setStep('details');
    };

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Reduce units
            if (propertyId && currentUnits > 0) {
                await propertyService.updatePlace(propertyId, {
                    number_of_units: currentUnits - 1
                });
            }

            setStep('success');
            if (onPaymentSuccess) onPaymentSuccess();
        } catch (error) {
            console.error("Payment/Update failed", error);
            // Optionally show error state
        } finally {
            setProcessing(false);
        }
    };

    const reset = () => {
        setStep('select');
        setMethod(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-fade-in">
                {/* Close Button */}
                <button onClick={reset} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6">
                    {step === 'select' && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Payment Method</h2>
                            <p className="text-slate-600 mb-6">Choose how you'd like to pay for {propertyTitle}</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleSelect('cardano')}
                                    className="w-full p-4 border rounded-xl flex items-center gap-4 hover:border-primary hover:bg-blue-50 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                        ₳
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">Cardano (ADA)</div>
                                        <div className="text-sm text-slate-500">Fast, secure crypto payment</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelect('escrow')}
                                    className="w-full p-4 border rounded-xl flex items-center gap-4 hover:border-primary hover:bg-blue-50 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold group-hover:scale-110 transition-transform">
                                        🛡️
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">Secure Escrow</div>
                                        <div className="text-sm text-slate-500">Funds held until key exchange</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'details' && method === 'cardano' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Pay with Cardano</h2>
                            <p className="text-slate-600 mb-6">Scan QR or copy address</p>

                            <div className="bg-slate-100 p-8 rounded-xl mb-6 mx-auto w-48 h-48 flex items-center justify-center">
                                {/* Mock QR Code */}
                                <div className="text-slate-400 text-xs text-center">
                                    [QR Code Placeholder] <br />
                                    addr1...xyz
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</label>
                                <div className="text-3xl font-bold text-primary">{adaAmount} ₳</div>
                                <div className="text-sm text-slate-400">≈ ₦{amount.toLocaleString()}</div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Wallet Address</label>
                                <div className="bg-slate-50 p-3 rounded font-mono text-xs text-slate-600 break-all select-all border">
                                    addr1qxy...29472...85n9
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={processing}
                                className={`w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors ${processing ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {processing ? 'Verifying Transaction...' : 'I Have Sent Payment'}
                            </button>
                        </div>
                    )}

                    {step === 'details' && method === 'escrow' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Escrow Service</h2>
                            <p className="text-slate-600 mb-6">Secure transaction via TrustGuard</p>

                            <div className="bg-green-50 p-6 rounded-xl mb-6 text-left">
                                <div className="flex gap-2 mb-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">Funds held securely</span>
                                </div>
                                <div className="flex gap-2 mb-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">Released only after move-in</span>
                                </div>
                                <div className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">Dispute protection included</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total to Deposit</label>
                                <div className="text-3xl font-bold text-slate-900">₦{amount.toLocaleString()}</div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={processing}
                                className={`w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors ${processing ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {processing ? 'Setting up Escrow...' : 'Initiate Escrow Deposit'}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 animate-bounce">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Processed!</h2>
                            <p className="text-slate-600 mb-8">
                                {method === 'cardano' ? 'We are verification your crypto transaction.' : 'Escrow contract has been created.'}
                                <br />The host will contact you shortly.
                            </p>
                            <button onClick={reset} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
