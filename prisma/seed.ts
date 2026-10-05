import {
  PrismaClient,
  RoleName,
  UserStatus,
  ComplaintStatus,
  CaseStatus,
  CasePriority,
  InformationType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // -------------------------------------------------------------
  // 1. Roles
  // -------------------------------------------------------------
  const roleData: { role_name: RoleName; description: string }[] = [
    { role_name: 'ADMIN', description: 'System administrator' },
    {
      role_name: 'MANAGER',
      description: 'Reviews complaints and assigns investigators',
    },
    {
      role_name: 'INVESTIGATOR',
      description: 'Investigates cases and collects evidence',
    },
    { role_name: 'USER', description: 'Employee / Whistleblower' },
  ];

  for (const role of roleData) {
    await prisma.role.upsert({
      where: { role_name: role.role_name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('✅ Roles seeded (4)');

  // -------------------------------------------------------------
  // 2. Departments
  // -------------------------------------------------------------
  const departmentNames = [
    { name: 'Human Resources', desc: 'HR and people operations' },
    { name: 'Information Technology', desc: 'IT and infrastructure' },
    { name: 'Finance', desc: 'Finance and accounting' },
    { name: 'Operations', desc: 'Operations and logistics' },
    { name: 'Legal', desc: 'Legal and compliance' },
  ];

  const departments: Record<string, number> = {};
  for (const d of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { department_name: d.name },
      update: { description: d.desc },
      create: {
        department_name: d.name,
        description: d.desc,
        status: 'active',
      },
    });
    departments[d.name] = dept.department_id;
  }
  console.log('✅ Departments seeded (5)');

  // -------------------------------------------------------------
  // 3. Users
  // -------------------------------------------------------------
  const BCRYPT_ROUNDS = 12;

  const usersToSeed: Array<{
    name: string;
    email: string;
    password: string;
    roleName: RoleName;
    departmentId: number | null;
  }> = [
    {
      name: 'System Admin',
      email: 'admin@wb.local',
      password: 'Admin@12345',
      roleName: 'ADMIN',
      departmentId: null,
    },
    // Managers
    {
      name: 'Maria Manager',
      email: 'manager@wb.local',
      password: 'Manager@12345',
      roleName: 'MANAGER',
      departmentId: departments['Human Resources'],
    },
    {
      name: 'Michael Manager',
      email: 'manager2@wb.local',
      password: 'Manager@12345',
      roleName: 'MANAGER',
      departmentId: departments['Operations'],
    },
    // Investigators
    {
      name: 'Ivan Investigator',
      email: 'investigator@wb.local',
      password: 'Investigator@12345',
      roleName: 'INVESTIGATOR',
      departmentId: departments['Legal'],
    },
    {
      name: 'Iris Investigator',
      email: 'investigator2@wb.local',
      password: 'Investigator@12345',
      roleName: 'INVESTIGATOR',
      departmentId: departments['Finance'],
    },
    {
      name: 'Isaac Investigator',
      email: 'investigator3@wb.local',
      password: 'Investigator@12345',
      roleName: 'INVESTIGATOR',
      departmentId: departments['Information Technology'],
    },
    // Employees
    {
      name: 'Eve Employee',
      email: 'employee@wb.local',
      password: 'Employee@12345',
      roleName: 'USER',
      departmentId: departments['Information Technology'],
    },
    {
      name: 'Eric Employee',
      email: 'employee2@wb.local',
      password: 'Employee@12345',
      roleName: 'USER',
      departmentId: departments['Finance'],
    },
    {
      name: 'Ella Employee',
      email: 'employee3@wb.local',
      password: 'Employee@12345',
      roleName: 'USER',
      departmentId: departments['Operations'],
    },
    {
      name: 'Ethan Employee',
      email: 'employee4@wb.local',
      password: 'Employee@12345',
      roleName: 'USER',
      departmentId: departments['Human Resources'],
    },
    {
      name: 'Emma Employee',
      email: 'employee5@wb.local',
      password: 'Employee@12345',
      roleName: 'USER',
      departmentId: departments['Legal'],
    },
  ];

  const userMap: Record<string, number> = {};

  for (const u of usersToSeed) {
    const role = await prisma.role.findUnique({
      where: { role_name: u.roleName },
    });
    if (!role) throw new Error('Role not found: ' + u.roleName);

    const hashed = await bcrypt.hash(u.password, BCRYPT_ROUNDS);

    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        role_id: role.role_id,
        department_id: u.departmentId,
        status: UserStatus.ACTIVE,
      },
    });

    userMap[u.email] = created.user_id;
  }
  console.log(`✅ Users seeded (${usersToSeed.length})`);

  // -------------------------------------------------------------
  // 4. Complaints
  // -------------------------------------------------------------
  const complaintsToSeed = [
    {
      title: 'Suspicious expense reports in Q3',
      description:
        'I noticed several expense reports approved in Q3 that do not match our procurement policy. Multiple receipts appear to have been altered.',
      category: 'Financial Fraud',
      status: ComplaintStatus.PENDING,
      isAnonymous: false,
      userEmail: 'employee@wb.local',
    },
    {
      title: 'Hostile behavior from team lead',
      description:
        'My team lead has repeatedly made demeaning comments in front of colleagues. I feel uncomfortable raising this internally.',
      category: 'Harassment',
      status: ComplaintStatus.PENDING,
      isAnonymous: true,
      userEmail: null,
    },
    {
      title: 'Unreported data breach',
      description:
        'A colleague mentioned that a customer data leak occurred two months ago, but I have not seen any incident report.',
      category: 'Data Protection',
      status: ComplaintStatus.UNDER_REVIEW,
      isAnonymous: false,
      userEmail: 'employee2@wb.local',
    },
    {
      title: 'Conflict of interest in vendor selection',
      description:
        'A senior manager selected a vendor that they have a personal relationship with, without a competitive bidding process.',
      category: 'Conflict of Interest',
      status: ComplaintStatus.APPROVED,
      isAnonymous: true,
      userEmail: null,
    },
    {
      title: 'Unauthorized access to HR files',
      description:
        'Someone accessed confidential HR records outside of normal working hours. Logs show repeated entry attempts.',
      category: 'Data Protection',
      status: ComplaintStatus.CONVERTED_TO_CASE,
      isAnonymous: false,
      userEmail: 'employee3@wb.local',
    },
    {
      title: 'Falsified safety inspection records',
      description:
        'The safety inspection reports for our warehouse have been signed off without an actual visit taking place.',
      category: 'Safety Violation',
      status: ComplaintStatus.CONVERTED_TO_CASE,
      isAnonymous: false,
      userEmail: 'employee4@wb.local',
    },
    {
      title: 'Discriminatory hiring practices',
      description:
        'A hiring manager consistently rejects candidates from a specific demographic, despite them being qualified.',
      category: 'Discrimination',
      status: ComplaintStatus.UNDER_REVIEW,
      isAnonymous: true,
      userEmail: null,
    },
    {
      title: 'Misuse of company credit card',
      description:
        'A senior employee is using a company credit card for personal purchases. Receipts are missing for multiple transactions.',
      category: 'Financial Fraud',
      status: ComplaintStatus.PENDING,
      isAnonymous: false,
      userEmail: 'employee5@wb.local',
    },
    {
      title: 'Retaliation after prior complaint',
      description:
        'Since I filed a complaint three months ago, my workload has increased and I was removed from key projects.',
      category: 'Retaliation',
      status: ComplaintStatus.PENDING,
      isAnonymous: false,
      userEmail: 'employee@wb.local',
    },
    {
      title: 'Environmental compliance bypass',
      description:
        'Waste disposal procedures have been bypassed for the last month. Records are being backdated.',
      category: 'Environmental',
      status: ComplaintStatus.REJECTED,
      isAnonymous: false,
      userEmail: 'employee2@wb.local',
    },
  ];

  const complaintIds: number[] = [];
  for (const c of complaintsToSeed) {
    const created = await prisma.complaint.create({
      data: {
        title: c.title,
        description: c.description,
        category: c.category,
        status: c.status,
        isAnonymous: c.isAnonymous,
        user_id: c.userEmail ? userMap[c.userEmail] : null,
      },
    });
    complaintIds.push(created.complaint_id);
  }
  console.log(`✅ Complaints seeded (${complaintsToSeed.length})`);

  // -------------------------------------------------------------
  // 5. Cases (for CONVERTED_TO_CASE complaints)
  // -------------------------------------------------------------
  const caseComplaintIndexes = [4, 5]; // Indexes of CONVERTED_TO_CASE complaints
  const caseConfigs = [
    {
      priority: CasePriority.HIGH,
      status: CaseStatus.INVESTIGATING,
      investigatorEmail: 'investigator@wb.local',
    },
    {
      priority: CasePriority.MEDIUM,
      status: CaseStatus.OPEN,
      investigatorEmail: 'investigator2@wb.local',
    },
  ];

  const caseIds: number[] = [];
  for (let i = 0; i < caseComplaintIndexes.length; i++) {
    const complaintId = complaintIds[caseComplaintIndexes[i]];
    const config = caseConfigs[i];

    const created = await prisma.case.create({
      data: {
        complaint_id: complaintId,
        priority: config.priority,
        status: config.status,
        assigned_investigator_id: userMap[config.investigatorEmail],
        closed_at:
          config.status === CaseStatus.CLOSED ||
          config.status === CaseStatus.ARCHIVED
            ? new Date()
            : null,
      },
    });
    caseIds.push(created.case_id);

    // Add status history entry
    await prisma.caseStatusHistory.create({
      data: {
        case_id: created.case_id,
        status: config.status,
        changed_by: userMap['manager@wb.local'],
      },
    });
  }
  console.log(`✅ Cases seeded (${caseIds.length})`);

  // -------------------------------------------------------------
  // 6. Additional Information (for some complaints)
  // -------------------------------------------------------------
  const additionalInfoToSeed = [
    {
      complaintId: complaintIds[0],
      title: 'More transaction details',
      description:
        'I can share specific transaction IDs if needed. They were filed between July 15 and July 22.',
      type: InformationType.ADDITIONAL_DETAILS,
      submittedBy: 'employee@wb.local',
    },
    {
      complaintId: complaintIds[1],
      title: 'Timeline of events',
      description:
        'The first incident was on August 3rd, followed by similar comments on August 10th and August 17th.',
      type: InformationType.CLARIFICATION,
      submittedBy: 'employee2@wb.local',
    },
    {
      complaintId: complaintIds[2],
      title: 'Witness information',
      description:
        'Two other colleagues were present during the incident and can corroborate the account.',
      type: InformationType.SUPPORTING_INFO,
      submittedBy: 'employee2@wb.local',
    },
  ];

  for (const info of additionalInfoToSeed) {
    await prisma.additionalInformation.create({
      data: {
        complaint_id: info.complaintId,
        title: info.title,
        description: info.description,
        informationType: info.type,
        submitted_by: userMap[info.submittedBy],
      },
    });
  }
  console.log(`✅ Additional Information seeded (${additionalInfoToSeed.length})`);

  // -------------------------------------------------------------
  // 7. Evidence (for cases)
  // -------------------------------------------------------------
  const evidenceToSeed = [
    {
      caseId: caseIds[0],
      fileName: 'access-logs-august.csv',
      fileType: 'text/csv',
      description: 'Access logs showing unusual HR file activity in August.',
    },
    {
      caseId: caseIds[0],
      fileName: 'incident-summary.pdf',
      fileType: 'application/pdf',
      description: 'Initial incident summary prepared by IT security.',
    },
    {
      caseId: caseIds[1],
      fileName: 'safety-inspection-photo.jpg',
      fileType: 'image/jpeg',
      description: 'Photo of the warehouse on the claimed inspection date.',
    },
    {
      caseId: caseIds[1],
      fileName: 'inspection-schedule.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Scheduled vs actual inspection dates comparison.',
    },
  ];

  for (const e of evidenceToSeed) {
    await prisma.evidence.create({
      data: {
        case_id: e.caseId,
        file_name: e.fileName,
        file_type: e.fileType,
        description: e.description,
      },
    });
  }
  console.log(`✅ Evidence seeded (${evidenceToSeed.length})`);

  // -------------------------------------------------------------
  // 8. Investigation Reports
  // -------------------------------------------------------------
  const reportsToSeed = [
    {
      caseId: caseIds[0],
      findings:
        'The access logs confirm unauthorized access to HR files outside of working hours. Interviews with two IT staff members corroborate that no maintenance ticket exists for the activity.',
      recommendation:
        'Suspend the involved account immediately, notify affected employees, and refer the case to senior management for disciplinary action.',
    },
  ];

  for (const r of reportsToSeed) {
    await prisma.investigationReport.create({
      data: {
        case_id: r.caseId,
        findings: r.findings,
        recommendation: r.recommendation,
      },
    });
  }
  console.log(`✅ Investigation Reports seeded (${reportsToSeed.length})`);

  // -------------------------------------------------------------
  // 9. Notifications
  // -------------------------------------------------------------
  const notificationsToSeed = [
    {
      userEmail: 'employee@wb.local',
      message: 'Your complaint "Suspicious expense reports in Q3" is being reviewed.',
      isRead: false,
    },
    {
      userEmail: 'employee@wb.local',
      message: 'Thank you for your recent complaint submission.',
      isRead: true,
    },
    {
      userEmail: 'manager@wb.local',
      message: 'New complaint submitted: "Suspicious expense reports in Q3".',
      isRead: false,
    },
    {
      userEmail: 'manager@wb.local',
      message: 'Case #1 has been assigned to Ivan Investigator.',
      isRead: false,
    },
    {
      userEmail: 'investigator@wb.local',
      message: 'You have been assigned to Case #1: Unauthorized access to HR files.',
      isRead: false,
    },
    {
      userEmail: 'investigator@wb.local',
      message: 'Reminder: Case #1 status update due this week.',
      isRead: true,
    },
    {
      userEmail: 'employee3@wb.local',
      message: 'Your complaint has been converted to Case #1.',
      isRead: true,
    },
    {
      userEmail: 'admin@wb.local',
      message: '2 new users were created in the last 24 hours.',
      isRead: false,
    },
    {
      userEmail: 'employee4@wb.local',
      message: 'Your complaint "Falsified safety inspection records" has been converted to a case.',
      isRead: true,
    },
    {
      userEmail: 'employee2@wb.local',
      message: 'Your complaint is under review by our compliance team.',
      isRead: false,
    },
  ];

  for (const n of notificationsToSeed) {
    await prisma.notification.create({
      data: {
        user_id: userMap[n.userEmail],
        message: n.message,
        is_read: n.isRead,
      },
    });
  }
  console.log(`✅ Notifications seeded (${notificationsToSeed.length})`);

  // -------------------------------------------------------------
  // 10. System Settings
  // -------------------------------------------------------------
  const settingsToSeed = [
    {
      key: 'site.name',
      value: 'Whistleblowing Management System',
      description: 'The public name of the system.',
    },
    {
      key: 'complaints.allowAnonymous',
      value: 'true',
      description: 'Allow employees to submit anonymous complaints.',
    },
    {
      key: 'notifications.emailEnabled',
      value: 'false',
      description: 'Send email notifications when events occur.',
    },
    {
      key: 'complaints.retentionDays',
      value: '365',
      description: 'How long to retain closed complaints.',
    },
    {
      key: 'cases.defaultPriority',
      value: 'MEDIUM',
      description: 'Default priority assigned to new cases.',
    },
    {
      key: 'security.passwordMinLength',
      value: '8',
      description: 'Minimum password length for user accounts.',
    },
  ];

  for (const s of settingsToSeed) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: {
        key: s.key,
        value: s.value,
        description: s.description,
        user_id: userMap['admin@wb.local'],
      },
    });
  }
  console.log(`✅ System Settings seeded (${settingsToSeed.length})`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Test credentials:');
  console.log('  admin@wb.local         / Admin@12345');
  console.log('  manager@wb.local       / Manager@12345');
  console.log('  manager2@wb.local      / Manager@12345');
  console.log('  investigator@wb.local  / Investigator@12345');
  console.log('  investigator2@wb.local / Investigator@12345');
  console.log('  investigator3@wb.local / Investigator@12345');
  console.log('  employee@wb.local      / Employee@12345');
  console.log('  employee2@wb.local     / Employee@12345');
  console.log('  employee3@wb.local     / Employee@12345');
  console.log('  employee4@wb.local     / Employee@12345');
  console.log('  employee5@wb.local     / Employee@12345');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });