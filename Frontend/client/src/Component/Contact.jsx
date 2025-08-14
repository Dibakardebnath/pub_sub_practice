import axios from "axios";
import { CheckCircle, Clock, Mail, MessageSquare, Send, User, XCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [log, setLog] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Memoize socket instance to prevent recreation on re-renders
    const socket = useMemo(() => io("http://localhost:3000", {
        transports: ["websocket"], // Force WebSocket only
        reconnectionAttempts: 5, // Limit reconnection attempts
        reconnectionDelay: 1000, // Delay between reconnections
    }), []);

    useEffect(() => {
        const handleEmailStatus = (data) => {
            setLog((prev) => [
                ...prev,
                {
                    ...data,
                    timestamp: new Date().toLocaleTimeString(),
                    id: Date.now() // Add unique ID for each log entry
                },
            ]);
            setIsSubmitting(false);
        };

        socket.on("email-status", handleEmailStatus);

        return () => {
            socket.off("email-status", handleEmailStatus); // Clean up listener
            socket.disconnect(); // Disconnect socket
        };
    }, [socket]);

    const validateForm = () => {
        const newErrors = {};
        const { name, email, message } = form;

        if (!name.trim()) newErrors.name = "Name is required";

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!message.trim()) {
            newErrors.message = "Message is required";
        } else if (message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters long";
        } else if (message.trim().length > 500) {
            newErrors.message = "Message must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendEmail = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});
        console.log(form, "form before call")
        try {
            // Explicitly stringify the body and set headers
            const response = await axios.post(
                "http://localhost:3000/send-email",
                JSON.stringify(form), // Explicit stringification
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json" // Explicitly ask for JSON response
                    },
                    timeout: 10000
                }
            );
            if (response.data.success) {
                setForm({ name: "", email: "", message: "" });
                // No need to manually set submitting to false - handled by socket
            } else {
                setErrors({ submit: response.data.error || "Failed to send email" });
                setIsSubmitting(false);
            }
        } catch (err) {
            let errorMessage = "Network error. Please try again.";

            if (err.response) {
                errorMessage = err.response.data?.error || errorMessage;
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection.";
            }

            setErrors({ submit: errorMessage });
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        const iconProps = { className: "w-4 h-4" };

        switch (status) {
            case "sent":
                return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-500`} />;
            case "failed":
                return <XCircle {...iconProps} className={`${iconProps.className} text-red-500`} />;
            default:
                return <Clock {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "sent":
                return "text-green-700 bg-green-50 border-green-200";
            case "failed":
                return "text-red-700 bg-red-50 border-red-200";
            default:
                return "text-yellow-700 bg-yellow-50 border-yellow-200";
        }
    };

    return (
        <div className="min-h-screen max-w-screen border bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 text-black">
            <div className="w-full mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
                    <p className="text-gray-600">Send us a message and we'll get back to you shortly</p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="inline w-4 h-4 mr-1" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                maxLength={100}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="inline w-4 h-4 mr-1" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Message Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MessageSquare className="inline w-4 h-4 mr-1" />
                                Message
                            </label>
                            <textarea
                                rows={5}
                                placeholder="Tell us what you'd like to discuss..."
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                maxLength={500}
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    {errors.message}
                                </p>
                            )}
                            <div className="mt-1 text-sm text-gray-500">
                                {form.message.length}/500 characters
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={sendEmail}
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Send Message</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Log */}
                {log.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            Email Status Log
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {log.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`p-4 rounded-lg border flex items-center justify-between ${getStatusColor(entry.status)}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(entry.status)}
                                        <div>
                                            <p className="font-medium">
                                                {entry.email || 'Unknown Email'}
                                            </p>
                                            <p className="text-sm opacity-75">
                                                Status: {entry.status}
                                            </p>
                                        </div>
                                    </div>
                                    {entry.timestamp && (
                                        <span className="text-sm opacity-75">
                                            {entry.timestamp}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}