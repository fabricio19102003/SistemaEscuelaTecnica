import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoUap from '../../assets/images/logo_uap.png';
import logoCentro from '../../assets/images/logo_centro.png';

const styles = StyleSheet.create({
    page: {
        paddingTop: '2cm', // Reduced to 2cm as requested
        paddingBottom: '1cm',
        paddingLeft: '2.54cm',
        paddingRight: '2.54cm',
        fontFamily: 'Times-Roman',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    // Header
    header: {
        flexDirection: 'row',
        marginBottom: 10,
        border: '1pt solid #000',
        height: 90,
    },
    logoContainer: {
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#90EE90',
        padding: 5,
    },
    logo: {
        width: 70,
        height: 'auto',
    },
    headerCenter: {
        flex: 1,
        backgroundColor: '#90EE90',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderLeft: '1pt solid #000',
        borderRight: '1pt solid #000',
    },
    universityName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    departmentName: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Student Info
    studentInfo: {
        marginBottom: 0,
        border: '1pt solid #000',
        borderTop: 'none',
    },
    infoRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #000',
    },
    infoCell: {
        padding: 5,
        backgroundColor: '#90EE90',
        borderRight: '1pt solid #000',
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    // Grades Table
    table: {
        width: '100%',
        marginTop: 0,
        border: '1pt solid #000',
        borderTop: 'none',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#90EE90',
        borderBottom: '1pt solid #000',
        fontWeight: 'bold',
    },
    th: {
        padding: 5,
        borderRight: '1pt solid #000',
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
    },
    skillRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #000',
    },
    skillHeader: {
        backgroundColor: '#FFA500', 
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottom: '1pt solid #000',
    },
    scoreCell: {
        width: '15%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRight: '1pt solid #000',
        fontWeight: 'bold',
    },
    // Styles update
    descCell: {
        width: '30%', // Increased from 20%
        padding: 5,
        fontSize: 9,
        borderRight: '1pt solid #000',
        justifyContent: 'center',
    },
    commentCell: {
        width: '55%', // Decreased from 65%
        padding: 5,
        fontSize: 9,
        minHeight: 40,
    },
    // Missing styles added
    overallRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #000',
        padding: 5,
        backgroundColor: '#E0E0E0', 
    },
    statusSection: {
        marginTop: 20,
        marginBottom: 20,
        padding: 10,
        border: '1pt solid #000',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    passToText: {
        fontSize: 11,
        textAlign: 'center',
    },
    signatures: {
        flexDirection: 'row',
        marginTop: 45,
        width: '100%',
    },
    sigCell: {
        width: '50%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    sigLine: {
        borderTop: '1pt dotted #000',
        paddingTop: 5,
        textAlign: 'center',
        width: '80%',
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        textAlign: 'center',
        color: '#666',
        borderTop: '1pt solid #ccc',
        paddingTop: 5,
    },
});

interface ReportCardPDFProps {
    data: any;
    userWhoGenerated?: string;
    clientIp?: string;
}

