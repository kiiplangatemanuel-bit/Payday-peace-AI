export type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly" | "irregular";
export type Bill = { id:string; name:string; amount:number; dueDate:string; paid?:boolean };

function parseDate(value:string){return new Date(value+"T12:00:00");}
function formatDate(value:Date){return value.toISOString().slice(0,10);}
function addDays(value:Date,days:number){const result=new Date(value);result.setDate(result.getDate()+days);return result;}
function addCalendarMonth(value:Date){const result=new Date(value);const day=result.getDate();result.setDate(1);result.setMonth(result.getMonth()+1);const last=new Date(result.getFullYear(),result.getMonth()+1,0).getDate();result.setDate(Math.min(day,last));return result;}

export function money(n:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number.isFinite(n)?n:0)}

export function periodEnd(nextPayday:string,frequency:Frequency){
  const start=parseDate(nextPayday);
  if(Number.isNaN(start.getTime()))return nextPayday;
  if(frequency==="weekly")return formatDate(addDays(start,6));
  if(frequency==="biweekly"||frequency==="irregular")return formatDate(addDays(start,13));
  if(frequency==="semimonthly"){
    const end=start.getDate()<15?new Date(start.getFullYear(),start.getMonth(),14,12):new Date(start.getFullYear(),start.getMonth()+1,0,12);
    return formatDate(end);
  }
  return formatDate(addDays(addCalendarMonth(start),-1));
}

export function allocateBills(income:number,nextPayday:string,bills:Bill[],frequency:Frequency){
  const end=periodEnd(nextPayday,frequency);
  const due=bills.filter(b=>!b.paid&&b.dueDate>=nextPayday&&b.dueDate<=end);
  const billTotal=due.reduce((sum,b)=>sum+Math.max(0,Number(b.amount)||0),0);
  return {periodEnd:end,bills:due,billTotal,remaining:income-billTotal,overAllocated:billTotal>income};
}

export function nextPaydays(start:string,frequency:Frequency,count=6){
  const result:string[]=[];let cursor=parseDate(start);
  if(Number.isNaN(cursor.getTime()))return result;
  for(let i=0;i<count;i++){
    result.push(formatDate(cursor));
    if(frequency==="weekly")cursor=addDays(cursor,7);
    else if(frequency==="biweekly")cursor=addDays(cursor,14);
    else if(frequency==="semimonthly")cursor=cursor.getDate()<15?new Date(cursor.getFullYear(),cursor.getMonth(),15,12):new Date(cursor.getFullYear(),cursor.getMonth()+1,1,12);
    else if(frequency==="monthly")cursor=addCalendarMonth(cursor);
    else break;
  }
  return result;
}
