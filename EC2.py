import psycopg2
import subprocess
import boto3
import os
import json
 
# AWS client setup
ec2 = boto3.client("ec2", region_name="us-east-1")
 
# Step 1: Fetch instance data from the PostgreSQL database
def fetch_instance_data():
    database_config = {
        'user': 'postgres',
        'host': 'localhost',
        'database': 'golab',
        'password': 'Khan@123',
        'port': 5432,
    }
    query = """
    SELECT lab_id, instance, storage, os, title
    FROM createlab
    WHERE lab_id NOT IN (SELECT lab_id FROM instances)
    ORDER BY created_at DESC
    LIMIT 1;
    """
 
    conn = psycopg2.connect(**database_config)
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchone()
    conn.close()
 
    if not result:
        return None
    lab_id, instance_type, storage_size, os, instance_name = result
    return lab_id, instance_type, storage_size, os, instance_name
 
# Step 2: Generate Terraform configuration file for a new instance
def generate_terraform_file(lab_id, instance_type, storage_size, ami_id, instance_name):
    directory = os.path.join(os.getcwd(), f"terraform_{lab_id}")  # Create a full path for the Terraform directory
    if not os.path.exists(directory):  # Create directory for this lab if it doesn't exist
        os.makedirs(directory)
 
    terraform_config = f"""
    provider "aws" {{
      region = "us-east-1"
    }}
 
    resource "aws_instance" "instance_{lab_id}" {{
      ami           = "{ami_id}"
      instance_type = "{instance_type}"
 
      root_block_device {{
        volume_size = {storage_size}
        volume_type = "gp2"
      }}
 
      tags = {{
        Name = "{instance_name}"
      }}
    }}
    """
 
    config_path = os.path.join(directory, "main.tf")
    with open(config_path, "w") as file:
        file.write(terraform_config)
    print(f"Terraform configuration for {instance_name} created in {directory}.")
    return directory
 
# Step 3: Run Terraform commands
def run_terraform(directory):
    try:
        subprocess.run(["terraform", "init"], cwd=directory, check=True)
        subprocess.run(["terraform", "apply", "-auto-approve"], cwd=directory, check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Terraform execution failed in {directory}: {e}")
 
# Step 4: Get instance ID from Terraform output
def get_instance_id(directory):
    result = subprocess.run(["terraform", "show", "-json"], cwd=directory, capture_output=True, text=True, check=True)
    terraform_output = json.loads(result.stdout)
    for resource in terraform_output["values"]["root_module"]["resources"]:
        if resource["type"] == "aws_instance":
            return resource["values"]["id"]
    raise ValueError("No instance ID found in Terraform output.")
 
# Step 5: Store instance ID in the PostgreSQL database
def store_instance_in_database(lab_id, instance_id):
    database_config = {
        'user': 'postgres',
        'host': 'localhost',
        'database': 'golab',
        'password': 'Khan@123',
        'port': 5432,
    }
    query = """
    CREATE TABLE IF NOT EXISTS instances (
        id SERIAL PRIMARY KEY,
        lab_id UUID,
        instance_id TEXT NOT NULL
    );
 
    INSERT INTO instances (lab_id, instance_id) VALUES (%s, %s);
    """
 
    conn = psycopg2.connect(**database_config)
    cursor = conn.cursor()
    cursor.execute(query.split(";")[0])  # Create table if not exists
    cursor.execute(query.split(";")[1], (lab_id, instance_id))  # Insert data
    conn.commit()
    conn.close()
 
# Step 6: Get AMI for the specified OS
def get_ami_for_os(os):
    ami_mapping = {
        "linux": "ami-12345678abcd12345",  # Replace with actual Linux AMI
        "windows": "ami-05b4ded3ceb71e470",  # Replace with actual Windows AMI
        "ubuntu": "ami-0dba2cb6798deb6d8",  # Replace with actual Ubuntu AMI
        "redhat": "ami-08f3d892de259504d",  # Replace with actual Red Hat AMI
    }
    if os not in ami_mapping:
        raise ValueError(f"Unsupported OS: {os}")
    return ami_mapping[os]
 
if __name__ == "__main__":
    try:
        # Fetch instance details
        data = fetch_instance_data()
        if data:
            lab_id, instance_type, storage_size, os, instance_name = data
 
            # Get AMI for the specified OS
            ami_id = get_ami_for_os(os)
 
            # Generate Terraform configuration
            directory = generate_terraform_file(lab_id, instance_type, storage_size, ami_id, instance_name)
 
            # Run Terraform to create the instance
            run_terraform(directory)
 
            # Get the created instance ID
            instance_id = get_instance_id(directory)
 
            # Store instance ID in the database
            store_instance_in_database(lab_id, instance_id)
 
            print(f"Instance created successfully with ID: {instance_id}")
        else:
            print("No new data found in the database.")
    except Exception as e:
        print(f"Error: {e}")

