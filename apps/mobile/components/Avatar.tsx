import React from 'react';
import { View, Image, Text } from 'react-native';
import { styled } from 'nativewind';

interface AvatarProps {
    uri?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
};

const textMap = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl'
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'md', className = '' }) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : '??';

    return (
        <View className={`${sizeMap[size]} rounded-full overflow-hidden bg-gray-200 justify-center items-center ${className}`}>
            {uri ? (
                <Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <Text className={`font-bold text-gray-500 ${textMap[size]}`}>
                    {initials}
                </Text>
            )}
        </View>
    );
};
