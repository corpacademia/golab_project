
    provider "aws" {
      region = "us-east-1"
    }
    resource "aws_instance" "be5a223a-234c-47ff-85a7-98b3dbb66d31" {
      ami           = "ami-05b4ded3ceb71e470"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "1-be5a223a-234c-47ff-85a7-98b3dbb66d31"  # Unique name to avoid conflicts
      }
    }
    