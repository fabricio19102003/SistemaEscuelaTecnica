import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentStore } from '../../store/student.store';
import Swal from 'sweetalert2';

import { useSchoolStore } from '../../store/school.store';
import { Combobox } from '../../components/ui/Combobox';
import { ArrowLeft, Save, Upload, User, Info, School } from 'lucide-react';

const studentSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    paternalSurname: z.string().min(2, 'El apellido paterno es requerido'),
    maternalSurname: z.string().optional(),
    email: z.string().email('Debe ser un email válido'),
    documentType: z.string(),
    documentNumber: z.string().min(5, 'El número de documento es requerido'),
    birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de nacimiento inválida",
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Seleccione un género' }),
    address: z.string().optional(),
    phone: z.string().optional(),
    // previousSchool: z.string().optional(), // Removed in favor of schoolId
    schoolId: z.number().optional().nullable(),
    medicalNotes: z.string().optional(),
    enrollmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED', 'RETIRADO', 'ABANDONO', 'NO_INCORPORADO']),

    // Guardian
    guardian: z.object({
        firstName: z.string().min(2, 'Nombre requerido'),
        paternalSurname: z.string().min(2, 'Apellido paterno requerido'),
        maternalSurname: z.string().optional(),
        email: z.string().email('Email requerido'),
        phone: z.string().min(6, 'Teléfono requerido'),
        documentType: z.string(),
        documentNumber: z.string().min(5, 'CI requerido'),
        relationship: z.enum(['FATHER', 'MOTHER', 'TUTOR', 'OTHER']),
        occupation: z.string().optional(),
        workplace: z.string().optional(),
    }).optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

const StudentFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createStudent, updateStudent, fetchStudentById, selectedStudent, isLoading } = useStudentStore();
    const { schools, fetchSchools } = useSchoolStore();
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    
    const isEditMode = !!id;

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<StudentForm>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            enrollmentStatus: 'ACTIVE',
            documentType: 'CI',
            gender: 'MALE',
            guardian: {
                relationship: 'FATHER',
                documentType: 'CI'
            }
        }
    });

    useEffect(() => {
        fetchSchools(); // Load schools for the combobox
        if (isEditMode && id) {
            fetchStudentById(id);
        }
    }, [id, isEditMode, fetchStudentById, fetchSchools]);

    useEffect(() => {
        if (isEditMode && selectedStudent) {
            // Check if we are editing the correct student
            if (selectedStudent.id.toString() !== id) return;

            // Map Backend Enums to Frontend Enums
            const mapGenderToFrontend = (val: string) => {
                const map: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = { 'M': 'MALE', 'F': 'FEMALE' };
                return map[val] || 'OTHER';
            };
            const mapDocTypeToFrontend = (val: string) => {
                const map: Record<string, string> = { 'DNI': 'CI', 'PASSPORT': 'PASSPORT' };
                return map[val] || 'CI'; // Default to CI if unknown or other
            };

            reset({
                firstName: selectedStudent.user.firstName,
                paternalSurname: selectedStudent.user.paternalSurname,
                maternalSurname: selectedStudent.user.maternalSurname || '',
                email: selectedStudent.user.email,
                phone: selectedStudent.user.phone || '',
                documentType: mapDocTypeToFrontend(selectedStudent.documentType),
                documentNumber: selectedStudent.documentNumber,
                birthDate: new Date(selectedStudent.dateOfBirth).toISOString().split('T')[0],
                gender: mapGenderToFrontend(selectedStudent.gender),
                address: selectedStudent.address || '',
                schoolId: selectedStudent.schoolId,
                enrollmentStatus: selectedStudent.enrollmentStatus,
                guardian: selectedStudent.studentGuardians?.[0]?.guardian ? {
                    firstName: selectedStudent.studentGuardians[0].guardian.user.firstName,
                    paternalSurname: selectedStudent.studentGuardians[0].guardian.user.paternalSurname,
                    maternalSurname: selectedStudent.studentGuardians[0].guardian.user.maternalSurname || '',
                    email: selectedStudent.studentGuardians[0].guardian.user.email,
                    phone: selectedStudent.studentGuardians[0].guardian.user.phone || '',
                    documentType: mapDocTypeToFrontend(selectedStudent.studentGuardians[0].guardian.documentType),
                    documentNumber: selectedStudent.studentGuardians[0].guardian.documentNumber,
                    relationship: selectedStudent.studentGuardians[0].guardian.relationship,
                    occupation: selectedStudent.studentGuardians[0].guardian.occupation || '',
                    workplace: selectedStudent.studentGuardians[0].guardian.workplace || ''
                } : undefined
            });
            if (selectedStudent.user.profileImageUrl) {
                setPhotoPreview(selectedStudent.user.profileImageUrl);
            }
        }
    }, [selectedStudent, isEditMode, reset, id]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<StudentForm> = async (data) => {
        console.log('========== FRONTEND: onSubmit called ==========');
        console.log('Form data received:', data);
        console.log('Is Edit Mode:', isEditMode, 'ID:', id);
        console.log('Has guardian in form?', !!data.guardian);
        
        try {
            // Map frontend enum values to backend Prisma enum values
            const mapGender = (gender: string) => {
                const mapping: Record<string, string> = { 'MALE': 'M', 'FEMALE': 'F', 'OTHER': 'OTHER' };
                return mapping[gender] || gender;
            };

            const mapDocumentType = (docType: string) => {
                const mapping: Record<string, string> = { 'CI': 'DNI', 'PASSPORT': 'PASSPORT', 'OTHER': 'OTHER' };
                return mapping[docType] || 'DNI';
            };

            // Transform frontend data to backend expected format
            const payload = {
                // User fields
                email: data.email,
                firstName: data.firstName,
                paternalSurname: data.paternalSurname,
                maternalSurname: data.maternalSurname,
                phone: data.phone,
                
                // Student fields
                documentType: mapDocumentType(data.documentType),
                documentNumber: data.documentNumber,
                dateOfBirth: data.birthDate, // Transform birthDate -> dateOfBirth
                gender: mapGender(data.gender) as 'MALE' | 'FEMALE' | 'OTHER',
                address: data.address,
                schoolId: data.schoolId,
                enrollmentStatus: data.enrollmentStatus,
                medicalNotes: data.medicalNotes,
                
                // Guardian data
                guardian: data.guardian ? {
                    ...data.guardian,
                    documentType: mapDocumentType(data.guardian.documentType)
                } : undefined
            };

            console.log('Payload prepared:', payload);
            console.log('Payload has guardian?', !!payload.guardian);
            if (payload.guardian) {
                console.log('Guardian email:', payload.guardian.email);
                console.log('Guardian name:', payload.guardian.firstName, payload.guardian.paternalSurname);
            }

            // Create FormData for upload
            const formData = new FormData();
            
            // Append payload as JSON string
            formData.append('data', JSON.stringify(payload));
            
            console.log('FormData created, JSON payload appended');
            
            // Append photo if selected
            if (photoFile) {
                formData.append('photo', photoFile);
                console.log('Photo file appended to FormData');
            }

            if (isEditMode && id) {
                console.log('Calling updateStudent with id:', id);
                // Now using FormData for update as well
                await updateStudent(id, formData); 
                console.log('updateStudent completed successfully');
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El estudiante ha sido actualizado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } else {
               console.log('Calling createStudent');
               // For create, we use FormData
               await createStudent(formData);
               console.log('createStudent completed successfully');
               Swal.fire({
                    title: '¡Registrado!',
                    text: 'El estudiante ha sido registrado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            navigate('/dashboard/students');
        } catch (error: any) {
            console.error('========== ERROR in onSubmit ==========');
            console.error('Error submitting form:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Hubo un error al guardar el estudiante.',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        }
    };

    if (isLoading && isEditMode && !selectedStudent) {
        return <div className="text-white text-center p-10">Cargando...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-10 space-y-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10 flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/students')} 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                            <User size={32} className="text-blue-200" />
                            {isEditMode ? 'Editar Estudiante' : 'Registro de Estudiante'}
                        </h1>
                        <p className="text-blue-100 text-lg font-medium mt-1">
                            {isEditMode ? 'Actualiza la información del estudiante.' : 'Complete el formulario para inscribir un nuevo estudiante.'}
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any, (errors) => {
                console.error('Validation Errors:', errors);
                
                // Helper to format errors recursively
                const formatErrors = (errObj: any, prefix = ''): string[] => {
                    let messages: string[] = [];
                    for (const key in errObj) {
                        if (errObj[key]?.message) {
                            messages.push(`${prefix}${key}: ${errObj[key].message}`);
                        } else if (typeof errObj[key] === 'object' && errObj[key] !== null && !errObj[key].message) {
                            messages = [...messages, ...formatErrors(errObj[key], `${key}.`)];
                        }
                    }
                    return messages;
                };

                const errorMessages = formatErrors(errors);

                Swal.fire({
                    title: 'Error de Validación',
                    html: `<div class="text-left text-sm max-h-60 overflow-y-auto">
                            <p class="mb-2">Por favor revise los siguientes errores:</p>
                            <ul class="list-disc pl-5">
                                ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                            </ul>
                           </div>`,
                    icon: 'warning',
                    background: '#1f2937', 
                    color: '#fff'
                });
            })} className="space-y-8">
            
                {/* Hidden fields to ensure form data is complete */}
                <input type="hidden" {...register('documentType')} />
                <input type="hidden" {...register('guardian.documentType')} />
                {/* 1. Datos Personales */}
                <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg shadow-blue-900/5">
                    <div className="flex items-center gap-3 mb-6 border-b border-blue-50 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#004694]"><User size={24} /></div>
                        <h2 className="text-xl font-bold text-[#004694]">Datos Personales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Foto Upload */}
                        <div className="md:col-span-3 flex flex-col items-center space-y-4">
                            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 bg-black/20 group">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User size={48} />
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Upload className="text-white" />
                                    <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400">JPG o PNG (Max. 2MB)</p>
                        </div>

                        {/* Fields */}
                        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nombres *</label>
                                <input {...register('firstName')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="Ej. JUAN ANDRÉS" />
                                {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email del Estudiante</label>
                                <input {...register('email')} type="email" className="glass-input w-full" placeholder="estudiante@escuela.com" />
                                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Apellido Paterno *</label>
                                <input {...register('paternalSurname')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="PÉREZ" />
                                {errors.paternalSurname && <p className="text-red-400 text-xs">{errors.paternalSurname.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Apellido Materno</label>
                                <input {...register('maternalSurname')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="LÓPEZ" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Cédula de Identidad *</label>
                                <input {...register('documentNumber')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="1234567" />
                                {errors.documentNumber && <p className="text-red-400 text-xs">{errors.documentNumber.message}</p>}
                            </div>

                             <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Fecha de Nacimiento *</label>
                                <input type="date" {...register('birthDate')} className="glass-input w-full [color-scheme:dark]" />
                                {errors.birthDate && <p className="text-red-400 text-xs">{errors.birthDate.message}</p>}
                            </div>

                             <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Género *</label>
                                <select {...register('gender')} className="glass-input w-full">
                                    <option value="MALE">Masculino</option>
                                    <option value="FEMALE">Femenino</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Teléfono (Contacto)</label>
                                <input {...register('phone')} className="glass-input w-full" placeholder="70012345" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Información Académica */}
                <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg shadow-blue-900/5 relative z-20">
                     <div className="flex items-center gap-3 mb-6 border-b border-blue-50 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#004694]"><School size={24} /></div>
                        <h2 className="text-xl font-bold text-[#004694]">Información Académica</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2 col-span-2">
                             <label className="text-sm font-medium text-gray-300">Colegio de Procedencia</label>
                             <div className="relative">
                                <Combobox 
                                    options={schools.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                                    onChange={(val) => setValue('schoolId', Number(val))}
                                    value={watch('schoolId') || undefined}
                                    placeholder="Buscar colegio..."
                                    onSearch={(query) => fetchSchools(query)}
                                />
                             </div>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Estado de Inscripción</label>
                            <select {...register('enrollmentStatus')} className="glass-input w-full">
                                <option value="ACTIVE">Activo</option>
                                <option value="INACTIVE">Inactivo</option>
                                <option value="GRADUATED">Graduado</option>
                                <option value="DROPPED">Retirado (Baja)</option>
                                <option value="RETIRADO">Retirado</option>
                                <option value="ABANDONO">Abandono</option>
                                <option value="NO_INCORPORADO">No Incorporado</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 3. Datos del Tutor/Padre */}
                <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg shadow-blue-900/5 relative z-10">
                    <div className="flex items-center gap-3 mb-6 border-b border-blue-50 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#004694]"><p className="font-bold text-lg px-1">T</p></div>
                        <h2 className="text-xl font-bold text-[#004694]">Datos del Tutor / Apoderado</h2>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex items-start gap-3">
                         <Info className="text-amber-600 shrink-0 mt-1" size={18} />
                         <p className="text-sm text-amber-800 font-medium">
                             Esta información creará automáticamente una cuenta de usuario para el tutor si no existe.
                         </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Nombres del Tutor *</label>
                            <input {...register('guardian.firstName')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="CARLOS" />
                            {errors.guardian?.firstName && <p className="text-red-400 text-xs">{errors.guardian.firstName.message}</p>}
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Apellido Paterno *</label>
                            <input {...register('guardian.paternalSurname')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="PÉREZ" />
                             {errors.guardian?.paternalSurname && <p className="text-red-400 text-xs">{errors.guardian.paternalSurname.message}</p>}
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Apellido Materno</label>
                            <input {...register('guardian.maternalSurname')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="GÓMEZ" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Relación *</label>
                             <select {...register('guardian.relationship')} className="glass-input w-full">
                                <option value="FATHER">Padre</option>
                                <option value="MOTHER">Madre</option>
                                <option value="TUTOR">Tutor Legal</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">CI del Tutor *</label>
                            <input {...register('guardian.documentNumber')} className="glass-input w-full uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} placeholder="8765432" />
                             {errors.guardian?.documentNumber && <p className="text-red-400 text-xs">{errors.guardian.documentNumber.message}</p>}
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Teléfono / Celular *</label>
                            <input {...register('guardian.phone')} className="glass-input w-full" placeholder="70099999" />
                             {errors.guardian?.phone && <p className="text-red-400 text-xs">{errors.guardian.phone.message}</p>}
                        </div>
                         <div className="space-y-2 md:col-span-2">
                             <label className="text-sm font-medium text-gray-300">Email del Tutor *</label>
                            <input {...register('guardian.email')} className="glass-input w-full" placeholder="padre@email.com" />
                             {errors.guardian?.email && <p className="text-red-400 text-xs">{errors.guardian.email.message}</p>}
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                     <button
                        type="button"
                        onClick={() => navigate('/dashboard/students')}
                        className="mr-4 px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors font-medium border border-transparent hover:border-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                    </button>
                </div>
            </form>

            <style>{`
                .glass-input {
                    display: block;
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    color: #1e293b;
                    font-weight: 500;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-input:focus {
                    background-color: #ffffff;
                    border-color: #004694;
                    box-shadow: 0 0 0 4px rgba(0, 70, 148, 0.1);
                }
                .glass-input:hover {
                    border-color: #cbd5e1;
                }
                .glass-input::placeholder {
                    color: #94a3b8;
                }
                label {
                    color: #004694;
                    font-weight: 700;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                    display: block;
                }
            `}</style>
        </div>
    );
};

export default StudentFormPage;
