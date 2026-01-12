import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    username: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setToken(storedToken);
                } else {
                    // Token invalid, clear storage
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Token verification error:', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (username: string, password: string) => {
        const url = '/api/auth/login';
        console.log('AuthContext: Attempting login to:', url);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('AuthContext: Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AuthContext: Response error text:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    throw new Error(error.error || 'Login failed');
                } catch (e) {
                    throw new Error(`Login failed with status ${response.status}: ${errorText}`);
                }
            }

            const data = await response.json();
            console.log('AuthContext: Login successful, received token');
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
        } catch (error) {
            console.error('AuthContext: Fetch error:', error);
            throw error;
        }
    };



    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
