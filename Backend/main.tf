
    provider "aws" {
      region = "us-east-1"
    }
 
    resource "aws_instance" "example" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "gui"
      }
    }
    