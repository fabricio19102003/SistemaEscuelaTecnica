import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoUap from '../../assets/images/logo_uap_official.png';

// Import fonts if necessary, defaulting to standard Helvetica for reliability

const styles = StyleSheet.create({
    page: {
        width: '210mm',
        paddingTop: '15mm',
        paddingLeft: '15mm',
        paddingRight: '15mm',
        paddingBottom: '30mm', // Increased to ensure footer space prevents orphan pages
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
        // Removed container borders to prevent layout engine freeze on page breaks
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
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 6,
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 5,
    }
});

interface OfficialReportPDFProps {
    data: {
        group: any;
        enrollments: any[];
    };
    userWhoGenerated: string;
    clientIp: string;
}

const OfficialReportPDF: React.FC<OfficialReportPDFProps> = ({ data, userWhoGenerated, clientIp }) => {
    const { group, enrollments } = data;
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');
    
    // Format data
    // Format data with defensive checks
    const teacherUser = group?.teacher?.user;
    const teacherName = teacherUser 
        ? `${teacherUser.firstName || ''} ${teacherUser.paternalSurname || ''} ${teacherUser.maternalSurname || ''}`.trim().toUpperCase() 
        : 'POR ASIGNAR';

    const courseName = group?.level?.course?.name || 'Sistema Modular';
    const levelName = group?.level?.name || 'B4';
    const period = '2/2025'; 
    const date = new Date().toLocaleDateString('es-ES');
    
    // Calculate schedule string - ONLY MONDAY
    let scheduleStr = 'POR DEFINIR';

    const formatTime = (timeVal: string | Date | null | undefined) => {
        if (!timeVal) return '';
        try {
            const dateObj = new Date(timeVal);
            if (isNaN(dateObj.getTime())) return String(timeVal).substring(0, 5);
            
            const hours = dateObj.getUTCHours().toString().padStart(2, '0');
            const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    // Safely access schedules
    const courseSchedules = group?.level?.course?.schedules;
    const groupSchedules = group?.schedules;

    if (Array.isArray(courseSchedules) && courseSchedules.length > 0) {
        const schedule = courseSchedules.find((s: any) => s.dayOfWeek === 'MONDAY') || courseSchedules[0];
        if (schedule) {
            const start = formatTime(schedule.startTime);
            const end = formatTime(schedule.endTime);
            if (start && end) {
                scheduleStr = `${start} - ${end} Hrs / Lunes - Viernes`;
            }
        }
    } else if (Array.isArray(groupSchedules) && groupSchedules.length > 0) {
        const schedule = groupSchedules.find((s: any) => s.dayOfWeek === 'MONDAY') || groupSchedules[0];
        if (schedule) {
            const start = formatTime(schedule.startTime);
            const end = formatTime(schedule.endTime);
            if (start && end) {
                scheduleStr = `${start} - ${end} Hrs / Lunes - Viernes`;
            }
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
                        <Text style={styles.departmentName}>DIRECCIÓN ACADÉMICA</Text>
                        <Text style={styles.departmentName}>CENTRO DE PROYECTOS ESPECIALES Y FORMACIÓN PERMANENTE</Text>
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

                    {Array.isArray(enrollments) && enrollments.map((enrollment, index) => {
                         const student = enrollment?.student;
                         if (!student || !student.user) return null;

                         const fullName = `${student.user.paternalSurname} ${student.user.maternalSurname || ''} ${student.user.firstName}`.toUpperCase();
                         
                         // Calculate Final Grade
                         let finalScore = 0;
                         const validGrades = Array.isArray(enrollment.grades) 
                            ? enrollment.grades.filter((g: any) => g.gradeValue !== null && g.gradeValue !== undefined)
                            : [];
                            
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

                {/* FOOTER */}
                <View style={styles.footer}>
                     <Text>Generado por: {userWhoGenerated} | Fecha: {currentDate} {currentTime} | IP: {clientIp} | El documento se genero desde el sistema de informacion Escuela Técnica de la U.A.P.</Text>
                </View>

            </Page>
        </Document>
    );
};

export default OfficialReportPDF;
