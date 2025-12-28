import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIAssistantScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am your AI Health Assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I understand. It's important to monitor your symptoms. Based on what you've shared, I recommend consulting with a general physician or a specialist for a more thorough evaluation. Would you like me to help you find a doctor?",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View className="flex-row items-center ml-4">
                    <View className="bg-blue-100 p-2 rounded-full">
                        <Ionicons name="medical" size={20} color="#197fe6" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-lg font-bold text-slate-900">AI Health Assistant</Text>
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                            <Text className="text-slate-500 text-xs">Always Online</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Chat Area */}
            <ScrollView
                className="flex-1 px-5 pt-4"
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        className={`flex-row mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'ai' && (
                            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center mr-2">
                                <Ionicons name="medical" size={14} color="#197fe6" />
                            </View>
                        )}
                        <View className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-blue-600 rounded-tr-none'
                                : 'bg-slate-100 rounded-tl-none'
                            }`}>
                            <Text className={`text-sm leading-5 ${msg.sender === 'user' ? 'text-white' : 'text-slate-800'
                                }`}>
                                {msg.text}
                            </Text>
                            <Text className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                                }`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View className="p-4 border-t border-slate-100 bg-white">
                    <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
                        <TouchableOpacity className="mr-2">
                            <Ionicons name="add" size={24} color="#64748b" />
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 text-slate-900 text-base max-h-24 p-2"
                            placeholder="Type your health concern..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-blue-600' : 'bg-slate-200'
                                }`}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
