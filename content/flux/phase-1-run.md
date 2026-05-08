# Phase 1 — Run Instructions

## Prerequisites

- Java 21+
- Maven 3.9+

## Compile and run tests

```shell
mvn test -pl reactive-foundations
```

## Run the standalone demo

```shell
mvn -pl reactive-foundations exec:java \
    -Dexec.mainClass="flux.foundations.ReactorDemo"
```

## Useful Maven commands

```shell
# Skip tests (fast compile check)
mvn compile -pl reactive-foundations

# Run a specific test class
mvn test -pl reactive-foundations -Dtest=MonoFluxTest

# Interactive REPL (JShell with classpath)
mvn -pl reactive-foundations dependency:build-classpath -q -Dmdep.outputFile=/tmp/cp.txt
jshell --class-path $(cat /tmp/cp.txt)
```
