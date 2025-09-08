const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkContinentField() {
  try {
    console.log('Checking if continent field exists in visa_countries table...');
    
    // Try to query the continent field
    const result = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'visa_countries' 
      AND COLUMN_NAME = 'continent'
    `;
    
    if (result && result.length > 0) {
      console.log('✅ Continent field exists in the database');
      console.log('Available columns:', result);
    } else {
      console.log('❌ Continent field does NOT exist in the database');
      console.log('You need to run a database migration to add the continent field');
    }
    
    // Also try to get a sample record to see what fields are available
    const sample = await prisma.visa_countries.findFirst();
    if (sample) {
      console.log('\nSample record fields:', Object.keys(sample));
    }
    
  } catch (error) {
    console.error('Error checking continent field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContinentField();
