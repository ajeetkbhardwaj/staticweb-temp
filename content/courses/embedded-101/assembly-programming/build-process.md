+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'The Build Process: From Source to Executable'
difficulty = 'medium'
language = 'c'
topic_weight = -19
subtopic_weight = 2
weight = 4
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V assembly demonstrating multi-file linking with a
 * jal call to an externally defined add_numbers function.
 */
.text
.globl _start
_start:
    addi a0, zero, 5
    addi a1, zero, 3
    jal  add_numbers
    addi a7, zero, 93
    ecall

.globl add_numbers
add_numbers:
    add a0, a0, a1
    ret'''
+++

## Problem Statement

Describe the complete build process from source code to executable. What does each tool (assembler, linker) contribute? How are symbols resolved and addresses assigned across multiple source files?

## Theory and Concepts

The build pipeline transforms source files into an executable through two major stages:

1. **Assembler** (`.s` → `.o`): Translates each assembly instruction into machine code. Produces an **object file** with placeholder addresses for external symbols and a **relocation table** listing which locations need fixing up.

2. **Linker** (`.o` → `.elf`): Combines multiple object files, resolves symbol references (matching `jal add_numbers` to the `add_numbers` entry point), and performs **relocation** — patching placeholder addresses with the final memory addresses.

Object files and executables are divided into **sections**:
- `.text` — executable code (read-only, often in flash/ROM)
- `.data` — initialized global/static variables (in RAM)
- `.bss` — zero-initialized global/static variables (in RAM, occupies no space in the binary file)

## Real World Application

Understanding the build process is critical for debugging link-time errors (undefined symbols, duplicate definitions) and for customizing memory layout with **linker scripts**. Embedded projects routinely use linker scripts to place interrupt vectors at address `0x00000000`, code at `0x08000000` (flash), and data at `0x20000000` (RAM). Without this knowledge, developers are helpless when the linker reports "undefined reference" or when the program crashes because a section is mapped to the wrong address.

===EXPLANATION===

The assembler processes each source file independently in two passes. In pass one, it parses instructions and directives, builds a symbol table (mapping labels to offsets within the section), and identifies unresolved references. In pass two, it emits instruction words with placeholder values for external symbols and records relocation entries. For example, `jal add_numbers` is encoded as a J-type instruction with a dummy immediate; the relocation entry says "at offset 0x10 in `.text`, patch the immediate field with the final address of `add_numbers`".

<figure id="fig-1" class="fig-right">
  <img src="/images/embedded-101/assembly-programming/build.jpeg" alt="Build Process">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Complete build process from source to executable</figcaption>
</figure>

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/compiler.jpeg" alt="Compiler">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Compiler stages in the build pipeline</figcaption>
</figure>

<figure id="fig-3" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/assembler-stages.jpeg" alt="Assembler Stages">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> Assembler processing stages</figcaption>
</figure>

<figure id="fig-4" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/linker-stages.jpeg" alt="Linker Stages">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> Linker stages in the build process</figcaption>
</figure>

## Build Process

### Compiler

The compiler itself is composed of multiple internal stages. The **preprocessor** handles `#include` and `#define` directives. The **lexical analyzer** (scanner) breaks the preprocessed source into tokens. The **syntax analyzer** (parser) checks that the token sequence follows the language grammar. The **semantic analyzer** verifies meaning (e.g., that variables are declared before use). The **intermediate code generator** produces a platform-neutral representation. The **code optimizer** improves efficiency by removing dead code and simplifying expressions. Finally, the **code generator** emits the target assembly language.

<figure id="fig-7" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/assembler-fail.jpeg" alt="Assembler Fail">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> Assembly written for RISC-V cannot be assembled by ARM or x86 assemblers — demonstrating non-portability</figcaption>
</figure>

<figure id="fig-8" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/compiler-autoasm-as.jpeg" alt="Compiler Auto Assembly">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> The compiler bridges C to assembly, which the assembler then converts to machine code for any target architecture</figcaption>
</figure>

<figure id="fig-6" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/compiler.png" alt="Compiler">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> Compiler stages — preprocessor, lexical analyzer, syntax analyzer, semantic analyzer, intermediate code generator, optimizer, code generator</figcaption>
</figure>

## The Need for C

The need for a higher-level language like C arises from portability. Assembly code written for RISC-V cannot run on ARM or x86 without a complete rewrite. C abstracts away the ISA: the same C code can be compiled for RISC-V, ARM, or x86 by using different compiler backends. The compiler translates C to assembly, the assembler converts assembly to relocatable machine code, and the linker combines object files into a final executable. In practice, the `riscv64-unknown-elf-gcc` command invokes all three stages: the compiler frontend (`cc1`), the assembler (`as`), and the linker (`ld` or `collect2`).

A simple C program to experiment with the compiler:

```c
int main() {
  return 0;
}
```
*Caption: Simple C code for compiler experiments — save as main.c.*

<figure id="fig-5" class="fig-right">
  <img src="/images/embedded-101/assembly-programming/c-to-bin.jpeg" alt="C to Binary">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> C source to binary conversion flow</figcaption>
</figure>

<figure id="fig-9" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/strace-output.png" alt="Strace Output">
  <figcaption><a href="#fig-9" class="fig-link">Figure 9:</a> strace output showing gcc invoking cc1, as, collect2, and ld internally</figcaption>
</figure>

The toolchain includes the compiler, assembler, linker, and many other utilities:

```bash
riscv64-unknown-elf-addr2line   riscv64-unknown-elf-elfedit
riscv64-unknown-elf-gcc-ranlib  riscv64-unknown-elf-ld.bfd
riscv64-unknown-elf-readelf     riscv64-unknown-elf-ar
riscv64-unknown-elf-g++         riscv64-unknown-elf-gcov
riscv64-unknown-elf-lto-dump    riscv64-unknown-elf-size
riscv64-unknown-elf-as          riscv64-unknown-elf-gcc
riscv64-unknown-elf-gcov-dump   riscv64-unknown-elf-nm
riscv64-unknown-elf-strings     riscv64-unknown-elf-c++
riscv64-unknown-elf-gcc-10.2.0  riscv64-unknown-elf-gcov-tool
riscv64-unknown-elf-objcopy     riscv64-unknown-elf-strip
riscv64-unknown-elf-c++filt      riscv64-unknown-elf-gcc-ar
riscv64-unknown-elf-gprof       riscv64-unknown-elf-objdump
riscv64-unknown-elf-cpp         riscv64-unknown-elf-gcc-nm
riscv64-unknown-elf-ld          riscv64-unknown-elf-ranlib
```
*Caption: List of utilities in the riscv64-unknown-elf toolchain — gcc, as, and ld are the compiler, assembler, and linker.*

Invoke the compiler:

```bash
$ riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 main.c
```
*Caption: Example of how the compiler is invoked for bare-metal RISC-V.*

Use `strace` to observe the internal stages:

```bash
$ strace -f -e execve riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i1 -mabi=ilp32 main.c
```
*Caption: strace command to track gcc internally calling cc1, as, collect2, and ld.*

### Assembler

The assembler converts assembly code into relocatable machine code. The assembler processes each source file independently, performing lexical analysis, syntax analysis, semantic analysis, symbol resolution, code generation, and output generation.

### Linker

We can confirm this multi-stage invocation using `strace`. Running `strace -f -e execve riscv64-unknown-elf-gcc main.c` reveals that the compiler calls `cc1` (the C frontend), then `as` (the assembler), then `collect2` and `ld` (the linker). Each stage produces intermediate files: `cc1` generates a temporary `.s` assembly file, `as` produces a `.o` object file, and `ld` merges everything into the final ELF executable. This trace provides concrete evidence that the build process is not a single monolithic step but a pipeline of specialized tools.

<figure id="fig-10" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/gcc-man.png" alt="GCC Man Page">
  <figcaption><a href="#fig-10" class="fig-link">Figure 10:</a> GCC man page showing the SYNOPSIS and available options</figcaption>
</figure>

<figure id="fig-11" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/gcc-options.png" alt="GCC Options">
  <figcaption><a href="#fig-11" class="fig-link">Figure 11:</a> GCC man page listing optimization and architecture-specific options</figcaption>
</figure>

## Using the Compiler

### Controlling the Compiler

The linker then takes all object files and performs symbol resolution: it collects every symbol table, verifies that each referenced symbol is defined exactly once, and assigns final memory addresses based on the linker script (or default layout). In our two-file example, `main.o` has an undefined reference to `add_numbers`, and `math.o` provides it. The linker resolves this by placing the `.text` sections of both files consecutively in memory and patching all relocation entries with the final addresses.

### Options

Use the `man` command to explore available compiler options:

```bash
man riscv64-unknown-elf-gcc
```
*Caption: The man command displays the manual for the compiler, listing all available options.*

Key compiler options used in bare-metal RISC-V development include:
- `-O0` — disable optimizations (keep code simple for debugging)
- `-nostdlib` — do not link the standard C library
- `-nostartfiles` — do not add startup code (no CRT)
- `-ffreestanding` — compile for an environment without an OS
- `-march=rv32i` — target the RV32I base integer ISA
- `-mabi=ilp32` — use the 32-bit integer calling convention

<figure id="fig-12" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/compiler-.png" alt="Compiler Dash">
  <figcaption><a href="#fig-12" class="fig-link">Figure 12:</a> Compiler intermediate code generation and optimization stages</figcaption>
</figure>

The linker script controls this layout precisely. The example linker script places `.text` starting at `0x80000000` (a common RISC-V RAM start), `.data` immediately after, then `.bss`. Relocation is the mechanism that makes this possible: without it, the assembler would need to know the final memory layout at assembly time, which is impossible when multiple files are combined. This separation of concerns — assembler translates, linker arranges — is a foundational design pattern in toolchain architecture.

===CODE===

Multi-file example demonstrating separate compilation and linking.

```asm {title="main.s"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V main module that calls an external add_numbers function.
 */
.text
.globl _start
_start:
    addi a0, zero, 10     # first argument = 10
    addi a1, zero, 20     # second argument = 20
    jal  add_numbers      # call external function
    addi a7, zero, 93     # exit syscall
    ecall
```

```asm {title="math.s"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V math module providing add_numbers for external linking.
 */
.text
.globl add_numbers
add_numbers:
    add a0, a0, a1        # a0 = a0 + a1
    ret
```

```ld {title="link.ld"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Linker script placing .text at 0x80000000 for RISC-V QEMU.
 */
OUTPUT_ARCH(riscv)
ENTRY(_start)

SECTIONS
{
    . = 0x80000000;
    .text : { *(.text) }
    .data : { *(.data) }
    .bss  : { *(.bss) }
}
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Makefile for multi-file linking with a custom linker script.
CROSS_COMPILE = riscv64-unknown-elf-
AS = $(CROSS_COMPILE)as
LD = $(CROSS_COMPILE)ld

all: program.elf

program.elf: main.o math.o
	$(LD) -T link.ld -o $@ $^

%.o: %.s
	$(AS) -o $@ $<

clean:
	rm -f *.o *.elf
```

===QUIZ===

## What is the primary job of the linker in the build process?

- [ ] Translating assembly mnemonics to binary opcodes
- [x] Resolving symbol references and performing relocation
- [ ] Optimizing the generated machine code for performance
- [ ] Converting object files back to assembly source
Correct: B
Explanation: The assembler handles mnemonic-to-opcode translation. The linker resolves cross-file symbol references and adjusts addresses via relocation entries.

## Which section in an executable contains uninitialized global data that occupies no space in the binary file?

- [ ] .text
- [ ] .data
- [x] .bss
- [ ] .rodata
Correct: C
Explanation: The `.bss` section holds variables that are zero-initialized at runtime. Because all values are zero, only the size and location are stored in the object file — the actual bytes are not present in the binary image.

## What are the internal stages of the compiler that process C source code?
- [ ] Editor, linker, loader, debugger
- [x] Preprocessor, lexical analyzer, syntax analyzer, semantic analyzer, intermediate code generator, optimizer, code generator
- [ ] Assembler, linker, loader, runtime
- [ ] Scanner, parser, executor, reporter
Correct: B
Explanation: The compiler has multiple internal stages: the preprocessor handles `#include`/`#define`, the lexical analyzer breaks source into tokens, the syntax analyzer checks grammar, the semantic analyzer checks meaning, the intermediate code generator produces a platform-neutral representation, the optimizer improves efficiency, and the code generator emits target assembly.

## How does the assembler handle unresolved external symbols like a function call to another file?
- [ ] It generates an error and stops
- [x] It emits the instruction with a placeholder address and records a relocation entry for the linker to patch later
- [ ] It ignores the unresolved reference
- [ ] It replaces the call with a `nop` instruction
Correct: B
Explanation: The assembler processes each file independently. When it encounters an external reference like `jal add_numbers`, it encodes the instruction with a dummy immediate and records a relocation entry. The linker later resolves the reference and patches the instruction with the final address.

## What is the purpose of `-nostdlib -nostartfiles -ffreestanding` in GCC compilation options for bare-metal development?
- [ ] They enable debugging symbols
- [x] They exclude the standard C library, startup files, and hosted runtime — necessary for code that runs directly on hardware without an OS
- [ ] They optimize for code size
- [ ] They enable position-independent code
Correct: B
Explanation: These flags tell GCC not to link the standard C library (`-nostdlib`), not to include C runtime startup code (`-nostartfiles`), and to compile for an environment without an OS (`-ffreestanding`). In bare-metal programming, we provide our own startup code and linker script.

## What does `strace` reveal about how `gcc` processes a C source file?
- [ ] It shows the source code line by line
- [x] It shows that gcc internally calls `cc1` (C frontend), `as` (assembler), `collect2`, and `ld` (linker) in sequence
- [ ] It shows the CPU registers during execution
- [ ] It shows the file system layout
Correct: B
Explanation: Running `strace -f -e execve riscv64-unknown-elf-gcc ...` reveals that gcc internally invokes `cc1` to compile C to assembly, `as` to assemble to object code, and `collect2`/`ld` to link object files into the final executable — confirming the multi-stage build pipeline.

## What is relocation, and why is it needed in the linking process?
- [ ] Relocation moves the code from disk to memory
- [x] Relocation patches placeholder addresses in machine code with the final memory addresses determined by the linker
- [ ] Relocation reorders instructions for better performance
- [ ] Relocation deletes unused code
Correct: B
Explanation: When the assembler produces an object file, it uses placeholder values for addresses that aren't yet known (e.g., addresses of symbols in other files). The linker resolves all symbol references and then performs relocation — patching each placeholder with the correct final address based on the linker script's memory layout.
