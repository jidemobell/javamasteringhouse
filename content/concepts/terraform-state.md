## Terraform state — the file that makes plan possible

Terraform does **not** inspect the world to decide what exists. It compares your
`.tf` files against `terraform.tfstate`, which records what it created last time.
Everything surprising about Terraform follows from that one fact.

### The three-way comparison

```
  your .tf files          terraform.tfstate           the real world
   (intent)                 (records)                  (exists)
        \                       |                        /
         \____ plan ____ refresh (read-only) ___________/
```

`plan` refreshes by reading the real world, compares it to state, and shows the
difference it intends to apply. `apply` makes the world match intent and writes
the new IDs into state.

### Consequences worth knowing

| Situation | What Terraform does | Why |
|---|---|---|
| Resource deleted by hand | Proposes **create** | State says it exists, refresh says it does not |
| Attribute changed by hand | Proposes **update** (revert) | Intent wins; this is the feature |
| Name/immutable field changed in `.tf` | Proposes **replace** | Destroy then create |
| Another apply happened elsewhere | **State lock** error | Two writers, one truth |
| State lost | Wants to create duplicates | It has no memory of the originals |

### Keep it out of git — and know why

`*.tfstate*` and `.terraform/` belong in `.gitignore` **before** the first apply.

- State can contain secrets (database passwords, keys — provider-dependent).
- Concurrent writers need a shared, locked backend, not a merge conflict.
- Real teams use a remote backend (S3 + DynamoDB lock, Terraform Cloud, GCS) for
  exactly this. Locally, the file is fine — as long as it is gitignored.

### The drift exercise everyone should do once

```bash
terraform apply -var="env=dev"
docker rm -f dev-relayd        # the "quick fix" at 2am
terraform plan -var="env=dev"  # proposes to create it again
```

You have just seen the distance between *what the file says* and *what the world
is*. Catch it in CI with `terraform plan -detailed-exitcode` — exit code 2 means
"there is a diff", which fails the build instead of surprising you later.

### What to avoid

- Hand-editing state with `terraform state rm` to make a plan go away. You have
  deleted the memory, not the problem.
- `-auto-approve` on a plan you have not read. The plan **is** the review.
- Copying a state file between environments. They are different worlds.
- Storing secrets in `.tf` variables with defaults. Use the environment or a
  secret manager; a committed default is a leaked default.

### The one-sentence takeaway

**State is the record of what Terraform believes it built — protect it, never
merge it, and let plan be the conversation between intent and reality.**
