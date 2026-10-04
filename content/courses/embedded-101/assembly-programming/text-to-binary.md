+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Text to Binary: How Assembly Becomes Machine Code'
difficulty = 'easy'
language = 'c'
topic_weight = -19
subtopic_weight = 2
weight = 1
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V RV32I assembly program demonstrating add/addi
 * instructions and ecall for program exit.
 */
.text
.globl _start
_start:
    addi a0, zero, 5
    addi a1, zero, 3
    add  a2, a0, a1
    addi a7, zero, 93
    ecall'''
+++

## Problem Statement

How does text written in assembly language become binary instructions the CPU can execute? Walk through each step, from the assembly source file to the final binary instruction word stored in memory.

## Theory and Concepts

Assembly language is a human-readable representation of machine code. Each mnemonic (like `add` or `addi`) corresponds to a specific opcode that the CPU's decoder hardware understands. The assembler translates each assembly line into a binary instruction word by computing the opcode, register numbers, and immediate values according to the instruction format.

RISC-V RV32I defines six instruction formats:
- **R-type** — register operands only (e.g., `add rd, rs1, rs2`)
- **I-type** — register + immediate (e.g., `addi rd, rs1, imm`)
- **S-type** — store to memory
- **B-type** — conditional branches
- **U-type** — upper immediate (LUI, AUIPC)
- **J-type** — unconditional jumps

For `add a2, a0, a1` (R-type): opcode[6:0]=`0110011`, funct3[14:12]=`000`, funct7[31:25]=`0000000`, rd=x12=`01100`, rs1=x10=`01010`, rs2=x11=`01011`. The resulting 32-bit word is `00000000101101010000011000110011` = `0x00B50633`.

## Real World Application

Every assembler performs text-to-binary translation. Embedded developers working on bootloaders or firmware often inspect raw hex dumps to verify instruction encoding. Tools like `objdump -d` disassemble binaries back to assembly, forming the round-trip that developers use to confirm their code compiles correctly. When a CPU executes unexpected instructions, examining the raw machine code is often the fastest debugging path.

===EXPLANATION===

## Converting Assembly to Machine Code

The translation from assembly to machine code happens in the assembler's first pass: it scans each line, strips comments, and parses the mnemonic and operands. In pass two, it assigns addresses to labels and emits the binary instruction words. Each instruction format defines exactly which bits encode the opcode, register operands, immediate values, and function selectors. The assembler computes each field and packs them into a 32-bit word.

A simple RISC-V RV32I instruction:

```asm
addi x2, x1, 20
```
*Caption: Simple RISC-V RV32I assembly instruction — adds the contents of x1 with the immediate value 20 and stores the result in x2.*

A complete assembly program with two instructions:

```asm
_start:
  addi x1, x0, 10
  addi x2, x1, 20
```
*Caption: main.s assembly program file — loads 10 into x1, then adds 20 and stores in x2.*

<figure id="fig-1" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/asm.jpeg" alt="Assembly Debug">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Assembly code debugging session</figcaption>
</figure>

Consider `addi a0, zero, 5` at `_start`. The assembler recognizes `addi` as an I-type instruction with opcode `0x13`. It encodes `rd=a0` (x10 = `01010`), `rs1=zero` (x0 = `00000`), and the immediate `5` (`000000000101`). The resulting word is `0x00500513`. The CPU's instruction fetch unit reads this word from memory; the decoder routes the opcode and control signals to the ALU to perform `x10 = x0 + 5`. Every instruction goes through this same encode-fetch-decode-execute cycle.

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/gdb.png" alt="GDB Debug">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> GDB debugger interface for RISC-V</figcaption>
</figure>

<figure id="fig-3" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/debug.png" alt="Debug">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> Debug session showing register and memory state</figcaption>
</figure>

<figure id="fig-4" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/run.png" alt="Make run">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> Executing `make` triggers the toolchain to compile assembly into binary</figcaption>
</figure>

### Linker Script

The build process uses a linker script to tell the linker where to place code in memory. For RISC-V QEMU, the CPU's program counter starts at address `0x80000000`. The linker script maps the `.text` section to that address so the binary is placed exactly where the CPU looks first. Without a linker script, the linker would use its default layout, which likely will not match the emulated machine's memory map.

```ld
MEMORY
{
  RAM : ORIGIN = 0x80000000, LENGTH = 4k
}

SECTIONS
{
  .text : {
    *(.text*)
  } > RAM
}
```
*Caption: main.ld linker script — dictates how code is placed in memory. The CPU's PC starts at 0x80000000.*

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/linker-script-annotated.png" alt="Linker Script Annotated">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> Annotated linker script showing MEMORY and SECTIONS directives</figcaption>
</figure>

<figure id="fig-6" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/makefile.png" alt="Makefile">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> Makefile structure showing targets, dependencies, and recipes</figcaption>
</figure>

### Makefile and Make

The `make` utility automates the build commands. When you run `make`, it reads the `Makefile`, finds the first target (`all`), checks whether its dependencies (`main.s`) have changed, and runs the recipe — a sequence of shell commands. The recipe compiles the assembly with `gcc`, converts the ELF to a raw binary with `objcopy`, and displays the hex dump with `xxd`. This automation saves you from typing the long compilation commands manually.

```makefile
TOOLCHAIN_PREFIX ?= riscv64-unknown-elf-
OBJCOPY           = $(TOOLCHAIN_PREFIX)objcopy
LD                = $(TOOLCHAIN_PREFIX)ld
AS                = $(TOOLCHAIN_PREFIX)as
GCC               = $(TOOLCHAIN_PREFIX)gcc

all: main.s
  $(GCC)  -O0 -ggdb -nostdlib -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld main.s -o main.elf
  $(OBJCOPY) -O binary main.elf main.bin
  xxd -e -c 4 -g 4 main.bin

debug:
  qemu-system-riscv32 -S -M virt -nographic -bios none -kernel main.elf -gdb tcp::1234

gdb:
  gdb-multiarch main.elf -ex "target remote localhost:1234" -ex "break _start" -ex "continue" -q

.PHONY: clean
clean:
  rm -rf *.o *.elf *.bin *.bmp a.out
```
*Caption: Makefile — instructions for the make utility to automate compilation, debugging, and cleanup.*

The compiled binary can be inspected with `xxd`:

```bash
$ riscv64-unknown-elf-gcc -O0 -ggdb -nostdlib -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld main.s -o main.elf
$ riscv64-unknown-elf-objcopy -O binary main.elf main.bin
$ xxd -e -c 4 -g 4 main.bin
00000000: 00a00093  ....
00000004: 01408113  ..@.
```
*Caption: Compiling assembly to binary and printing the content as hex — the two instructions show as 32-bit words.*

This process repeats for every instruction in the program. The output is a flat binary — a sequence of 32-bit words — that the CPU can execute directly. Understanding this encoding allows developers to patch binaries at the machine-code level when source code is unavailable, and is essential for anyone writing instruction-set simulators, disassemblers, or low-level debug tools.

<figure id="fig-7" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/qemu-gdb-connection.jpeg" alt="QEMU GDB Connection">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> QEMU and GDB running as separate processes connected over TCP</figcaption>
</figure>

## Demo

To verify that the generated binary contains the correct instructions, we can run it on QEMU and single-step with GDB.

### Launching QEMU

QEMU emulates a RISC-V `virt` machine and loads the `main.elf` kernel. Starting QEMU with the `-S` flag pauses the CPU immediately, waiting for a debugger to attach.

```bash
$ make debug
qemu-system-riscv32 -S -M virt -nographic -bios none -kernel main.elf -gdb tcp::1234
```
*Caption: Starting QEMU in debug mode — the CPU is paused, waiting for GDB to connect.*

### Launching GDB

GDB connects to QEMU's GDB server on TCP port 1234, sets a breakpoint at `_start`, and lets you step through each instruction.

```bash
$ make gdb
gdb-multiarch main.elf -ex "target remote localhost:1234" -ex "break _start" -ex "continue" -q
```
*Caption: Launching GDB to connect with QEMU — sets a breakpoint at _start and continues execution.*

### Single Stepping the CPU

Using GDB commands like `p $pc`, `p $x1`, `ni` (next instruction), and `p $x2`, you can watch the program counter advance and the register values update. QEMU emulates a RISC-V `virt` machine and loads the `main.elf` kernel. Starting QEMU with the `-S` flag pauses the CPU immediately, waiting for a debugger to attach. GDB connects to QEMU's GDB server on TCP port 1234, sets a breakpoint at `_start`, and lets you step through each instruction.

<figure id="fig-8" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/terminal-1.png" alt="Terminal 1 QEMU">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> Terminal showing QEMU launched in debug mode with `make debug`</figcaption>
</figure>

<figure id="fig-9" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/terminal-2.png" alt="Terminal 2 GDB">
  <figcaption><a href="#fig-9" class="fig-link">Figure 9:</a> Terminal showing GDB connecting to QEMU and single-stepping</figcaption>
</figure>

<figure id="fig-10" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/completed-execution.png" alt="Completed Execution">
  <figcaption><a href="#fig-10" class="fig-link">Figure 10:</a> GDB session showing register state after single-stepping both instructions</figcaption>
</figure>

Using GDB commands like `p $pc`, `p $x1`, `ni` (next instruction), and `p $x2`, you can watch the program counter advance and the register values update. After executing `addi x1, x0, 10`, register `x1` contains `10` (0xA). After `addi x2, x1, 20`, register `x2` contains `30` (0x1E). This confirms that the binary produced by the assembler, linker, and objcopy contains the correct instruction encodings and that QEMU executes them faithfully.

<figure id="fig-11" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/two-window-debug.png" alt="Two Window Debug">
  <figcaption><a href="#fig-11" class="fig-link">Figure 11:</a> Two-window debugging setup with QEMU in one terminal and GDB in another</figcaption>
</figure>

<figure id="fig-12" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/qemu-gdb-output.png" alt="QEMU GDB Output">
  <figcaption><a href="#fig-12" class="fig-link">Figure 12:</a> GDB output showing disassembly and register state during debugging</figcaption>
</figure>

===CODE===

Full compilable example with annotated binary encodings.

```asm {title="add.s"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V assembly with annotated binary encodings.
 */
.text
.globl _start
_start:
    addi a0, zero, 5    # a0 = 5;  I-type: 0x00500513
    addi a1, zero, 3    # a1 = 3;  I-type: 0x00300593
    add  a2, a0, a1     # a2 = a0 + a1;  R-type: 0x00B50633
    addi a7, zero, 93   # a7 = 93 (exit syscall);  I-type: 0x05D00793
    ecall               # Environment call;  0x00000073
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Makefile for assembling RISC-V assembly into an ELF binary.
CROSS_COMPILE = riscv64-unknown-elf-
AS = $(CROSS_COMPILE)as
LD = $(CROSS_COMPILE)ld

all: program.elf

program.elf: add.o
	$(LD) -o $@ $^

add.o: add.s
	$(AS) -o $@ $<

clean:
	rm -f *.o *.elf
```

===QUIZ===

## Which field in an R-type RISC-V instruction identifies the operation category?

- [ ] rs1
- [ ] rd
- [x] opcode
- [ ] funct3
Correct: C
Explanation: The opcode field (bits 6:0) identifies the instruction category. For R-type arithmetic instructions, the opcode is 0x33.

## What is the binary encoding of `addi x5, x6, 31`?

- [ ] 0x01F28313
- [x] 0x01F30293
- [ ] 0x01F00313
- [ ] 0x01F28293
Correct: B
Explanation: `addi x5, x6, 31`: I-type with opcode=0010011, rd=x5=00101, funct3=000, rs1=x6=00110, imm=31=000000011111. Packs to 0x01F30293.

## How does the assembler process an assembly source file in its two-pass approach?
- [ ] Pass one generates the final binary; pass two cleans up comments
- [x] Pass one scans lines, parses mnemonics, and builds a symbol table; pass two assigns addresses to labels and emits binary instruction words
- [ ] Both passes generate identical output
- [ ] Pass one generates C code; pass two assembles it
Correct: B
Explanation: In the first pass, the assembler scans each line, strips comments, and parses the mnemonic and operands, building a symbol table. In the second pass, it assigns final addresses to labels and emits the binary instruction words by computing each field and packing them into 32-bit words.

## What is the purpose of the linker script in the text-to-binary build process?
- [ ] It defines the programming language syntax
- [x] It tells the linker where to place code in memory — mapping sections to physical addresses like 0x80000000 for QEMU
- [ ] It compiles C code to assembly
- [ ] It launches QEMU
Correct: B
Explanation: The linker script maps the `.text` section to the address where the CPU's program counter starts (0x80000000 on QEMU RISC-V virt machine). Without it, the linker would use a default layout that likely will not match the emulated machine's memory map.

## What does the `-S` flag do in the QEMU launch command `qemu-system-riscv32 -S -M virt ...`?
- [ ] It enables secure boot
- [x] It tells QEMU to start the CPU in a paused state, waiting for a debugger to attach
- [ ] It speeds up emulation
- [ ] It enables serial output
Correct: B
Explanation: The `-S` flag starts QEMU with the CPU paused at the first instruction, rather than executing immediately. This allows a debugger (GDB) to connect, set breakpoints, and control execution from the very first instruction.

## What command can be used to inspect the raw hex content of a compiled binary?
- [ ] gcc
- [x] xxd
- [ ] make
- [ ] qemu-system-riscv32
Correct: B
Explanation: The `xxd` utility produces a hex dump of a binary file. For example, `xxd -e -c 4 -g 4 main.bin` displays the binary contents as 32-bit words in hexadecimal format, allowing inspection of the encoded machine instructions.

## What does `objcopy -O binary main.elf main.bin` do?
- [ ] It converts a C source file to assembly
- [x] It strips debug information from an ELF file and produces a raw binary file containing only the machine code
- [ ] It launches the binary in QEMU
- [ ] It compiles assembly to an object file
Correct: B
Explanation: `objcopy -O binary` converts the ELF executable (which contains metadata, symbol tables, and debug info) into a flat binary file that contains only the raw machine instructions and data — suitable for loading directly into the emulated machine's memory.
