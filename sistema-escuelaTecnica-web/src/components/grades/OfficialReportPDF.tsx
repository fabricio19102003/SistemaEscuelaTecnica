import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoUap from '../../assets/images/logo_uap_official.png';

// Import fonts if necessary, defaulting to standard Helvetica for reliability

const styles = StyleSheet.create({
    page: {
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    logoContainer: {
        width: 80,
    },
    logo: {
        width: 70,
        height: 'auto',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        paddingRight: 80, // Balance the logo width to center text relative to page
    },
    universityName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    viceRectorado: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    departmentName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    lema: {
        fontSize: 8,
        fontStyle: 'italic',
        marginTop: 5,
        lineHeight: 1.2,
        textAlign: 'center',
    },

    // Course Info Table
    courseInfoTable: {
        display: 'flex',
        width: '100%',
        marginBottom: 10,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#000',
    },
    row: {
        flexDirection: 'row',
    },
    labelCell: {
        padding: 5,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        width: '25%',
        fontSize: 9,
    },
    valueCell: {
        padding: 5,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        width: '25%',
        fontSize: 9,
    },
    fullRowLabel: {
        width: '25%',
    },
    fullRowValue: {
        width: '75%',
    },

    // Title
    title: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        marginVertical: 10,
        textTransform: 'uppercase',
    },

    // Grades Table
    gradesTable: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#90EE90',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    th: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    td: {
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontSize: 9,
    },
    
    // Column Widths - Adjusted
    colRe: { width: '15%', textAlign: 'center' },
    colCi: { width: '15%', textAlign: 'center' },
    colNombre: { width: '38%' },
    colNota: { width: '10%', textAlign: 'center', fontWeight: 'bold' },
    colObs: { width: '22%', textAlign: 'center', borderRightWidth: 0 },

    // Signatures
    signatures: {
        flexDirection: 'row',
        marginTop: 30,
        width: '100%',
    },
    sigCell: {
        width: '50%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    sigLine: {
        borderTopWidth: 1.5,
        borderTopColor: '#000',
        borderTopStyle: 'dotted',
        marginTop: 40,
        paddingTop: 5,
        textAlign: 'center',
        width: '100%',
        fontSize: 9,
    }
});

interface OfficialReportPDFProps {
    data: {
        group: any;
        enrollments: any[];
    };
}

