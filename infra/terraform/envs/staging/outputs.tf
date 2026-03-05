output "vpc_id" {
  value = module.networking.vpc_id
}

output "postgres_endpoint" {
  value = module.data.postgres_endpoint
}

output "redis_endpoint" {
  value = module.data.redis_endpoint
}

output "ecs_cluster_name" {
  value = module.compute.cluster_name
}

output "waf_arn" {
  value = module.edge.waf_arn
}
