resource "aws_cloudwatch_dashboard" "platform" {
  dashboard_name = "${var.name_prefix}-platform"
  dashboard_body = jsonencode({
    widgets = []
  })
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  for_each            = toset(var.service_names)
  alarm_name          = "${var.name_prefix}-${each.value}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "High CPU for ${each.value}"

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = each.value
  }
}
