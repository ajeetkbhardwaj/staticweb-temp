+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Control Flow and Functions'
difficulty = 'medium'
language = 'c'
topic_weight = -18
subtopic_weight = 3
weight = 4
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Demonstrates function calls and if-else control flow in C.
 */
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int x = 10;
    int y = 20;
    int result;

    if (x < y) {
        result = add(x, y);
    } else {
        result = x - y;
    }

    printf("Result: %d\\n", result);
    return 0;
}
'''
+++

## Problem Statement

How do C control flow constructs compile to branch instructions? What is the cost of a function call in terms of cycles and stack usage? Trace how `if/else`, `for` loops, and function calls are implemented in RISC-V assembly.

## Theory and Concepts

- **if/else → branch**: An `if (condition) { A } else { B }` compiles to: evaluate condition, `beq`/`bne` to jump over A (or B), execute the appropriate block. The condition is any expression evaluating to zero (false) or non-zero (true).
- **Loops → jumps**: A `while (cond) { body }` compiles to: evaluate condition, branch to exit if false, execute body, jump back to condition check. `for` and `do-while` are syntactic sugar over this pattern.
- **switch → jump table**: A `switch` with dense case values may compile to a jump table — an array of addresses indexed by the case value. This is O(1) dispatch instead of a chain of comparisons.
- **Function prologue/epilogue**: On entry, a function saves the return address (`ra`) and callee-saved registers to the stack, adjusts the stack pointer (`sp`). On exit, it restores registers and returns via `jalr zero, ra, 0` (RISC-V `ret`).
- **Stack frames**: Each function call creates a stack frame — the region between the old `sp` and the new `sp` after prologue. The frame stores: return address, saved registers, local variables that don't fit in registers, and any `alloca`-allocated space.
- **Calling convention**: The ABI (Application Binary Interface) defines how arguments are passed (in registers `a0`–`a7`, then stack) and which registers must be preserved across calls (callee-saved: `s0`–`s11`, `sp`, `ra`).

## Real World Application

Function call overhead matters in embedded systems. An interrupt service routine must be as fast as possible — every instruction in the prologue/epilogue adds latency. Inline functions (`static inline`) eliminate call overhead by expanding the function body at each call site. The compiler's `-Os` (optimize for size) flag may decide not to inline, while `-O2` aggressively inlines small functions. Understanding stack frames helps estimate worst-case stack usage, which is critical in systems without virtual memory (stack overflow corrupts adjacent memory).

===EXPLANATION===

## Functions

C is a procedural programming language — program flow is divided into functions (procedures or recipes) that can be called upon. A function can be visualized as a machine that takes inputs and produces an output. This abstraction allows programmers to compose complex behavior from simple, testable building blocks.

<figure id="fig-1" class="fig-right">
  <img src="/images/embedded-101/c-language/functions-as-machines.jpeg" alt="Functions as Machines">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Functions can be seen as machines — inputs go in, outputs come out</figcaption>
</figure>

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/c-language/function-machine.jpeg" alt="Function Machine">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Function call mechanism in C programs</figcaption>
</figure>

Functions can be composed — the output of one function can be fed as input to another. For example, `h(x) = g(f(x))` computes `f(x)` first and passes its result to `g`. In C, this translates directly: `int h(int x) { return g(f(x)); }`. This composability is a hallmark of procedural programming.

```c
int f(int x) {
  int output = x * x;
  return output;
}

int g(int x) {
  int output = x + x;
  return output;
}

int h(int x) {
  int output = g(f(x));
  return output;
}
```
*Caption: h(x) implemented as a composition of g(x) and f(x).*

The C compiler is flexible with whitespace and identifier names. The following code is functionally identical to the one above, proving that only the structure matters, not the particular names or spacing:

```c
int _jkfhSdh_2312qs(int _oids343) {
  int P_=       _oids343*_oids343;
  return P_;
}int G2344r3dx__dskFDS(int Pch_j34){int _OP=Pch_j34+Pch_j34;return _OP;}

int h(int _2132Ds  )
{
  int jkghk_0P
  =
  G2344r3dx__dskFDS(_jkfhSdh_2312qs(_2132Ds));
  return
  jkghk_0P;
}
```
*Caption: This code is exactly the same as the one above — note the abuse of whitespace and naming conventions!*

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/c-language/function-nesting.jpeg" alt="Function Nesting">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> Function composition — output of one function feeds into another</figcaption>
</figure>

### Generated Assembly!

When the compiler encounters a function call, it generates a `jal` (jump and link) instruction in RISC-V. This instruction saves the return address (the address of the next instruction after the call) into register `ra` and jumps to the function's entry point. The function then executes its prologue, body, and epilogue before returning via `ret` (pseudo-instruction for `jalr zero, ra, 0`).

For the code:
```c
int add(int a, int b) {
    return a + b;
}

int main(void) {
    int x = add(5, 3);
    return 0;
}
```

The generated RISC-V assembly (with optimizations off) looks like:
```asm
add:
    addi sp, sp, -48      # prologue: allocate stack frame
    sw   ra, 44(sp)       # save return address
    sw   s0, 40(sp)       # save frame pointer
    addi s0, sp, 48       # set frame pointer
    sw   a0, -36(s0)      # save argument a0
    sw   a1, -40(s0)      # save argument a1
    lw   a5, -36(s0)      # load a
    lw   a4, -40(s0)      # load b
    add  a5, a5, a4       # a5 = a + b
    mv   a0, a5           # set return value
    lw   ra, 44(sp)       # restore ra
    lw   s0, 40(sp)       # restore s0
    addi sp, sp, 48       # deallocate frame
    jr   ra               # return

main:
    addi sp, sp, -16
    sw   ra, 12(sp)
    li   a0, 5            # first argument = 5
    li   a1, 3            # second argument = 3
    jal  add              # call add; ra = return addr
    sw   a0, -20(s0)      # x = return value
    li   a0, 0            # return 0
    lw   ra, 12(sp)
    addi sp, sp, 16
    jr   ra
```

<figure id="fig-4" class="fig-center">
  <img src="/images/embedded-101/c-language/functions.png" alt="Functions Assembly">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> C functions with a call to add — main function in assembly</figcaption>
</figure>

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/c-language/functions-assembly.png" alt="Functions Assembly Generated">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> Generated assembly showing function prologue, body, and epilogue</figcaption>
</figure>

C is a strongly typed language — every variable and function must specify its data type. The naming rules for identifiers are: can contain letters (a-z, A-Z), digits (0-9), and underscores (_); must not start with a digit; must not be a C keyword. Whitespace is flexible — tabs and spaces are used for readability, but only the whitespace immediately after a C keyword is mandatory.

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 -S functions.c
```
*Caption: Instructing the compiler to generate the assembly file functions.s.*

The resulting `functions.s` file shows the assembly translation of the C functions:

```asm
  .file "functions.c"
  .option nopic
  .attribute arch, "rv32i1p0"
  .attribute unaligned_access, 0
  .attribute stack_align, 16
  .text
  .align 2
  .globl f
  .type f, @function
f:
  addi sp,sp,-48
  sw ra,44(sp)
  sw s0,40(sp)
  addi s0,sp,48
  sw a0,-36(s0)
  lw a1,-36(s0)
  lw a0,-36(s0)
  call __mulsi3
  mv a5,a0
  sw a5,-20(s0)
  lw a5,-20(s0)
  mv a0,a5
  lw ra,44(sp)
  lw s0,40(sp)
  addi sp,sp,48
  jr ra
  .size f, .-f
  .align 2
  .globl g
  .type g, @function
g:
  addi sp,sp,-48
  sw s0,44(sp)
  addi s0,sp,48
  sw a0,-36(s0)
  lw a5,-36(s0)
  slli a5,a5,1
  sw a5,-20(s0)
  lw a5,-20(s0)
  mv a0,a5
  lw s0,44(sp)
  addi sp,sp,48
  jr ra
  .size g, .-g
  .align 2
  .globl h
  .type h, @function
h:
  addi sp,sp,-48
  sw ra,44(sp)
  sw s0,40(sp)
  addi s0,sp,48
  sw a0,-36(s0)
  lw a0,-36(s0)
  call f
  mv a5,a0
  mv a0,a5
  call g
  sw a0,-20(s0)
  lw a5,-20(s0)
  mv a0,a5
  lw ra,44(sp)
  lw s0,40(sp)
  addi sp,sp,48
  jr ra
  .size h, .-h
  .ident "GCC: () 10.2.0"
```
*Caption: Contents of the functions.s file — the generated assembly from the C code.*

To prove that the two C files (with different naming and whitespace) produce equivalent assembly, we can generate assembly for both and use `diff`:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 -S confusing.c
% diff functions.s confusing.s
1c1
< 	.file	"functions.c"
---
> 	.file	"confusing.c"
9,11c9,11
< 	.globl	f
< 	.type	f, @function
< f:
---
> 	.globl	_jkfhSdh_2312qs
> 	.type	_jkfhSdh_2312qs, @function
> _jkfhSdh_2312qs:
...
```
*Caption: Diff showing only label names differ — the generated code is functionally identical.*

## Variables

Variables in C have different storage classes and placements. Global initialized variables are placed in the `.sdata` or `.data` section. Global uninitialized variables are placed in the `.sbss` or `.bss` section and default to zero. Local variables live on the stack (in registers or memory). Static local variables retain their value across function calls.

The format for variable declaration is: `[storage-class] [qualifiers] <data-type> <identifier>;`. The identifier must always be on the right. An initialized variable (definition) includes an `= <value>` assignment.

```c
int _start() {
  // Declaration of variables
  static volatile long unsigned int a;
  volatile static long unsigned int b;
  volatile static unsigned long int c;
  volatile unsigned static long int d;
  volatile unsigned long static int e;
  int volatile unsigned long static f;
  int unsigned long volatile static g;

  // Definition of variables
  static volatile long unsigned int a_ = 1;
  volatile static long unsigned int b_ = 1;
  volatile static unsigned long int c_ = 1;
  volatile unsigned static long int d_ = 1;
  volatile unsigned long static int e_ = 1;
  int volatile unsigned long static f_ = 1;
  int unsigned long volatile static g_ = 1;
}
```
*Caption: Variable declarations — all variables are the same type despite different ordering of qualifiers and storage class.*

Compiling this code produces no errors:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 variables.c
```
*Caption: The compiler accepts the variable declarations without any complaints.*

Incorrect placement of identifiers results in compilation errors:

```c
int _start() {
  static volatile a long unsigned int;
  static b volatile long unsigned int = 1;
}
```
*Caption: Modified variables.c with identifiers in the wrong position — will cause compiler errors.*

A more comprehensive example showing different variable types:

```c
int global_initialized_integer = 123456789;
char global_uninitialized_char;

int _start() {
  char character = 'a';
  int integer = global_initialized_integer;
  float decimal_number= 1.23;
  double decimal_number_more_precision = 0.23;

  global_uninitialized_char = character;

  long int uninitialized;

  static unsigned int static_integer = 987654321;

  global_uninitialized_char= 2;
}
```
*Caption: Different types of variable declaration and initialization — globals, locals, statics, floats, and doubles.*

Generate the assembly for this code:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 -S variables.c
```
*Caption: Command to generate the variables.s assembly file from variables.c.*

<figure id="fig-6" class="fig-center">
  <img src="/images/embedded-101/c-language/variables-assembly-1.png" alt="Variables Assembly 1">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> Initialized global variable placed in .sdata section</figcaption>
</figure>

<figure id="fig-7" class="fig-center">
  <img src="/images/embedded-101/c-language/variables-assembly-2.png" alt="Variables Assembly 2">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> Uninitialized global variable placed in .sbss section</figcaption>
</figure>

### Function Calls and the Stack

The RISC-V calling convention defines how arguments are passed (registers a0-a7, then stack), how return values are handled (a0, or a0-a1 for 64-bit), and which registers must be preserved (s0-s11 are callee-saved). The function prologue saves `ra` and callee-saved registers on the stack; the epilogue restores them. The `sp` register must be initialized before any C function call — this is done in the startup code.

The typical assembly pattern for a function that calls another function follows a prologue-body-epilogue structure:

```asm
# Function to be called
.text
.align 2
.globl bar
.type bar, @function
bar:
  # Similar prologue, epilogue as that of foo
  jr ra              # Return
  .size bar, .-bar

  .text
  .align 2
  .globl foo
  .type foo, @function
foo:
  # Function prologue
  addi sp, sp, -48   # Allocate stack space
  sw ra, 44(sp)      # Save return address
  sw s0, 40(sp)      # Save callee-saved register s0

  # Function body, some logic...
  # Arguments setup (if any)
  # Call the callee function
  call bar
  # Function body, some logic...

  # Function epilogue
  lw s0, 40(sp)      # Restore callee-saved register s0
  lw ra, 44(sp)      # Restore return address
  addi sp, sp, 48    # Deallocate stack space
  jr ra              # Return
  .size foo, .-foo
```
*Caption: Template of function and function call in assembly — foo function calls bar function.*

### What is `__mulsi3`?

When the target architecture lacks a hardware multiplier (rv32i instead of rv32im), the compiler may call a software multiplication function like `__mulsi3`. This function implements multiplication via repeated addition — a loop that adds `a0` to itself `a1` times. This demonstrates how the compiler adapts to the instruction set: with the M extension it emits a single `mul` instruction; without it, a function call with stack management overhead.

Trying to compile without the M extension and without providing `__mulsi3` produces a linker error:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 functions.c
/usr/lib/riscv64-unknown-elf/bin/ld: warning: cannot find entry symbol _start; defaulting to 0000000000010054
/usr/lib/riscv64-unknown-elf/bin/ld: /tmp/ccZEmLMJ.o: in function `f':
functions.c:(.text+0x1c): undefined reference to `__mulsi3'
collect2: error: ld returned 1 exit status
```
*Caption: The linker complains that __mulsi3 is missing when targeting rv32i without the M extension.*

Using the M extension (`-march=rv32im1`) resolves the issue:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32im1 -mabi=ilp32 functions.c
/usr/lib/riscv64-unknown-elf/bin/ld: warning: cannot find entry symbol _start; defaulting to 0000000000010054
```
*Caption: The linker error goes away when using -march=rv32im1 — the compiler uses hardware multiply instructions.*

The assembly for the `f` function changes to use the `mul` instruction instead of calling `__mulsi3`:

```asm
  .text
  .align 2
  .globl f
  .type f, @function
f:
  addi sp,sp,-48
  sw s0,44(sp)
  addi s0,sp,48
  sw a0,-36(s0)
  lw a5,-36(s0)
  mul a5,a5,a5
  sw a5,-20(s0)
  lw a5,-20(s0)
  mv a0,a5
  lw s0,44(sp)
  addi sp,sp,48
  jr ra
  .size f, .-f
```
*Caption: Assembly of function f using the mul instruction (with M extension).*

We can provide our own software implementation of `__mulsi3` in assembly. Starting with the function template:

```asm
  .text
  .align 2
  .globl __mulsi3
  .type __mulsi3, @function
__mulsi3:
  addi sp, sp, -48
  sw ra, 44(sp)
  sw s0, 40(sp)

  # implement multiplication here!

  lw s0, 40(sp)
  lw ra, 44(sp)
  addi sp, sp, 48
  jr ra
  .size __mulsi3, .-__mulsi3
```
*Caption: Template-based implementation of the __mulsi3 function (save this as mul.s).*

Compiling with the assembly file:

```bash
% riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 functions.c mul.s
/usr/lib/riscv64-unknown-elf/bin/ld: warning: cannot find entry symbol _start; defaulting to 0000000000010054
```
*Caption: Linker no longer complains — __mulsi3 is provided by mul.s.*

The full implementation of `__mulsi3` using repeated addition:

```asm
  .text
  .align 2
  .globl __mulsi3
  .type __mulsi3, @function
__mulsi3:
  addi sp, sp, -48
  sw ra, 44(sp)
  sw s0, 40(sp)

  mv t0, a0       # save a0 in t0
  mv t1, a1       # save a1 in t1
  addi t2, t1, 0  # initialize t2 to 0

loop:
  add t2, t2, t0  # t2 = t2 + t0
  addi t1, t1, -1 # t1 = t1 - 1
  bnez t1, loop   # jump to loop if t1 != 0

  mv a0, t2       # save the answer back to a0

  lw s0, 40(sp)
  lw ra, 44(sp)
  addi sp, sp, 48
  jr ra
  .size __mulsi3, .-__mulsi3
```
*Caption: Implementation of __mulsi3 as repeated addition.*

Control flow constructs map directly to branch instructions. An `if (x < y)` compiles to something like `lw a5, ...; lw a4, ...; bge a5, a4, .Lelse;` — if x >= y, branch to the else block. A `while` loop compiles to a backward branch: execute body, evaluate condition, `bne` back to loop start if true, fall through if false.

<figure id="fig-8" class="fig-center">
  <img src="/images/embedded-101/c-language/if-else-ladder.jpeg" alt="If-Else Ladder">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> If-else ladder compiled to RISC-V branch instructions</figcaption>
</figure>

A `switch` with dense, contiguous case labels (e.g., `case 0: ... case 1: ... case 2:`) may compile to a jump table. The compiler builds an array of code addresses, subtracts the smallest case value from the switch expression, and uses the result as an index into the table. This is a single indirect jump — O(1) dispatch — versus O(n) for a chain of if-else comparisons.

Function inlining eliminates all this overhead. The compiler copies the function body directly into the caller, removing the `jal`/`ret` pair and the stack frame allocation. For small functions called frequently (like a UART putc wrapper), inlining can significantly improve performance and reduce code size (counterintuitively — call overhead code may be larger than the inlined body).

References: K&R Ch. 3 (Control Flow) and Ch. 4 (Functions); "Computer Systems: A Programmer's Perspective" (CS:APP) Ch. 3 (Machine-Level Representation of Programs). For RISC-V calling convention: "RISC-V Calling Convention" specification, RISC-V International. For jump tables: Patterson & Hennessy, "Computer Organization and Design" §2.13 (Jump Tables).

===QUIZ===

## In the RISC-V calling convention, which register holds the return address after a `jal` instruction?
- [ ] a0
- [ ] sp
- [ ] t0
- [x] ra
Correct: D
Explanation: The `jal` (jump and link) instruction saves the address of the instruction following the jump into register `ra` (x1). The callee returns to this address using `jalr zero, ra, 0` (assembler pseudo-instruction `ret`).

## What is the primary advantage of a jump table implementation for a `switch` statement?
- [ ] It reduces code size compared to if-else chains
- [x] It executes in O(1) time regardless of the number of cases
- [ ] It works with non-integer case expressions
- [ ] It eliminates the need for a default case
Correct: B
Explanation: A jump table is an array of code addresses indexed by the case value. The compiler computes the index, does a single indirect jump through the table, and arrives at the correct case handler — all in constant time, regardless of how many cases exist. In contrast, an if-else chain must evaluate each condition sequentially.

## What is a function prologue and epilogue in RISC-V assembly?
- [x] The prologue saves `ra` and callee-saved registers and allocates stack space; the epilogue restores them and returns
- [ ] The prologue executes the function body; the epilogue calls other functions
- [ ] The prologue prints debug information; the epilogue clears variables
- [ ] The prologue and epilogue are optional comments
Correct: A
Explanation: The function prologue (`addi sp, sp, -N` and `sw ra/s0, offset(sp)`) saves the return address and callee-saved registers, and allocates space on the stack. The epilogue (`lw ra/s0, offset(sp)` and `addi sp, sp, N` followed by `ret`) restores saved state and returns to the caller.

## In the RISC-V calling convention, which registers are callee-saved (must be preserved by the called function)?
- [ ] a0–a7 (argument registers)
- [ ] t0–t6 (temporary registers)
- [x] s0–s11 (saved registers)
- [ ] All 32 registers
Correct: C
Explanation: Registers s0–s11 are callee-saved — if a function modifies them, it must save them to the stack in the prologue and restore them in the epilogue. Argument registers (a0–a7) and temporaries (t0–t6) are caller-saved and can be freely modified by the callee.

## What is `__mulsi3`, and why does the compiler call it when targeting rv32i without the M extension?
- [ ] It is a hardware multiplier instruction
- [x] It is a software multiplication function that implements multiplication via repeated addition, called because rv32i lacks a `mul` instruction
- [ ] It is a memory allocation function
- [ ] It is a debug printing function
Correct: B
Explanation: The rv32i base ISA does not include a multiply instruction. When the compiler encounters multiplication (`*`) and the M extension is not available, it generates a call to `__mulsi3` — a software routine that performs multiplication through repeated addition. With the M extension (`-march=rv32im`), the compiler emits a single `mul` instruction instead.

## What is the difference between a declaration and a definition in C?
- [ ] They are the same thing
- [x] A declaration introduces a name; a definition allocates memory for it
- [ ] A declaration allocates memory; a definition introduces a name
- [ ] Definitions are only for functions, declarations only for variables
Correct: B
Explanation: A declaration tells the compiler about a name (variable or function) and its type without allocating storage. A definition causes storage to be allocated. For example, `extern int x;` is a declaration, while `int x = 5;` is a definition.

## Where are global initialized variables placed in memory by the compiler?
- [ ] In the `.text` section (code)
- [x] In the `.data` or `.sdata` section (initialized data)
- [ ] In the `.bss` section
- [ ] On the stack
Correct: B
Explanation: Global initialized variables (like `int x = 10;`) are placed in the `.data` or `.sdata` section of the object file. These sections contain data with pre-defined initial values that are loaded into RAM before the program starts.