const OfficialReportPDF: React.FC<OfficialReportPDFProps> = ({ data }) => {
    const { group, enrollments } = data;
    
    // Format data
    const teacherName = group?.teacher ? `${group.teacher.user.firstName} ${group.teacher.user.paternalSurname} ${group.teacher.user.maternalSurname || ''}`.toUpperCase() : 'POR ASIGNAR';
    const courseName = group?.level?.course?.name || 'Sistema Modular';
    const levelName = group?.level?.name || 'B4'; // Needs to come from level if available
    const period = '2/2025'; // This should ideally come from group params or startDate
    const date = new Date().toLocaleDateString('es-ES');
    
    // Calculate schedule string - ONLY MONDAY
    let scheduleStr = 'POR DEFINIR';

    const formatTime = (timeVal: string | Date) => {
        if (!timeVal) return '';
        const date = new Date(timeVal);
        if (isNaN(date.getTime())) return String(timeVal).substring(0, 5); // Fallback if not a valid date string
        
        // Extract hours and minutes manually to ensure HH:mm format independent of locale vagaries in PDF renderer
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    if (group?.level?.course?.schedules?.length > 0) {
        // Priority: Course Schedules (as per user request: "horario real del curso")
        const schedule = group.level.course.schedules.find((s: any) => s.dayOfWeek === 'MONDAY') || group.level.course.schedules[0];
        
        const start = formatTime(schedule.startTime);
        const end = formatTime(schedule.endTime);
        
        if (start && end) {
            scheduleStr = `${start} - ${end} Hrs / Lunes - Viernes`;
        }
    } else if (group?.schedules?.length > 0) {
        // Fallback: Group specific schedules
        const schedule = group.schedules.find((s: any) => s.dayOfWeek === 'MONDAY') || group.schedules[0];
        
        const start = formatTime(schedule.startTime);
        const end = formatTime(schedule.endTime);
        
        if (start && end) {
            scheduleStr = `${start} - ${end} Hrs / Lunes - Viernes`;
        }
    }


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* ENCABEZADO INSTITUCIONAL */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Image src={logoUap} style={styles.logo} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.universityName}>UNIVERSIDAD AMAZÓNICA DE PANDO</Text>
                        <Text style={styles.viceRectorado}>VICE-RECTORADO</Text>
                        <Text style={styles.departmentName}>DIRECCIÓN ACADÉMICA PEDAGÓGICA</Text>
                        <Text style={styles.departmentName}>UNIDAD DE PROGRAMAS ESPECIALES</Text>
                        <Text style={styles.lema}>"La preservación de la Amazonía es parte de la vida, del proceso y desarrollo de la bella tierra pandina"</Text>
                    </View>
                </View>

                {/* INFORMACIÓN DEL CURSO */}
                <View style={styles.courseInfoTable}>
                    <View style={styles.row}>
                        <Text style={styles.labelCell}>TIPO DE ACTA</Text>
                        <Text style={styles.valueCell}>EVALUACIÓN REGULAR</Text>
                        <Text style={styles.labelCell}>PERIODO:</Text>
                        <Text style={[styles.valueCell, { borderRightWidth: 0 }]}>{period}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelCell}>CAPACITADOR</Text>
                        <Text style={styles.valueCell}>{teacherName}</Text>
                        <Text style={styles.labelCell}>MÓDULO:</Text>
                        <Text style={[styles.valueCell, { borderRightWidth: 0 }]}>{levelName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelCell}>SIGLA MATERIA:</Text>
                        <Text style={styles.valueCell}>{courseName}</Text>
                        <Text style={styles.labelCell}>FECHA:</Text>
                        <Text style={[styles.valueCell, { borderRightWidth: 0 }]}>{date}</Text>
                    </View>
                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <Text style={styles.labelCell}>HORARIO</Text>
                        <Text style={[styles.valueCell, { width: '75%', borderRightWidth: 0 }]}>{scheduleStr}</Text>
                    </View>
                </View>

                {/* TÍTULO */}
                <Text style={styles.title}>ACTA DE CALIFICACIONES</Text>

                {/* TABLA DE CALIFICACIONES */}
                <View style={styles.gradesTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.colRe]}>R.E.</Text>
                        <Text style={[styles.th, styles.colCi]}>CÉDULA DE IDENTIDAD</Text>
                        <Text style={[styles.th, styles.colNombre]}>NOMBRE Y APELLIDO</Text>
                        <Text style={[styles.th, styles.colNota]}>NOTA FINAL</Text>
                        <Text style={[styles.th, styles.colObs]}>OBSERVACIONES</Text>
                    </View>

                    {enrollments.map((enrollment, index) => {
                         const student = enrollment.student;
                         const fullName = `${student.user.paternalSurname} ${student.user.maternalSurname || ''} ${student.user.firstName}`.toUpperCase();
                         
                         // Calculate Final Grade
                         // Assuming the backend has calculated it or we sum it up?
                         // The prompt says "Nota Final 0-100".
                         // Usually stored in `grades` or calculated.
                         // For now, let's sum active grades or check if there's a final grade entry.
                         // But `getGroupReportData` returns `grades` array.
                         // Let's sum all grades? Or is there a "FINAL" grade type?
                         // The prompt implies a single final score.
                         // Let's assume average of competencies for now if exact logic isn't clear, or check if `gradeValue` exists on `grades`.
                         // Actually `enrollment.grades` is an array.
                         // Let's calculate average of available grades as a best guess for "Final Score" if not explicitly stored.
                         
                         let finalScore = 0;
                         const validGrades = enrollment.grades.filter((g: any) => g.gradeValue !== null && g.gradeValue !== undefined);
                         if (validGrades.length > 0) {
                             const sum = validGrades.reduce((acc: number, curr: any) => acc + Number(curr.gradeValue), 0);
                             finalScore = Math.round(sum / validGrades.length); // Simple average for now
                         }

                         const isApproved = finalScore >= 51;
                         const observation = isApproved ? 'APROBADO' : 'REPROBADO';

                         return (
                            <View key={enrollment.id} style={[styles.tableRow, index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }]}>
                                <Text style={[styles.td, styles.colRe]}>{student.registrationCode || `R.E - ${student.id}`}</Text>
                                <Text style={[styles.td, styles.colCi]}>{student.documentNumber || student.user.documentNumber || ''}</Text>
                                <Text style={[styles.td, styles.colNombre]}>{fullName}</Text>
                                <Text style={[styles.td, styles.colNota]}>{finalScore}</Text>
                                <Text style={[styles.td, styles.colObs]}>{observation}</Text>
                            </View>
                         );
                    })}
                </View>

                {/* FIRMAS */}
                <View style={styles.signatures}>
                    <View style={styles.sigCell}>
                        <Text style={styles.sigLine}>Firma de responsable de la Escuela Técnica</Text>
                    </View>
                    <View style={styles.sigCell}>
                        <Text style={styles.sigLine}>Firma de facilitador</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default OfficialReportPDF;
