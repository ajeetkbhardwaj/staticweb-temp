+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Mixing Assembly and C'
difficulty = 'medium'
language = 'c'
topic_weight = -17
subtopic_weight = 4
weight = 1
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Calls an assembly add function from C and writes result to memory.
 */
extern int add(int a, int b);

int main(void) {
    int result = add(5, 3);
    *(volatile int*)0x10000000 = result;
    while (1);
    return 0;
}'''
+++

## Problem Statement

How do you call assembly functions from C and vice versa? What ABI rules must both sides follow to ensure arguments are passed correctly and registers are preserved?

## Theory and Concepts

The RISC-V calling convention (part of the RISC-V ABI) defines a standard set of rules for function calls. When a C function calls an assembly function, the compiler generates code that follows these rules, and the assembly function must also follow them for correct operation.

**Argument registers (a0–a7):** The first eight integer arguments are passed in registers a0 through a7. If there are more than eight arguments, additional arguments are passed on the stack. The return value is placed in a0.

**Callee-saved vs. caller-saved registers:** Registers s0–s11 (saved registers) must be preserved by the callee. If the callee modifies them, it must save them to the stack and restore them before returning. Registers a0–a7, ra, t0–t6 are caller-saved — the callee may freely modify them.

**Prologue and epilogue:** The function prologue saves the return address (ra) and any callee-saved registers on the stack, then adjusts the stack pointer (sp). The epilogue restores saved registers and ra, then returns using `ret`.

## Real World Application

Embedded firmware frequently mixes C and assembly. Performance-critical inner loops, CPU initialization (cache, MMU, FPU), and low-level hardware access (interrupt handlers, context switching in RTOS) are often written in assembly while the bulk of application logic is written in C. Understanding the calling convention is essential for writing interrupt service routines in assembly that properly save and restore CPU state, and for calling those routines from C.

===EXPLANATION===

## Function Calling Convention for RISC-V RV32I CPU

An Application Binary Interface (ABI) is a contract between software components that defines data representation, function calling conventions, and object file formats. The RISC-V calling convention (part of its ABI) specifies how functions should be called, how parameters are passed, and how return values are handled. Adhering to the ABI allows code written in different languages (C and assembly) to interoperate seamlessly.

### Register Usage

The RV32I ISA has 32 general-purpose registers (x0–x31). Register x0 is hardwired to zero.

### Parameter Passing

The function arguments are passed in registers x10–x17 (ABI names a0–a7). If a function has more than 7 arguments, the remaining arguments are passed on the stack.

### Return Values

Return values are placed in register x10 (a0), with x11 (a1) used for the upper 32 bits of 64-bit returns.

### Function Prologue and Epilogue

When a function is called, the CPU executes a set of instructions known as the function prologue, which saves the caller's state onto the stack. The function epilogue restores this state before returning.

### Stack Usage

Stack management is critical: the stack pointer sp must always remain 16-byte aligned

## Calling Assembly Code from C Files and Vice Versa

### Calling Assembly from C

When you write `extern int add(int a, int b);` in C and `add` is implemented in assembly, the compiler generates a call instruction (`jal ra, add`) that jumps to the assembly label. The values `5` and `3` are placed in registers a0 and a1 respectively by the C compiler before the call. The assembly function performs `add a0, a0, a1` — this computes `a0 + a1` and stores the result back into a0, which is the designated return value register. Finally, `ret` (equivalent to `jalr zero, ra, 0`) returns control to the caller. The C code then reads a0 as the return value.

The assembly implementation of `add`:

```asm
.text
.align 2
.globl add
.type add, @function
add:
  add x10, x11, x10    # add the two numbers
  ret
```
*Caption: Assembly code implementing the function add which will be called from C code.*

The C code that calls the assembly function:

```c
extern int add(int x, int y); // declare the function in C

int main(void)
{
    int a = 5;
    int b = 7;
    int sum = add(a, b); // call the assembly function from C
    return sum;
}
```
*Caption: C code demonstrating a call to add which is a function in assembly.*

### Running on Qemu

To run this on QEMU, we need a startup file (`start.S`) and a linker script (`main.ld`). The source files required:

```bash
$ ls
add.S  main.c  main.ld  start.S
```
*Caption: Required files — add.S, main.c, main.ld, and start.S.*

Compile and generate the binary:

```bash
$ riscv64-unknown-elf-gcc  -O0 -ggdb -nostdlib -nostartfiles \
  -ffreestanding -march=rv32i -mabi=ilp32 \
  -Wl,-Tmain.ld main.c add.S start.S -o main.elf
$ riscv64-unknown-elf-objcopy -O binary main.elf main.bin
```
*Caption: Commands to generate main.bin from all C and assembly files.*

Launch QEMU with the binary, exposing the GDB port:

```bash
$ qemu-system-riscv32 -S -M virt -nographic -bios none -kernel main.elf \
  -gdb tcp::1234
```
*Caption: Load main.bin in QEMU and launch with GDB port exposed, machine halted on the first instruction.*

In another terminal, attach GDB:

```bash
$ gdb-multiarch -q main.elf -ex "target remote localhost:1234" \
  -ex "break _start" -ex "continue"
```
*Caption: Launch GDB and attach it to the port exposed by QEMU.*

GDB output upon successful connection:

```bash
$ gdb-multiarch -q main.elf -ex "target remote localhost:1234" \
  -ex "break _start" -ex "continue"
Reading symbols from main.elf...
Remote debugging using localhost:1234
0x00001000 in ?? ()
Breakpoint 1 at 0x80000000: file start.S, line 4.
Continuing.

Breakpoint 1, _start () at start.S:4
4           la sp, _STACK_TOP_
(gdb)
```
*Caption: GDB attached to the debug port on QEMU.*

Single-stepping through the program using GDB:

```bash
(gdb) break main
Breakpoint 2 at 0x80000020: file main.c, line 5.
(gdb) break main.c:7
Breakpoint 3 at 0x80000030: file main.c, line 7.
(gdb) break add
Breakpoint 4 at 0x8000005c: file add.S, line 6.
(gdb) c
Continuing.

Breakpoint 2, main () at main.c:5
5           int a = 5;
(gdb) c
Continuing.

Breakpoint 3, main () at main.c:7
7           int sum = 0;
(gdb) n
8           sum = add(a, b);
(gdb) p sum
$1 = 0
(gdb) c
Continuing.

Breakpoint 4, add () at add.S:6
6           add x10, x11, x10    # add the two numbers
(gdb) n
7           ret
(gdb) s
main () at main.c:9
9           return sum;
(gdb) p sum
$2 = 12
(gdb)
```
*Caption: Using GDB to step through the program — note sum changes from 0 to 12 after the call to add.*

## Calling C Function from Assembly Code

To call a C function from assembly code, follow the same calling convention. Load arguments into a0–a7, then execute `jal ra, function_name`. The C function to be called:

```c
int add_nums_in_c(int x, int y) {
    return x + y;
}
```
*Caption: C function in main.c that will be called from the assembly code.*

The assembly code that calls the C function:

```asm
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    addi x10, x0, 5
    addi x11, x0, 7
    jal add_nums_in_c
    add x12, x0, x10
    j .
```
*Caption: start.S modified to call add_nums_in_c — arguments are set in x10 and x11 before jal.*

Debugging the mixed-language call in GDB:

```bash
$ gdb-multiarch -q main.elf -ex "target remote localhost:1234" \
  -ex "break _start" -ex "continue"
Reading symbols from main.elf...
Remote debugging using localhost:1234
0x00001000 in ?? ()
Breakpoint 1 at 0x80000000: file start.S, line 4.
Continuing.

Breakpoint 1, _start () at start.S:4
4           la sp, _STACK_TOP_
(gdb) break add_nums_in_c
Breakpoint 2 at 0x80000030: file main.c, line 2.
(gdb) c
Continuing.

Breakpoint 2, add_nums_in_c (x=5, y=7) at main.c:2
2           return x + y;
(gdb) info reg
ra             0x80000014       0x80000014 <_start+20>
sp             0x80000fdc       0x80000fdc
a0             0x5      5
a1             0x7      7
pc             0x80000030       0x80000030 <add_nums_in_c+20>
(gdb) s
3       }
(gdb) s
_start () at start.S:8
8           add x12, x0, x10
(gdb) info reg
a0             0xc      12
a1             0x7      7
a2             0xc      12
pc             0x80000014       0x80000014 <_start+20>
(gdb) s
9           j .
(gdb) info reg
a2             0xc      12
```
*Caption: GDB session showing register state — a0 contains the return value 12, a2 gets copied from a0.*

===CODE===

```c {title="main.c"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 */
extern int add(int a, int b);

int main(void) {
    int result = add(5, 3);
    *(volatile int*)0x10000000 = result;
    while (1);
    return 0;
}
```

```asm {title="add.S"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Assembly implementation of add() and _start entry point.
 */
.text
.globl _start
_start:
    lui sp, 0x80000
    jal main
1:  j 1b

.globl add
add:
    add a0, a0, a1
    ret
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build system for mixed C and assembly RISC-V project.
CC = riscv64-unknown-elf-gcc
CFLAGS = -march=rv64gc -mabi=lp64d -O2 -Wall -nostdlib -nostartfiles
LDFLAGS = -Wl,-Ttext=0x80000000

all: program.elf

program.elf: main.o add.S
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ main.o add.S

main.o: main.c
	$(CC) $(CFLAGS) -c -o $@ $<

clean:
	rm -f *.o program.elf

run: program.elf
	qemu-system-riscv64 -nographic -machine virt -kernel program.elf
```

===QUIZ===

## Which register is used to return a value from a function in the RISC-V calling convention?

- [ ] ra
- [ ] sp
- [x] a0
- [ ] t0

Correct: C
Explanation: The a0 register is designated for returning values from functions. For a 64-bit value, a1 may also be used for the upper 64 bits of a 128-bit return type.

## Which registers must be preserved by a callee function in the RISC-V ABI?

- [ ] a0–a7
- [ ] t0–t6
- [ ] ra and sp only
- [x] s0–s11

Correct: D
Explanation: Registers s0–s11 (saved registers) are callee-saved. If the callee modifies them, it must save them to the stack in the prologue and restore them in the epilogue.

## What are the three key components defined by an Application Binary Interface (ABI)?
- [ ] Hardware design, PCB layout, and power management
- [x] Data representation, function calling conventions, and object file formats
- [ ] Network protocols, memory addresses, and clock speeds
- [ ] Source code, compiler flags, and debug symbols
Correct: B
Explanation: An ABI defines how data types are represented in binary form (size, alignment, endianness), how functions are called (register usage, stack management, parameter passing), and the format of object/executable files for the linker and loader.

## How are function arguments passed in the RISC-V calling convention when a function has more than 8 parameters?
- [ ] All arguments are passed in registers
- [x] The first 8 arguments are passed in registers a0–a7; additional arguments are passed on the stack
- [ ] All arguments are passed on the stack
- [ ] Arguments are passed through global variables
Correct: B
Explanation: The first eight integer/pointer arguments are passed in registers a0 through a7. If a function has more than eight arguments, the remaining arguments are placed on the stack, and the callee reads them from the stack frame.

## When calling an assembly function from C, how does the C compiler pass arguments to the assembly function?
- [ ] Through global memory locations
- [x] It places the first arguments in registers a0–a7 according to the calling convention, then uses `jal` to jump to the assembly label
- [ ] It passes arguments through the stack only
- [ ] It uses inline assembly macros
Correct: B
Explanation: The C compiler follows the RISC-V calling convention: it loads arguments into a0–a7 (and the stack if more than 8), then emits a `jal ra, function_name` instruction. The assembly function receives the arguments in these registers and returns the result in a0.

## What is the purpose of the `extern` keyword when declaring an assembly function in C?
- [ ] It allocates memory for the function
- [x] It tells the compiler that the function is defined in another file (e.g., an assembly file), preventing a linker error
- [ ] It declares the function as inline
- [ ] It marks the function as deprecated
Correct: B
Explanation: The `extern` keyword declares a function or variable that is defined in another translation unit (another source file or assembly file). It tells the compiler "this symbol exists, it will be resolved by the linker," allowing cross-language function calls between C and assembly.

## What two essential tasks must the startup code (`start.S`) perform before calling `main()`?
- [ ] Initialize the UART and set up the GPIO
- [x] Set the stack pointer (`sp`) to a valid memory address and jump to `main()`
- [ ] Clear all CPU registers and enable interrupts
- [ ] Load the linker script and compile the C code
Correct: B
Explanation: The startup code must (1) load the `sp` register with a valid stack address (typically the end of RAM) so that C functions can use the stack for local variables and return addresses, and (2) jump to `main()` using `jal main`.

## In the GDB debugging session for mixed C/assembly code, what is the purpose of the `ni` (next instruction) command?
- [ ] It prints the value of a register
- [x] It executes the current instruction and stops at the next one, stepping over function calls
- [ ] It continues execution until a breakpoint
- [ ] It lists the source code
Correct: B
Explanation: `ni` (next instruction) tells GDB to execute exactly one machine instruction and then pause. It steps over function calls (unlike `si` which steps into them). Combined with `p $a0`, `p $pc` etc., it allows tracing register changes instruction by instruction.
