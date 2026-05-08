# Memory Management & Heap Dump Analysis

## Overview
Memory management is critical for building scalable, reliable Java applications. This concept introduces heap dumps, common memory errors, and best practices for memory-aware coding.

---

## What is a Heap Dump?
A heap dump is a snapshot of the memory used by a Java process at a specific point in time. It helps diagnose memory leaks, OutOfMemoryError (OOM), and inefficient object usage.

- **How to generate:**
  - JVM options: `-XX:+HeapDumpOnOutOfMemoryError`
  - Tools: `jmap`, VisualVM, Eclipse MAT
- **What you see:**
  - Object instances, references, memory size, GC roots

---

## Common Memory Issues
- **OutOfMemoryError (OOM):** JVM cannot allocate more memory.
- **NullPointerException:** Dereferencing a null reference (often a symptom of logic bugs, not memory exhaustion).
- **Memory Leaks:** Objects unintentionally retained, preventing GC.
- **Excessive Object Retention:** Large collections, caches, or static fields holding references.

---

## Inspecting a Heap Dump
1. Open with VisualVM or Eclipse MAT.
2. Look for:
   - Dominator tree (largest objects/retained size)
   - Unreachable objects
   - Reference chains (why is this object alive?)
3. Identify root causes:
   - Large collections, static maps, listeners
   - Unclosed resources

---

## Best Practices for Memory-Aware Coding
- Release references when no longer needed
- Avoid static collections for caches unless managed
- Profile memory usage in development
- Use weak references for listeners/caches
- Monitor for OOM and analyze heap dumps regularly

---

## Exercise: Simulate and Analyze OOM
1. Write a Java program that allocates objects in a loop until OOM.
2. Run with `-XX:+HeapDumpOnOutOfMemoryError`.
3. Open the heap dump and find the largest object.

---

## Further Reading
- [Java Memory Management Basics](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)
- [VisualVM](https://visualvm.github.io/)
- [Eclipse Memory Analyzer (MAT)](https://www.eclipse.org/mat/)
