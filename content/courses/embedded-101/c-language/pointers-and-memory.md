+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Pointers and Memory Access'
difficulty = 'medium'
language = 'c'
topic_weight = -18
subtopic_weight = 3
weight = 2
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Demonstrates pointer declaration, assignment, dereference, and arithmetic.
 */
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int a = 42;
    int *ptr = &a;

    printf("Value of a: %d\\n", a);
    printf("Address of a: %p\\n", (void*)&a);
    printf("Pointer ptr holds: %p\\n", (void*)ptr);
    printf("Dereference ptr: %d\\n", *ptr);

    // Pointer arithmetic
    printf("ptr + 0: %p\\n", (void*)(ptr + 0));
    printf("ptr + 1: %p\\n", (void*)(ptr + 1));
    printf("ptr + 2: %p\\n", (void*)(ptr + 2));

    return 0;
}
'''
+++

## Problem Statement

Why are pointers essential in embedded systems programming? How do they map to hardware addresses? Explain how a pointer variable can point to data memory, code memory, or memory-mapped peripheral registers.

## Theory and Concepts

- **Pointer definition**: A pointer is a variable that holds a memory address. The type of the pointer determines how the data at that address is interpreted and how many bytes are accessed on dereference.
- **Address-of operator (&)**: Returns the memory address of a variable. `int *p = &a;` stores the address of `a` in `p`.
- **Dereference operator (*)**: Accesses the value at the address held by a pointer. `int x = *p;` reads the value at address `p`. On RISC-V, this compiles to `lw` (load word) for a 4-byte read.
- **Pointer arithmetic**: Adding N to a pointer advances it by N × sizeof(type) bytes. `int *p; p + 1` advances by 4 bytes (sizeof(int)). This is why pointer arithmetic is type-aware.
- **Pointer to volatile**: The `volatile` qualifier tells the compiler that the value at a pointer may change outside the normal program flow (e.g., by hardware). Every memory-mapped peripheral register should be accessed via a `volatile`-qualified pointer to prevent the compiler from optimizing away reads/writes.
- **Function pointers**: Pointers that store the address of executable code. Declared as `return_type (*name)(param_types)`. Dereferencing calls the function. Used for callback mechanisms, jump tables, and interrupt vector tables.
- **NULL pointer safety**: A pointer with value `0` (or `NULL`) points to nothing. Dereferencing a NULL pointer causes undefined behavior (typically a crash). Always check `if (ptr != NULL)` before dereferencing in production code.

## Real World Application

Pointers are the primary mechanism for accessing hardware in embedded systems. Every memory-mapped peripheral register is accessed through a pointer: `*(volatile uint32_t*)0x40020014 = 0x01;` sets a GPIO pin high on an STM32 microcontroller. Function pointers are used for interrupt service routines (ISRs) — the interrupt vector table is an array of function pointers. RTOS schedulers use function pointers for task entry points. Without pointers, embedded C would be unable to interact with hardware at all.

===EXPLANATION===

## Pointers

A pointer is a variable that holds a memory address. This is the single most important concept to tattoo on your brain. Pointers give C its raw power to access any address in memory — whether that address contains data, code, or a memory-mapped peripheral register. The `*` in the declaration tells C that the variable is a pointer type: `int *ptr;` means `ptr` is a variable that stores a memory address, and at that address there will be an integer value.

<figure id="fig-1" class="fig-right">
  <img src="/images/embedded-101/c-language/eg-pointer.jpeg" alt="Pointer Example">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> p_var is a pointer variable holding address 0x20c, pointing to another memory location containing data</figcaption>
</figure>

### Declaration and Types

A pointer is declared by placing `*` before the variable name:

```c
int a;
int *ptr;
```
*Caption: The use of * to declare a variable to be a pointer type. ptr is a variable that will store a memory address.*

The address-of operator `&` returns the memory address of a variable. So `int *ptr = &a;` assigns the address of `a` to `ptr`. After this assignment, we say "ptr points to a". The pointer itself occupies memory (4 bytes on RV32, 8 bytes on RV64), and the value it holds is the address of `a`. Dereferencing a pointer with `*ptr` accesses the value at the stored address — reading `*ptr` after the assignment gives `a`'s value.

```c
int a = 10;
int *ptr = &a;
```
*Caption: Pointer assignment — ptr is initialized to point to the address of a.*

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/c-language/assigned-ptr.jpeg" alt="Assigned Pointer">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Pointer assignment — ptr holds the address of variable a (0x4000c)</figcaption>
</figure>

### Note on the Usage of `*` and `&`

The `*` and `&` operators have dual meanings depending on context. When used in a declaration, `*` makes the variable a pointer (`int *p;`). When used elsewhere on the left of a pointer variable, it dereferences it — reads the value at the pointed-to address (`int x = *p;`). The `&` operator is the "address of" operator, used before a variable name to get its address. Brain tattoo: `*` should always be on the left of the variable name when used outside of declaration.

Consider the following examples of pointer usage:

```c
int p = 1;

int *q = &p;  // q is an integer pointer and points to p

int *r;       // r is an integer pointer, uninitialized.
r = &p;       // r is made to point to p.

int *s;       // s is an integer pointer.
*s = &p;      // store p at the address pointed to by s.
```
*Caption: Demonstration of correct and incorrect pointer assignment. Line 6 (r = &p) is correct; line 9 (*s = &p) is incorrect — s is uninitialized.*

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/c-language/ptr-usage-1.jpeg" alt="Pointer Usage 1">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> Declaring a pointer variable with the * notation in the declaration</figcaption>
</figure>

<figure id="fig-4" class="fig-right">
  <img src="/images/embedded-101/c-language/ptr-usage-2.jpeg" alt="Pointer Usage 2">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> Dereferencing a pointer with * on the left of the variable name</figcaption>
</figure>

### Dereferencing a Pointer

Consider the difference between `b = ptr;` and `b = *ptr;`. In the first case, `b` gets the value of `ptr`, which is the address `0x4000c` (a number). In the second case, `b` gets the value stored at the address held by `ptr` — that is, the value of `a`, which is 10. The second case is called dereferencing.

```c
int a = 10;
int *ptr = &a;
int b;

b = ptr;   // b gets the address value 0x4000c
b = *ptr;  // b gets the value at that address = 10
```
*Caption: The difference between assigning the pointer value (b = ptr) and dereferencing (b = *ptr).*

An incorrect usage would be `*s = &p;` with an uninitialized `s` — this tries to write the address of `p` to whatever garbage address `s` happens to contain, which typically causes a crash.

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/c-language/incorrect-usage.jpeg" alt="Incorrect Usage">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> Incorrect pointer usage — dereferencing an uninitialized pointer writes to a random address</figcaption>
</figure>

Pointer arithmetic is scoped to the pointed-to type. For an `int *` on RV32, `ptr + 1` adds 4 to the address (because sizeof(int) = 4). For a `char *`, `ptr + 1` adds 1. This behavior is defined by the C standard and is fundamental to array access — `arr[i]` is equivalent to `*(arr + i)`. For a `uint32_t *` pointing to a memory-mapped register at address 0x10000000, adding 1 gives address 0x10000004 — the next register in the peripheral's address space.

The data type of the pointer guides the compiler on how many bytes to access during dereference:

```c
int random() {
  int  a = 10;              // a is 4 bytes and stores 10
  char b = 20;              // b is 1 byte and stores 20

  int  *ptr_a = &a;         // ptr_a stores the address of a
  char *ptr_b = &b;         // ptr_b stores the address of b

  int c = *ptr_a + *ptr_b;

  return c;
}
```
*Caption: Pointer declaration and assignment — int pointer loads 4 bytes, char pointer loads 1 byte.*

To generate the assembly for this code:

```bash
riscv64-unknown-elf-gcc -O0 -nostdlib -march=rv32i -mabi=ilp32 -S main.c
```
*Caption: Compiling the C program with gcc to generate assembly.*

A void pointer simply points to a memory location with no type information — dereferencing it is not allowed:

```c
int random(void) {
  int p = 2;
  void *vp = &p;

  int q;
  q = *vp;

  return 0;
}
```
*Caption: Pointer declaration without any associated data type — dereferencing a void pointer will cause a compile error.*

Attempting to dereference a void pointer produces:

```bash
main.c: In function 'random':
main.c:8:7: warning: dereferencing 'void *' pointer
    8 |   q = *vp;
      |       ^~~
main.c:8:5: error: void value not ignored as it ought to be
    8 |   q = *vp;
      |     ^
```
*Caption: Dereferencing a void pointer is not allowed — the compiler cannot infer how many bytes to load.*

A void pointer must be typecast before it can be dereferenced:

```c
int random(void) {
  int p = 2;
  void *vp = &p;

  int q;
  q = *(int *)vp;

  return 0;
}
```
*Caption: A void pointer needs to be typecasted before it can be used — (int *) tells the compiler to treat vp as an int pointer.*

The `volatile` keyword is critical when accessing hardware registers. Consider:

```c
volatile uint32_t *status_reg = (uint32_t*)0x10000004;
while (!(*status_reg & (1 << 5)));  // wait for bit 5
```

Without `volatile`, the compiler may optimize the loop to a single read — it sees `*status_reg` doesn't change in the loop body, so it reads once and caches the value. With `volatile`, the compiler generates a load instruction for every access, ensuring the CPU reads the register on each iteration.

```c {title="memory-mapped-register-access.c"}
#include <stdint.h>

#define UART_BASE ((volatile uint32_t*)0x10000000)
#define UART_THR  (UART_BASE[0])  /* Transmit Holding Register */
#define UART_LSR  (UART_BASE[5])  /* Line Status Register */
#define LSR_THRE  (1 << 5)        /* THR Empty bit */

void uart_putc(char c) {
    while (!(UART_LSR & LSR_THRE));
    UART_THR = c;
}
```

Function pointers enable dynamic dispatch without the overhead of a function call table lookup. On embedded systems, they are used for interrupt handlers (the vector table is literally an array of function pointers), state machines, and plugin architectures.

The syntax for declaring a function pointer is: `return-type (*variable-name)(parameter-datatype-list);`

```c
return-type (*variable-name)(parameter-datatype-list);
```
*Caption: Template of function pointer declaration.*

A complete example showing how to declare and use function pointers:

```c
int add(int x, int y) {
  return x + y;
}

int sub(int x, int y) {
  return x - y;
}

void main() {
  int (*funct_ptr)(int, int);
  int a;

  funct_ptr = &add;
  a = funct_ptr(10, 20); // a == 30

  funct_ptr = &sub;
  a = funct_ptr(10, 20); // a == -10

  return;
}
```
*Caption: Example of declaring a function pointer — funct_ptr is assigned to point to add and sub functions.*

Compile this code to see how function pointers translate to assembly:

```bash
riscv64-unknown-elf-gcc -O0 -nostdlib -march=rv32i -mabi=ilp32 -S main.c
```
*Caption: Compiling the main.c file with function pointers to generate assembly.*

References: K&R, "The C Programming Language" Ch. 5 (Pointers and Arrays); "Expert C Programming: Deep C Secrets" by Peter van der Linden, Ch. 4 (Pointers). For volatile: Dan Saks, "Volatile as a Promise" (Embedded Systems Programming, 2001).

===QUIZ===

## What does `*(volatile uint32_t*)0x40020014 = 0x01;` do on an ARM Cortex-M4?
- [ ] Declares a constant pointer to an integer
- [x] Writes the value 1 to the memory-mapped register at address 0x40020014, with volatile access to prevent optimization
- [ ] Reads the value at address 0x40020014 and discards it
- [ ] Creates a new variable at address 0x40020014
Correct: B
Explanation: This expression casts the integer 0x40020014 to a volatile uint32_t pointer, then dereferences it to write 0x01. The volatile qualifier ensures the compiler generates an actual store instruction rather than optimizing it away.

## On a 32-bit system, if `int *p = (int*)0x1000;`, what is the value of `p + 3`?
- [ ] 0x1003
- [x] 0x100C
- [ ] 0x1030
- [ ] 0x1100
Correct: B
Explanation: Pointer arithmetic is scaled by the size of the pointed-to type. sizeof(int) = 4 bytes, so p + 3 advances by 3 × 4 = 12 bytes = 0xC. The resulting address is 0x1000 + 0xC = 0x100C.

## What is a pointer variable in C?
- [ ] A variable that stores a character value
- [x] A variable that stores a memory address
- [ ] A variable that stores a floating-point number
- [ ] A variable that stores an instruction
Correct: B
Explanation: A pointer is a variable that holds a memory address. The type of the pointer determines how the data at that address is interpreted and how many bytes are accessed on dereference (e.g., `int *` accesses 4 bytes, `char *` accesses 1 byte).

## What does dereferencing a pointer mean?
- [ ] Assigning a new address to the pointer
- [x] Accessing the value stored at the memory address held by the pointer
- [ ] Deleting the pointer variable
- [ ] Changing the pointer's type
Correct: B
Explanation: Dereferencing a pointer (using `*ptr`) accesses the value at the memory address stored in the pointer variable. For example, if `int *p = &a;`, then `*p` yields the value of `a`. The compiler generates a load instruction (like `lw` for a word) to read from that address.

## What is a `void *` pointer, and what restriction applies to it?
- [x] It points to void (nothing); it cannot be dereferenced without a typecast because the compiler doesn't know the size of the pointed-to data
- [ ] It points to functions only
- [ ] It can be dereferenced freely
- [ ] It only works with character data
Correct: A
Explanation: A `void *` pointer simply holds a memory address with no type information. The compiler cannot determine how many bytes to load/store when dereferencing it, so dereferencing a `void *` directly causes a compile error. It must be typecast (e.g., `*(int *)vp`) before use.

## What is a function pointer in C?
- [ ] A pointer that points to a data variable
- [x] A pointer that stores the address of executable code (a function), allowing the function to be called indirectly
- [ ] A pointer used only for arithmetic operations
- [ ] A special keyword in C
Correct: B
Explanation: A function pointer stores the address of a function. It is declared with the function's return type and parameter types (e.g., `int (*fp)(int, int);`). Dereferencing it calls the pointed-to function. Function pointers are used for callbacks, interrupt vector tables, and state machines.

## Why is the `volatile` qualifier essential when accessing memory-mapped hardware registers?
- [ ] It makes the register access faster
- [x] It prevents the compiler from optimizing away repeated reads or writes — hardware register values can change outside program flow
- [ ] It makes the pointer constant
- [ ] It enables pointer arithmetic on the register address
Correct: B
Explanation: The `volatile` qualifier tells the compiler that the value at the address may change outside the normal program flow (e.g., by hardware). Without `volatile`, the compiler may optimize away repeated reads (caching the value in a register) or eliminate writes it deems unnecessary, which would break hardware interaction.
