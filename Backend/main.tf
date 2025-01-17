
    provider "aws" {
      region = "us-east-1"
    }
    resource "aws_instance" "e23561c7-3b0a-4067-a8b3-7fc96f73d5dc" {
      ami           = "ami-12345678abcd12345"
      instance_type = "t3.small"
 
      root_block_device {
        volume_size = 50
        volume_type = "gp2"
      }
 
      tags = {
        Name = "linux-e23561c7-3b0a-4067-a8b3-7fc96f73d5dc"  # Unique name to avoid conflicts
      }
    }
    