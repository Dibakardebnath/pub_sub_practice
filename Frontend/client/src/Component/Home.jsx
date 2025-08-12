import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Send, Bell, Mail, Hash, MessageSquare } from 'lucide-react';

export default function Home() {
    const [socket, setSocket] = useState(null);
    const [subTopic, setSubTopic] = useState('');
    const [pubTopic, setPubTopic] = useState('');
    const [pubMessage, setPubMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('message', ({ topic, message }) => {
            addMessage(`📩 [${topic}] ${message}`);
        });

        return () => newSocket.disconnect();
    }, []);

    const subscribe = () => {
        if (!subTopic.trim()) return;
        socket.emit('subscribe', subTopic);
        setActiveSubscriptions(prev => [...new Set([...prev, subTopic])]);
        addMessage(`✅ Subscribed to: ${subTopic}`);
        setSubTopic('');
    };

    const publish = () => {
        if (!pubTopic.trim() || !pubMessage.trim()) return;
        socket.emit('publish', { topic: pubTopic, message: pubMessage });
        addMessage(`📤 Published to ${pubTopic}: ${pubMessage}`);
        setPubMessage('');
    };

    const addMessage = (text) => {
        setMessages(prev => [...prev, { text, id: Date.now() }]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 text-black">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Bell className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pub/Sub Demo</h1>
                    <p className="text-gray-600">Real-time messaging with Socket.IO</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Subscribe Panel */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Hash className="w-5 h-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-800">Subscribe</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={subTopic}
                                        onChange={(e) => setSubTopic(e.target.value)}
                                        placeholder="Enter topic name"
                                        className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={subscribe}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            {activeSubscriptions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Active Subscriptions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {activeSubscriptions.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Publish Panel */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Send className="w-5 h-5 text-green-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-800">Publish</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                                <input
                                    type="text"
                                    value={pubTopic}
                                    onChange={(e) => setPubTopic(e.target.value)}
                                    placeholder="Enter topic name"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows={3}
                                    value={pubMessage}
                                    onChange={(e) => setPubMessage(e.target.value)}
                                    placeholder="Enter your message"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={publish}
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>Publish Message</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Log */}
                <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-800">Message Log</h2>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No messages received yet
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <p className="text-sm font-mono">{message.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(message.id).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}