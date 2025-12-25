// Date formatting utilities
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)}, ${formatTime(date)}`;
}

export function getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) {
        const absMins = Math.abs(diffMins);
        if (absMins < 60) return `${absMins} mins ago`;
        if (absMins < 1440) return `${Math.round(absMins / 60)} hours ago`;
        return `${Math.round(absMins / 1440)} days ago`;
    } else {
        if (diffMins < 60) return `In ${diffMins} mins`;
        if (diffMins < 1440) return `In ${Math.round(diffMins / 60)} hours`;
        return `In ${Math.round(diffMins / 1440)} days`;
    }
}

// Currency formatting
export function formatCurrency(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

// Phone number formatting
export function formatPhone(phone: string): string {
    if (phone.length === 10) {
        return `${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
}

// Validation utilities
export function isValidPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// String utilities
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Greeting based on time
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}
