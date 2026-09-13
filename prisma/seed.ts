import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';
const p=new PrismaClient();
async function main(){
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();const password=process.env.ADMIN_PASSWORD;
 if(!email) throw new Error('ADMIN_EMAIL is required');
 if(!password||password==='CHANGE_ME_BEFORE_SEEDING'||password.length<12) throw new Error('ADMIN_PASSWORD must be a real password with at least 12 characters');
 const passwordHash=await bcrypt.hash(password,12);
 await p.admin.upsert({where:{email},update:{passwordHash},create:{email,passwordHash}});
 console.log(`Admin ready: ${email}. No demo menu was seeded.`);
}
main().finally(()=>p.$disconnect());
