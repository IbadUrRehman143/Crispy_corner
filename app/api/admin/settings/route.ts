import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';
const S=z.object({isOpen:z.boolean(),openingTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),closingTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),deliveryFee:z.number().int().min(0).max(10000),minimumDelivery:z.number().int().min(0).max(100000),estimatedMinutes:z.number().int().min(5).max(240),deliveryAreas:z.string().trim().min(2).max(500)});
export async function GET(){if(!(await requireAdmin()))return Response.json({error:'Unauthorized'},{status:401});return Response.json(await prisma.storeSetting.upsert({where:{id:1},update:{},create:{id:1}}))}
export async function PATCH(req:Request){if(!(await requireAdmin()))return Response.json({error:'Unauthorized'},{status:401});const p=S.safeParse(await req.json().catch(()=>null));if(!p.success)return Response.json({error:'Check store settings'},{status:400});return Response.json(await prisma.storeSetting.upsert({where:{id:1},update:p.data,create:{id:1,...p.data}}))}
