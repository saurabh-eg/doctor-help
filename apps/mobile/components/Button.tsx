import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

const StyledButton = styled(TouchableOpacity);
const StyledText = styled(Text);

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    className = ''
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-secondary';
            case 'outline':
                return 'bg-transparent border border-primary';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-primary';
        }
    };

    const getTextStyle = () => {
        if (variant === 'outline') return 'text-primary font-bold';
        return 'text-white font-bold';
    };

    return (
        <StyledButton
            onPress={onPress}
            disabled={disabled || loading}
            className={`py-4 px-6 rounded-2xl flex-row justify-center items-center ${getVariantStyles()} ${disabled ? 'opacity-50' : ''} ${className}`}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#197fe6' : 'white'} />
            ) : (
                <StyledText className={`text-lg ${getTextStyle()}`}>
                    {title}
                </StyledText>
            )}
        </StyledButton>
    );
};
