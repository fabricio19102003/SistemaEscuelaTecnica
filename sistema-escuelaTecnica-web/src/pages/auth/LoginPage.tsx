import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useAuthStore } from '../../store/auth.store';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', data);
            const { token, user } = response.data;
            login(token, user);
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
            setError('root', { 
                message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
            });
        }
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Usuario o Correo</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            {...register('identifier')}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-all duration-200 backdrop-blur-sm"
                            placeholder="Usuario o correo electrónico"
                        />
                    </div>
                    {errors.identifier && <p className="text-red-400 text-xs mt-1 font-medium ml-1">{errors.identifier.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                    <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            {...register('password')}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-all duration-200 backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 font-medium ml-1">{errors.password.message}</p>}
                </div>

                {errors.root && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.root.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Iniciando sesión...
                        </span>
                    ) : 'Ingresar al Sistema'}
                </button>
            </form>
        </>
    );
};

export default LoginPage;
