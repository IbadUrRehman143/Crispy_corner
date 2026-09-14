import {clearCustomerSession} from '@/lib/customerAuth';export async function POST(){await clearCustomerSession();return Response.json({ok:true})}
