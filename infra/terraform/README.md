# Terraform

Environments:
- `envs/dev`
- `envs/staging`
- `envs/prod`

Modules:
- `modules/networking`
- `modules/data`
- `modules/compute`
- `modules/observability`
- `modules/edge`

## Commands

```bash
terraform -chdir=infra/terraform/envs/dev init
terraform -chdir=infra/terraform/envs/dev plan
terraform -chdir=infra/terraform/envs/dev apply
```
