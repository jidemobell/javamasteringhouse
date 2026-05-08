# Phase 2 — Run Instructions

## Start Keycloak (Docker)

```shell
docker run -d --name keycloak \
  -p 9080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

## Configure a realm

1. Open http://localhost:9080 → admin / admin
2. Create realm: `sentinel`
3. Create client: `sentinel-api` (type: bearer-only)
4. Create a user and assign a role

## Get a token (password grant — dev only)

```shell
TOKEN=$(curl -s -X POST \
  http://localhost:9080/realms/sentinel/protocol/openid-connect/token \
  -d 'grant_type=password' \
  -d 'client_id=sentinel-api' \
  -d 'username=testuser' \
  -d 'password=testpassword' \
  | jq -r .access_token)
echo $TOKEN
```

## Start the service

```shell
./gradlew :sentinel-oauth2:bootRun
```

## Test with token

```shell
# Should return 401 without token
curl -s http://localhost:8080/api/secure

# Should return 200 with valid token
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/secure
```
