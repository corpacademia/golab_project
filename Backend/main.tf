
    provider "aws" {
      region = "us-east-1"
    }
 
    resource "aws_instance" "ec35" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.large"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "ec35"
      }
    }
    
    resource "aws_instance" "instance_9f117445-1b9f-46df-a02f-a309629eb9b3" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "ec1"
      }
    }
    
    resource "aws_instance" "instance_e5f33c1c-56ce-46ec-8225-42f6265b8e6d" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "golab"
      }
    }
    
    resource "aws_instance" "instance_dc747f26-c0e5-44da-bfd5-38ceb83efc5b" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "Parveez"
      }
    }
    