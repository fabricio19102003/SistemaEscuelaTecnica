import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttendanceStore } from '../../store/attendance.store';
import { useTeacherStore } from '../../store/teacher.store';
import { useAuthStore } from '../../store/auth.store'; // To get teacher name
import { ArrowLeft, Save, Calendar, Loader, Check, X, Clock, Printer, FileBarChart, Download } from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance.types';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import DailyAttendancePDF from '../../components/attendance/DailyAttendancePDF';
import AttendanceStatsPDF from '../../components/attendance/AttendanceStatsPDF';

const TeacherAttendancePage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { user } = useAuthStore();
    
    // Stats Modal State
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsDateRange, setStatsDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of month
        end: new Date().toISOString().split('T')[0]
    });
    const [generatingReport, setGeneratingReport] = useState(false);

    // Store
    const { attendanceList, isLoading, fetchAttendance, saveAttendance, updateLocalStatus, fetchStats } = useAttendanceStore();
    const { myCourses, fetchMyCourses } = useTeacherStore(); // Ensure fetchMyCourses is available

    const courseInfo = myCourses.find(c => c.id === Number(groupId));

    // Ensure courses are loaded
    useEffect(() => {
        if (myCourses.length === 0) {
            console.log("No courses found, fetching...");
            fetchMyCourses();
        }
    }, [myCourses.length, fetchMyCourses]);

    useEffect(() => {
        if (groupId && selectedDate) {
            fetchAttendance(Number(groupId), selectedDate);
        }
    }, [groupId, selectedDate, fetchAttendance]);

    const handleStatusChange = (enrollmentId: number, status: AttendanceStatus) => {
        updateLocalStatus(enrollmentId, status);
    };



    const handleSaveAttendance = async () => {
        if (!groupId) return;
        
        try {
            const records = attendanceList.map(item => ({
                enrollmentId: item.enrollmentId,
                status: item.status || AttendanceStatus.ABSENT, 
                notes: item.notes,
                arrivalTime: item.arrivalTime || undefined
            }));

            await saveAttendance({
                groupId: Number(groupId),
                date: selectedDate,
                records: records as any 
            });

            Swal.fire({
                title: 'Guardado',
                text: 'Asistencia registrada correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#fff', color: '#000'
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo guardar la asistencia',
                icon: 'error',
                background: '#fff', color: '#000'
            });
        }
    };

    const handlePrintDailyReport = async () => {
        console.log('Generating Daily PDF...');
        if (!courseInfo) {
            console.error("Course Info not found!");
            Swal.fire("Error", "Información del curso no encontrada. Intente recargar.", "error");
            return;
        }
        try {
            const blob = await pdf(
                <DailyAttendancePDF
                    courseName={courseInfo?.level.course.name}
                    levelName={courseInfo?.level.name}
                    date={selectedDate}
                    teacherName={`${user?.firstName} ${user?.paternalSurname}`}
                    userWhoGenerated={`${user?.firstName} ${user?.paternalSurname}`}
                    students={attendanceList}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error generating daily PDF:', error);
            Swal.fire('Error', 'No se pudo generar el PDF. Revise la consola.', 'error');
        }
    };

    const handleDownloadStatsReport = async () => {
        console.log('Generating Stats PDF...');
        if (!groupId || !courseInfo) {
             console.error("Missing Group ID or Course Info");
             return;
        }
        setGeneratingReport(true);
        try {
            const data = await fetchStats(Number(groupId), statsDateRange.start, statsDateRange.end);
            console.log('Stats data received:', data);

            const blob = await pdf(
                <AttendanceStatsPDF
                    courseName={courseInfo.level.course.name}
                    levelName={courseInfo.level.name}
                    startDate={statsDateRange.start}
                    endDate={statsDateRange.end}
                    teacherName={`${user?.firstName} ${user?.paternalSurname}`}
                    userWhoGenerated={`${user?.firstName} ${user?.paternalSurname}`}
                    totalClasses={data.period.totalClasses}
                    stats={data.stats}
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setShowStatsModal(false);
        } catch (error) {
             console.error('Error generating stats:', error);
             Swal.fire('Error', 'No se pudo generar el reporte estadístico', 'error');
        } finally {
            setGeneratingReport(false);
        }
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <button 
                        onClick={() => navigate('/teacher/courses')}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#004694] transition-colors mb-2"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a Mis Cursos</span>
                    </button>
                    <h1 className="text-3xl font-bold text-[#004694]">
                        Control de Asistencia
                    </h1>
                    <p className="text-gray-500">
                        {courseInfo?.level?.course?.name} - {courseInfo?.level?.name}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowStatsModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#004694] hover:bg-[#003da5] text-white rounded-xl transition-colors shadow-sm"
                    >
                         <FileBarChart size={20} />
                         <span>Reportes (Stats)</span>
                    </button>
                    <button
                        onClick={() => handlePrintDailyReport()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#BF0811] hover:bg-[#a3070f] text-white rounded-xl transition-colors shadow-sm"
                    >
                         <Printer size={20} />
                         <span>Imprimir Día</span>
                    </button>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Guardar Cambios</span>
                    </button>
                </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-blue-50 text-[#004694] rounded-lg">
                    <Calendar size={24} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Asistencia</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-[#004694] focus:border-[#004694] block w-full p-2.5"
                    />
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-sm text-gray-500">Total Estudiantes</div>
                    <div className="text-2xl font-bold text-gray-900">{attendanceList.length}</div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs">Estudiante</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-3">
                                            <Loader className="animate-spin" size={24} />
                                            <span>Cargando lista de estudiantes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendanceList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        No hay estudiantes inscritos en este curso.
                                    </td>
                                </tr>
                            ) : (
                                attendanceList.map((record) => (
                                    <tr key={record.enrollmentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                                    {record.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {record.studentName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{record.registrationCode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(record.enrollmentId, AttendanceStatus.PRESENT)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        record.status === AttendanceStatus.PRESENT 
                                                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500 shadow-sm' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                    title="Presente"
                                                >
                                                    <Check size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(record.enrollmentId, AttendanceStatus.ABSENT)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        record.status === AttendanceStatus.ABSENT 
                                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500 shadow-sm' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                    title="Ausente"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(record.enrollmentId, AttendanceStatus.LATE)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        record.status === AttendanceStatus.LATE 
                                                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500 shadow-sm' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                    title="Atraso"
                                                >
                                                    <Clock size={20} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                placeholder="Agregar observación..." 
                                                value={record.notes || ''}
                                                onChange={(e) => {
                                                    useAttendanceStore.getState().updateLocalStatus(record.enrollmentId, undefined, e.target.value);
                                                }}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Report Modal */}
            {showStatsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <FileBarChart className="text-[#004694]" /> Generar Reporte Estadístico
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    value={statsDateRange.start}
                                    onChange={(e) => setStatsDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#004694] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    value={statsDateRange.end}
                                    onChange={(e) => setStatsDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#004694] outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowStatsModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDownloadStatsReport}
                                disabled={generatingReport}
                                className="px-4 py-2 bg-[#004694] hover:bg-[#003da5] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                            >
                                {generatingReport ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                                Generar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendancePage;
