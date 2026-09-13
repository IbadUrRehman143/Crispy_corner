import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendOrderConfirmation } from "@/lib/messaging";
import { z } from "zod";
import { randomBytes } from "crypto";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^\+?[0-9][0-9\s()-]{8,19}$/),
    address: z.string().trim().max(300).optional().default(""),
  }),
  type: z.enum(["Pickup", "Delivery"]),
  items: z.array(z.object({id: z.string().min(1), qty: z.number().int().min(1).max(50)})).min(1).max(50),
}).superRefine((value, ctx) => {
  if (value.type === "Delivery" && !value.customer.address) ctx.addIssue({code:"custom",path:["customer","address"],message:"Address required"});
});

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return Response.json(rows.map((order) => ({
    ...order, id: order.id.toString(),
    items: order.items.map((item) => ({ ...item, id: item.id.toString(), orderId: item.orderId.toString() })),
  })));
}


export async function POST(req:Request){const body=await req.json().catch(()=>null);const parsed=orderSchema.safeParse(body);if(!parsed.success)return Response.json({error:"Please check order details",details:z.treeifyError(parsed.error)},{status:400});const data=parsed.data;try{const productIds=[...new Set(data.items.map(item=>item.id))];const products=await prisma.product.findMany({where:{id:{in:productIds},active:true}});if(products.length!==productIds.length)return Response.json({error:"One or more menu items are unavailable"},{status:409});const productMap=new Map(products.map(product=>[product.id,product]));const total=data.items.reduce((sum,item)=>sum+productMap.get(item.id)!.price*item.qty,0);const orderNo=`CC-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;const order=await prisma.order.create({data:{orderNo,customerName:data.customer.name,phone:data.customer.phone,address:data.customer.address||null,orderType:data.type,total,items:{create:data.items.map(item=>{const product=productMap.get(item.id)!;return{productId:product.id,name:product.name,unitPrice:product.price,qty:item.qty}})}}});const origin=process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin;sendOrderConfirmation({orderNo,phone:order.phone,total,trackingUrl:`${origin}/order/${orderNo}`}).then(async result=>{if(result.sent)await prisma.order.update({where:{id:order.id},data:{messageSent:true}})}).catch(()=>{});return Response.json({orderNo,total,status:order.status},{status:201})}catch(error){console.error("Order creation failed:",error);return Response.json({error:"Could not place order. Please try again."},{status:500})}}

export async function PATCH(req:Request){if(!(await requireAdmin()))return Response.json({error:"Unauthorized"},{status:401});const body=await req.json();const allowedStatuses=["Received","Preparing","Ready","OutForDelivery","Completed","Cancelled"];if(!body?.orderNo||!allowedStatuses.includes(body.status))return Response.json({error:"Invalid request"},{status:400});try{const order=await prisma.order.update({where:{orderNo:body.orderNo},data:{status:body.status}});return Response.json({orderNo:order.orderNo,status:order.status})}catch{return Response.json({error:"Order not found"},{status:404})}}
