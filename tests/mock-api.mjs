// UI test fixture only. Production always uses the configured real API.
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
const user={id:'fixture-user',name:'dimdim',email:'preview@example.test'}
const data={contacts:[],folders:[],debts:[]}
const payments=[]
createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Content-Type','application/json')
  if(req.method==='OPTIONS'){res.end();return}
  const chunks=[];for await(const chunk of req)chunks.push(chunk)
  let body={};try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}')}catch{}
  const route=req.url.split('?')[0].replace('/api/','').split('/')
  const send=(value,status=200)=>{res.statusCode=status;res.end(JSON.stringify(value))}
  if(route[0]==='auth'){send({user,accessToken:'local-test-token',refreshToken:'local-test-refresh-token'});return}
  if(route[0]==='users'){if(req.method==='PATCH')user.name=body.name;send(user);return}
  if(route[0]==='debts'&&route[2]==='payments'){
    if(req.method==='POST'){const payment={...body,id:randomUUID(),debt_id:route[1],paid_at:new Date().toISOString()};payments.push(payment);const debt=data.debts.find(d=>d.id===route[1]);if(debt)debt.status=payments.filter(p=>p.debt_id===debt.id).reduce((s,p)=>s+Number(p.amount),0)>=debt.amount?'paid':'partial';send(payment,201)}else send(payments.filter(p=>p.debt_id===route[1]));return
  }
  const list=data[route[0]]
  if(!list){send({error:'Not found'},404);return}
  const id=route[1],index=list.findIndex(item=>item.id===id)
  if(req.method==='GET'){send(id?list[index]:list);return}
  if(req.method==='POST'){const item={...body,id:randomUUID(),status:'pending',created_at:new Date().toISOString()};list.push(item);send(item,201);return}
  if(index===-1){send({error:'Not found'},404);return}
  if(req.method==='PATCH'){Object.assign(list[index],body);send(list[index]);return}
  if(req.method==='DELETE'){list.splice(index,1);res.statusCode=204;res.end();return}
}).listen(4176,'127.0.0.1',()=>console.log('UI test API: http://127.0.0.1:4176/api'))
