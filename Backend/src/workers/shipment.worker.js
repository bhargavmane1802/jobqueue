import { Worker } from "bullmq";
import { query } from "../config/database.js";
const shipmentWorker=new Worker('shipmentQueue',async(job)=>{
    if(job.name=='createShipment'){
        try {
            const{orderId}=job.data;
            const shipment= await query(` insert into shipments (order_id) values ($1,)`,[orderId]);
            const result =await updateOrder(orderId,"shipment");
        } catch (error) {
            throw err;
        }
    }
    if(job.name=='cancelShipment'){
        const {orderId}=job.data;
        const shipment=await query('update shipments set status=$1 where order_id=$2 and status!=$1 returning id',['cancelled',orderId]);
        if(shipment.rows.length==0){return {success:"duplicate"};}
        return {success:"updated shipment status"};
    }
},{ connection: redis });
shipmentWorker.on('completed',(job,result)=>{
    console.log('shipment updated');
})
shipmentWorker.on('failed',(job,err)=>{
    console.log(
      `attempt ${job.attemptsMade} of ${job.opts.attempts} failed`,err
    );
});
