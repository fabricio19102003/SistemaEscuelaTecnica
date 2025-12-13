import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 10
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#1a365d'
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666666'
    },
    section: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f3f4f6',
        padding: 5,
        color: '#1f2937'
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 5,
        alignItems: 'center'
    },
    headerRow: {
        backgroundColor: '#374151',
        paddingVertical: 6
    },
    col1: { width: '40%', paddingLeft: 5 },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '20%', textAlign: 'center' },
    col4: { width: '20%', textAlign: 'center' },
    
    text: { fontSize: 10, color: '#374151' },
    headerText: { fontSize: 10, color: '#ffffff', fontWeight: 'bold' },
    
    summaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20
    },
    card: {
        width: '30%',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4
    },
    cardTitle: { fontSize: 10, color: '#64748b', marginBottom: 5 },
    cardValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
        paddingTop: 10
    }
});

interface StatsData {
    courseName: string;
    totalStudents: number;
    averageScore: number;
    passRate: number;
    competencyAverages: { name: string; average: number }[];
    studentPerformance: { name: string; average: number; status: string }[];
    financialStats?: { name: string; totalRevenue: number }[];
    topStudents?: { name: string; average: number }[];
    bestIndividualGrades?: { studentName: string; course: string; evaluation: string; grade: number }[];
}

const StatsReportPDF: React.FC<{ data: StatsData }> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte Estadístico de Rendimiento</Text>
                    <Text style={styles.subtitle}>Curso: {data.courseName}</Text>
                    <Text style={styles.subtitle}>Fecha de Emisión: {new Date().toLocaleDateString()}</Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryBox}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Total Estudiantes</Text>
                        <Text style={styles.cardValue}>{data.totalStudents}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Promedio General</Text>
                        <Text style={styles.cardValue}>{data.averageScore.toFixed(1)}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Tasa de Aprobación</Text>
                        <Text style={styles.cardValue}>{data.passRate.toFixed(1)}%</Text>
                    </View>
                </View>

                {/* Financial Stats Section */}
                {data.financialStats && data.financialStats.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingresos Recaudados</Text>
                        <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.col1, styles.headerText, { width: '70% '}]}>Curso</Text>
                            <Text style={[styles.col2, styles.headerText, { width: '30%' }]}>Ingresos (Bs)</Text>
                        </View>
                        {data.financialStats.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={[styles.col1, styles.text, { width: '70%' }]}>{item.name}</Text>
                                <Text style={[styles.col2, styles.text, { width: '30%' }]}>{item.totalRevenue.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Top Students Section */}
                {data.topStudents && data.topStudents.length > 0 && (
                     <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mejores Promedios (Top 5)</Text>
                        <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.col1, styles.headerText, { width: '70%' }]}>Estudiante</Text>
                            <Text style={[styles.col2, styles.headerText, { width: '30%' }]}>Promedio</Text>
                        </View>
                        {data.topStudents.map((student, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={[styles.col1, styles.text, { width: '70%' }]}>{index + 1}. {student.name}</Text>
                                <Text style={[styles.col2, styles.text, { width: '30%' }]}>{student.average.toFixed(1)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                 {/* Best Individual Grades Section */}
                 {data.bestIndividualGrades && data.bestIndividualGrades.length > 0 && (
                     <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mejores Notas Individuales (Top 5)</Text>
                        <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.col1, styles.headerText, { width: '40%' }]}>Estudiante</Text>
                            <Text style={[styles.col2, styles.headerText, { width: '30%' }]}>Competencia</Text>
                            <Text style={[styles.col3, styles.headerText, { width: '30%' }]}>Nota</Text>
                        </View>
                        {data.bestIndividualGrades.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={[styles.col1, styles.text, { width: '40%' }]}>{item.studentName}</Text>
                                <Text style={[styles.col2, styles.text, { width: '30%' }]}>{item.evaluation}</Text>
                                <Text style={[styles.col3, styles.text, { width: '30%' }]}>{item.grade}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Competency Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Promedio por Competencia</Text>
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.col1, styles.headerText, { width: '70%' }]}>Competencia</Text>
                        <Text style={[styles.col2, styles.headerText, { width: '30%' }]}>Promedio</Text>
                    </View>
                    {data.competencyAverages.map((comp, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={[styles.col1, styles.text, { width: '70%' }]}>{comp.name}</Text>
                            <Text style={[styles.col2, styles.text, { width: '30%' }]}>{comp.average.toFixed(1)}</Text>
                        </View>
                    ))}
                </View>

                {/* Detailed Student Performance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalle por Estudiante</Text>
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.col1, styles.headerText]}>Nombre Estudiante</Text>
                        <Text style={[styles.col4, styles.headerText]}>Promedio</Text>
                        <Text style={[styles.col4, styles.headerText]}>Estado</Text>
                    </View>
                    {data.studentPerformance.map((student, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={[styles.col1, styles.text]}>{student.name}</Text>
                            <Text style={[styles.col4, styles.text]}>{student.average > 0 ? student.average.toFixed(1) : '-'}</Text>
                            <Text style={[styles.col4, styles.text, { 
                                color: student.status === 'Aprobado' ? '#059669' : 
                                       student.status === 'Reprobado' ? '#dc2626' : '#6b7280'
                            }]}>
                                {student.status}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text>Sistema Escuela Técnica - Generado automáticamente</Text>
                </View>
            </Page>
        </Document>
    );
};

export default StatsReportPDF;
