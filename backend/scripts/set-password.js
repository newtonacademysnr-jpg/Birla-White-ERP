const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const newPassword = process.argv[2];

if (!newPassword || !newPassword.trim()) {
  console.log('=======================================================');
  console.log(' BIRLA WHITE ERP - PASSWORD SETUP TOOL');
  console.log('=======================================================');
  console.log('Usage: node scripts/set-password.js <your_new_password>');
  console.log('Example: node scripts/set-password.js "BirlaWhite@2026"');
  console.log('=======================================================');
  process.exit(1);
}

const cleanPassword = newPassword.trim();

if (cleanPassword.length < 8) {
  console.error('❌ Error: Password should be at least 8 characters long for security.');
  process.exit(1);
}

const hash = bcrypt.hashSync(cleanPassword, 10);
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('ADMIN_PASSWORD_HASH=')) {
    content = content.replace(/ADMIN_PASSWORD_HASH=.*/g, `ADMIN_PASSWORD_HASH=${hash}`);
  } else {
    content += `\nADMIN_PASSWORD_HASH=${hash}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('✅ Password successfully updated in backend/.env!');
} else {
  fs.writeFileSync(envPath, `ADMIN_PASSWORD_HASH=${hash}\n`, 'utf8');
  console.log('✅ Created backend/.env with new password hash!');
}

console.log(`🔑 Username: suraj (or configured ADMIN_USERNAME)`);
console.log(`🛡️  Bcrypt Hash generated: ${hash}`);
