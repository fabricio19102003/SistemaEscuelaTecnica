import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useAuthStore } from '../../store/auth.store';
import logoUap from '../../assets/images/logo_uap_official.png';
import { User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Usuario o correo requerido'),
    password: z.string().min(1, 'Contraseña requerida'),
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
                message: error.response?.data?.message || 'Error de autenticación. Verifique sus credenciales.' 
            });
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#004694] relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full bg-blue-500/20 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[80%] rounded-full bg-blue-800/20 blur-[120px]" />
                <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[50%] rounded-full bg-red-600/10 blur-[100px]" />
            </div>

            {/* Main Container */}
            <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-500">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/20 mb-6 transform hover:scale-105 transition-transform duration-300">
                        <img 
                            src={logoUap} 
                            alt="Logo UAP" 
                            className="w-24 h-24 object-contain drop-shadow-lg" 
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white text-center tracking-tight drop-shadow-md">
                        Sistema <span className="text-blue-200">Escuela Técnica</span>
                    </h1>
                    <p className="text-blue-200 mt-2 text-sm font-medium tracking-wide uppercase opacity-90">
                        Universidad Amazónica de Pando
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-red-600 rounded-full block shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                        Iniciar Sesión
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-100 uppercase tracking-wider ml-1">Usuario</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    {...register('identifier')}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-blue-950/30 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-blue-950/50 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                                    placeholder="Ingrese su usuario o correo"
                                />
                            </div>
                            {errors.identifier && (
                                <p className="text-red-300 text-xs mt-1 flex items-center gap-1 ml-1 animate-in slide-in-from-left-2 duration-200">
                                    <AlertCircle size={12} /> {errors.identifier.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-100 uppercase tracking-wider ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    {...register('password')}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-blue-950/30 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-blue-950/50 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-300 text-xs mt-1 flex items-center gap-1 ml-1 animate-in slide-in-from-left-2 duration-200">
                                    <AlertCircle size={12} /> {errors.password.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-100 rounded-xl text-sm flex items-start gap-3 animate-in shake duration-300">
                                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                <span className="font-medium">{errors.root.message}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/50 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#004694] focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingresar al Sistema</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-blue-300/60 text-xs font-medium">
                        © {new Date().getFullYear()} Universidad Amazónica de Pando v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
