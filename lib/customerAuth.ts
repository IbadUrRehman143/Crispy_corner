import {cookies} from 'next/headers';import {SignJWT,jwtVerify} from 'jose';
const key=()=>{if(!process.env.AUTH_SECRET)throw new Error('AUTH_SECRET is not configured');return new TextEncoder().encode(process.env.AUTH_SECRET)};
export async function createCustomerSession(id:string){const token=await new SignJWT({sub:id,role:'customer'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('30d').sign(key());(await cookies()).set('tb_customer',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:2592000})}
export async function getCustomerSession(){try{const t=(await cookies()).get('tb_customer')?.value;if(!t)return null;const {payload}=await jwtVerify(t,key());return payload.role==='customer'?payload:null}catch{return null}}
export async function clearCustomerSession(){(await cookies()).set('tb_customer','',{httpOnly:true,path:'/',maxAge:0})}
