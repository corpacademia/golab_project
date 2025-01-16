const { Pool } = require('pg');
const { spawn } = require('child_process');
const createdTables = require('../createTables/tables')
const dotenv = require('dotenv')


dotenv.config()
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database:process.env.database,
  password:process.env.password,
  port: process.env.port,
});


const createLab=async(req,res)=>{
    try{
       const {data,user} = req.body;
       const {type,details,platform,provider,config,instance} = data
       const query_instance=`INSERT INTO createlab (user_id,type,platform,provider,os,cpu,ram,storage,instance,title,description,duration) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`
       const output = await pool.query(query_instance,[user.id,type,platform,provider,config.os,config.cpu,config.ram,config.storage,instance,details.title,details.description,details.duration])
       if(!output.rows[0]){
        return res.status(405).send({
            success:false,
            message:"Could not store the lab catalogue",
        })
       }
       res.status(200).send({
        success:true,
        message:"Successfully stored the catalogue",
        output:output.rows[0],
       })
    }
    catch(error){
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Could not create the lab",
            error
        })
    }
}

const getAllLab = async(req,res)=>{
    try{
        const query_instance = 'SELECT * FROM createlab'
        const labs = await pool.query(query_instance);
        if(!labs.rows){
            return res.status(405).send({
                success:false,
                message:"Could not get the labs"
            })
        }
        return res.status(200).send({
            success:true,
            message:'Successfully retrieved the labs',
            data:labs.rows
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Error in gettings the labs",
            error,
        })
    }
}

const getLabsConfigured=async(req,res)=>{
    try{
        const {admin_id} = req.body;
        const query_instance = `
    SELECT DISTINCT cl.* 
    FROM createlab cl
    INNER JOIN lab_configurations lc ON cl.lab_id = lc.lab_id
    WHERE lc.admin_id = $1
`;
const labs = await pool.query(query_instance, [admin_id]);

        if(!labs.rows){
            return res.status(404).send({
                success:false,
                message:"Could not get the labs"
            })
        }
        return res.status(200).send({
            success:true,
            message:'Successfully retrieved the labs',
            data:labs.rows
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Error in gettings the labs",
            error,
        })
    }
}

