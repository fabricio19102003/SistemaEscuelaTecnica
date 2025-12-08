import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../assets/logo_school.png';

const AuthLayout = () => {
    return (
        <div className="min-h-screen relative w-full overflow-hidden bg-[#0f172a] flex items-center justify-center p-4">
            {/* 3D Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                        x: [0, 100, 0], 
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-red-600/20 to-pink-600/20 blur-[100px]" 
                />
                
                <motion.div 
                    animate={{ 
                        rotate: [360, 0],
                        scale: [1, 1.2, 1],
                        x: [0, -50, 0], 
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] -right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 blur-[100px]" 
                />

                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        x: [0, 200, -200, 0],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] left-[20%] w-[900px] h-[900px] rounded-full bg-gradient-to-t from-blue-900/20 to-purple-900/20 blur-[120px]" 
                />
            </div>

            {/* Glassmorphism Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* 3D Tilt Effect Container */}
                <div className="backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-white/20 shadow-2xl rounded-3xl p-8 overflow-hidden relative group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="mb-8 p-4 relative"
                        >
                             <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                             <img src={logo} alt="Logo Escuela Técnica" className="w-32 h-auto relative drop-shadow-2xl" />
                        </motion.div>
                        
                        <div className="w-full">
                            <Outlet />
                        </div>
                    </div>
                </div>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-gray-400 mt-6 text-sm"
                >
                    © {new Date().getFullYear()} Sistema Escuela Técnica. U.A.P.
                </motion.p>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
