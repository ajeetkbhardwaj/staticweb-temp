+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Assembly Language: Mnemonics and Instruction Formats'
difficulty = 'easy'
language = 'c'
topic_weight = -19
subtopic_weight = 2
weight = 2
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V RV32I assembly program that adds two values using
 * temporary registers and exits via ecall.
 */
.text
.globl _start
_start:
    addi t0, zero, 10
    addi t1, zero, 20
    add  t2, t0, t1
    addi a7, zero, 93
    ecall'''
+++

## Problem Statement

What is the relationship between assembly language and machine code? Can you hand-assemble a RISC-V instruction from its mnemonic form to the raw 32-bit binary encoding?

## Theory and Concepts

Assembly language is a one-to-one textual mapping to machine code. Each **mnemonic** (e.g., `add`, `lw`, `jal`) corresponds to a specific opcode. **Operands** (registers, immediates, labels) supply the data the instruction operates on. **Labels** provide symbolic names for memory addresses. **Assembler directives** (like `.text`, `.globl`) control the assembly process without generating instructions.

RISC-V RV32I instructions use six formats:
| Format | Fields | Example |
|--------|--------|---------|
| R-type | `funct7 rs2 rs1 funct3 rd opcode` | `add t0, t1, t2` |
| I-type | `imm rs1 funct3 rd opcode` | `addi t0, t1, 5` |
| S-type | `imm rs1 funct3 rs2 opcode` | `sw t0, 0(t1)` |
| B-type | `imm rs1 funct3 rs2 opcode` | `beq t0, t1, label` |
| U-type | `imm rd opcode` | `lui t0, 0x12345` |
| J-type | `imm rd opcode` | `jal ra, label` |

## Real World Application

Hand-assembly is rarely done manually today, but understanding instruction encoding is essential for writing instruction-set simulators, compilers, and disassemblers. It also helps when reading raw machine code during security reverse-engineering or when patching binaries in the field. Tools like `objdump -d` and `riscv64-unknown-elf-objdump -d` perform the reverse mapping automatically.

===EXPLANATION===

## ISA and Assembly Program

The relationship between assembly and machine code is a direct symbolic mapping. Each mnemonic is shorthand for a binary opcode, each register name maps to a 5-bit register number (x0–x31), and each label resolves to a 32-bit address. The assembler's primary job is to resolve all symbolic references and emit the correct instruction words. This stands in contrast to high-level languages (C, Rust) where a single statement can expand to dozens of instructions.

<figure id="fig-1" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/asm-prog.png" alt="Assembly Program">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Assembly program execution in QEMU</figcaption>
</figure>

To hand-assemble `addi sp, sp, -32` (adjusting the stack pointer), you identify: I-type format, opcode `0010011` (ADDI), rd=sp(x2=`00010`), rs1=sp(x2=`00010`), funct3=`000`, imm=`111111100000` (sign-extended -32). The word becomes `111111100000_00010_000_00010_0010011` = `0xFF810113`. This skill is useful when you need to verify what a compiler or assembler produced, or when working with instruction encoding in processor design.

RISC-V was designed with a clean, regular encoding that makes hand-assembly easier than CISC ISAs like x86. All instructions are 32 bits (for RV32I), opcodes are consistently placed in bits 6:0, and register fields always occupy the same bit positions within each format. This regularity is a deliberate design choice that simplifies the decoder hardware and makes the ISA easy to learn.

Assembly programs use labels to mark code locations. The `bnez` pseudo-instruction branches to a label if the register is not zero:

```asm
addi x1, x0, 5
addi x2, x0, 1
addi x3, x0, 0

loop:
  add x3, x3, x2
  addi x1, x1, -1
  bnez x1, loop
```
*Caption: main.s — a loop that accumulates values using labels and branches.*

Compiling this code and dumping the binary shows the instruction encodings:

```bash
$ make
riscv64-unknown-elf-gcc  -O0 -ggdb -nostdlib -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld main.s -o main.elf
riscv64-unknown-elf-objcopy -O binary main.elf main.bin
xxd -e -c 4 -g 4 main.bin
00000000: 00500093   ..P.
00000004: 00100113   ....
00000008: 00000193   ....
0000000c: 002181b3   ..!.
00000010: fff08093   ....
00000014: fe009ce3   ....
```
*Caption: The six instructions from the assembly program encoded as 32-bit words in the binary.*

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/labels-asm.jpeg" alt="Labels in Assembly">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Labels in assembly language programs</figcaption>
</figure>

<figure id="fig-3" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/bne.png" alt="BNE Instruction">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> BNE branch instruction encoding in RISC-V</figcaption>
</figure>

### Pseudoinstructions

Assembly programs support **pseudo-instructions** — convenience mnemonics provided by the assembler that expand into one or more real machine instructions. For example, `bnez rs, label` is a pseudo-instruction that the assembler translates to `bne rs, x0, label`. Similarly, `li rd, imm` expands to a `lui`/`addi` pair for large immediates, `mv rd, rs` becomes `addi rd, rs, 0`, and `ret` becomes `jalr x0, x1, 0`. Pseudo-instructions make code more readable without adding new hardware capabilities — they are pure assembler conveniences processed at assembly time.

<figure id="fig-4" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/bnez.png" alt="BNEZ Instruction">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> BNEZ pseudo-instruction decoded showing -8 offset for branch to loop label</figcaption>
</figure>

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/assembly-programming/qemu-run.png" alt="QEMU Run">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> GDB console showing QEMU execution of an assembly program with register state</figcaption>
</figure>

### ABI Register Names

Another key concept is the **ABI (Application Binary Interface) register naming convention**. While RISC-V hardware names registers `x0` through `x31`, the ABI assigns meaningful names like `zero` (x0, hardwired to 0), `ra` (x1, return address), `sp` (x2, stack pointer), `a0-a7` (x10-x17, function arguments/return values), and `t0-t6` (temporaries). Compiler-generated assembly always uses ABI names, so familiarity with them is essential for reading any real-world RISC-V assembly output.

## Essentials

An assembly program consists of four types of elements:
- **Instructions**: Mnemonics like `add`, `addi`, `jal`, `jr` followed by operands
- **Directives**: Commands to the assembler starting with `.` (e.g., `.text`, `.globl`)
- **Labels**: Symbolic names ending with `:` that mark locations in code or data
- **Comments**: Text after `#` that the assembler ignores

A well-structured assembly program uses `.text` to mark the code section, `.globl` to export symbols for the linker, labels for entry points and branch targets, and comments to document intent. The program `main.s` typically starts with `.text`, declares `_start` or `entry` as a global label, then lists instructions. Function calls use `jal ra, function_name` to jump-and-link (storing the return address in `ra`), and functions return with `jr ra` (jump to the address in `ra`).

A minimal assembly program:

```asm
li t0, 1
addi t0, t0, 1
j .
```
*Caption: main.s — loads t0 with 1, increments by 1, and loops forever.*

Assembling and dumping the binary:

```bash
$ make
riscv64-unknown-elf-gcc  -O0 -ggdb -nostdlib -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld main.s -o main.elf
riscv64-unknown-elf-objcopy -O binary main.elf main.bin
xxd -e -c 4 -g 4 main.bin
00000000: 00100293  ....
00000004: 00128293  ....
00000008: 0000006f  o...
```
*Caption: The three instructions encoded in the binary.*

A more complete example with a function call:

```asm
# This line is a comment
  .text
  .globl entry
entry:
  li t0, 1
  jal ra, recipe
  j .

recipe:
  addi t0, t0, 1
  jr ra
```
*Caption: Modified main.s — demonstrates directives (.text, .globl), labels (entry, recipe), and function calls (jal, jr).*

Compiling and dumping the binary for this program:

```bash
$ make
riscv64-unknown-elf-gcc  -O0 -ggdb -nostdlib -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld main.s -o main.elf
riscv64-unknown-elf-objcopy -O binary main.elf main.bin
xxd -e -c 4 -g 4 main.bin
00000000: 00100293  ....
00000004: 008000ef  ....
00000008: 0000006f  o...
0000000c: 00128293  ....
00000010: 00008067  g...
```
*Caption: Five instructions encoded in the binary — including jal and jr for function call and return.*

To get a polished GDB experience with color and register visualization:

```bash
# enable color on gdb console
pip3 install pygments

# install gdb console
wget -P ~ https://git.io/.gdbinit
```
*Caption: Commands to install Python packages and GDB scripts for a nicer debugging console.*

===CODE===

Example RISC-V program that adds two numbers using temporary registers.

```asm {title="add.s"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RISC-V assembly that adds two numbers using temp registers.
 */
.text
.globl _start
_start:
    addi t0, zero, 10     # t0 = 10
    addi t1, zero, 20     # t1 = 20
    add  t2, t0, t1       # t2 = t0 + t1
    addi a7, zero, 93     # a7 = 93 (exit syscall)
    ecall
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

## In RISC-V RV32I, how many instruction formats are defined?

- [ ] 3
- [ ] 4
- [x] 6
- [ ] 8
Correct: C
Explanation: RISC-V RV32I defines six formats: R-type, I-type, S-type, B-type, U-type, and J-type. Each has a fixed layout optimized for different operand types.

## What does a label in assembly language represent?

- [ ] A CPU register number
- [x] A symbolic memory address
- [ ] An assembler directive
- [ ] A comment
Correct: B
Explanation: Labels are symbolic names for memory addresses. The assembler resolves each label to its final address in pass two, allowing instructions to reference code or data locations by name.

## What is a pseudo-instruction in RISC-V assembly, and what does `bnez rs, label` expand to?
- [ ] A pseudo-instruction is a hardware instruction; `bnez` expands to `bne rs, x0, label`
- [x] A pseudo-instruction is a convenience mnemonic provided by the assembler; `bnez` expands to `bne rs, x0, label`
- [ ] A pseudo-instruction is a CPU instruction; `bnez` is executed directly
- [ ] A pseudo-instruction is a linker directive; `bnez` expands to `addi rs, x0, label`
Correct: B
Explanation: Pseudo-instructions are conveniences provided by the assembler, not real machine instructions. `bnez rs, label` is expanded to `bne rs, x0, label` by the assembler. Similarly, `li` expands to a `lui`/`addi` pair, `mv` becomes `addi rd, rs, 0`, and `ret` becomes `jalr x0, x1, 0`.

## According to the RISC-V ABI, what is the purpose of register `ra` (x1)?
- [ ] It is the stack pointer
- [x] It is the return address register — holds the address to return to after a function call
- [ ] It is hardwired to zero
- [ ] It is a temporary register
Correct: B
Explanation: The ABI name `ra` stands for "return address." When `jal` (jump and link) is executed, the address of the instruction following the jump is saved in `ra`. The callee returns to the caller using `jr ra` (or `ret`).

## What are the four essential elements that make up an assembly program?
- [ ] Functions, variables, headers, and libraries
- [x] Instructions, directives, labels, and comments
- [ ] Classes, objects, methods, and properties
- [ ] Opcodes, operands, immediates, and registers
Correct: B
Explanation: An assembly program consists of instructions (mnemonics like `add`, `addi`, `jal`), directives (commands to the assembler starting with `.` like `.text`, `.globl`), labels (symbolic names ending with `:`), and comments (text after `#`).

## How does the `jal ra, function_name` instruction work in RISC-V?
- [ ] It jumps to the function and discards the return address
- [x] It saves the return address (next instruction's address) into `ra` and jumps to `function_name`
- [ ] It loads a value from memory into `ra`
- [ ] It compares two registers and branches if equal
Correct: B
Explanation: `jal` (jump and link) saves the address of the instruction following the `jal` into the link register (`ra`, x1) and then sets the PC to the target address. The called function returns by executing `jr ra` (or `ret`), which jumps to the address stored in `ra`.
