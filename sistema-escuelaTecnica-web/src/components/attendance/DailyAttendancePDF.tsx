import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
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
    colName: { width: '40%' },
    colCode: { width: '15%' },
    colStatus: { width: '15%' },
    colNotes: { width: '25%', borderRightWidth: 0 },

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

interface DailyAttendancePDFProps {
    courseName?: string;
    levelName?: string;
    date: string;
    teacherName?: string;
    students: any[];
    userWhoGenerated?: string;
}

const DailyAttendancePDF = ({ courseName, levelName, date, teacherName, students, userWhoGenerated }: DailyAttendancePDFProps) => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
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

                <Text style={styles.title}>LISTA DE ASISTENCIA DIARIA</Text>

                {/* Info Table */}
                 <View style={styles.infoTable}>
                    <View style={styles.row}>
                        <Text style={[styles.labelCell, { width: '15%' }]}>CURSO/NIVEL:</Text>
                        <Text style={[styles.valueCell, { width: '35%' }]}>{courseName} - {levelName}</Text>
                        <Text style={[styles.labelCell, { width: '15%' }]}>FECHA:</Text>
                        <Text style={[styles.valueCell, { width: '35%', borderRightWidth: 0 }]}>{date}</Text>
                    </View>
                    <View style={[styles.row, styles.lastRow]}>
                        <Text style={[styles.labelCell, { width: '15%' }]}>DOCENTE:</Text>
                        <Text style={[styles.valueCell, { width: '85%', borderRightWidth: 0 }]}>{teacherName}</Text>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.gradesTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.colNo]}>#</Text>
                        <Text style={[styles.th, styles.colName]}>ESTUDIANTE</Text>
                        <Text style={[styles.th, styles.colCode]}>CÓDIGO</Text>
                        <Text style={[styles.th, styles.colStatus]}>ESTADO</Text>
                        <Text style={[styles.th, styles.colNotes]}>OBSERVACIONES</Text>
                    </View>

                    {/* Table Body */}
                    {students.map((student, index) => {
                        let statusText = '-';
                        if (student.status === 'PRESENT') statusText = 'PRESENTE';
                        if (student.status === 'ABSENT') statusText = 'FALTA';
                        if (student.status === 'LATE') statusText = 'TARDANZA';
                        
                        return (
                            <View key={index} style={[styles.tableRow, index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }]}>
                                <Text style={[styles.td, styles.colNo]}>{index + 1}</Text>
                                <Text style={[styles.td, styles.colName, styles.tdLeft]}>{student.studentName}</Text>
                                <Text style={[styles.td, styles.colCode]}>{student.registrationCode}</Text>
                                <Text style={[styles.td, styles.colStatus]}>{statusText}</Text>
                                <Text style={[styles.td, styles.colNotes]}>{student.notes || ''}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                {/* <View style={{ marginTop: 5 }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>Leyenda: P = Presente, F = Falta/Ausente, T = Tardanza</Text>
                </View> */}

                {/* Footer */}
                <View style={styles.footer}>
                     <Text>Generado por: {userWhoGenerated || teacherName} | Fecha: {currentDate} {currentTime} | El documento se generó desde el sistema de información Escuela Técnica de la U.A.P.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default DailyAttendancePDF;
