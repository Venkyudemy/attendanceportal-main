const bcrypt = require('bcryptjs');

// Test script to verify bcrypt hash for Admin@123
console.log('🔐 Testing bcrypt hash for Admin@123...');

const password = 'Admin@123';
const hashedPassword = bcrypt.hashSync(password, 12);

console.log('📧 Password:', password);
console.log('🔒 Hashed Password:', hashedPassword);
console.log('✅ Hash Length:', hashedPassword.length);
console.log('🔍 Hash starts with $2a$12$:', hashedPassword.startsWith('$2a$12$'));

// Test verification
const isValid = bcrypt.compareSync(password, hashedPassword);
console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');

// Test with wrong password
const isInvalid = bcrypt.compareSync('wrongpassword', hashedPassword);
console.log('❌ Wrong password test:', isInvalid ? 'FAILED (should be false)' : 'SUCCESS (correctly false)');

console.log('\n🎯 Use this hash in your scripts:');
console.log(hashedPassword);
