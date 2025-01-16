const { Pool } = require('pg');
const createdTables = require('../createTables/tables')
const {hashPassword , comparePassword} = require('../helper/authHelper')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')


dotenv.config()
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database:process.env.database,
  password:process.env.password,
  port: process.env.port,
});

// const connect = async ()=>{
//     const client = await pool.connect();
// }
// connect();

const signupController = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const query_instance = `INSERT INTO users (name,email,password) VALUES($1,$2,$3) RETURNING *`
        const HashedPassword = await hashPassword(password)
        const result = await pool.query(query_instance,[name,email,HashedPassword])
        if(!result.rows[0]){
            return res.status(405).send({
                success:false,
                message:"Error occured in storing data", 
            })
        }
        return res.status(200).send({
            success:true,
            result:result.rows[0],
            message:"Successfully inserted data",
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not insert the data",
            error
        })
    }
    
 }

const loginController = async (req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            res.send("Email or Password is missing")
        }
        const getUser = await pool.query(`SELECT * FROM users WHERE email=$1`,[email])
        const comparedPassword = await comparePassword(password,getUser.rows[0].password);
        if(!comparedPassword){
            return res.send({
                success:false,
                message:"Password is Invalid"
            })
        }
        const query_instance = `SELECT * FROM users WHERE email=$1 AND password=$2 `
        const result = await pool.query(query_instance,[email,getUser.rows[0].password]);
        if(!result.rows[0]){
            return res.status(405).send({
            success:false,
            message:"Invalid Credentials",
            })
            
        }
        const currentDate = new Date();

// Get the day, month, and year
const day = currentDate.getDate();
const month = currentDate.getMonth(); // 0-11
const year = currentDate.getFullYear();

// Array of month names
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get the month name
const monthName = monthNames[month];

console.log(`${day} ${monthName} ${year}`); // Output: "3 January 2025" (example)
   const lactive = await pool.query(`update users set lastactive = $1 where email=$2 returning *`,[`${day} ${monthName} ${year}`,email])
   if(!lactive.rows[0]){
    return res.status(404).send({
        success:false,
        message:"Could not insert the lastactive"
    })
   }

        const token = jwt.sign({_id:result.rows[0].id},process.env.SECRET_KEY)
        return res.status(200).send({
            success:true,
            message:"Successfully Accessed",
            result:result.rows[0],
            token,
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not find the user",
            error,
        })
    }
}
const getAllUsers = async (req,res)=>{
    try{
        const query_instance=`select * from users`;
        const result = await pool.query(query_instance)

        if(!result.rows){
            return res.status(204).send({
                success:false,
                message:"No users are available",
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully accessed users",
            data:result.rows
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not access the users",
            error
        })
    }
}
const addUser = async (req,res)=>{
    try{
        const {name,email,role,organization}=req.body.formData;
        const {id}= req.body.user;
        const password='123';
        const HashedPassword = await hashPassword(password)
        const query_instance =`INSERT INTO users (name,email,password,role,organization,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
        const result = await pool.query(query_instance,[name,email,HashedPassword,role,organization,id])
        if(!result.rows[0]){
            return res.status(204).send({
                success:false,
                message:"could not add user",
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully added user",
            data:result.rows[0],
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not add the user",
            error:error.message,
            detail:error.detail,
        })
    }
}
const getUserData = async (req,res)=>{
    try{
        const userId = req.params.id;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (!user.rows[0]) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Query 2: Fetch User stats
        const stats = await pool.query('SELECT * FROM UserStats WHERE UserId = $1', [userId]);
        // Query 3: Fetch User certifications (if in a separate table)
        const certifications = await pool.query('SELECT CertificationName FROM Certifications WHERE UserId = $1', [userId]);
        // Combine results
        const response = {
            user: user.rows[0],                 // Basic user information
            stats: stats.rows[0] || {},         // User statistics (if available)
            certifications: certifications.rows.map(row => row.certificationname) // Certification list
        };
        if(!response){
            return res.status(204).send({
                success:false,
                message:"No data",
            })
        }
        return res.status(200).send({
              success:true,
              message:"Successfully accessed data",
              response,
    })
}
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not access the user data",
            error,
        })
    }
}

const updateUserOrganization = async(req,res)=>{
    try{
        const {userId,values} = req.body;
        const [org_name,type]=values.split(',');
        if(!userId || !org_name || !type ){
            return res.send("Some field is missing")
        }
        const update_query = `update users set organization = $1 , organization_type = $2  where id =$3 returning *`
        const update = await pool.query(update_query,[org_name,type,userId]);

        if(!update.rows[0]){
            return res.status(404).send({
                success:false,
                message:"Invalid field or userid"
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully updated",
            data:update.rows[0],
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not update the field",
            error,
        })
    }
}

const updateUserRole = async(req,res)=>{
    try{
        const {userId,role} = req.body;
        if(!userId || !role){
            return res.send("Userid or role is missing")
        }
        const update_query = `update users set role = $1 where id = $2 returning *`;
        const update = await pool.query(update_query,[role,userId]);

        if(!update.rows[0]){
            return res.status(400).send({
                success:false,
                message:"Userid or role is invalid"
            })
        }
        return res.status(200).send({
            success:true,
            message:"Successfully updated users role",
            data:update.rows[0]
        })
    }
    catch(error){
        return res.status(500).send({
            success:false,
            message:"Could not update data",
            error,
        })
    }
}

module.exports={
    signupController,
    loginController,
    getAllUsers,
    addUser,
    getUserData,
    updateUserOrganization,
    updateUserRole,
}