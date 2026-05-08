# Phase 3 — R2DBC Reactive Database

> Blocking JDBC would stall Netty's event-loop threads, defeating the entire
> reactive model. R2DBC provides a non-blocking database driver. Spring Data R2DBC
> adds repositories on top of it.

## Why not JDBC?

JDBC calls `socket.read()` under the hood, which blocks the thread until the DB responds.
On a Netty server with 16 threads, one slow query can block 1/16th of your capacity.

R2DBC returns a `Publisher<T>` immediately. Netty subscribes, hands the I/O to
the OS via NIO, and reuses the thread while waiting.

## Spring Data R2DBC

Three components:
- `R2dbcEntityTemplate` — low-level, full SQL control
- `ReactiveCrudRepository` — Spring Data-style repository, auto-implemented
- `@Query` — custom SQL on repository methods

```java
public interface ItemRepository extends ReactiveCrudRepository<Item, Long> {
    @Query("SELECT * FROM items WHERE category = :category")
    Flux<Item> findByCategory(String category);
}
```

Entities use `@Table` and `@Id` from `org.springframework.data.annotation` and
`org.springframework.data.relational.core.mapping` — **not** JPA annotations.

## Maven coordinates

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-r2dbc</artifactId>
</dependency>
<dependency>
  <groupId>io.r2dbc</groupId>
  <artifactId>r2dbc-h2</artifactId>
  <scope>runtime</scope>
</dependency>
<!-- For Postgres in production: -->
<!-- <artifactId>r2dbc-postgresql</artifactId> -->
```

## application.yml

```yaml
spring:
  r2dbc:
    url: r2dbc:h2:mem:///testdb;DB_CLOSE_DELAY=-1
    username: sa
    password:
  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
```
