import React from 'react';
import { View, TextInput, Text } from 'react-native';

interface InputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    error?: string;
    className?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    error,
    className = ''
}) => {
    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                    {label}
                </Text>
            )}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} p-4 rounded-2xl text-lg`}
                placeholderTextColor="#9ca3af"
            />
            {error && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
