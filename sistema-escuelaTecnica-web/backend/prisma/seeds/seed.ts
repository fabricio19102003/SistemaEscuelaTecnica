import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ============================================
  // 1. ROLES
  // ============================================
  console.log('📋 Creando roles...');
  
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrador del sistema con acceso total',
      },
    }),
    prisma.role.upsert({
      where: { name: 'TEACHER' },
      update: {},
      create: {
        name: 'TEACHER',
        description: 'Docente con acceso a gestión académica',
      },
    }),
    prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: {
        name: 'STUDENT',
        description: 'Estudiante con acceso a consulta de datos',
      },
    }),
    prisma.role.upsert({
      where: { name: 'GUARDIAN' },
      update: {},
      create: {
        name: 'GUARDIAN',
        description: 'Padre o tutor con acceso a datos de estudiantes',
      },
    }),
  ]);

  console.log('✅ Roles creados:', roles.length);

  // ============================================
  // 2. USUARIOS ADMINISTRADORES
  // ============================================
  console.log('👤 Creando usuarios administradores...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@escuelatecnica.com' },
    update: {},
    create: {
      email: 'admin@escuelatecnica.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      phone: '+51999999999',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: roles[0].id, // ADMIN
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: roles[0].id,
    },
  });

  console.log('✅ Usuario admin creado: admin@escuelatecnica.com / Admin123!');

  // ============================================
  // 3. COLEGIOS
  // ============================================
  console.log('🏫 Creando colegios...');

  const schools = await Promise.all([
    prisma.school.create({
      data: {
        name: 'Colegio San Martín de Porres',
        code: 'CSMP001',
        address: 'Av. Principal 123',
        district: 'San Isidro',
        city: 'Lima',
        phone: '+5114567890',
        email: 'contacto@sanmartin.edu.pe',
        contactPerson: 'María García',
        contactPhone: '+51987654321',
        isActive: true,
      },
    }),
    prisma.school.create({
      data: {
        name: 'Instituto Educativo Los Álamos',
        code: 'IELA002',
        address: 'Jr. Educación 456',
        district: 'Miraflores',
        city: 'Lima',
        phone: '+5114445566',
        email: 'info@losalamos.edu.pe',
        contactPerson: 'Carlos Rodríguez',
        contactPhone: '+51987123456',
        isActive: true,
      },
    }),
    prisma.school.create({
      data: {
        name: 'Colegio Santa Rosa',
        code: 'CSR003',
        address: 'Calle Académica 789',
        district: 'San Borja',
        city: 'Lima',
        phone: '+5114443322',
        email: 'santarosa@colegio.edu.pe',
        contactPerson: 'Ana López',
        contactPhone: '+51987789012',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Colegios creados:', schools.length);

  // ============================================
  // 4. CONVENIOS
  // ============================================
  console.log('📋 Creando convenios...');

  const agreement = await prisma.agreement.create({
    data: {
      schoolId: schools[0].id,
      agreementCode: 'CONV-CSMP-2025',
      discountType: 'PERCENTAGE',
      discountValue: 15.00,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
      notes: 'Convenio institucional con 15% de descuento para estudiantes',
    },
  });

  console.log('✅ Convenio creado');

  // ============================================
  // 5. CURSOS Y NIVELES
  // ============================================
  console.log('📚 Creando cursos y niveles...');

  const course = await prisma.course.create({
    data: {
      name: 'Inglés para Niños y Adolescentes',
      code: 'ENG-KIDS',
      description: 'Programa completo de inglés diseñado para estudiantes de 8 a 15 años',
      minAge: 8,
      maxAge: 15,
      durationMonths: 12,
      isActive: true,
    },
  });

  const levels = await Promise.all([
    prisma.level.create({
      data: {
        courseId: course.id,
        name: 'Básico',
        code: 'BASIC',
        orderIndex: 1,
        description: 'Nivel básico - Introducción al inglés',
        durationWeeks: 12,
        totalHours: 48,
        basePrice: 350.00,
        objectives: 'Vocabulario básico, gramática fundamental, conversación simple',
        isActive: true,
      },
    }),
    prisma.level.create({
      data: {
        courseId: course.id,
        name: 'Intermedio',
        code: 'INTERMEDIATE',
        orderIndex: 2,
        description: 'Nivel intermedio - Desarrollo de habilidades',
        durationWeeks: 12,
        totalHours: 48,
        basePrice: 380.00,
        objectives: 'Ampliación de vocabulario, estructuras gramaticales complejas',
        requirements: 'Haber completado nivel básico',
        isActive: true,
      },
    }),
    prisma.level.create({
      data: {
        courseId: course.id,
        name: 'Avanzado',
        code: 'ADVANCED',
        orderIndex: 3,
        description: 'Nivel avanzado - Fluidez y perfeccionamiento',
        durationWeeks: 12,
        totalHours: 48,
        basePrice: 420.00,
        objectives: 'Fluidez conversacional, escritura avanzada, comprensión completa',
        requirements: 'Haber completado nivel intermedio',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Curso y niveles creados');

  // ============================================
  // 6. DOCENTES
  // ============================================
  console.log('👨‍🏫 Creando docentes...');

  const teacherPassword = await bcrypt.hash('Teacher123!', 10);

  const teacher1User = await prisma.user.create({
    data: {
      email: 'jperez@escuelatecnica.com',
      passwordHash: teacherPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+51987111222',
      isActive: true,
      emailVerified: true,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      documentType: 'DNI',
      documentNumber: '12345678',
      specialization: 'Enseñanza de Inglés para Niños',
      hireDate: new Date('2024-01-15'),
      contractType: 'FULL_TIME',
      hourlyRate: 50.00,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: teacher1User.id,
      roleId: roles[1].id, // TEACHER
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'mlopez@escuelatecnica.com',
      passwordHash: teacherPassword,
      firstName: 'María',
      lastName: 'López',
      phone: '+51987333444',
      isActive: true,
      emailVerified: true,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      documentType: 'DNI',
      documentNumber: '87654321',
      specialization: 'Inglés Avanzado',
      hireDate: new Date('2024-02-01'),
      contractType: 'PART_TIME',
      hourlyRate: 45.00,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: teacher2User.id,
      roleId: roles[1].id, // TEACHER
    },
  });

  console.log('✅ Docentes creados: 2');

  // ============================================
  // 7. GRUPOS
  // ============================================
  console.log('👥 Creando grupos...');

  const groups = await Promise.all([
    prisma.group.create({
      data: {
        levelId: levels[0].id, // Básico
        teacherId: teacher1.id,
        name: 'Básico A - Mañana',
        code: 'BASIC-A-2025-1',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
        maxCapacity: 15,
        minCapacity: 5,
        currentEnrolled: 0,
        status: 'OPEN',
        classroom: 'Aula 101',
      },
    }),
    prisma.group.create({
      data: {
        levelId: levels[1].id, // Intermedio
        teacherId: teacher1.id,
        name: 'Intermedio B - Tarde',
        code: 'INT-B-2025-1',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
        maxCapacity: 15,
        minCapacity: 5,
        currentEnrolled: 0,
        status: 'OPEN',
        classroom: 'Aula 102',
      },
    }),
    prisma.group.create({
      data: {
        levelId: levels[2].id, // Avanzado
        teacherId: teacher2.id,
        name: 'Avanzado C - Noche',
        code: 'ADV-C-2025-1',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
        maxCapacity: 12,
        minCapacity: 5,
        currentEnrolled: 0,
        status: 'OPEN',
        classroom: 'Aula 201',
      },
    }),
  ]);

  console.log('✅ Grupos creados:', groups.length);

  // ============================================
  // 8. HORARIOS
  // ============================================
  console.log('📅 Creando horarios...');

  await Promise.all([
    // Básico A - Lunes y Miércoles 9:00-11:00
    prisma.schedule.create({
      data: {
        groupId: groups[0].id,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T09:00:00'),
        endTime: new Date('1970-01-01T11:00:00'),
      },
    }),
    prisma.schedule.create({
      data: {
        groupId: groups[0].id,
        dayOfWeek: 'WEDNESDAY',
        startTime: new Date('1970-01-01T09:00:00'),
        endTime: new Date('1970-01-01T11:00:00'),
      },
    }),
    // Intermedio B - Martes y Jueves 15:00-17:00
    prisma.schedule.create({
      data: {
        groupId: groups[1].id,
        dayOfWeek: 'TUESDAY',
        startTime: new Date('1970-01-01T15:00:00'),
        endTime: new Date('1970-01-01T17:00:00'),
      },
    }),
    prisma.schedule.create({
      data: {
        groupId: groups[1].id,
        dayOfWeek: 'THURSDAY',
        startTime: new Date('1970-01-01T15:00:00'),
        endTime: new Date('1970-01-01T17:00:00'),
      },
    }),
    // Avanzado C - Lunes y Miércoles 18:00-20:00
    prisma.schedule.create({
      data: {
        groupId: groups[2].id,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T18:00:00'),
        endTime: new Date('1970-01-01T20:00:00'),
      },
    }),
    prisma.schedule.create({
      data: {
        groupId: groups[2].id,
        dayOfWeek: 'WEDNESDAY',
        startTime: new Date('1970-01-01T18:00:00'),
        endTime: new Date('1970-01-01T20:00:00'),
      },
    }),
  ]);

  console.log('✅ Horarios creados');

  // ============================================
  // 9. GUARDIANES (PADRES)
  // ============================================
  console.log('👨‍👩‍👧‍👦 Creando guardianes...');

  const guardianPassword = await bcrypt.hash('Guardian123!', 10);

  const guardian1User = await prisma.user.create({
    data: {
      email: 'carlos.rodriguez@email.com',
      passwordHash: guardianPassword,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      phone: '+51987555666',
      isActive: true,
      emailVerified: true,
    },
  });

  const guardian1 = await prisma.guardian.create({
    data: {
      userId: guardian1User.id,
      documentType: 'DNI',
      documentNumber: '45678901',
      relationship: 'FATHER',
      occupation: 'Ingeniero',
      workplace: 'Empresa Tech SAC',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: guardian1User.id,
      roleId: roles[3].id, // GUARDIAN
    },
  });

  const guardian2User = await prisma.user.create({
    data: {
      email: 'ana.torres@email.com',
      passwordHash: guardianPassword,
      firstName: 'Ana',
      lastName: 'Torres',
      phone: '+51987777888',
      isActive: true,
      emailVerified: true,
    },
  });

  const guardian2 = await prisma.guardian.create({
    data: {
      userId: guardian2User.id,
      documentType: 'DNI',
      documentNumber: '56789012',
      relationship: 'MOTHER',
      occupation: 'Doctora',
      workplace: 'Hospital Central',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: guardian2User.id,
      roleId: roles[3].id, // GUARDIAN
    },
  });

  console.log('✅ Guardianes creados: 2');

  // ============================================
  // 10. ESTUDIANTES
  // ============================================
  console.log('👦👧 Creando estudiantes...');

  const studentPassword = await bcrypt.hash('Student123!', 10);

  const students = [];

  // Estudiante 1
  const student1User = await prisma.user.create({
    data: {
      email: 'luis.rodriguez@email.com',
      passwordHash: studentPassword,
      firstName: 'Luis',
      lastName: 'Rodríguez',
      phone: '+51987000111',
      isActive: true,
      emailVerified: true,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: student1User.id,
      documentType: 'DNI',
      documentNumber: '78901234',
      dateOfBirth: new Date('2013-05-15'),
      gender: 'M',
      address: 'Av. Los Pinos 123, San Isidro',
      schoolId: schools[0].id,
      emergencyContactName: 'Carlos Rodríguez',
      emergencyContactPhone: '+51987555666',
      enrollmentStatus: 'ACTIVE',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: student1User.id,
      roleId: roles[2].id, // STUDENT
    },
  });

  await prisma.studentGuardian.create({
    data: {
      studentId: student1.id,
      guardianId: guardian1.id,
      isPrimary: true,
      canPickup: true,
    },
  });

  students.push(student1);

  // Estudiante 2
  const student2User = await prisma.user.create({
    data: {
      email: 'sofia.torres@email.com',
      passwordHash: studentPassword,
      firstName: 'Sofía',
      lastName: 'Torres',
      phone: '+51987000222',
      isActive: true,
      emailVerified: true,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: student2User.id,
      documentType: 'DNI',
      documentNumber: '89012345',
      dateOfBirth: new Date('2012-08-20'),
      gender: 'F',
      address: 'Jr. Las Flores 456, Miraflores',
      schoolId: schools[1].id,
      emergencyContactName: 'Ana Torres',
      emergencyContactPhone: '+51987777888',
      enrollmentStatus: 'ACTIVE',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: student2User.id,
      roleId: roles[2].id, // STUDENT
    },
  });

  await prisma.studentGuardian.create({
    data: {
      studentId: student2.id,
      guardianId: guardian2.id,
      isPrimary: true,
      canPickup: true,
    },
  });

  students.push(student2);

  // Estudiantes 3, 4, 5 (sin convenio)
  for (let i = 3; i <= 5; i++) {
    const studentUser = await prisma.user.create({
      data: {
        email: `estudiante${i}@email.com`,
        passwordHash: studentPassword,
        firstName: `Estudiante${i}`,
        lastName: `Apellido${i}`,
        phone: `+5198700${i}${i}${i}${i}`,
        isActive: true,
        emailVerified: true,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        documentType: 'DNI',
        documentNumber: `9012345${i}`,
        dateOfBirth: new Date(`201${i}-0${i}-1${i}`),
        gender: i % 2 === 0 ? 'F' : 'M',
        address: `Calle Ejemplo ${i * 100}`,
        enrollmentStatus: 'ACTIVE',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: studentUser.id,
        roleId: roles[2].id, // STUDENT
      },
    });

    students.push(student);
  }

  console.log('✅ Estudiantes creados: 5');

  // ============================================
  // 11. MATRÍCULAS
  // ============================================
  console.log('📝 Creando matrículas...');

  const enrollments = await Promise.all([
    // Estudiante 1 en Básico A (con convenio)
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        groupId: groups[0].id,
        enrollmentDate: new Date('2025-02-15'),
        startDate: new Date('2025-03-01'),
        status: 'ACTIVE',
        agreedPrice: 297.50, // 350 - 15%
        discountPercentage: 15.00,
        agreementId: agreement.id,
      },
    }),
    // Estudiante 2 en Intermedio B
    prisma.enrollment.create({
      data: {
        studentId: students[1].id,
        groupId: groups[1].id,
        enrollmentDate: new Date('2025-02-16'),
        startDate: new Date('2025-03-01'),
        status: 'ACTIVE',
        agreedPrice: 380.00,
        discountPercentage: 0.00,
      },
    }),
    // Estudiante 3 en Básico A
    prisma.enrollment.create({
      data: {
        studentId: students[2].id,
        groupId: groups[0].id,
        enrollmentDate: new Date('2025-02-17'),
        startDate: new Date('2025-03-01'),
        status: 'ACTIVE',
        agreedPrice: 350.00,
        discountPercentage: 0.00,
      },
    }),
    // Estudiante 4 en Avanzado C
    prisma.enrollment.create({
      data: {
        studentId: students[3].id,
        groupId: groups[2].id,
        enrollmentDate: new Date('2025-02-18'),
        startDate: new Date('2025-03-01'),
        status: 'ACTIVE',
        agreedPrice: 420.00,
        discountPercentage: 0.00,
      },
    }),
    // Estudiante 5 en Básico A
    prisma.enrollment.create({
      data: {
        studentId: students[4].id,
        groupId: groups[0].id,
        enrollmentDate: new Date('2025-02-19'),
        startDate: new Date('2025-03-01'),
        status: 'PENDING',
        agreedPrice: 350.00,
        discountPercentage: 0.00,
      },
    }),
  ]);

  // Actualizar currentEnrolled en grupos
  await prisma.group.update({
    where: { id: groups[0].id },
    data: { currentEnrolled: 3 },
  });

  await prisma.group.update({
    where: { id: groups[1].id },
    data: { currentEnrolled: 1 },
  });

  await prisma.group.update({
    where: { id: groups[2].id },
    data: { currentEnrolled: 1 },
  });

  console.log('✅ Matrículas creadas: 5');

  // ============================================
  // 12. ASISTENCIAS
  // ============================================
  console.log('✅ Creando asistencias...');

  await Promise.all([
    // Estudiante 1 - 3 sesiones
    prisma.attendance.create({
      data: {
        enrollmentId: enrollments[0].id,
        attendanceDate: new Date('2025-03-03'),
        status: 'PRESENT',
        recordedBy: teacher1.id,
      },
    }),
    prisma.attendance.create({
      data: {
        enrollmentId: enrollments[0].id,
        attendanceDate: new Date('2025-03-05'),
        status: 'PRESENT',
        recordedBy: teacher1.id,
      },
    }),
    prisma.attendance.create({
      data: {
        enrollmentId: enrollments[0].id,
        attendanceDate: new Date('2025-03-10'),
        status: 'LATE',
        arrivalTime: new Date('1970-01-01T09:15:00'),
        notes: 'Llegó 15 minutos tarde',
        recordedBy: teacher1.id,
      },
    }),
  ]);

  console.log('✅ Asistencias creadas: 3');

  // ============================================
  // 13. CALIFICACIONES
  // ============================================
  console.log('📊 Creando calificaciones...');

  await Promise.all([
    prisma.grade.create({
      data: {
        enrollmentId: enrollments[0].id,
        evaluationName: 'Quiz 1 - Vocabulario',
        evaluationType: 'QUIZ',
        gradeValue: 18.00,
        maxGrade: 20.00,
        weight: 1.00,
        evaluationDate: new Date('2025-03-08'),
        comments: 'Buen desempeño en vocabulario',
        recordedBy: teacher1.id,
      },
    }),
    prisma.grade.create({
      data: {
        enrollmentId: enrollments[1].id,
        evaluationName: 'Examen Parcial',
        evaluationType: 'EXAM',
        gradeValue: 16.50,
        maxGrade: 20.00,
        weight: 2.00,
        evaluationDate: new Date('2025-03-15'),
        comments: 'Necesita mejorar en gramática',
        recordedBy: teacher1.id,
      },
    }),
    prisma.grade.create({
      data: {
        enrollmentId: enrollments[3].id,
        evaluationName: 'Proyecto Final',
        evaluationType: 'PROJECT',
        gradeValue: 19.00,
        maxGrade: 20.00,
        weight: 3.00,
        evaluationDate: new Date('2025-03-20'),
        comments: 'Excelente proyecto',
        recordedBy: teacher2.id,
      },
    }),
  ]);

  console.log('✅ Calificaciones creadas: 3');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de acceso:');
  console.log('=====================================');
  console.log('👤 Admin:');
  console.log('   Email: admin@escuelatecnica.com');
  console.log('   Password: Admin123!');
  console.log('\n👨‍🏫 Docentes:');
  console.log('   Email: jperez@escuelatecnica.com');
  console.log('   Email: mlopez@escuelatecnica.com');
  console.log('   Password: Teacher123!');
  console.log('\n👨‍👩‍👧‍👦 Padres:');
  console.log('   Email: carlos.rodriguez@email.com');
  console.log('   Email: ana.torres@email.com');
  console.log('   Password: Guardian123!');
  console.log('\n👦 Estudiantes:');
  console.log('   Email: luis.rodriguez@email.com');
  console.log('   Email: sofia.torres@email.com');
  console.log('   Email: estudiante3@email.com');
  console.log('   Email: estudiante4@email.com');
  console.log('   Email: estudiante5@email.com');
  console.log('   Password: Student123!');
  console.log('=====================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
