import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Register fonts if custom ones were actually available, but for now we use standard PDF fonts
// Times-Roman = Serif (Tinos-like)
// Helvetica = Sans-serif (Roboto-like)

const styles = StyleSheet.create({
  page: {
    padding: 30, // Approx 15mm ~ 42pt, keeping 30 for safety
    fontFamily: 'Times-Roman',
    fontSize: 10,
    backgroundColor: '#ffffff'
  },
  // Table Borders helper
  table: {
    width: '100%',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#000',
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  cell: {
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 4,
    justifyContent: 'center'
  },
  // Specific Styles
  headerTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10
  },
  logoCell: {
    width: '15%',
    borderRightWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 100,
    height: 70, 
    objectFit: 'contain'
  },
  uapText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5
  },
  titleCell: {
    width: '65%',
    borderRightWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold', // Using Helvetica-Bold for visual weight
    textAlign: 'center',
    lineHeight: 1.3
  },
  metaCell: {
    width: '20%',
    padding: 5,
    fontSize: 9, // Increased from 8
    textAlign: 'center',
    justifyContent: 'flex-start'
  },
  sectionTitle: {
    backgroundColor: '#d9d9d9',
    fontSize: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#000',
    borderBottomWidth: 0,
    textAlign: 'left',
    fontFamily: 'Helvetica'
  },
  // Form Body Styles
  label: {
    fontFamily: 'Times-Bold',
    fontSize: 10,
    backgroundColor: '#fafafa'
  },
  value: {
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  photoCell: {
    width: '20%',
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoPlaceholder: {
    width: 80, 
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nestTable: {
    margin: -4, // Counteract padding of parent cell to fill it
    flexDirection: 'column'
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerCol: {
    width: '30%',
    alignItems: 'center'
  },
  signLine: {
    borderTopWidth: 1,
    borderTopStyle: 'dotted',
    borderColor: '#000',
    width: '80%',
    marginBottom: 5
  },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  bold: { fontFamily: 'Times-Bold' },
  bgGrey: { backgroundColor: '#d9d9d9' },
  redText: { color: 'red' },
  
  // Credentials
  credentialsBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    backgroundColor: '#f9f9f9'
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 5
  }
});

interface EnrollmentPDFProps {
    data: any;
    credentials?: { username: string; password?: string };
}

const EnrollmentPDF = ({ data, credentials }: EnrollmentPDFProps) => {
    const student = data?.student;
    const user = student?.user;
    const group = data?.group;
    const level = group?.level;
    const course = level?.course;
    const createdBy = data?.createdBy;
    // const school = student?.school;
    // const agreement = data?.agreement;

    // Derived values
    const fullName = `${user?.firstName || ''} ${user?.paternalSurname || ''} ${user?.maternalSurname || ''}`.trim().toUpperCase();
    const courseName = course?.name?.toUpperCase() || 'CURSO SIN NOMBRE';
    const levelName = level?.name?.toUpperCase() || '';
    const fullTitle = `${courseName} ${levelName}`;
    const price = level?.basePrice ? Number(level.basePrice) : 450;
    const discountPrice = Number(data.agreedPrice);
    // Updated to use current date for "Fecha Depósito" as requested
    const dateDepos = new Date().toLocaleDateString('es-ES');
    const period = group?.code?.split('-')[1] ? `${new Date().getMonth() < 6 ? '1' : '2'}/${new Date().getFullYear()}` : '1/2025'; // Estimating period

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(val) + ' Bs.';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* HEAD TABLE */}
                <View style={styles.headerTable}>
                    <View style={styles.logoCell}>
                        {/* Using logo2.png as requested (UAP Logo) */}
                        <Image src={`${window.location.origin}/assets/logo2.png`} style={styles.logo} />
                        <Text style={styles.uapText}>U.A.P</Text>
                    </View>
                    <View style={styles.titleCell}>
                        <Text style={styles.titleText}>FORMULARIO</Text>
                        <Text style={styles.titleText}>VICE-RECTORADO</Text>
                        <Text style={styles.titleText}>CENTRO DE PROYECTOS ESPECIALES</Text>
                        <Text style={styles.titleText}>ESCUELA TÉCNICA</Text>
                    </View>
                    <View style={styles.metaCell}>
                        <Text style={{marginBottom: 5}}>FORM. UPE 10/{new Date().getFullYear()}</Text>
                        <Text>VIGENCIA:</Text>
                        <Text>30/12/2018</Text>
                        <Text style={{fontStyle: 'italic', marginTop: 10}}>Versión No. 1</Text>
                    </View>
                </View>

                {/* SECTION TITLE */}
                <View style={styles.sectionTitle}>
                    <Text>{fullTitle}</Text>
                </View>

                {/* MAIN FORM BODY TABLE */}
                <View style={{ ...styles.table, borderTopWidth: 1 }}>
                    
                    {/* 1. Cost Row */}
                    <View style={styles.row}>
                        <View style={{ ...styles.cell, width: '80%', ...styles.bgGrey }}>
                            <Text style={styles.bold}>COSTO Bs. {formatCurrency(price)}</Text>
                        </View>
                        <View style={{ ...styles.cell, width: '20%', borderRightWidth: 0 }}>
                            <Text style={styles.right}>{formatCurrency(discountPrice)}</Text>
                        </View>
                    </View>

                    {/* 2. Name Row + Photo START */}
                    {/* We need a structure that handles the rowspan for photo manually by splitting columns */}
                    <View style={{ flexDirection: 'row' }}>
                        {/* LEFT COLUMN (Form Fields) */}
                        <View style={{ width: '80%', borderRightWidth: 1, borderColor: '#000' }}>
                            
                            {/* Row 2.1 Name */}
                            <View style={{ ...styles.row, borderBottomWidth: 1 }}>
                                <View style={{ ...styles.cell, width: '25%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>Nombre y Apellidos:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '75%', borderRightWidth: 0 }}>
                                    <Text style={styles.value}>{fullName}</Text>
                                </View>
                            </View>

                            {/* Row 2.2 IDs */}
                            <View style={{ ...styles.row, borderBottomWidth: 1 }}>
                                <View style={{ ...styles.cell, width: '10%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>C.I.:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '20%' }}>
                                    <Text style={styles.value}>{student?.documentNumber}</Text>
                                </View>

                                {/* Added R.E. Field - Widened */}
                                <View style={{ ...styles.cell, width: '10%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>R.E.:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '20%' }}> {/* Increased width */}
                                    <Text style={{...styles.value, fontSize: 9}}>{student?.registrationCode || ''}</Text>
                                </View>
                                {/* Removed Exp field as requested */}
                                <View style={{ ...styles.cell, width: '15%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>Celular:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '25%', borderRightWidth: 0 }}> {/* Adjusted width */}
                                    <Text style={styles.value}>{user?.phone}</Text>
                                </View>
                            </View>

                            {/* Row 2.3 System/Shift (Nested) */}
                             <View style={{ ...styles.row, borderBottomWidth: 1 }}>
                                <View style={{ ...styles.cell, width: '25%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>Sistema Formación:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '25%', textAlign: 'center' }}>
                                    <Text style={styles.value}>PRESENCIAL</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '15%', backgroundColor: '#fafafa', textAlign: 'center' }}>
                                    <Text style={styles.bold}>Horario:</Text>
                                </View>
                                <View style={{ width: '35%' }}>
                                     {/* Simplified Schedule Display: Time Range Only (Monday Priority) */}
                                     {(() => {
                                         // Use strictly COURSE schedules as requested
                                         const schedules = course?.schedules;
                                         if (schedules && schedules.length > 0) {
                                             // User requested specifically Monday's schedule as reference
                                             const s = schedules.find((sch: any) => sch.dayOfWeek === 'MONDAY') || schedules[0];
                                             return (
                                                  <View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                                                      <Text style={styles.value}>
                                                          {new Date(s.startTime).getUTCHours().toString().padStart(2, '0')}:{new Date(s.startTime).getUTCMinutes().toString().padStart(2, '0')} - {new Date(s.endTime).getUTCHours().toString().padStart(2, '0')}:{new Date(s.endTime).getUTCMinutes().toString().padStart(2, '0')}
                                                      </Text>
                                                  </View>
                                             );
                                         }
                                         return (
                                              <View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                                                  <Text style={{fontSize: 8}}>POR ASIGNAR</Text>
                                              </View>
                                         );
                                     })()}
                                </View>
                            </View>

                             {/* Row 2.4 Date/Period */}
                             <View style={{ ...styles.row, borderBottomWidth: 0 }}> {/* Last row of this block */}
                                <View style={{ ...styles.cell, width: '20%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>Fecha Depósito:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '25%' }}>
                                    <Text style={styles.value}>{dateDepos}</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '15%', backgroundColor: '#fafafa' }}>
                                    <Text style={styles.bold}>Periodo:</Text>
                                </View>
                                <View style={{ ...styles.cell, width: '40%', borderRightWidth: 0, textAlign: 'center' }}>
                                    <Text style={styles.value}>{period}</Text>
                                </View>
                            </View>

                        </View>

                        {/* RIGHT COLUMN (Photo) */}
                         <View style={{ width: '20%', padding: 5, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}>
                            <Image 
                                src={user?.profileImageUrl || `${window.location.origin}/assets/user-silhouette.png`} 
                                style={{ width: 80, height: 100, objectFit: 'cover' }} 
                            />
                        </View>
                    </View>

                    {/* 3. Program Row (Full Width again) */}
                    <View style={styles.row}>
                        <View style={{ ...styles.cell, width: '20%', backgroundColor: '#fafafa' }}>
                            <Text style={styles.bold}>Nro. Programa{'\n'}INGLES</Text>
                        </View>
                        <View style={{ ...styles.cell, width: '30%' }}>
                            <Text style={{ ...styles.value, ...styles.redText }}>{group?.code || 'PENDIENTE'}</Text>
                        </View>
                        <View style={{ ...styles.cell, width: '25%', backgroundColor: '#fafafa' }}>
                            <Text style={styles.bold}>Resolución{'\n'}Vicerrectoral</Text>
                        </View>
                        <View style={{ ...styles.cell, width: '25%', borderRightWidth: 0, textAlign: 'center' }}>
                            <Text style={styles.value}>272/2016</Text>
                        </View>
                    </View>

                    {/* 4. Observations */}
                    <View style={{ ...styles.row, borderBottomWidth: 1 }}>
                         <View style={{ ...styles.cell, width: '20%', backgroundColor: '#fafafa' }}>
                            <Text style={styles.bold}>OBSERVACIONES</Text>
                        </View>
                         <View style={{ ...styles.cell, width: '50%' }}>
                            <Text style={styles.value}>{data.enrollmentNotes || ''}</Text>
                        </View>
                        <View style={{ ...styles.cell, width: '30%', borderRightWidth: 0, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                            <Text style={styles.value}>BOLIVIANOS</Text>
                            <Text style={{ ...styles.value, fontSize: 12, fontWeight: 'bold' }}>{formatCurrency(discountPrice)}</Text>
                        </View>
                    </View>

                     {/* 5. Authorized by */}
                     <View style={{ ...styles.row, borderBottomWidth: 0 }}>
                         <View style={{ ...styles.cell, width: '100%', borderRightWidth: 0, borderBottomWidth: 0 }}>
                             <Text style={styles.bold}>Autorizado por:</Text>
                         </View>
                     </View>

                </View>

                {/* FOOTER - SIGNATURES */}
                <View style={styles.footer}>
                    <View style={styles.footerCol}>
                        <View style={styles.signLine} />
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>RESPONSABLE ADMINISTRATIVO</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <View style={styles.signLine} />
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>RESPONSABLE{'\n'}CENTRO DE PROYECTOS ESPECIALES</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <View style={styles.signLine} />
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>ESTUDIANTE/PADRE O{'\n'}TUTOR</Text>
                    </View>
                </View>
                
                {/* Generated By Footer */}
                <View style={{ marginTop: 20, paddingTop: 5, borderTopWidth: 1, borderColor: '#ccc' }}>
                    <Text style={{ fontSize: 9, textAlign: 'right', color: '#444' }}>
                        Generado por: {createdBy ? `${createdBy.firstName} ${createdBy.paternalSurname}` : 'Sistema'} — Fecha de emisión: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </Text>
                </View>

                {/* CREDENTIALS SECTION (Requested to be added) */}
                {credentials && credentials.password && (
                    <View style={styles.credentialsBox}>
                        <Text style={{ ...styles.bold, textAlign: 'center', fontSize: 12, marginBottom: 5 }}>CREDENCIALES DE ACCESO AL SISTEMA</Text>
                        <Text style={{ textAlign: 'center', fontSize: 9, marginBottom: 10, color: '#666', fontFamily: 'Helvetica' }}>
                            Recorte y conserve estos datos. Son necesarios para ingresar al aula virtual.
                        </Text>
                        <View style={styles.credentialRow}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.bold}>USUARIO</Text>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 12, marginTop: 2 }}>{credentials.username}</Text>
                            </View>
                            <View style={{ borderRightWidth: 1, borderColor: '#ccc' }} />
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.bold}>CONTRASEÑA</Text>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 12, marginTop: 2 }}>{credentials.password}</Text>
                            </View>
                        </View>
                    </View>
                )}

            </Page>
        </Document>
    );
};

export default EnrollmentPDF;
