const User = require('../models/User');
console.log('User loaded:', !!User);
console.log('typeof User.findOne:', typeof (User && User.findOne));
console.log('User keys:', Object.keys(User || {}));
process.exit(0);
