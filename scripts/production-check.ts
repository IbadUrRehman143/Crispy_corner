import "dotenv/config";
const required=['DATABASE_URL','AUTH_SECRET','ADMIN_EMAIL','ADMIN_PASSWORD','NEXT_PUBLIC_APP_URL'];
const missing=required.filter(k=>!process.env[k]||process.env[k]?.includes('CHANGE_ME')||process.env[k]?.includes('your-domain'));
const channel=(process.env.MESSAGE_CHANNEL||'whatsapp').toLowerCase();
if(!process.env.TWILIO_ACCOUNT_SID||!process.env.TWILIO_AUTH_TOKEN||(channel==='sms'?!process.env.TWILIO_SMS_FROM:!process.env.TWILIO_WHATSAPP_FROM)) missing.push('Twilio production credentials');
if(missing.length){console.error('NOT PRODUCTION READY. Missing:',[...new Set(missing)].join(', '));process.exit(1)}
if((process.env.AUTH_SECRET||'').length<32){console.error('AUTH_SECRET must be at least 32 characters');process.exit(1)}
console.log('Environment configuration passes production checks.');
