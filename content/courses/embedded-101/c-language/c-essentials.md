+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'C Essentials: Types, Variables, and Compilation'
difficulty = 'medium'
language = 'c'
topic_weight = -18
subtopic_weight = 3
weight = 1
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Prints the sizes of C fundamental data types using sizeof.
 */
#include <stdio.h>
#include <stdint.h>

int main(void) {
    printf("Size of char: %zu byte(s)\\n", sizeof(char));
    printf("Size of short: %zu byte(s)\\n", sizeof(short));
    printf("Size of int: %zu byte(s)\\n", sizeof(int));
    printf("Size of long: %zu byte(s)\\n", sizeof(long));
    printf("Size of long long: %zu byte(s)\\n", sizeof(long long));
    printf("Size of float: %zu byte(s)\\n", sizeof(float));
    printf("Size of double: %zu byte(s)\\n", sizeof(double));
    return 0;
}
'''
+++

## Problem Statement

How does C code get compiled into assembly? What is the relationship between C constructs and the underlying machine code? Trace how `int x = 5; int y = x + 3;` becomes RISC-V load, add, and store instructions.

## Theory and Concepts

- **C as a "portable assembler"**: C was designed to map cleanly to machine concepts — variables map to memory locations and registers, operators map to ALU operations, control flow maps to branch instructions. This is why C is the dominant language for systems and embedded programming.
- **Compilation process**: C source → Preprocessor (handles `#include`, `#define`) → Compiler (C → assembly) → Assembler (assembly → object file) → Linker (combines object files → executable). The `-S` flag to GCC generates assembly output.
- **Data types and memory layout**:
  - `char`: 1 byte (8 bits), typically signed on RISC-V
  - `short`: 2 bytes (16 bits)
  - `int`: 4 bytes (32 bits) on RV32
  - `long`: 4 bytes on RV32, 8 bytes on RV64
  - `float`: 4 bytes (IEEE 754 single precision)
  - `double`: 8 bytes (IEEE 754 double precision)
- **sizeof operator**: A compile-time operator that returns the size (in bytes) of a type or expression. The result is of type `size_t` (usually `unsigned int`). Useful for writing portable code that adapts to different platforms.
- **Signed vs unsigned**: The MSB (most significant bit) acts as the sign bit for signed types. Unsigned types use all bits for magnitude, giving a larger positive range.

## Real World Application

Understanding the C compilation model is essential for debugging, optimization, and writing embedded code. When you declare `uint32_t reg_val = *(volatile uint32_t*)0x40020014;`, knowing that this compiles to a single `lw` instruction helps you reason about timing and atomicity. The `sizeof` operator is critical when writing portable code — a `long` on a desktop Linux x86-64 is 8 bytes, but on an RV32 embedded target it is 4 bytes. Using `sizeof` instead of hardcoded sizes prevents subtle bugs when porting code between platforms.

===EXPLANATION===

## Data Types

C has only 32 reserved keywords, and almost every keyword maps back to the way the CPU works. The keywords are grouped into categories: data types, storage class, and flow control. Understanding the correspondence between C constructs and machine operations is the foundation of systems programming.

 <figure id="fig-1" class="fig-center">
  <img src="/images/embedded-101/c-language/c-keywords.jpg" alt="C Keywords">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> The 32 reserved C keywords grouped by functional category</figcaption>
</figure>

The compilation pipeline transforms C source through several stages. The preprocessor handles text substitution (`#include`, `#define`), the compiler translates C to assembly, the assembler produces relocatable machine code, and the linker resolves cross-file references. To see the intermediate assembly, use `gcc -S file.c`. For RISC-V cross-compilation: `riscv64-unknown-elf-gcc -march=rv32im -mabi=ilp32 -S file.c`. The generated `.s` file shows exactly which assembly instructions correspond to each C construct. For example, `int x = 5;` becomes `addi s0, zero, 5` — an I-type instruction that adds the immediate value 5 to register zero and stores the result in `s0`.

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/c-language/c-data-types.jpeg" alt="C Data Types">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Map of categories of data types provided by C</figcaption>
</figure>

The preprocessor stage can be isolated using the `-E` flag. Running `riscv64-unknown-elf-gcc -E main.c -o main.i` stops compilation after preprocessing, showing how `#include` directives are expanded and `#define` macros are substituted. The intermediate `.i` file contains line markers that map back to the original source — a powerful tool for debugging macro expansions and understanding what the compiler actually sees.

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/c-language/include-example.jpeg" alt="Include Example">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> The #include directive copies the contents of other.h directly into main.c</figcaption>
</figure>

<figure id="fig-4" class="fig-center">
  <img src="/images/embedded-101/c-language/gcc-E-output.png" alt="GCC -E Output">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> After preprocessing, the main.i file shows the expanded source with line markers</figcaption>
</figure>

The `sizeof` operator is evaluated at compile time (except for variable-length arrays). The compiler knows the size of each type from its internal ABI tables. On a 32-bit RISC-V target, `sizeof(int) = 4`, `sizeof(char) = 1`, `sizeof(float) = 4`. On an 8-bit AVR microcontroller, `sizeof(int) = 2`. This compile-time evaluation means `sizeof` incurs zero runtime overhead — the result is baked into the generated code as an immediate value.

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/c-language/int-variable.jpeg" alt="Integer Variable Declaration">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> Integer variable declaration syntax in C</figcaption>
</figure>

<figure id="fig-6" class="fig-center">
  <img src="/images/embedded-101/c-language/int-types.jpeg" alt="Integer Types">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> Integer types and their representation in memory</figcaption>
</figure>

## Data Storage for Basic Types

### Integer Types

Integer types store whole numbers using two's complement encoding for signed values. The MSB represents `-2^(N-1)` for signed types. For `signed char` (8 bits), the MSB represents -128; for `int` (32 bits), the MSB represents -2147483648. Unsigned types use all bits for magnitude, doubling the positive range. The `float` and `double` types use IEEE 754 encoding with sign (1 bit), exponent (8 bits for float, 11 for double), and mantissa (23 bits for float, 52 for double).

<figure id="fig-7" class="fig-center">
  <img src="/images/embedded-101/c-language/float.jpeg" alt="Float Type">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> IEEE 754 single-precision floating-point format (32-bit float)</figcaption>
</figure>

<figure id="fig-8" class="fig-center">
  <img src="/images/embedded-101/c-language/double-precission.jpeg" alt="Double Precision">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> IEEE 754 double-precision floating-point format (64-bit double)</figcaption>
</figure>

### Floating Point Type

A `float` uses 32 bits with a bias of 127 for the exponent. The place value of each bit matters: bit 0 represents `2^{-23}`, and bit 30 represents `2^{8}`. A `double` uses 64 bits with a bias of 1023, giving a much larger range and precision. The key difference between `10` and `10.0` is that the integer is stored as a two's complement value while the floating-point number follows the IEEE 754 encoding — a completely different bit-level representation.

### Modifiers

C provides modifiers that affect the size, sign, and storage class of data types. These include `signed`, `unsigned`, `short`, `long` for size and sign; `volatile` and `const` for access semantics; and `auto`, `register`, `extern`, `static` for storage duration and scope.

<figure id="fig-9" class="fig-center">
  <img src="/images/embedded-101/c-language/modifiers-standalone.png" alt="Modifiers Standalone">
  <figcaption><a href="#fig-9" class="fig-link">Figure 9:</a> Modifier keywords used standalone — the compiler defaults to int type</figcaption>
</figure>

<figure id="fig-10" class="fig-center">
  <img src="/images/embedded-101/c-language/modifiers-standalone-warnings.png" alt="Modifiers Standalone Warnings">
  <figcaption><a href="#fig-10" class="fig-link">Figure 10:</a> GCC warnings when modifiers are used without an explicit type specifier</figcaption>
</figure>

Variables must be declared with a data type, optional qualifiers, and an identifier. The general syntax is: `[storage-class] [qualifiers] <data-type> <identifier>;`. The order of storage class, qualifiers, and data type can vary, but the identifier must always be on the right. An initialized variable (definition) includes an `= <value>` assignment. The naming rules for identifiers are: can contain letters, digits, and underscores; must not start with a digit; must not be a C keyword.

<figure id="fig-11" class="fig-center">
  <img src="/images/embedded-101/c-language/variable-declarations.jpeg" alt="Variable Declarations">
  <figcaption><a href="#fig-11" class="fig-link">Figure 11:</a> Variable declaration syntax showing type, qualifier, and identifier placement</figcaption>
</figure>

<figure id="fig-12" class="fig-center">
  <img src="/images/embedded-101/c-language/some-variable-1.jpeg" alt="Variable Example">
  <figcaption><a href="#fig-12" class="fig-link">Figure 12:</a> Example of variable storage in memory</figcaption>
</figure>

## Custom Data Types

### struct

C provides custom data types through `struct`, `union`, and `enum`. A `struct` groups multiple variables together, laid out sequentially in memory. A `struct` groups multiple variables together, laid out sequentially in memory. A `union` stores all members at the same starting address — its size is the size of its largest member. An `enum` creates a named integer constant list, starting at 0 by default.

```c
struct pixel {
  unsigned char red;
  unsigned char blue;
  unsigned char green;
};
```
*Caption: Custom data type to define a pixel as a group of three unsigned char type of storages.*

```c
union pixel {
  unsigned char red;
  unsigned char blue;
  unsigned char green;
};
```
*Caption: Custom data type to define union pixel as a group of three unsigned char type of storages.*

```c
union pixel {
  unsigned char red;
  unsigned short int blue;
  unsigned int green;
};
```
*Caption: Custom data type to define union pixel with mixed member sizes — the union spans the largest member (4 bytes).*

```c
enum days {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
};
```
*Caption: Declaring an enum days data type. SUNDAY = 0 and all entries following are assigned an incrementing value.*

<figure id="fig-13" class="fig-center">
  <img src="/images/embedded-101/c-language/struct-pixel.jpeg" alt="Struct Pixel">
  <figcaption><a href="#fig-13" class="fig-link">Figure 13:</a> Memory layout of a struct pixel with three unsigned char members</figcaption>
</figure>

<figure id="fig-14" class="fig-center">
  <img src="/images/embedded-101/c-language/union-pixel.jpeg" alt="Union Pixel">
  <figcaption><a href="#fig-14" class="fig-link">Figure 14:</a> Memory layout of a union pixel — all members share the same starting address</figcaption>
</figure>

<figure id="fig-15" class="fig-center">
  <img src="/images/embedded-101/c-language/union-pixel-modified.jpeg" alt="Union Pixel Modified">
  <figcaption><a href="#fig-15" class="fig-link">Figure 15:</a> Union pixel with mixed member sizes — the union spans the largest member (4 bytes)</figcaption>
</figure>

A `struct pixel` with `unsigned char red, green, blue;` occupies 3 bytes (no padding needed). A `union pixel` with the same members occupies only 1 byte — all three members overlap at offset 0. If the union has a `unsigned int` member (4 bytes), the union occupies 4 bytes. The `sizeof` operator reports these sizes at compile time.

## Decision Making

Decision-making in C uses `if-else` and `switch` constructs. The `if` block executes when the condition evaluates to non-zero (true); the optional `else` block executes when it evaluates to zero (false). For multi-way decisions, an `if-else if-else` ladder or a `switch` statement is used.

```c
if ( <expression> ) {
  /*
   * This block of code will be executed if the expression
   * evaluates to anything other than 0!
   */
} else {
  /*
   * This part of the code will get executed if the expression
   * evaluates to 0!
   */
}
```
*Caption: Use of the if-else block.*

```c
...
if (<expression>) {
  /**
   * Execute this part of the code if the expression
   * evaluates to a non-zero number.
   */
}
...
```
*Caption: The code within if block will be executed only if the expression evaluates to a non-zero number.*

```c
...
if (<expression>) {
  /**
   * Execute this part of the code if the expression
   * evaluates to a non-zero number.
   */
} else {
  /**
   * Execute this part of the code if the expression
   * evaluates to a non-zero number.
   */
}
...
```
*Caption: Depending on what the expression evaluates to, one of the if or the else block of code will execute.*

```c
...
if (<expression 1>) {
  /* code block 1 */
} else if (<expression 2>) {
  /* code block 2 */
} else if (<expression 3>) {
  /* code block 3 */
}
...
else {
  /* code block n */
}
...
```
*Caption: If-else ladder — expressions are evaluated sequentially until one matches.*

```c
switch (expression) {
  case 1:
    // do something for 1
    break;
  case 2:
    // do something for 2
    break;
  default:
    // for all other cases
    break;
}
```
*Caption: Use of switch block — control jumps to the matching case label.*

<figure id="fig-16" class="fig-right">
  <img src="/images/embedded-101/c-language/if-only.jpeg" alt="If Only">
  <figcaption><a href="#fig-16" class="fig-link">Figure 16:</a> Flow of an if-only block — body executes only if condition is non-zero</figcaption>
</figure>

<figure id="fig-17" class="fig-right">
  <img src="/images/embedded-101/c-language/if-else.jpeg" alt="If Else">
  <figcaption><a href="#fig-17" class="fig-link">Figure 17:</a> If-else flow — one of two blocks executes based on the condition</figcaption>
</figure>

<figure id="fig-18" class="fig-center">
  <img src="/images/embedded-101/c-language/if-else-ladder.jpeg" alt="If Else Ladder">
  <figcaption><a href="#fig-18" class="fig-link">Figure 18:</a> If-else ladder — conditions are evaluated sequentially until one matches</figcaption>
</figure>

<figure id="fig-19" class="fig-right">
  <img src="/images/embedded-101/c-language/switch.jpeg" alt="Switch">
  <figcaption><a href="#fig-19" class="fig-link">Figure 19:</a> Switch-case flow — control jumps to the matching case label</figcaption>
</figure>

## Preprocessor Directives

The preprocessor handles text substitution before compilation begins. Directives like `#include` and `#define` are processed in this stage. The `-E` flag to GCC shows the preprocessor output.

### #include

The `#include` directive directs the preprocessor to copy the contents of the specified file into the current file. Files in `<>` are looked up in standard locations; files in `""` are looked up in the local directory.

```c
int a = 10;
```
*Caption: The other.h file — a simple C file with an integer declaration.*

```c
#include "other.h"

void main() {
  return;
}
```
*Caption: The main.c file that includes other.h using the #include directive.*

The compiler can be instructed to stop after the preprocessing phase using the `-E` option:

```bash
riscv64-unknown-elf-gcc -E main.c -o main.i
```
*Caption: Compiling with the -E option to generate the preprocessed main.i file.*

The resulting `main.i` file shows how the content of `other.h` is placed directly into `main.c`:

```c
# 1 "main.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 1 "main.c"
# 1 "other.h" 1
int a = 10;
# 2 "main.c" 2

void main() {
  return;
}
```
*Caption: Contents of the preprocessed main.i file with line markers showing the original source mapping.*

### #define

The `#define` directive defines a macro — a text substitution that the preprocessor replaces before the compiler sees the code.

## Looping

Looping in C is provided by `for`, `while`, and `do-while` constructs.

### for

The `for` loop has initialization, condition, and increment/decrement parts.

```c
for (<initialization>; <condition>; <increment/decrement>) {
  /**
   * code to be executed repeatedly.
   */
}
```
*Caption: Basic syntax for the for loop.*

### while

The `while` loop checks the condition before each iteration.

```c
while (<condition>) {
  /**
   * code to be executed repeatedly.
   */
}
```
*Caption: Basic syntax for the while loop.*

### do while

The `do-while` loop guarantees at least one execution.

```c
do {
  /**
   * code to be executed repeatedly.
   */
} while (<condition>);
```
*Caption: Basic syntax for the do while loop.*

### break

The `break` keyword exits a loop or switch early.

```c
for (int i=0; i<10; i++) {
  if (i==6) {
    break;
  }
  /* other code to be executed repeatedly. */
}
```
*Caption: A for loop that exits when the i variable has the value of 6.*

### continue

The `continue` keyword skips to the next iteration.

```c
for (int i=0; i<10; i++) {
  if (i==6) {
    continue;
  }
  /* other code to be executed repeatedly. */
}
```
*Caption: A for loop that skips iteration when the i variable has the value of 6.*

### goto

The `goto` keyword provides an unconditional jump to a label (discouraged in practice but used in Linux kernel error handling).

```c
/* some code. */
goto some_label;
/* some more code — this part will be skipped! */
some_label:
/* more code */
```
*Caption: General usage of the goto statement.*

### return

The `return` keyword exits a function and optionally provides a return value.

```c
int add(int a, int b) {
  return a + b;
}
```
*Caption: Example usage of the return keyword to exit a function and return a value.*

References: Kernighan & Ritchie, "The C Programming Language" (2nd ed.), Ch. 2 (Types, Operators, and Expressions); "C: A Reference Manual" by Harbison & Steele, Ch. 5 (Types). For the compilation pipeline: "Linkers and Loaders" by John R. Levine, Ch. 1.

===QUIZ===

## What is the output of `sizeof(int)` on a 32-bit RISC-V target?
- [ ] 2
- [ ] 8
- [ ] 1
- [x] 4
Correct: D
Explanation: On a 32-bit architecture (RV32), the `int` type is 32 bits = 4 bytes. The C standard only guarantees that `int` is at least 16 bits, but on most 32-bit platforms it is 32 bits.

## What does the `-S` flag do when passed to GCC?
- [ ] It links the object files into an executable
- [x] It stops compilation after generating assembly output (.s file)
- [ ] It enables optimization level 3
- [ ] It assembles the source without linking
Correct: B
Explanation: The `-S` flag tells GCC to stop after the compilation stage, producing an assembly language file (.s) instead of an object file. This is the primary way to inspect what assembly code the compiler generates from C source.

## How many reserved keywords does the C language have?
- [ ] 16
- [ ] 64
- [x] 32
- [ ] 48
Correct: C
Explanation: C has exactly 32 reserved keywords. These are grouped into categories: data types, storage class specifiers, qualifiers, and flow control keywords. Almost every keyword maps back to a machine concept.

## What does the C preprocessor do with the `#include` directive?
- [ ] It compiles the included file separately
- [x] It copies the contents of the specified file directly into the current file before compilation
- [ ] It links the included file at runtime
- [ ] It checks for syntax errors in the included file
Correct: B
Explanation: The `#include` directive directs the preprocessor to copy the contents of the specified file into the current file. Files in `<>` are looked up in standard system paths; files in `""` are looked up in the local directory.

## What is the IEEE 754 representation of a `float` in C?
- [ ] 16 bits: 1 sign bit, 7 exponent, 8 mantissa
- [x] 32 bits: 1 sign bit, 8 exponent bits (bias 127), 23 mantissa bits
- [ ] 64 bits: 1 sign bit, 11 exponent, 52 mantissa
- [ ] 8 bits: 1 sign bit, 3 exponent, 4 mantissa
Correct: B
Explanation: A `float` in C follows the IEEE 754 single-precision format: 32 bits total — 1 sign bit, 8 exponent bits (biased by 127), and 23 mantissa (significand) bits. This is fundamentally different from integer encoding.

## What is the size of a `struct` in C, and how is it determined?
- [x] It is the sum of all its members' sizes, plus possible padding bytes inserted by the compiler for alignment
- [ ] It is always the size of the largest member
- [ ] It is always 4 bytes
- [ ] It is the product of all members' sizes
Correct: A
Explanation: The size of a struct is the sum of the sizes of its members plus any padding the compiler inserts to satisfy alignment requirements. For example, if a `uint8_t` is followed by a `uint32_t`, three padding bytes may be inserted.

## What is the difference between `break` and `continue` in a loop?
- [x] `break` exits the loop entirely; `continue` skips to the next iteration
- [ ] Both exit the loop
- [ ] `break` skips to the next iteration; `continue` exits the loop
- [ ] They are interchangeable
Correct: A
Explanation: `break` immediately terminates the loop (or switch) and execution continues after the loop. `continue` skips the rest of the current iteration and jumps to the next iteration's condition check.
