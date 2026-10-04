+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Assembler Directives: Controlling the Assembler'
difficulty = 'medium'
language = 'c'
topic_weight = -19
subtopic_weight = 2
weight = 3
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V assembly demonstrating use of .equ directive for
 * defining constants, and a minimal exit program.
 */
.equ  MY_VAL, 100
.text
.globl _start
_start:
    addi a0, zero, MY_VAL
    addi a7, zero, 93
    ecall'''
+++

## Problem Statement

What are assembler directives and how do they differ from instructions? Give examples of when each is used, and explain the role of `.section`, `.globl`, `.align`, and `.word` in organizing assembly programs.

## Theory and Concepts

Assembler directives (also called pseudo-operations) are commands to the assembler, not CPU instructions. They control section placement, symbol visibility, alignment, data storage, and constant definitions. Unlike instructions, directives do not produce machine code directly — they affect how the assembler organizes and labels the generated binary.

Common RISC-V assembler directives:

| Directive | Purpose | Example |
|-----------|---------|---------|
| `.text` | Place following code in the text (code) section | `.text` |
| `.data` | Place following data in the data section | `.data` |
| `.bss` | Place following data in the BSS section | `.bss` |
| `.globl` | Make a symbol visible to the linker | `.globl _start` |
| `.align n` | Align next data/code to 2^n boundary | `.align 2` |
| `.word v` | Emit a 32-bit value | `.word 0xDEADBEEF` |
| `.byte v` | Emit an 8-bit value | `.byte 0x41` |
| `.equ n, v` | Define a numeric constant | `.equ UART_BASE, 0x1000` |
| `.space n` | Reserve n bytes (zero-filled) | `.space 64` |

## Real World Application

Bare-metal embedded systems rely heavily on directives. `.section` places interrupt vector tables at specific memory addresses. `.align` ensures structure members are properly aligned for the target ABI. `.equ` defines memory-mapped register offsets portably, so changing a peripheral's base address requires only one edit.

===EXPLANATION===

<figure id="fig-1" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/directives-explained.png" alt="Directives Explained">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Assembler directives explained with examples</figcaption>
</figure>

<figure id="fig-2" class="fig-right">
  <img src="/images/embedded-101/assembly-programming/gnu-as-doc.png" alt="GNU AS Documentation">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> GNU assembler (GAS) documentation reference</figcaption>
</figure>

## Generating Assembly from C Code

The distinction between directives and instructions is fundamental: an instruction tells the CPU what to do at runtime, while a directive tells the assembler how to build the binary at compile time. For example, `.word 0xDEADBEEF` does not execute anything — it simply places the 32-bit value `0xDEADBEEF` at the current location in the output. The CPU will interpret those bytes as data or as an instruction depending on where the program counter points.

To see directives in action, consider the following C code with various types of variables:

```c
char initialized_array[] = "Hello, World!";
int initialized_int = 10;
int uninitialized_int;

int function() {
  int initialized_local = initialized_int;
  int uninitialized_local;

  uninitialized_int = initialized_local + 1;

  uninitialized_local = uninitialized_int + 1;

  return uninitialized_local;
}
```
*Caption: main.c — a simple C program with initialized globals, uninitialized globals, and a function.*

The Makefile to generate the assembly:

```bash
TOOLCHAIN_PREFIX ?= riscv64-unknown-elf-

OBJCOPY           = $(TOOLCHAIN_PREFIX)objcopy
LD                = $(TOOLCHAIN_PREFIX)ld
AS                = $(TOOLCHAIN_PREFIX)as
GCC               = $(TOOLCHAIN_PREFIX)gcc

all: main.c
  $(GCC) -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i -mabi=ilp32 -S main.c

.PHONY: clean
clean:
  rm -rf *.s
```
*Caption: Makefile with commands to generate the assembly file from the C file.*

Run make to generate the assembly:

```bash
$ make
riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 -S main.c
```
*Caption: main.c converted to main.s using the -S flag.*

Directives become especially important in multi-section programs. The `.text` section holds executable code, typically placed in ROM or flash on embedded systems. The `.data` section holds initialized global variables that must be copied to RAM at startup. The `.bss` section holds uninitialized globals that are zero-filled by the CRT (C runtime) before `main()` runs. Understanding these sections is critical for writing linker scripts and for minimizing a program's memory footprint — `.bss` variables consume no space in the binary image, only in RAM.

The `.equ` directive is a simple text substitution mechanism: wherever the assembler sees `UART_BASE`, it substitutes `0x10000000`. Unlike C's `#define`, `.equ` applies only within the assembly source and is not processed by a preprocessor. The `.globl` directive controls symbol visibility — only symbols explicitly marked `.globl` are exported to the symbol table for the linker. Without `.globl`, a symbol is local to the file and cannot be referenced from other object files.

## Generated Assembly Code

To see directives in action, consider what happens when a C compiler generates assembly from a C source file. A simple C file with initialized globals, uninitialized globals, and a function produces assembly output that uses `.data` for initialized data, `.bss`/`.sbss` for uninitialized data, `.text` for code, `.globl` for exported symbols, and `.type`/`.size` for symbol metadata. The compiler's `-S` flag stops after generating assembly, letting you inspect all the directives the compiler emits automatically.

The generated `main.s` file:

```asm
  .file  "main.c"
  .option nopic
  .attribute arch, "rv32i1p0"
  .attribute unaligned_access, 0
  .attribute stack_align, 16
  .text
  .globl  initialized_array
  .data
  .align  2
  .type  initialized_array, @object
  .size  initialized_array, 14
initialized_array:
  .string  "Hello, World!"
  .globl  initialized_int
  .section  .sdata,"aw"
  .align  2
  .type  initialized_int, @object
  .size  initialized_int, 4
initialized_int:
  .word  10
  .globl  uninitialized_int
  .section  .sbss,"aw",@nobits
  .align  2
  .type  uninitialized_int, @object
  .size  uninitialized_int, 4
uninitialized_int:
  .zero  4
  .text
  .align  2
  .globl  function
  .type  function, @function
function:
  addi  sp,sp,-32
  sw  s0,28(sp)
  addi  s0,sp,32
  lui  a5,%hi(initialized_int)
  lw  a5,%lo(initialized_int)(a5)
  sw  a5,-20(s0)
  lw  a5,-20(s0)
  addi  a4,a5,1
  lui  a5,%hi(uninitialized_int)
  sw  a4,%lo(uninitialized_int)(a5)
  lui  a5,%hi(uninitialized_int)
  lw  a5,%lo(uninitialized_int)(a5)
  addi  a5,a5,1
  sw  a5,-24(s0)
  lw  a5,-24(s0)
  mv  a0,a5
  lw  s0,28(sp)
  addi  sp,sp,32
  jr  ra
  .size  function, .-function
  .ident  "GCC: (g2ee5e430018-dirty) 12.2.0"
```
*Caption: Generated main.s — note the use of .data, .sbss, .text sections, .globl, .type, .size directives around labels.*

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/assembly-programming/qr-directives.png" alt="QR Directives">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> QR code linking to the complete GNU assembler directives documentation</figcaption>
</figure>

Common directives that appear in compiler-generated assembly include:
- `.file "main.c"` — records the source filename for debug info
- `.option nopic` — disables position-independent code generation
- `.attribute arch, "rv32i1p0"` — records the target architecture
- `.align 2` — aligns to a 2-byte (2^1) boundary
- `.type symbol, @object` or `.type symbol, @function` — sets the symbol type for the linker
- `.size symbol, N` — records the size of a symbol in bytes
- `.zero N` or `.space N` — reserves N zero-filled bytes

<figure id="fig-4" class="fig-right">
  <img src="/images/embedded-101/assembly-programming/gnu-as-doc.png" alt="GNU AS Documentation">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> GNU assembler (GAS) documentation showing available directives</figcaption>
</figure>

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/directives-explained.png" alt="Directives Explained">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> Grouping patterns of directives around labels in compiler-generated assembly</figcaption>
</figure>

## Grouping Patterns

Directives follow recognizable grouping patterns around labels. For a global variable, the compiler emits: `.globl`, `.section` or `.data`/`.text`, `.align`, `.type`, `.size`, then the label. For a function, the pattern is the same but in the `.text` section with `.type` set to `@function`. Recognizing these groups makes it much easier to read compiler-generated assembly output and understand how C-level constructs map to assembly-level data and code organization.

===CODE===

Example demonstrating various assembler directives with annotations.

```asm {title="directives.s"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V assembly demonstrating .equ, .section, .rodata,
 * .data, .bss, .byte, .word, .space, and %hi/%lo relocations.
 */
.equ  UART_BASE, 0x10000000
.equ  UART_TX,   UART_BASE + 0x00

.section .rodata
msg:
    .byte 0x48, 0x65, 0x6C, 0x6C, 0x6F  # "Hello" in ASCII

.section .data
my_data:
    .word 0xDEADBEEF, 0xCAFEBABE
    .align 2

.section .bss
buffer:
    .space 64

.section .text
.globl _start
_start:
    lui   a0, %hi(my_data)
    addi  a0, a0, %lo(my_data)
    lw    a1, 0(a0)
    addi  a7, zero, 93
    ecall
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Makefile for assembling the directives example into an ELF.
CROSS_COMPILE = riscv64-unknown-elf-
AS = $(CROSS_COMPILE)as
LD = $(CROSS_COMPILE)ld

all: program.elf

program.elf: directives.o
	$(LD) -o $@ $^

directives.o: directives.s
	$(AS) -o $@ $<

clean:
	rm -f *.o *.elf
```

===QUIZ===

## Which directive makes a symbol visible to other object files during linking?

- [ ] .text
- [ ] .align
- [x] .globl
- [ ] .equ
Correct: C
Explanation: `.globl` exports a symbol to the object file's symbol table so it can be referenced by other modules at link time. Without `.globl`, symbols are file-local.

## What is the primary difference between an assembler directive and a CPU instruction?

- [ ] Directives execute faster than instructions
- [x] Instructions produce machine code; directives control the assembler
- [ ] Directives can only appear at the start of a file
- [ ] Instructions are case-sensitive; directives are not
Correct: B
Explanation: Instructions are translated to binary opcodes that the CPU executes at runtime. Directives are commands to the assembler that control sectioning, alignment, symbol visibility, and data emission.

## What is the purpose of the `.section` directive in assembly?
- [ ] It defines a new CPU instruction
- [x] It switches the assembler to a named section (e.g., `.text`, `.data`, `.bss`, `.rodata`) for organizing code and data
- [ ] It creates a new register
- [ ] It sets the clock speed
Correct: B
Explanation: The `.section` directive tells the assembler which section of the output file to place the following code or data into. Common sections include `.text` (executable code), `.data` (initialized data), `.bss` (zero-initialized data), and `.rodata` (read-only data).

## What does the `.align 2` directive do?
- [x] It aligns the next data or code to a 2^2 = 4-byte boundary
- [ ] It creates 2 bytes of space
- [ ] It aligns the next data or code to a 2-byte boundary
- [ ] It sets the instruction alignment to 2 instructions
Correct: A
Explanation: `.align n` aligns the following code/data to a 2^n byte boundary. `.align 2` means alignment to a 4-byte (2^2) boundary, which is important for performance and required for certain data types like 32-bit words.

## What do the `.word` and `.byte` directives do?
- [ ] They execute instructions at runtime
- [x] They emit 32-bit and 8-bit values respectively into the binary at the current location
- [ ] They define CPU registers
- [ ] They set compiler optimization flags
Correct: B
Explanation: `.word value` emits a 32-bit value at the current location in the output section. `.byte value` emits an 8-bit value. These are used to place constant data (like lookup tables or magic numbers) directly into the binary.

## What is the purpose of the `.equ` directive?
- [ ] It defines an equilateral triangle shape
- [x] It defines a numeric constant — the assembler substitutes the name with the value wherever it appears
- [ ] It equals two registers
- [ ] It enables equal-probability branch prediction
Correct: B
Explanation: `.equ name, value` defines a numeric constant. Wherever `name` appears in the assembly source, the assembler substitutes `value`. For example, `.equ UART_BASE, 0x1000` lets code use `UART_BASE` instead of a hardcoded number.

## In compiler-generated assembly, what grouping pattern of directives typically surrounds a global variable label?
- [ ] Only `.text` and `.align`
- [x] `.globl`, `.section`/`.data`, `.align`, `.type`, `.size`, then the label
- [ ] Just the label alone
- [ ] `.word` and `.byte` only
Correct: B
Explanation: For a global variable, the compiler emits a recognizable pattern: `.globl` (export symbol), `.section .data` or similar (placement), `.align` (alignment), `.type symbol, @object` (symbol type), `.size symbol, N` (size in bytes), then the label followed by the data directives.
