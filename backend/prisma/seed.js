"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed...');
    // Limpiar datos existentes (opcional, comentar si no quieres borrar)
    console.log('🧹 Limpiando datos existentes...');
    await prisma.investmentPriceSnapshot.deleteMany();
    await prisma.investmentPosition.deleteMany();
    await prisma.investmentInstrument.deleteMany();
    await prisma.fixedTermDeposit.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.income.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.recurringTransaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    // Crear usuario de prueba
    console.log('👤 Creando usuario...');
    const hashedPassword = await bcrypt_1.default.hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'demo@finanzas.com',
            passwordHash: hashedPassword,
        },
    });
    // Crear categorías
    console.log('📁 Creando categorías...');
    const categories = {
        income: {
            sueldo: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Sueldo',
                    type: 'INCOME',
                    color: '#10B981',
                    icon: '💼',
                },
            }),
            freelance: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Freelance',
                    type: 'INCOME',
                    color: '#3B82F6',
                    icon: '💻',
                },
            }),
            alquiler: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Alquiler',
                    type: 'INCOME',
                    color: '#8B5CF6',
                    icon: '🏠',
                },
            }),
        },
        expense: {
            comida: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Comida',
                    type: 'EXPENSE',
                    color: '#F59E0B',
                    icon: '🍔',
                },
            }),
            transporte: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Transporte',
                    type: 'EXPENSE',
                    color: '#EF4444',
                    icon: '🚗',
                },
            }),
            servicios: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Servicios',
                    type: 'EXPENSE',
                    color: '#6366F1',
                    icon: '⚡',
                },
            }),
            entretenimiento: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Entretenimiento',
                    type: 'EXPENSE',
                    color: '#EC4899',
                    icon: '🎬',
                },
            }),
            salud: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Salud',
                    type: 'EXPENSE',
                    color: '#14B8A6',
                    icon: '🏥',
                },
            }),
            ropa: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Ropa',
                    type: 'EXPENSE',
                    color: '#F97316',
                    icon: '👕',
                },
            }),
            educacion: await prisma.category.create({
                data: {
                    userId: user.id,
                    name: 'Educación',
                    type: 'EXPENSE',
                    color: '#06B6D4',
                    icon: '📚',
                },
            }),
        },
    };
    // Crear ingresos de los últimos 6 meses
    console.log('💰 Creando ingresos...');
    const now = new Date();
    const incomesToCreate = [];
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        // Sueldo mensual
        incomesToCreate.push({
            userId: user.id,
            categoryId: categories.income.sueldo.id,
            amount: 350000,
            currency: 'ARS',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
            description: 'Sueldo mensual',
            sourceType: 'Sueldo',
        });
        // Freelance ocasional (3 de los 6 meses)
        if (monthOffset < 3) {
            incomesToCreate.push({
                userId: user.id,
                categoryId: categories.income.freelance.id,
                amount: 50000 + Math.random() * 30000,
                currency: 'ARS',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15 + Math.floor(Math.random() * 10)),
                description: 'Proyecto freelance',
                sourceType: 'Freelance',
            });
        }
        // Ingreso en USD (2 veces)
        if (monthOffset < 2) {
            incomesToCreate.push({
                userId: user.id,
                categoryId: categories.income.freelance.id,
                amount: 500,
                currency: 'USD',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20),
                description: 'Pago en dólares',
                sourceType: 'Freelance',
            });
        }
    }
    // Crear todos los ingresos de una vez
    await prisma.income.createMany({
        data: incomesToCreate,
        skipDuplicates: true,
    });
    console.log(`   ✅ ${incomesToCreate.length} ingresos creados`);
    // Crear gastos realistas de los últimos 6 meses
    console.log('💸 Creando gastos...');
    const expensePatterns = [
        { category: categories.expense.comida, amount: 25000, frequency: 15, variance: 5000 },
        { category: categories.expense.transporte, amount: 15000, frequency: 20, variance: 3000 },
        { category: categories.expense.servicios, amount: 12000, frequency: 1, variance: 2000 },
        { category: categories.expense.entretenimiento, amount: 8000, frequency: 5, variance: 3000 },
        { category: categories.expense.salud, amount: 15000, frequency: 2, variance: 5000 },
        { category: categories.expense.ropa, amount: 20000, frequency: 1, variance: 10000 },
        { category: categories.expense.educacion, amount: 30000, frequency: 1, variance: 5000 },
    ];
    // Preparar todos los gastos en memoria primero
    const expensesToCreate = [];
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        for (const pattern of expensePatterns) {
            const transactionsThisMonth = Math.floor(daysInMonth / pattern.frequency);
            for (let i = 0; i < transactionsThisMonth; i++) {
                const day = Math.floor(Math.random() * daysInMonth) + 1;
                const amount = pattern.amount + (Math.random() - 0.5) * pattern.variance * 2;
                expensesToCreate.push({
                    userId: user.id,
                    categoryId: pattern.category.id,
                    amount: Math.max(100, amount),
                    currency: 'ARS',
                    date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
                    description: `${pattern.category.name} - ${getRandomDescription(pattern.category.name)}`,
                    paymentMethod: getRandomPaymentMethod(),
                });
            }
        }
    }
    // Crear gastos en lotes de 50 para mejor performance
    console.log(`   Creando ${expensesToCreate.length} gastos en lotes...`);
    const batchSize = 50;
    for (let i = 0; i < expensesToCreate.length; i += batchSize) {
        const batch = expensesToCreate.slice(i, i + batchSize);
        await prisma.expense.createMany({
            data: batch,
            skipDuplicates: true,
        });
        if ((i + batchSize) % 100 === 0 || i + batchSize >= expensesToCreate.length) {
            console.log(`   Progreso: ${Math.min(i + batchSize, expensesToCreate.length)}/${expensesToCreate.length}`);
        }
    }
    // Crear algunos gastos en USD
    const usdExpenses = [];
    for (let i = 0; i < 5; i++) {
        const monthOffset = Math.floor(Math.random() * 3);
        const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const day = Math.floor(Math.random() * 28) + 1;
        usdExpenses.push({
            userId: user.id,
            categoryId: categories.expense.entretenimiento.id,
            amount: 20 + Math.random() * 30,
            currency: 'USD',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
            description: 'Suscripción Netflix/Spotify',
            paymentMethod: 'tarjeta',
        });
    }
    if (usdExpenses.length > 0) {
        await prisma.expense.createMany({
            data: usdExpenses,
            skipDuplicates: true,
        });
    }
    // Crear presupuestos para el mes actual y próximo
    console.log('📊 Creando presupuestos...');
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const budgets = [
        { category: categories.expense.comida, amount: 80000 },
        { category: categories.expense.transporte, amount: 45000 },
        { category: categories.expense.servicios, amount: 12000 },
        { category: categories.expense.entretenimiento, amount: 25000 },
        { category: categories.expense.salud, amount: 30000 },
        { category: categories.expense.ropa, amount: 40000 },
        { category: categories.expense.educacion, amount: 35000 },
    ];
    for (const budget of budgets) {
        await prisma.budget.create({
            data: {
                userId: user.id,
                categoryId: budget.category.id,
                amount: budget.amount,
                currency: 'ARS',
                periodStart: currentMonthStart,
                periodEnd: currentMonthEnd,
                repeat: true,
                notes: 'Presupuesto mensual',
            },
        });
    }
    // Crear metas financieras
    console.log('🎯 Creando metas...');
    const goals = [
        {
            name: 'Fondo de emergencia',
            targetAmount: 1000000,
            currency: 'ARS',
            targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
            calculationMode: 'ACCOUNT_BALANCE',
            notes: '6 meses de gastos',
        },
        {
            name: 'Viaje a Europa',
            targetAmount: 5000,
            currency: 'USD',
            targetDate: new Date(now.getFullYear() + 1, 5, 1),
            calculationMode: 'ACCOUNT_BALANCE',
            notes: 'Viaje de verano',
        },
        {
            name: 'Notebook nueva',
            targetAmount: 1500,
            currency: 'USD',
            targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
            calculationMode: 'ACCOUNT_BALANCE',
            notes: 'MacBook Pro',
        },
    ];
    for (const goal of goals) {
        await prisma.goal.create({
            data: {
                userId: user.id,
                ...goal,
                status: 'ACTIVE',
            },
        });
    }
    // Crear plazos fijos
    console.log('🏦 Creando plazos fijos...');
    const fixedTerms = [
        {
            principalAmount: 500000,
            currency: 'ARS',
            tna: 75.5,
            termInDays: 30,
            bankName: 'Banco Nación',
            startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
            autoRenew: true,
        },
        {
            principalAmount: 2000,
            currency: 'USD',
            tna: 4.5,
            termInDays: 90,
            bankName: 'Banco Galicia',
            startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
            autoRenew: false,
        },
        {
            principalAmount: 300000,
            currency: 'ARS',
            tna: 80.0,
            termInDays: 60,
            bankName: 'Mercado Pago',
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            autoRenew: true,
        },
    ];
    for (const ft of fixedTerms) {
        const maturityDate = new Date(ft.startDate);
        maturityDate.setDate(maturityDate.getDate() + ft.termInDays);
        const interestAmount = Number(ft.principalAmount) * (Number(ft.tna) / 100) * (ft.termInDays / 365);
        await prisma.fixedTermDeposit.create({
            data: {
                userId: user.id,
                principalAmount: ft.principalAmount,
                currency: ft.currency,
                tna: ft.tna,
                termInDays: ft.termInDays,
                bankName: ft.bankName,
                startDate: ft.startDate,
                computedMaturityDate: maturityDate,
                computedInterestAmount: interestAmount,
                autoRenew: ft.autoRenew,
            },
        });
    }
    // Crear instrumentos de inversión
    console.log('📈 Creando instrumentos de inversión...');
    const instruments = [
        {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            type: 'STOCK',
            market: 'NYSE',
            currency: 'USD',
        },
        {
            ticker: 'GGAL',
            name: 'Grupo Financiero Galicia',
            type: 'STOCK',
            market: 'BYMA',
            currency: 'ARS',
        },
        {
            ticker: 'AL30',
            name: 'Bono AL30',
            type: 'BOND',
            market: 'MAE',
            currency: 'ARS',
        },
        {
            ticker: 'AAPLD',
            name: 'Apple CEDEAR',
            type: 'CEDEAR',
            market: 'BYMA',
            currency: 'ARS',
        },
    ];
    const createdInstruments = [];
    for (const inst of instruments) {
        createdInstruments.push(await prisma.investmentInstrument.create({
            data: {
                userId: user.id,
                ...inst,
            },
        }));
    }
    // Crear posiciones de inversión
    console.log('💼 Creando posiciones...');
    const positions = [
        {
            instrument: createdInstruments[0], // AAPL
            quantity: 10,
            averageBuyPrice: 175.50,
            accountName: 'Interactive Brokers',
            brokerName: 'IBKR',
        },
        {
            instrument: createdInstruments[1], // GGAL
            quantity: 100,
            averageBuyPrice: 1250.75,
            accountName: 'Cuenta propia',
            brokerName: 'IOL',
        },
        {
            instrument: createdInstruments[2], // AL30
            quantity: 5,
            averageBuyPrice: 45000,
            accountName: 'Cuenta propia',
            brokerName: 'PPI',
        },
        {
            instrument: createdInstruments[3], // AAPLD
            quantity: 50,
            averageBuyPrice: 18500,
            accountName: 'Cuenta propia',
            brokerName: 'IOL',
        },
    ];
    for (const pos of positions) {
        await prisma.investmentPosition.create({
            data: {
                userId: user.id,
                instrumentId: pos.instrument.id,
                quantity: pos.quantity,
                averageBuyPrice: pos.averageBuyPrice,
                accountName: pos.accountName,
                brokerName: pos.brokerName,
            },
        });
    }
    // Crear algunos snapshots de precios
    console.log('📊 Creando snapshots de precios...');
    for (const inst of createdInstruments) {
        const basePrice = inst.type === 'STOCK' && inst.currency === 'USD' ? 180 :
            inst.type === 'STOCK' && inst.currency === 'ARS' ? 1300 :
                inst.type === 'BOND' ? 48000 : 19000;
        for (let i = 0; i < 5; i++) {
            const priceDate = new Date(now);
            priceDate.setDate(priceDate.getDate() - i * 2);
            const price = basePrice + (Math.random() - 0.5) * basePrice * 0.05;
            await prisma.investmentPriceSnapshot.create({
                data: {
                    instrumentId: inst.id,
                    price: price,
                    currency: inst.currency,
                    at: priceDate,
                },
            });
        }
    }
    console.log('✅ Seed completado!');
    console.log(`📧 Usuario: demo@finanzas.com`);
    console.log(`🔑 Contraseña: password123`);
    console.log(`\nDatos creados:`);
    console.log(`- ${incomes.length} ingresos`);
    console.log(`- ~${expensePatterns.reduce((sum, p) => sum + Math.floor(30 / p.frequency), 0) * 6} gastos`);
    console.log(`- ${budgets.length} presupuestos`);
    console.log(`- ${goals.length} metas`);
    console.log(`- ${fixedTerms.length} plazos fijos`);
    console.log(`- ${instruments.length} instrumentos`);
    console.log(`- ${positions.length} posiciones`);
}
function getRandomDescription(category) {
    const descriptions = {
        'Comida': ['Supermercado', 'Restaurante', 'Delivery', 'Café', 'Almuerzo'],
        'Transporte': ['Subte', 'Colectivo', 'Uber', 'Combustible', 'Estacionamiento'],
        'Servicios': ['Luz', 'Gas', 'Internet', 'Agua', 'Cable'],
        'Entretenimiento': ['Cine', 'Concierto', 'Streaming', 'Juegos', 'Salida'],
        'Salud': ['Farmacia', 'Médico', 'Dentista', 'Gimnasio', 'Seguro'],
        'Ropa': ['Zapatos', 'Pantalón', 'Remera', 'Abrigo', 'Accesorios'],
        'Educación': ['Curso', 'Libro', 'Universidad', 'Certificación', 'Material'],
    };
    const options = descriptions[category] || ['Gasto'];
    return options[Math.floor(Math.random() * options.length)];
}
function getRandomPaymentMethod() {
    const methods = ['efectivo', 'tarjeta', 'transferencia', 'débito'];
    return methods[Math.floor(Math.random() * methods.length)];
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map