const crypto = require('crypto');
// CodeQL flags MD5 as a weak/broken cryptographic algorithm
const hash = crypto.createHash('md5').update('secret').digest('hex');
console.log("Password hash:", hash);

// CodeQL flags hardcoded credentials
const dbPassword = "SuperSecretHardcodedPassword123!";
