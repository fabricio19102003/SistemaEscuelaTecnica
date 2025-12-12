
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Student, AcademicHistoryRecord } from '../../types/student.types';
import logoUap from '../../assets/images/logo_uap_official.png';

// Register fonts (Standard Helvetica is safer)
// Font.register({ family: 'Open Sans', ... });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#000000',
        paddingBottom: 50 // Increased padding for footer
    },
    header: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 10,
        alignItems: 'center'
    },
    logo: {
        width: 60,
        height: 60,
        objectFit: 'contain',
        marginRight: 15
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    universityName: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4
    },
    subHeader: {
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
        textAlign: 'center'
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
        textTransform: 'uppercase',
        textDecoration: 'underline'
    },
    
    // Student Info Grid
    infoContainer: {
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 20
    },
    infoRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000'
    },
    infoRowLast: {
        flexDirection: 'row',
        borderBottomWidth: 0
    },
    infoLabel: {
        width: '20%',
        backgroundColor: '#f0f0f0',
        padding: 4,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderRightColor: '#000000',
        fontSize: 8
    },
    infoValue: {
        width: '30%',
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1,
        borderRightColor: '#000000'
    },
    
    // Grades Table
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 20
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        alignItems: 'center',
        minHeight: 25
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        alignItems: 'center',
        minHeight: 20
    },
    tableHeaderCell: {
        padding: 4,
        fontWeight: 'bold',
        fontSize: 7,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000000'
    },
    tableCell: {
        padding: 4,
        fontSize: 7,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000000'
    },

    // Column Widths
    colGestion: { width: '10%' },
    colPeriodo: { width: '10%' },
    colCodigo: { width: '10%' },
    colAsignatura: { width: '30%', textAlign: 'left' },
    colNivel: { width: '20%', textAlign: 'left' },
    colNota: { width: '10%' },
    colEstado: { width: '10%', borderRightWidth: 0 },

    // Footer / Signatures
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 60,
        marginBottom: 20
    },
    signatureBlock: {
        alignItems: 'center',
        width: '45%' // Increased width for longer titles
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000000',
        width: '100%',
        marginBottom: 5
    },
    signatureText: {
        fontSize: 8,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    // Footer with audit info
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 6,
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 5,
    }
});

interface AcademicHistoryPDFProps {
    student: Student;
    history: AcademicHistoryRecord[];
    userWhoGenerated: string;
    clientIp: string;
}

export const AcademicHistoryPDF: React.FC<AcademicHistoryPDFProps> = ({ student, history, userWhoGenerated, clientIp }) => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoUap} style={styles.logo} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.universityName}>UNIVERSIDAD AMAZÓNICA DE PANDO</Text>
                        <Text style={styles.subHeader}>VICERRECTORADO</Text>
                        <Text style={styles.subHeader}>DIRECCIÓN ACADÉMICA</Text>
                        <Text style={styles.subHeader}>CENTRO DE PROYECTOS ESPECIALES Y FORMACIÓN PERMANENTE</Text>
                    </View>
                </View>

                <Text style={styles.reportTitle}>HISTORIAL ACADÉMICO</Text>

                {/* Student Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ESTUDIANTE:</Text>
                        <Text style={[styles.infoValue, { width: '80%' }]}>
                            {student.user.firstName} {student.user.paternalSurname} {student.user.maternalSurname || ''}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CÓDIGO:</Text>
                        <Text style={styles.infoValue}>{student.registrationCode}</Text>
                        <Text style={styles.infoLabel}>C.I.:</Text>
                        <Text style={[styles.infoValue, { borderRightWidth: 0 }]}>{student.documentNumber}</Text>
                    </View>
                    <View style={styles.infoRowLast}>
                        <Text style={styles.infoLabel}>PROGRAMA:</Text>
                        <Text style={[styles.infoValue, { width: '80%', borderRightWidth: 0 }]}>
                            PROGRAMA DE INGLES
                        </Text>
                    </View>
                </View>

                {/* Grades Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderCell, styles.colGestion]}>GESTIÓN</Text>
                        <Text style={[styles.tableHeaderCell, styles.colPeriodo]}>PERIODO</Text>
                        <Text style={[styles.tableHeaderCell, styles.colCodigo]}>CÓDIGO</Text>
                        <Text style={[styles.tableHeaderCell, styles.colAsignatura, {textAlign: 'center'}]}>MODULO</Text>
                        <Text style={[styles.tableHeaderCell, styles.colNivel, {textAlign: 'center'}]}>NIVEL</Text>
                        <Text style={[styles.tableHeaderCell, styles.colNota]}>NOTA</Text>
                        <Text style={[styles.tableHeaderCell, styles.colEstado]}>ESTADO</Text>
                    </View>

                    {history.map((record, index) => (
                        <View key={record.id} style={[styles.tableRow, index === history.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                            <Text style={[styles.tableCell, styles.colGestion]}>{String(record.year)}</Text>
                            <Text style={[styles.tableCell, styles.colPeriodo]}>{String(record.period)}</Text>
                            <Text style={[styles.tableCell, styles.colCodigo]}>{record.courseCode || '-'}</Text>
                            <Text style={[styles.tableCell, styles.colAsignatura]}>{record.courseName}</Text>
                            <Text style={[styles.tableCell, styles.colNivel]}>{record.levelName}</Text>
                            <Text style={[styles.tableCell, styles.colNota, { fontWeight: 'bold' }]}>
                                {record.finalGrade !== null ? Number(record.finalGrade).toFixed(2) : '-'}
                            </Text>
                            <Text style={[styles.tableCell, styles.colEstado]}>
                                {record.status === 'ACTIVE' ? 'CURSANDO' : record.status.toUpperCase()}
                            </Text>
                        </View>
                    ))}
                    
                    {history.length === 0 && (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', padding: 10, borderRightWidth: 0 }]}>
                                No hay registros académicos disponibles.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Signatures */}
                <View style={styles.signatures}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Responsable de Escuela Técnica</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Responsable del Centro de Proyectos Especiales y Formación Permanente</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                     <Text>Generado por: {userWhoGenerated} | Fecha: {currentDate} {currentTime} | IP: {clientIp} | El documento se genero desde el sistema de informacion Escuela Técnica de la U.A.P.</Text>
                </View>
            </Page>
        </Document>
    );
};
