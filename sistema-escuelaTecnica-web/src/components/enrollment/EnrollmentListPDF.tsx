import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoUap from '../../assets/images/logo_uap_official.png';

const styles = StyleSheet.create({
    page: {
        width: '210mm',
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
        paddingRight: 80, 
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
    // Title
    title: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        marginVertical: 10,
        textTransform: 'uppercase',
    },
    // Info Table
    infoTable: {
        display: 'flex',
        width: '100%',
        marginBottom: 15,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    labelCell: {
        padding: 5,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        width: '20%',
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    valueCell: {
        padding: 5,
        width: '30%',
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    // Main Table
    gradesTable: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0', 
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    th: {
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    td: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontSize: 8,
        textAlign: 'center'
    },
    tdLeft: {
        textAlign: 'left',
        paddingLeft: 8
    },
    
    // Column Widths
    colNo: { width: '5%' },
    colRe: { width: '15%' },
    colCi: { width: '15%' },
    colName: { width: '45%' },
    colDate: { width: '20%', borderRightWidth: 0 },

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

interface EnrollmentListPDFProps {
    data: any[]; // Array of enrollments
    filterInfo: {
        year: string;
        academicPeriod: string;
        moduleName: string;
    };
    userWhoGenerated: string;
    clientIp: string;
}

const EnrollmentListPDF: React.FC<EnrollmentListPDFProps> = ({ data, filterInfo, userWhoGenerated, clientIp }) => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* HEADERS */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Image src={logoUap} style={styles.logo} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.universityName}>UNIVERSIDAD AMAZÓNICA DE PANDO</Text>
                        <Text style={styles.viceRectorado}>VICE-RECTORADO</Text>
                        <Text style={styles.departmentName}>DIRECCIÓN ACADÉMICA PEDAGÓGICA</Text>
                        <Text style={styles.departmentName}>UNIDAD DE PROGRAMAS ESPECIALES</Text>
                    </View>
                </View>

                <Text style={styles.title}>LISTA DE ESTUDIANTES MATRICULADOS</Text>

                {/* INFO FILTERS */}
                <View style={styles.infoTable}>
                    <View style={styles.row}>
                        <Text style={[styles.labelCell, { width: '15%' }]}>GESTIÓN:</Text>
                        <Text style={[styles.valueCell, { width: '15%' }]}>{filterInfo.year || 'TODAS'}</Text>
                        <Text style={[styles.labelCell, { width: '30%' }]}>PERIODO ACADÉMICO:</Text>
                        <Text style={[styles.valueCell, { width: '40%', borderRightWidth: 0 }]}>{filterInfo.academicPeriod ? `${filterInfo.academicPeriod}/${filterInfo.year}` : 'TODOS'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelCell}>FECHA REPORTE:</Text>
                        <Text style={[styles.valueCell, { width: '80%', borderRightWidth: 0 }]}>{currentDate} {currentTime}</Text>
                    </View>
                    <View style={[styles.row, styles.lastRow]}>
                        <Text style={styles.labelCell}>MÓDULO:</Text>
                        <Text style={[styles.valueCell, { width: '80%', borderRightWidth: 0 }]}>{filterInfo.moduleName || 'TODOS LOS MÓDULOS'}</Text>
                    </View>
                </View>

                {/* TABLE */}
                <View style={styles.gradesTable}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.th, styles.colNo]}>N°</Text>
                        <Text style={[styles.th, styles.colRe]}>R.E.</Text>
                        <Text style={[styles.th, styles.colCi]}>C.I.</Text>
                        <Text style={[styles.th, styles.colName]}>APELLIDOS Y NOMBRES</Text>
                        <Text style={[styles.th, styles.colDate]}>FECHA MATRÍCULA</Text>
                    </View>

                    {data.length === 0 ? (
                         <View style={styles.tableRow}>
                            <Text style={[styles.td, { width: '100%', borderRightWidth: 0 }]}>No se encontraron estudiantes registrados para los filtros seleccionados.</Text>
                         </View>
                    ) : (
                        data.map((enrollment, index) => {
                            const student = enrollment.student;
                            const fullName = `${student.user.paternalSurname} ${student.user.maternalSurname || ''} ${student.user.firstName}`.toUpperCase();
                            
                            return (
                                <View key={enrollment.id} style={[styles.tableRow, index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }]}>
                                    <Text style={[styles.td, styles.colNo]}>{index + 1}</Text>
                                    <Text style={[styles.td, styles.colRe]}>{student.registrationCode || '-'}</Text>
                                    <Text style={[styles.td, styles.colCi]}>{student.documentNumber}</Text>
                                    <Text style={[styles.td, styles.colName, styles.tdLeft]}>{fullName}</Text>
                                    <Text style={[styles.td, styles.colDate]}>{new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES')}</Text>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={styles.footer}>
                    <Text>Generado por: {userWhoGenerated} | Fecha: {currentDate} {currentTime} | IP: {clientIp} | El documento se genero desde el sistema de informacion Escuela Técnica de la U.A.P.</Text>
                </View>

            </Page>
        </Document>
    );
};

export default EnrollmentListPDF;
