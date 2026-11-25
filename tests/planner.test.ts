import test from "node:test";
import assert from "node:assert/strict";
import { allocateBills, nextPaydays, periodEnd } from "../lib/planner";

test("biweekly allocation includes only unpaid bills within the pay period",()=>{
  const bills=[
    {id:"rent",name:"Rent",amount:1000,dueDate:"2026-12-01"},
    {id:"phone",name:"Phone",amount:50,dueDate:"2026-12-10"},
    {id:"paid",name:"Paid",amount:20,dueDate:"2026-12-02",paid:true},
    {id:"later",name:"Later",amount:80,dueDate:"2026-12-30"}
  ];
  const plan=allocateBills(1500,"2026-12-01",bills,"biweekly");
  assert.equal(plan.periodEnd,"2026-12-14");
  assert.equal(plan.billTotal,1050);
  assert.equal(plan.remaining,450);
  assert.equal(plan.bills.length,2);
  assert.equal(plan.overAllocated,false);
});

test("flags when planned bills exceed paycheck income",()=>{
  const plan=allocateBills(500,"2026-12-01",[{id:"1",name:"Rent",amount:900,dueDate:"2026-12-02"}],"weekly");
  assert.equal(plan.overAllocated,true);
  assert.equal(plan.remaining,-400);
});

test("weekly, semimonthly and monthly periods follow calendar boundaries",()=>{
  assert.equal(periodEnd("2026-12-01","weekly"),"2026-12-07");
  assert.equal(periodEnd("2026-12-01","semimonthly"),"2026-12-14");
  assert.equal(periodEnd("2026-12-15","semimonthly"),"2026-12-31");
  assert.equal(periodEnd("2026-01-31","monthly"),"2026-02-27");
});

test("generates biweekly and standard 1st/15th semimonthly payday schedules",()=>{
  assert.deepEqual(nextPaydays("2026-12-01","biweekly",3),["2026-12-01","2026-12-15","2026-12-29"]);
  assert.deepEqual(nextPaydays("2026-12-01","semimonthly",4),["2026-12-01","2026-12-15","2027-01-01","2027-01-15"]);
});
