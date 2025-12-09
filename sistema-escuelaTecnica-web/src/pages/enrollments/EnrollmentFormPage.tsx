import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStudentStore } from '../../store/student.store';

import { useEnrollmentStore } from '../../store/enrollment.store';
import { useCourseStore } from '../../store/course.store';
import { ArrowLeft, Save, GraduationCap, Users, Calculator, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PDFViewer } from '@react-pdf/renderer';
import EnrollmentPDF from '../../components/enrollment/EnrollmentPDF';

const EnrollmentFormPage = () => {
    const navigate = useNavigate();
    const { students, fetchStudents } = useStudentStore();
    const { courses, fetchCourses } = useCourseStore();
    const { createEnrollment } = useEnrollmentStore();
    
    // Local state for calculation and modal
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [calculatedPrice, setCalculatedPrice] = useState<number>(450);
    const [discountDetails, setDiscountDetails] = useState<string>('');
    
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [enrollmentResult, setEnrollmentResult] = useState<any>(null);

    const { handleSubmit, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, [fetchStudents, fetchCourses]);

    // Price Calculation Effect
    useEffect(() => {
        if (!selectedStudentId || !selectedCourseId) {
            setCalculatedPrice(450);
            setDiscountDetails('');
            return;
        }

        const student = students.find(s => s.id === Number(selectedStudentId));
        const course = courses.find(c => c.id === Number(selectedCourseId));
        
        console.log('--- Price Calculation ---');
        console.log('Selected Student:', student);
        console.log('Selected Course:', course);

        if (student && course) {
            // Try to find price from first level, or default
            // Assuming course object might have levels populated. If not, default 450.
            // Note: Frontend types might need to ensure levels are included in listing.
            // If they are not, we might need a separate fetch or just assume 450.
            // For now, let's try to access it safely.
            const firstLevel = (course as any).levels?.[0];
            let price = Number(firstLevel?.basePrice) || 450;
            let info = 'Precio Base';

            // Check Agreement
            if (student.school?.agreement?.isActive) {
                const agreement = student.school.agreement;
                const now = new Date();
                
                console.log('Student has Agreement:', agreement);
                
                // Simple date check (should match backend)
                const start = new Date(agreement.startDate);
                const end = agreement.endDate ? new Date(agreement.endDate) : null;
                
                console.log('Agreement Valid Dates:', start, end, 'Now:', now);

                if (start <= now && (!end || end >= now)) {
                    console.log('Agreement is DATE VALID');
                    if (agreement.discountType === 'PERCENTAGE') {
                        const discount = Number(agreement.discountValue);
                        price = price - (price * discount / 100);
                        info = `Descuento aplicado: ${discount}% (${agreement.name})`;
                    } else if (agreement.discountType === 'FIXED_AMOUNT') {
                        const discount = Number(agreement.discountValue);
                        price = Math.max(0, price - discount);
                        info = `Descuento aplicado: Bs ${discount} (${agreement.name})`;
                    }
                } else {
                    console.log('Agreement Expired or Not Started');
                }
            } else {
                console.log('No Active Agreement');
            }

            console.log('Calculated Price:', price);
            setCalculatedPrice(price);
            setDiscountDetails(info);
        }

    }, [selectedStudentId, selectedCourseId, students, courses]);

    const onSubmit = async () => {
        try {
            const result = await createEnrollment({
                studentId: Number(selectedStudentId),
                courseId: Number(selectedCourseId) 
            });

            setEnrollmentResult(result);
            setShowPdfModal(true);

            Swal.fire({
                title: '¡Matrícula Exitosa!',
                text: 'El estudiante ha sido matriculado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                background: '#1f2937', 
                color: '#fff'
            });

        } catch (error: any) {
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo procesar la matrícula',
                icon: 'error',
                confirmButtonColor: '#d33',
                background: '#1f2937', 
                color: '#fff'
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
             {/* PDF Modal */}
             {showPdfModal && enrollmentResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Download size={20} /> Formulario de Matrícula
                            </h3>
                            <button onClick={() => { setShowPdfModal(false); navigate('/dashboard/enrollments'); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden">
                            <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <EnrollmentPDF data={enrollmentResult} credentials={enrollmentResult.credentials} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard/enrollments')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                     <h1 className="text-3xl font-bold text-white tracking-tight">Nueva Matrícula</h1>
                    <p className="text-gray-400">Inscribir estudiante y generar comprobante</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Student Selection */}
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><GraduationCap size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Seleccionar Estudiante</h2>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Estudiante</label>
                        <select 
                            className="glass-input w-full [&>option]:text-black"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un estudiante...</option>
                            {students.filter(s => s.enrollmentStatus !== 'INACTIVE').map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.documentNumber} - {student.user?.firstName} {student.user?.paternalSurname} {student.user?.maternalSurname}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Course Selection */}
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Users size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Seleccionar Curso</h2>
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-300">Curso</label>
                         <select 
                            className="glass-input w-full [&>option]:text-black"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un curso...</option>
                            {courses.filter(c => c.isActive).map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Price Preview */}
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 relative">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Calculator size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Resumen de Costos</h2>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
                        <div>
                            <p className="text-gray-400 mb-1">Detalle del cálculo</p>
                            <p className="text-lg text-white">{discountDetails || 'Precio estándar sin descuentos aplicados'}</p>
                        </div>
                        <div className="text-right bg-black/20 p-4 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-1">Monto Total</p>
                            <p className="text-4xl font-bold text-green-400">Bs {calculatedPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </section>
                
                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/enrollments')}
                        className="mr-4 px-6 py-3 rounded-xl text-gray-300 hover:bg-white/10 transition-colors font-medium border border-transparent hover:border-white/10"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedStudentId || !selectedCourseId}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Procesando...' : 'Matricular y Generar PDF'}
                    </button>
                </div>

            </form>

             <style>{`
                .glass-input {
                    display: block;
                    padding: 0.75rem 1rem;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                }
                .glass-input:focus {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
            `}</style>
        </div>
    );
};

export default EnrollmentFormPage;
