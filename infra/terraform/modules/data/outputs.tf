output "postgres_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "events_queue_url" {
  value = aws_sqs_queue.events.url
}

output "data_security_group_id" {
  value = aws_security_group.data.id
}
