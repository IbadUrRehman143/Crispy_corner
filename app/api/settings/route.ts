import { prisma } from '@/lib/prisma';
export async function GET(){
  const s=await prisma.storeSetting.upsert({where:{id:1},update:{},create:{id:1}});
  return Response.json(s);
}
