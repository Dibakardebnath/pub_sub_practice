import { useState } from "react";

export default function Payment() {
    const [amount, setamount] = useState(350);

    // handlePayment Function
    const handlePayment = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_HOST_URL}/api/payment/order`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    amount
                })
            });

            const data = await res.json();
            console.log(data);
            handlePaymentVerify(data.data)
        } catch (error) {
            console.log(error);
        }
    }

    // handlePaymentVerify Function
    const handlePaymentVerify = async (data) => {
        const options = {
            key: import.meta.env.RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            name: "Devknus",
            description: "Test Mode",
            order_id: data.id,
            handler: async (response) => {
                console.log("response", response)
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_HOST_URL}/api/payment/verify`, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    })

                    const verifyData = await res.json();

                    if (verifyData.message) {
                        toast.success(verifyData.message)
                    }
                } catch (error) {
                    console.log(error);
                }
            },
            theme: {
                color: "#5f63b8"
            }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#fcfcfc] to-[rgb(138,171,202)]">
            <div className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* Product Image */}
                <div className="relative w-full h-56 bg-gray-100">
                    <img
                        src="https://codeswear.nyc3.cdn.digitaloceanspaces.com/tshirts/pack-of-five-plain-tshirt-white/1.webp"
                        alt="Product"
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#1B9CFC] text-white text-xs font-semibold px-2 py-1 rounded-md">
                        Bestseller
                    </span>
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        My First Product
                    </h2>

                    <p className="text-xl font-bold text-gray-900">
                        ₹350{" "}
                        <span className="text-sm text-gray-500 line-through ml-1">₹699</span>
                    </p>

                    {/* Buy Button */}
                    <button
                        onClick={handlePayment}
                        className="mt-4 w-full bg-[#1B9CFC] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#167acb] transition-colors"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}