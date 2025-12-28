import React from 'react';
import { View } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <View
            className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 ${className}`}
        >
            {children}
        </View>
    );
};
