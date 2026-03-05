variable "name_prefix" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "service_security_group_ids" {
  type = list(string)
}

variable "services" {
  type = map(object({
    image          = string
    cpu            = number
    memory         = number
    container_port = number
  }))
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}