const ReportCardPDF: React.FC<ReportCardPDFProps> = ({ data, userWhoGenerated, clientIp }) => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');

    // Extract data for display
    const studentName = data.studentName || 'ESTUDIANTE';
    const courseName = data.courseName || 'CURSO';
    const levelName = data.levelName || '';
    const teacherName = data.teacherName || '';
    const period = data.period || '';
    const schedule = data.schedule || '';

    // Calculate or extract calculated items
    const competencies = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR'];
    
    const getGrade = (comp: string) => {
        if (!data.grades) return { score: 0, comments: '' };
        const grade = data.grades.find((g: any) => g.evaluationType === comp);
        return grade ? { score: grade.gradeValue, comments: grade.comments } : { score: 0, comments: '' };
    };

    const calculatedAverage = data.finalScore || 0;
    // const passed = calculatedAverage >= 51; // This is used in the lower part of the file, assuming 'passed' is available in scope or needs to be calculated.
    // Looking at line 162 in original file: passed ? ... 
    // Usually passed is part of data or calculated. 
    const passed = data.passed !== undefined ? data.passed : calculatedAverage >= 51;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image src={logoUap} style={styles.logo} />
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.universityName}>UNIVERSIDAD AMAZÓNICA DE PANDO</Text>
                        <Text style={styles.departmentName}>CENTRO DE IDIOMAS Y RECURSOS DIDÁCTICOS</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Image src={logoCentro} style={styles.logo} />
                    </View>
                </View>

                {/* Student Info */}
                <View style={styles.studentInfo}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoCell, { width: '60%' }]}>
                            <Text><Text style={styles.infoLabel}>Student: </Text>{studentName}</Text>
                        </View>
                        <View style={[styles.infoCell, { width: '40%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Date: </Text>{currentDate}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoCell, { width: '50%' }]}>
                            <Text><Text style={styles.infoLabel}>Course: </Text>{courseName} - {levelName}</Text>
                        </View>
                        <View style={[styles.infoCell, { width: '50%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Period: </Text>{period}</Text>
                        </View>
                    </View>
                    <View style={[styles.infoRow, { borderBottom: 'none' }]}>
                        <View style={[styles.infoCell, { width: '60%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Teacher: </Text>{teacherName}</Text>
                        </View>
                         <View style={[styles.infoCell, { width: '40%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Schedule: </Text>{schedule}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, { width: '30%' }]}>Skills</Text>
                        <Text style={[styles.th, { width: '15%' }]}>Score</Text>
                        <Text style={[styles.th, { width: '55%', borderRight: 'none' }]}>Teacher's comments</Text>
                    </View>

                    {competencies.map(comp => {
                        const grade = getGrade(comp);
                        return (
                            <View key={comp} wrap={false}>
                                <Text style={styles.skillHeader}>{comp}</Text>
                                <View style={styles.skillRow}>
                                    <View style={styles.descCell}>
                                        <Text>Progress test</Text>
                                        <Text>Class performance</Text>
                                    </View>
                                    <View style={styles.scoreCell}>
                                        <Text>{grade.score}</Text>
                                    </View>
                                    <View style={styles.commentCell}>
                                        <Text>{grade.comments}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.overallRow}>
                        <Text style={{ width: '30%', fontWeight: 'bold' }}>Overall performance</Text>
                        <Text style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>{Math.round(calculatedAverage)}</Text>
                        <Text style={{ width: '55%', textAlign: 'right', paddingRight: 10 }}>Absences: {data.absences || 0}</Text>
                    </View>

                    {/* Status merged into table */}
                    {/* Status merged into table */}
                    <View style={[styles.overallRow, { borderBottom: 'none', flexDirection: 'column', alignItems: 'center', padding: 2, backgroundColor: '#FFFFFF' }]}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 0, color: passed ? '#000' : '#D32F2F', textAlign: 'center' }}>
                            {passed ? '' : 'Repeat: You failed the course'}
                        </Text>
                        <Text style={{ fontSize: 11, textAlign: 'center' }}>
                            Pass to: <Text style={{ color: passed ? '#388E3C' : '#D32F2F' }}>
                                {passed ? 'PROXIMO NIVEL' : 'REPROBADO'}
                            </Text>
                        </Text>
                    </View>
                </View>

                {/* Signatures */}
                <View style={styles.signatures}>
                    <View style={styles.sigCell}>
                        <Text style={styles.sigLine}>Teacher's signature</Text>
                    </View>
                    <View style={styles.sigCell}>
                        <Text style={styles.sigLine}>Responsable's signatures</Text>
                    </View>
                </View>

                 {/* Footer */}
                <View style={styles.footer}>
                     <Text>Generado por: {userWhoGenerated} | Fecha: {currentDate} {currentTime} | IP: {clientIp} | El documento se generó desde el sistema de información Escuela Técnica de la U.A.P.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ReportCardPDF;
