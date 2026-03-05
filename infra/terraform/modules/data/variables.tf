variable "name_prefix" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "db_username" {
  type    = string
  default = "gazelle"
}

variable "db_password" {
  type      = string
  sensitive = true
}
