# Phase 4 — Run Instructions

## Run tests

```shell
mvn test -pl reactor-operators
```

## Run the demo (prints operator output to stdout)

```shell
mvn -pl reactor-operators exec:java \
    -Dexec.mainClass="flux.operators.OperatorsDemo"
```