const getLabOnId = async(req,res)=>{
    try{
        const {labId} = req.body;
        const query_instance =`SELECT * from creatlab where lab_id=$1`
        const result = await pool.query(query_instance,[labId]);

        if(!result.rows[0]){
            return res.status(405).send({
                success:false,
                message:"Invalid lab id"
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully accessed lab catalogue",
            data:result.rows[0],
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Error in getting the lab",
            error,
        })
    }
}

const assignLab = async(req,res)=>{
    try{
        const {lab,duration,userId,assign_admin_id} = req.body;
        const checkAlreadyAssigned = await pool.query(`SELECT * FROM labassignments WHERE user_id=$1 AND lab_id=$2`,[userId,lab[0].lab_id])
        if(checkAlreadyAssigned.rows[0]){
            return res.status(409).send({
                success:false,
                message:"Data already exists"
            })
        }

        const query_instance = `INSERT INTO labassignments(lab_id,user_id,status,assigned_admin_id,duration) VALUES($1,$2,$3,$4,$5) RETURNING *`
        const result = await pool.query(query_instance,[lab[0].lab_id,userId,'pending',assign_admin_id,duration])

        if(!result.rows[0]){
            return res.status(404).send({
                success:false,
                message:"The data is invalid",
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully assigned the lab",
            data:result.rows[0],
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Error in assignning the lab",
            error,
        })
    }
}
const getAssignLabOnId = async(req,res)=>{
    try {
        const {userId} = req.body;
        const query_instance = `SELECT * FROM labassignments WHERE user_id=$1`
        const result = await pool.query (query_instance,[userId])
        if(!result.rows){
            return res.status(404).send({
                success:false,
                message:"Error in retrieving the labs",
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully accessed the labs",
            data:result.rows,
        })
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"Server error",
            error,
        })
    }
}
const ec2Terraform =  async(req,res)=>{


    const {cloudPlatform} = req.body
    //select type of cloud 
    // let scriptPath;

    // Select the appropriate Python script based on the cloud platform
    // switch (cloudPlatform.toLowerCase()) {
    //     case 'aws':
    //         scriptPath = 'EC2.py'; // Path to the AWS-specific script
    //         break;
    //     case 'azure':
    //         scriptPath = 'azure_script.py'; // Path to the Azure-specific script
    //         break;
    //     default:
    //         return res.status(400).json({ error: 'Unsupported cloud platform' });
    // }
 
    //run the script
        const pythonProcess = spawn('python', ['EC2.py']);
      
        let result = '';
      
        // Capture the output of the Python script
        pythonProcess.stdout.on('data', (data) => {
          console.log('output produced')
          function formatOutput(output) {
            // Replace \r\n with actual newlines
            const formattedOutput = output.replace(/\r\n/g, '\n');
            return formattedOutput;
        }
          result += formatOutput(data.toString()); // Accumulate the script's output
          console.log(`stdout: ${data}`);
        });
      
        pythonProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
      
        pythonProcess.on('close', (code) => {
          console.log(`${cloudPlatform} process exited with code ${code}`);
          if (code === 0) {
            // Send the accumulated result once the process exits
            res.json({ message: 'Python script executed successfully', result });
          } else {
            res.status(500).json({ error: 'Python script execution failed' });
          }
        });
      
        
    
      //  Set a timeout for the process (e.g., 30 seconds)
    //    setTimeout(() => {
    //     pythonProcess.kill();
    //     res.status(500).send({ error: 'Python script execution timed out.' });
    // }, 30000); 
    
    }
const getInstanceOnParameters = async(req,res)=>{
    try {
        const {cloud,cpu,ram,storage} = req.body;
        let table;
        switch (cloud.toLowerCase()) {
            case 'aws':
                table = 'ec2_instance'; // Path to the AWS-specific script
                break;
            case 'azure':
                table = 'azure_vm'; // Path to the Azure-specific script
                break;
            default:
                return res.status(400).json({ error: 'Unsupported cloud platform' });
        }

        const core = cpu.toString()
        const memory = ram.toString()
        const query_instance = `SELECT * FROM ${table} WHERE vcpu=$1 AND memory=$2`
        const result = await pool.query(query_instance,[core,memory])

        if(!result.rows){
            return res.status(404).send({
                success:true,
                message:"Could get the data"
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully accessed the data",
            result:result.rows
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Error in getting the instances",
            error,
        })
    }
}
const getInstanceDetailsForPricing = async(req,res)=>{
    try {
        let {provider,instance,cpu,ram} = req.body;
        let table,instancename;
        switch(provider.toLowerCase()){
            case 'aws':
                table='ec2_instance'
                instancename='instanceName'
                break
            case 'azure':
                table='azure_vm'
                instancename='instance'
                break
        }
        const query_instance = `
    SELECT * 
    FROM ${table} 
    WHERE REPLACE(${instancename}, E'\n', '') = $1 
    AND vcpu = $2
      AND memory = $3
      
`;

        const result = await pool.query(query_instance,[instance,cpu,ram])
        console.log(result.rows[0])
        if(!result.rows[0]){
            return res.status(404).send({
                success:false,
                message:"No data with the details"
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully Accessed the details",
            data:result.rows[0]
        })
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"Error in accessing the data",
            error,
        })
    }
}
const updateLabsOnConfig=async(req,res)=>{
    try {
        const {lab_id,admin_id,config_details} = req.body;
        const query_instance = `Insert into lab_configurations (lab_id,admin_id,config_details) VALUES($1,$2,$3) RETURNING *`;
        const result = await pool.query(query_instance,[lab_id,admin_id,config_details])
        if(!result.rows[0]){
            return res.status(404).send({
                success:false,
                message:"Invalid Details for updating lab"
            })
        }
        return res.status(201).send({
            success:true,
            message:"Successfully updated the lab configured",
            data:result.rows[0]
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Could not update the lab config",
            error,
        })
    }
}

module.exports = {
    createLab,
    getAllLab,
    getLabOnId,
    assignLab,
    getAssignLabOnId,
    ec2Terraform,
    getInstanceOnParameters,
    getInstanceDetailsForPricing,
    getLabsConfigured,
    updateLabsOnConfig,
}