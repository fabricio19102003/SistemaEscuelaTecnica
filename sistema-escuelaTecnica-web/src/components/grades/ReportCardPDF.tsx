import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import logoUap from '../../assets/images/logo_uap.png';
import logoCentro from '../../assets/images/logo_centro.png';

// Register fonts if needed, but standard Helvetica is fine for now.

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    // Header
    header: {
        flexDirection: 'row',
        marginBottom: 10,
        border: '2pt solid #000',
        height: 80,
    },
    logoContainer: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#90EE90',
        padding: 5,
    },
    logo: {
        width: 60,
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
        border: '2pt solid #000',
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
        border: '2pt solid #000',
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    descCell: {
        width: '20%',
        padding: 5,
        fontSize: 9,
        borderRight: '1pt solid #000',
        justifyContent: 'center',
    },
    commentCell: {
        width: '65%',
        padding: 5,
        fontSize: 9,
        minHeight: 40,
    },
    overallRow: {
        flexDirection: 'row',
        backgroundColor: '#FFA500',
        borderBottom: '1pt solid #000',
        padding: 5,
    },
    // Status
    statusSection: {
        marginTop: 10,
        border: '2pt solid #000',
        padding: 10,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    passToText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Signatures
    signatures: {
        flexDirection: 'row',
        marginTop: 30,
        border: '2pt solid #000',
    },
    sigCell: {
        width: '50%',
        height: 80,
        borderRight: '1pt solid #000',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 10,
    },
    sigLine: {
        borderTop: '2pt dotted #000',
        width: '80%',
        textAlign: 'center',
        paddingTop: 5,
    },
});

const ReportCardPDF = ({ data }: { data: any }) => {
    const { student, group, grades, calculatedAverage } = data;
    const { user } = student;
    const fullName = `${user.firstName} ${user.paternalSurname} ${user.maternalSurname || ''}`;
    const courseName = group?.level?.course?.name || 'N/A';
    const period = new Date().getFullYear().toString(); // Could be improved
    const date = new Date().toLocaleDateString();

    const getGrade = (type: string) => {
        const g = grades.find((gr: any) => gr.evaluationType === type);
        return {
            score: g ? Number(g.gradeValue) : 0,
            comments: g?.comments || ''
        };
    };

    const competencies = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR'];

    const passed = calculatedAverage >= 51;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {/* Use remote or base64 if local imports fail in dev, but imports usually work with vite */}
                         <Image src={logoUap} style={styles.logo} />
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.universityName}>AMAZONIC PANDO UNIVERSITY</Text>
                        <Text style={styles.departmentName}>SPECIAL PROJECTS CENTER AND PERMANENT EDUCATION</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Image src={logoCentro} style={styles.logo} />
                    </View>
                </View>

                {/* Student Info */}
                <View style={styles.studentInfo}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoCell, { width: '60%' }]}>
                            <Text><Text style={styles.infoLabel}>Student's name: </Text>{fullName}</Text>
                        </View>
                        <View style={[styles.infoCell, { width: '40%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Date: </Text>{date}</Text>
                        </View>
                    </View>
                    <View style={[styles.infoRow, { borderBottom: 'none' }]}>
                        <View style={[styles.infoCell, { width: '60%' }]}>
                            <Text><Text style={styles.infoLabel}>Course: </Text>{courseName} / {group?.level?.name}</Text>
                        </View>
                         <View style={[styles.infoCell, { width: '40%', borderRight: 'none' }]}>
                            <Text><Text style={styles.infoLabel}>Schedule: </Text>{/* Logic for schedule string */}</Text>
                        </View>
                    </View>
                </View>

                {/* Grades Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, { width: '20%' }]}>Skills</Text>
                        <Text style={[styles.th, { width: '15%' }]}>Score</Text>
                        <Text style={[styles.th, { width: '65%', borderRight: 'none' }]}>Teacher's comments</Text>
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
                        <Text style={{ width: '20%', fontWeight: 'bold' }}>Overall performance</Text>
                        <Text style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>{Math.round(calculatedAverage)}</Text>
                        <Text style={{ width: '65%', textAlign: 'right', paddingRight: 10 }}>Absences: {data.absences || 0}</Text>
                    </View>
                </View>

                {/* Status */}
                <View style={styles.statusSection}>
                    <Text style={[styles.statusText, { color: passed ? '#000' : '#D32F2F' }]}>
                        {passed ? '' : 'Repeat: You failed the course'}
                    </Text>
                    <Text style={styles.passToText}>
                        Pass to: <Text style={{ color: passed ? '#388E3C' : '#D32F2F' }}>
                            {passed ? 'PROXIMO NIVEL' : 'REPROBADO'}
                        </Text>
                    </Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatures}>
                    <View style={styles.sigCell}>
                        <Text style={styles.sigLine}>Teacher's signature</Text>
                    </View>
                    <View style={[styles.sigCell, { borderRight: 'none' }]}>
                        <Text style={styles.sigLine}>Responsable's signatures</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ReportCardPDF;
