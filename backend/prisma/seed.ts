/**
 * FleetPilot — Database Seed Script
 * Inserts realistic demo data for all roles and modules.
 * Run: npx ts-node prisma/seed.ts  OR  npm run db:seed
 */

import { PrismaClient, VehicleStatus, DriverStatus, TripStatus, VehicleType, FuelType, LicenseCategory, MaintenanceType, MaintenanceStatus, ExpenseCategory, DocumentEntityType, DocumentType, NotificationType, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FleetPilot database seed...');

  // ─── Clean existing data ────────────────────────────────────
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.route.deleteMany();
  await prisma.driverStatusHistory.deleteMany();
  await prisma.vehicleStatusHistory.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.region.deleteMany();
  await prisma.organization.deleteMany();

  // ─── Organization ───────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: 'FleetPilot Demo Corp',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✅ Organization: ${org.name}`);

  // ─── Regions ────────────────────────────────────────────────
  const regions = await Promise.all([
    prisma.region.create({ data: { orgId: org.id, name: 'North Zone', code: 'NZ' } }),
    prisma.region.create({ data: { orgId: org.id, name: 'South Zone', code: 'SZ' } }),
    prisma.region.create({ data: { orgId: org.id, name: 'East Zone', code: 'EZ' } }),
    prisma.region.create({ data: { orgId: org.id, name: 'West Zone', code: 'WZ' } }),
  ]);
  const [northRegion, southRegion, eastRegion, westRegion] = regions;
  console.log(`✅ Regions: ${regions.map(r => r.name).join(', ')}`);

  // ─── Roles ──────────────────────────────────────────────────
  const roleData = [
    { name: UserRole.Admin, description: 'Full system access, user and role management, audit log' },
    { name: UserRole.FleetManager, description: 'Full CRUD on vehicles, maintenance, view all reports' },
    { name: UserRole.Dispatcher, description: 'Create/dispatch/complete/cancel trips, view vehicle/driver availability' },
    { name: UserRole.SafetyOfficer, description: 'Full CRUD on drivers, license tracking, safety scores, suspend drivers' },
    { name: UserRole.FinancialAnalyst, description: 'Read-only fleet data, full access to fuel logs, expenses, reports, exports' },
  ];
  const roles = await Promise.all(roleData.map(r => prisma.role.create({ data: r })));
  const roleMap = Object.fromEntries(roles.map(r => [r.name, r]));
  console.log(`✅ Roles: ${roles.map(r => r.name).join(', ')}`);

  // ─── Role Permissions ───────────────────────────────────────
  const permissionsData = [
    // Admin — full access
    ...['vehicles', 'drivers', 'trips', 'maintenance', 'fuel-expense', 'documents', 'reports', 'notifications', 'audit', 'users', 'settings'].flatMap(resource =>
      ['create', 'read', 'update', 'delete', 'export'].map(action => ({
        roleId: roleMap[UserRole.Admin].id, resource, action,
      }))
    ),
    // Fleet Manager
    ...['vehicles', 'maintenance', 'fuel-expense', 'documents', 'reports', 'notifications'].flatMap(resource =>
      ['create', 'read', 'update', 'delete', 'export'].map(action => ({
        roleId: roleMap[UserRole.FleetManager].id, resource, action,
      }))
    ),
    { roleId: roleMap[UserRole.FleetManager].id, resource: 'drivers', action: 'read' },
    { roleId: roleMap[UserRole.FleetManager].id, resource: 'trips', action: 'read' },
    // Dispatcher
    ...['trips', 'notifications'].flatMap(resource =>
      ['create', 'read', 'update', 'delete'].map(action => ({
        roleId: roleMap[UserRole.Dispatcher].id, resource, action,
      }))
    ),
    { roleId: roleMap[UserRole.Dispatcher].id, resource: 'vehicles', action: 'read' },
    { roleId: roleMap[UserRole.Dispatcher].id, resource: 'drivers', action: 'read' },
    // Safety Officer
    ...['drivers', 'documents', 'notifications'].flatMap(resource =>
      ['create', 'read', 'update', 'delete', 'export'].map(action => ({
        roleId: roleMap[UserRole.SafetyOfficer].id, resource, action,
      }))
    ),
    { roleId: roleMap[UserRole.SafetyOfficer].id, resource: 'trips', action: 'read' },
    // Financial Analyst
    ...['fuel-expense', 'reports', 'notifications'].flatMap(resource =>
      ['create', 'read', 'export'].map(action => ({
        roleId: roleMap[UserRole.FinancialAnalyst].id, resource, action,
      }))
    ),
    { roleId: roleMap[UserRole.FinancialAnalyst].id, resource: 'vehicles', action: 'read' },
    { roleId: roleMap[UserRole.FinancialAnalyst].id, resource: 'drivers', action: 'read' },
    { roleId: roleMap[UserRole.FinancialAnalyst].id, resource: 'trips', action: 'read' },
    { roleId: roleMap[UserRole.FinancialAnalyst].id, resource: 'maintenance', action: 'read' },
  ];
  await prisma.rolePermission.createMany({ data: permissionsData, skipDuplicates: true });
  console.log(`✅ Role permissions configured`);

  // ─── Users (one per role) ───────────────────────────────────
  const password = await argon2.hash('FleetPilot@2026');
  const usersData = [
    { fullName: 'Admin User', email: 'admin@fleetpilot.dev', role: UserRole.Admin },
    { fullName: 'Rajesh Kumar', email: 'fleet@fleetpilot.dev', role: UserRole.FleetManager },
    { fullName: 'Priya Sharma', email: 'dispatch@fleetpilot.dev', role: UserRole.Dispatcher },
    { fullName: 'Vikram Singh', email: 'safety@fleetpilot.dev', role: UserRole.SafetyOfficer },
    { fullName: 'Ananya Patel', email: 'finance@fleetpilot.dev', role: UserRole.FinancialAnalyst },
  ];
  const users = await Promise.all(
    usersData.map(u =>
      prisma.user.create({
        data: {
          orgId: org.id,
          fullName: u.fullName,
          email: u.email,
          passwordHash: password,
          roleId: roleMap[u.role].id,
          isActive: true,
        },
      })
    )
  );
  const adminUser = users[0];
  const dispatcherUser = users[2];
  console.log(`✅ Users: ${users.map(u => u.email).join(', ')}`);

  // ─── Vehicles ───────────────────────────────────────────────
  const vehiclesData = [
    { reg: 'MH-01-AB-1234', model: 'Tata LPT 1109', type: VehicleType.Truck, capacity: 5000, odometer: 125400, cost: 1850000, fuel: FuelType.Diesel, status: VehicleStatus.Available, region: northRegion.id, insurance: new Date('2027-03-15'), permit: new Date('2026-11-30'), puc: new Date('2026-09-01') },
    { reg: 'DL-04-CD-5678', model: 'Mahindra Bolero Pickup', type: VehicleType.Pickup, capacity: 1200, odometer: 68900, cost: 920000, fuel: FuelType.Diesel, status: VehicleStatus.OnTrip, region: northRegion.id, insurance: new Date('2026-08-20'), permit: new Date('2027-01-15'), puc: new Date('2026-07-25') },
    { reg: 'KA-02-EF-9012', model: 'Ashok Leyland Dost', type: VehicleType.Van, capacity: 1500, odometer: 92300, cost: 1120000, fuel: FuelType.Diesel, status: VehicleStatus.Available, region: southRegion.id, insurance: new Date('2026-12-01'), permit: new Date('2026-10-30'), puc: new Date('2026-08-15') },
    { reg: 'TN-09-GH-3456', model: 'Eicher Pro 2059', type: VehicleType.Truck, capacity: 8000, odometer: 210500, cost: 2400000, fuel: FuelType.Diesel, status: VehicleStatus.InShop, region: southRegion.id, insurance: new Date('2027-05-10'), permit: new Date('2027-02-28'), puc: new Date('2026-10-01') },
    { reg: 'GJ-05-IJ-7890', model: 'Force Traveller', type: VehicleType.Van, capacity: 2000, odometer: 45200, cost: 1350000, fuel: FuelType.CNG, status: VehicleStatus.Available, region: westRegion.id, insurance: new Date('2027-01-20'), permit: new Date('2026-09-15'), puc: new Date('2026-08-01') },
    { reg: 'WB-03-KL-2345', model: 'Tata Ace Gold', type: VehicleType.Pickup, capacity: 750, odometer: 31800, cost: 680000, fuel: FuelType.CNG, status: VehicleStatus.Available, region: eastRegion.id, insurance: new Date('2026-09-30'), permit: new Date('2027-03-01'), puc: new Date('2026-07-18') },
    { reg: 'MH-12-MN-6789', model: 'BYD e6 Electric Van', type: VehicleType.EV, capacity: 1000, odometer: 18500, cost: 2200000, fuel: FuelType.Electric, status: VehicleStatus.Available, region: northRegion.id, insurance: new Date('2027-06-15'), permit: new Date('2027-04-30'), puc: new Date('2027-01-01') },
    { reg: 'RJ-14-OP-1234', model: 'Leyland Stallion 4×4', type: VehicleType.Truck, capacity: 10000, odometer: 380000, cost: 3200000, fuel: FuelType.Diesel, status: VehicleStatus.Retired, region: westRegion.id, insurance: new Date('2024-12-01'), permit: new Date('2024-10-01'), puc: new Date('2024-08-01') },
  ];

  const vehicles = await Promise.all(
    vehiclesData.map(v =>
      prisma.vehicle.create({
        data: {
          orgId: org.id,
          registrationNumber: v.reg,
          nameModel: v.model,
          type: v.type,
          maxLoadCapacityKg: v.capacity,
          odometerKm: v.odometer,
          acquisitionCost: v.cost,
          acquisitionDate: new Date('2023-01-01'),
          fuelType: v.fuel,
          status: v.status,
          regionId: v.region,
          insuranceExpiryDate: v.insurance,
          permitExpiryDate: v.permit,
          pucExpiryDate: v.puc,
        },
      })
    )
  );
  console.log(`✅ Vehicles: ${vehicles.length} created`);

  // Seed vehicle status histories
  await Promise.all(
    vehicles.map(v =>
      prisma.vehicleStatusHistory.create({
        data: {
          vehicleId: v.id,
          oldStatus: null,
          newStatus: v.status,
          changedById: adminUser.id,
          reason: 'Initial registration',
        },
      })
    )
  );

  // ─── Drivers ────────────────────────────────────────────────
  const driversData = [
    { name: 'Alex Mathew', license: 'KL-2019-0012345', category: LicenseCategory.HMV, expiry: new Date('2027-06-30'), contact: '9876543210', email: 'alex@demo.com', score: 95, status: DriverStatus.Available, region: northRegion.id, lastTrip: new Date(Date.now() - 3 * 3600000) },
    { name: 'Suresh Babu', license: 'TN-2020-0054321', category: LicenseCategory.HMV, expiry: new Date('2025-03-31'), contact: '9876543211', email: 'suresh@demo.com', score: 82, status: DriverStatus.OnTrip, region: northRegion.id, lastTrip: new Date(Date.now() - 8 * 3600000) },
    { name: 'Kavitha Reddy', license: 'AP-2021-0067890', category: LicenseCategory.LMV, expiry: new Date('2026-09-15'), contact: '9876543212', email: 'kavitha@demo.com', score: 98, status: DriverStatus.Available, region: southRegion.id, lastTrip: new Date(Date.now() - 26 * 3600000) },
    { name: 'Mohammed Irfan', license: 'KA-2018-0023456', category: LicenseCategory.HMV, expiry: new Date('2026-12-01'), contact: '9876543213', email: 'irfan@demo.com', score: 89, status: DriverStatus.Available, region: southRegion.id, lastTrip: new Date(Date.now() - 12 * 3600000) },
    { name: 'Ramesh Gupta', license: 'UP-2022-0078901', category: LicenseCategory.LMV_TR, expiry: new Date('2027-04-20'), contact: '9876543214', email: 'ramesh@demo.com', score: 74, status: DriverStatus.OffDuty, region: westRegion.id, lastTrip: new Date(Date.now() - 48 * 3600000) },
    { name: 'Pradeep Nair', license: 'KL-2020-0034567', category: LicenseCategory.PSV, expiry: new Date('2026-07-10'), contact: '9876543215', email: 'pradeep@demo.com', score: 60, status: DriverStatus.Suspended, region: westRegion.id, lastTrip: new Date(Date.now() - 72 * 3600000) },
    { name: 'Anjali Sinha', license: 'WB-2021-0089012', category: LicenseCategory.LMV, expiry: new Date('2028-01-15'), contact: '9876543216', email: 'anjali@demo.com', score: 100, status: DriverStatus.Available, region: eastRegion.id, lastTrip: new Date(Date.now() - 36 * 3600000) },
    { name: 'Deepak Sharma', license: 'RJ-2019-0045678', category: LicenseCategory.HMV, expiry: new Date('2026-08-05'), contact: '9876543217', email: 'deepak@demo.com', score: 91, status: DriverStatus.Available, region: northRegion.id, lastTrip: new Date(Date.now() - 20 * 3600000) },
  ];

  const drivers = await Promise.all(
    driversData.map(d =>
      prisma.driver.create({
        data: {
          orgId: org.id,
          fullName: d.name,
          licenseNumber: d.license,
          licenseCategory: d.category,
          licenseExpiryDate: d.expiry,
          contactNumber: d.contact,
          email: d.email,
          safetyScore: d.score,
          status: d.status,
          regionId: d.region,
          dateJoined: new Date('2023-01-01'),
          lastTripCompletedAt: d.lastTrip,
          totalTripsCompleted: Math.floor(Math.random() * 80) + 10,
        },
      })
    )
  );
  console.log(`✅ Drivers: ${drivers.length} created`);

  // ─── Routes ─────────────────────────────────────────────────
  const routesData = [
    { src: 'Mumbai', dst: 'Pune', dist: 150 },
    { src: 'Delhi', dst: 'Jaipur', dist: 280 },
    { src: 'Bengaluru', dst: 'Chennai', dist: 350 },
    { src: 'Hyderabad', dst: 'Vijayawada', dist: 280 },
    { src: 'Ahmedabad', dst: 'Surat', dist: 270 },
    { src: 'Kolkata', dst: 'Bhubaneswar', dist: 440 },
  ];
  const routes = await Promise.all(
    routesData.map(r =>
      prisma.route.create({
        data: {
          orgId: org.id,
          source: r.src,
          destination: r.dst,
          avgDistanceKm: r.dist,
          timesUsed: Math.floor(Math.random() * 20) + 1,
        },
      })
    )
  );
  console.log(`✅ Routes: ${routes.length} created`);

  // ─── Trips ──────────────────────────────────────────────────
  const now = new Date();
  const tripsData = [
    { code: 'TRIP-2026-000001', src: 'Mumbai', dst: 'Pune', v: 0, d: 0, cargo: 450, dist: 150, status: TripStatus.Completed, sched: new Date(now.getTime() - 48 * 3600000), actualStart: new Date(now.getTime() - 47 * 3600000), actualEnd: new Date(now.getTime() - 44 * 3600000), fuel: 18, rev: 25000 },
    { code: 'TRIP-2026-000002', src: 'Delhi', dst: 'Jaipur', v: 1, d: 1, cargo: 1100, dist: 280, status: TripStatus.Dispatched, sched: new Date(now.getTime() - 5 * 3600000), actualStart: new Date(now.getTime() - 4 * 3600000), actualEnd: null, fuel: null, rev: 42000 },
    { code: 'TRIP-2026-000003', src: 'Bengaluru', dst: 'Chennai', v: 2, d: 2, cargo: 800, dist: 350, status: TripStatus.Draft, sched: new Date(now.getTime() + 24 * 3600000), actualStart: null, actualEnd: null, fuel: null, rev: 55000 },
    { code: 'TRIP-2026-000004', src: 'Mumbai', dst: 'Pune', v: 4, d: 3, cargo: 1200, dist: 150, status: TripStatus.Completed, sched: new Date(now.getTime() - 96 * 3600000), actualStart: new Date(now.getTime() - 95 * 3600000), actualEnd: new Date(now.getTime() - 92 * 3600000), fuel: 12, rev: 30000 },
    { code: 'TRIP-2026-000005', src: 'Ahmedabad', dst: 'Surat', v: 5, d: 4, cargo: 600, dist: 270, status: TripStatus.Cancelled, sched: new Date(now.getTime() - 24 * 3600000), actualStart: null, actualEnd: null, fuel: null, rev: null },
    { code: 'TRIP-2026-000006', src: 'Kolkata', dst: 'Bhubaneswar', v: 6, d: 6, cargo: 900, dist: 440, status: TripStatus.Completed, sched: new Date(now.getTime() - 72 * 3600000), actualStart: new Date(now.getTime() - 71 * 3600000), actualEnd: new Date(now.getTime() - 66 * 3600000), fuel: 35, rev: 68000 },
  ];

  const tripCounter: Record<string, number> = {};
  const trips = await Promise.all(
    tripsData.map(t =>
      prisma.trip.create({
        data: {
          orgId: org.id,
          tripCode: t.code,
          source: t.src,
          destination: t.dst,
          vehicleId: vehicles[t.v].id,
          driverId: drivers[t.d].id,
          cargoWeightKg: t.cargo,
          plannedDistanceKm: t.dist,
          actualDistanceKm: t.actualEnd ? t.dist * 1.02 : null,
          status: t.status,
          scheduledStart: t.sched,
          actualStart: t.actualStart,
          actualEnd: t.actualEnd,
          fuelConsumedLiters: t.fuel,
          revenueAmount: t.rev,
          createdById: dispatcherUser.id,
          cancellationReason: t.status === TripStatus.Cancelled ? 'Customer request — order cancelled' : null,
        },
      })
    )
  );
  console.log(`✅ Trips: ${trips.length} created`);

  // ─── Maintenance Logs ───────────────────────────────────────
  const maintenanceData = [
    { v: 3, type: MaintenanceType.GeneralService, desc: 'Full service — oil, filters, brakes', status: MaintenanceStatus.Open, cost: 18500, sched: new Date(now.getTime() - 2 * 24 * 3600000), vendor: 'AutoCare Workshop' },
    { v: 0, type: MaintenanceType.OilChange, desc: 'Engine oil and filter change', status: MaintenanceStatus.Closed, cost: 4500, sched: new Date(now.getTime() - 10 * 24 * 3600000), comp: new Date(now.getTime() - 9 * 24 * 3600000), vendor: 'QuickLube Center' },
    { v: 2, type: MaintenanceType.Tires, desc: 'Rear tire replacement — all 4', status: MaintenanceStatus.Closed, cost: 12000, sched: new Date(now.getTime() - 20 * 24 * 3600000), comp: new Date(now.getTime() - 19 * 24 * 3600000), vendor: 'TyreCare Depot' },
    { v: 4, type: MaintenanceType.Inspection, desc: 'Annual roadworthiness inspection', status: MaintenanceStatus.Open, cost: 2500, sched: new Date(now.getTime() + 3 * 24 * 3600000), vendor: 'Govt RTTI Center' },
    { v: 1, type: MaintenanceType.Brakes, desc: 'Brake pad replacement — front axle', status: MaintenanceStatus.Closed, cost: 8000, sched: new Date(now.getTime() - 30 * 24 * 3600000), comp: new Date(now.getTime() - 29 * 24 * 3600000), vendor: 'BrakeMaster Garage' },
  ];

  await Promise.all(
    maintenanceData.map(m =>
      prisma.maintenanceLog.create({
        data: {
          orgId: org.id,
          vehicleId: vehicles[m.v].id,
          maintenanceType: m.type,
          description: m.desc,
          status: m.status,
          cost: m.cost,
          scheduledDate: m.sched,
          completedDate: (m as any).comp || null,
          vendorName: m.vendor,
          createdById: adminUser.id,
        },
      })
    )
  );
  console.log(`✅ Maintenance logs: ${maintenanceData.length} created`);

  // ─── Fuel Logs ──────────────────────────────────────────────
  const fuelLogsData = [
    { v: 0, liters: 80, cost: 7200, odo: 125200, station: 'HP Petrol Pump, Thane', date: new Date(now.getTime() - 5 * 24 * 3600000) },
    { v: 1, liters: 45, cost: 4050, odo: 68700, station: 'BPCL Fuel Station, Vasant Kunj', date: new Date(now.getTime() - 3 * 24 * 3600000) },
    { v: 2, liters: 60, cost: 5400, odo: 92100, station: 'IOC Pump, Marathahalli', date: new Date(now.getTime() - 7 * 24 * 3600000) },
    { v: 3, liters: 120, cost: 10800, odo: 210200, station: 'IOCL Depot, Tambaram', date: new Date(now.getTime() - 15 * 24 * 3600000) },
    { v: 4, liters: 35, cost: 2800, odo: 45000, station: 'Mahanagar Gas CNG, Andheri', date: new Date(now.getTime() - 2 * 24 * 3600000) },
    { v: 6, liters: 0, cost: 850, odo: 18200, station: 'EESL Charging Station, Sector 62', date: new Date(now.getTime() - 1 * 24 * 3600000) },
  ];

  await Promise.all(
    fuelLogsData.map(f =>
      prisma.fuelLog.create({
        data: {
          orgId: org.id,
          vehicleId: vehicles[f.v].id,
          liters: f.liters,
          cost: f.cost,
          odometerReading: f.odo,
          fuelStation: f.station,
          logDate: f.date,
          createdById: adminUser.id,
        },
      })
    )
  );
  console.log(`✅ Fuel logs: ${fuelLogsData.length} created`);

  // ─── Expenses ───────────────────────────────────────────────
  const expensesData = [
    { v: 0, cat: ExpenseCategory.Toll, amount: 2400, date: new Date(now.getTime() - 5 * 24 * 3600000), desc: 'Mumbai-Pune expressway toll — round trip' },
    { v: 1, cat: ExpenseCategory.Parking, amount: 800, date: new Date(now.getTime() - 3 * 24 * 3600000), desc: 'Overnight parking at depot, Delhi' },
    { v: 2, cat: ExpenseCategory.Permit, amount: 5000, date: new Date(now.getTime() - 10 * 24 * 3600000), desc: 'Interstate permit renewal — Karnataka' },
    { v: 3, cat: ExpenseCategory.Maintenance, amount: 18500, date: new Date(now.getTime() - 2 * 24 * 3600000), desc: 'General service — oil, filters, brakes' },
    { v: 4, cat: ExpenseCategory.Fine, amount: 1500, date: new Date(now.getTime() - 7 * 24 * 3600000), desc: 'Overloading fine — Gujarat check post' },
    { v: 6, cat: ExpenseCategory.Misc, amount: 1200, date: new Date(now.getTime() - 1 * 24 * 3600000), desc: 'Driver allowance — overnight trip' },
  ];

  await Promise.all(
    expensesData.map(e =>
      prisma.expense.create({
        data: {
          orgId: org.id,
          vehicleId: vehicles[e.v].id,
          category: e.cat,
          amount: e.amount,
          expenseDate: e.date,
          description: e.desc,
          createdById: adminUser.id,
        },
      })
    )
  );
  console.log(`✅ Expenses: ${expensesData.length} created`);

  // ─── Notifications ──────────────────────────────────────────
  const notificationsData = [
    { type: NotificationType.license_expiry, msg: '⚠️ Driver Suresh Babu\'s HMV license (TN-2020-0054321) expires in 5 days — renewal required urgently.', entity: 'Driver', entityId: drivers[1].id },
    { type: NotificationType.insurance_expiry, msg: '⚠️ Vehicle DL-04-CD-5678 insurance expires in 39 days. Schedule renewal with your insurance provider.', entity: 'Vehicle', entityId: vehicles[1].id },
    { type: NotificationType.maintenance_due, msg: '🔧 Vehicle TN-09-GH-3456 has an open maintenance record (General Service). Scheduled 2 days ago.', entity: 'MaintenanceLog', entityId: null },
    { type: NotificationType.puc_expiry, msg: '⚠️ Vehicle WB-03-KL-2345 PUC certificate expires in 6 days.', entity: 'Vehicle', entityId: vehicles[5].id },
    { type: NotificationType.document_expiry, msg: '📄 Vehicle KA-02-EF-9012 permit expires in 110 days. Plan renewal in advance.', entity: 'Vehicle', entityId: vehicles[2].id },
  ];

  await Promise.all(
    notificationsData.map(n =>
      prisma.notification.create({
        data: {
          orgId: org.id,
          type: n.type,
          message: n.msg,
          targetRole: UserRole.Admin,
          relatedEntityType: n.entity,
          relatedEntityId: n.entityId || undefined,
          isRead: false,
        },
      })
    )
  );
  console.log(`✅ Notifications: ${notificationsData.length} created`);

  // ─── Audit Logs ─────────────────────────────────────────────
  const auditData = [
    { action: 'LOGIN', entity: 'User', desc: 'Admin user logged in', userId: adminUser.id },
    { action: 'CREATE', entity: 'Vehicle', desc: 'Vehicle MH-01-AB-1234 registered', userId: adminUser.id },
    { action: 'DISPATCH', entity: 'Trip', desc: 'Trip TRIP-2026-000002 dispatched — Vehicle DL-04-CD-5678, Driver Suresh Babu', userId: dispatcherUser.id },
    { action: 'COMPLETE', entity: 'Trip', desc: 'Trip TRIP-2026-000001 completed successfully — 150km, 18L fuel consumed', userId: dispatcherUser.id },
    { action: 'UPDATE', entity: 'Driver', desc: 'Driver Pradeep Nair status changed to Suspended — safety review pending', userId: users[3].id },
  ];

  await Promise.all(
    auditData.map((a, i) =>
      prisma.auditLog.create({
        data: {
          orgId: org.id,
          userId: a.userId,
          action: a.action,
          entityType: a.entity,
          description: a.desc,
          createdAt: new Date(now.getTime() - (5 - i) * 3600000),
        },
      })
    )
  );
  console.log(`✅ Audit logs: ${auditData.length} created`);

  console.log('\n🎉 FleetPilot seed complete!');
  console.log('\n📋 Demo credentials (password: FleetPilot@2026):');
  console.log('   admin@fleetpilot.dev     → Admin');
  console.log('   fleet@fleetpilot.dev     → Fleet Manager');
  console.log('   dispatch@fleetpilot.dev  → Dispatcher');
  console.log('   safety@fleetpilot.dev    → Safety Officer');
  console.log('   finance@fleetpilot.dev   → Financial Analyst');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
