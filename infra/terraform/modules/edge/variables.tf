variable "name_prefix" {
  type = string
}

variable "create_dns_record" {
  type    = bool
  default = false
}

variable "zone_id" {
  type    = string
  default = ""
}

variable "dns_name" {
  type    = string
  default = "api.gazellecoffee.com"
}

variable "alb_dns_name" {
  type    = string
  default = ""
}

variable "alb_zone_id" {
  type    = string
  default = ""
}
