+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'RISC-V Instruction Set'
difficulty = 'medium'
language = 'asm'
topic_weight = -20
subtopic_weight = 1
weight = 4
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: RV32I example — compute (a + b) - c and return the result.
 */
# a0 = a, a1 = b, a2 = c
add  t0, a0, a1        # t0 = a + b
sub  a0, t0, a2        # a0 = (a + b) - c
ret                     # return a0
'''
+++

## Problem Statement

Why was RISC-V created? What makes it fundamentally different from ARM and x86? Examine the design philosophy of the RISC-V ISA and its base integer instruction formats (R, I, S, B, U, J). Why would a university, a startup, or a government choose RISC-V over proprietary ISAs?

## Theory and Concepts

- **RISC vs CISC**: RISC (Reduced Instruction Set Computer) uses simple, fixed-width instructions that each do one operation. CISC (Complex Instruction Set Computer, e.g., x86) uses variable-length instructions that can perform multi-step operations. RISC trades code density for simpler hardware — the CPU needs less transistor area for decoding, leaving more room for pipelines and caches.
- **What makes RISC-V different**:
  - **Open ISA**: RISC-V is not owned by any company. The specification is open (BSD-licensed). Anyone can design a RISC-V core without paying royalties. ARM charges license fees and royalties per chip. x86 is owned by Intel/AMD and cannot be licensed for new designs.
  - **Extensible**: The base ISA (RV32I) is minimal (~40 instructions). Extensions (M = multiply/divide, F = single-precision float, D = double-precision float, C = compressed 16-bit instructions, V = vector) are layered on top as optional modules. A chip designer implements only the extensions their application needs.
  - **Academic roots**: Designed at UC Berkeley in 2010 by Krste Asanović and David Patterson (of Patterson & Hennessy fame), RISC-V was created as a clean-slate ISA for computer architecture research and teaching.
- **RV32I base instruction formats** (all 32 bits wide):
  - **R-type** (Register): `funct7 | rs2 | rs1 | funct3 | rd | opcode` — for arithmetic on two registers (ADD, SUB, XOR, SLT). Three register operands.
  - **I-type** (Immediate): `imm[11:0] | rs1 | funct3 | rd | opcode` — for arithmetic with one register and a 12-bit immediate (ADDI, SLTI) or loads (LW, LH, LB).
  - **S-type** (Store): `imm[11:5] | rs2 | rs1 | funct3 | imm[4:0] | opcode` — for store instructions (SW, SH, SB). The immediate is split across two fields to share hardware with R-type.
  - **B-type** (Branch): `imm[12|10:5] | rs2 | rs1 | funct3 | imm[4:1|11] | opcode` — for conditional branches (BEQ, BNE, BLT). The immediate encodes the branch offset in a compressed format (bit 0 of the offset is always 0, so it's not stored).
  - **U-type** (Upper immediate): `imm[31:12] | rd | opcode` — for loading a 20-bit upper immediate (LUI, AUIPC). The lower 12 bits are zeroed.
  - **J-type** (Jump): `imm[20|10:1|11|19:12] | rd | opcode` — for JAL (jump and link). The immediate encodes a 21-bit signed offset (bit 0 always 0).

## Real World Application

RISC-V has seen explosive adoption since 2018. Western Digital uses RISC-V cores in SSD controllers (replacing proprietary designs). NVIDIA uses a RISC-V microcontroller for GPU management (the "Falcon" processor). SiFive (founded by RISC-V's creators) sells commercial RISC-V cores used in IoT, AI accelerators, and automotive. The Indian government's "Digital India RISC-V" (DIRV) program is developing indigenous RISC-V processors for national strategic needs. The European Processor Initiative uses RISC-V for accelerator cores. In the embedded space, the ESP32-C6 from Espressif is a dual-core chip with a RISC-V application processor.

===EXPLANATION===

<figure id="fig-1" class="fig-right">
  <img src="contract.jpeg" alt="ISA Contract">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> The ISA is the hardware-software contract — it hides the CPU implementation details from the programmer</figcaption>
</figure>

RISC-V is not just another ISA — it is a institutional response to the centralization of computing architecture. Since the 1990s, x86 (Intel/AMD) and ARM (Arm Ltd.) controlled virtually every processor on earth. To build a chip, you had to license one of these two architectures. This created a barrier: startups paid millions in ARM licensing fees; researchers couldn't modify x86 or ARM internals; governments worried about supply-chain security (could an ARM core in a Chinese chip have hidden backdoors?). RISC-V solves all of these problems with a single insight: make the ISA free, open, and extensible. The specification is a PDF (the "RISC-V Unprivileged Specification") that anyone can download, implement, and modify. If you want to add a custom instruction for AI tensor operations, you just define it and build a core that supports it — no NDA, no license fee, no permission needed.

<figure id="fig-2" class="fig-center">
  <img src="risc-v-core-inst.jpeg" alt="RISC-V Core Instructions">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> RISC-V core instructions and their encoding</figcaption>
</figure>

## Encoding and Machine Code

The six instruction formats (R, I, S, B, U, J) are the masterwork of the RISC-V design. Every instruction is exactly 32 bits. Every format has the opcode in the same position (bits 6:0), so the decoder can identify the format before fully decoding the instruction. The source register fields (rs1, rs2) are always in the same bit positions (rs1 at 19:15, rs2 at 24:20) across all formats. The destination register (rd) is in the same position for R, I, U, and J types. This uniformity means the register file addressing logic is shared across all instructions — a simpler decoder, smaller die area, lower power. The S-type and B-type formats intentionally rearrange the immediate bits to maximize overlap with R-type's rs2 field, again simplifying the hardware. The compressed extension (RVC, "C" extension) adds 16-bit instructions for common operations (addi, lw, sw, jr) — these are transparently expanded into full 32-bit instructions during decode, so the pipeline sees only normal instructions. The result is an ISA that is smaller, simpler, and more regular than any competing design.

The ISA serves as the **contract** between hardware and software (Figure 1). It specifies the encoding of every instruction — the exact bit patterns that the CPU recognizes as valid operations. For example, to add two numbers, the ISA dictates what bit pattern must be placed in memory such that when the CPU fetches and decodes it, the ALU performs the addition. All RISC-V instructions fall into one of six categories:

### Types of Instructions

1. **R-type (Register)**: Register-to-register operations like ADD, SUB, XOR. The instruction fields are `funct7 | rs2 | rs1 | funct3 | rd | opcode`. Both source operands come from the register file.
2. **I-type (Immediate)**: Operations involving a register and a 12-bit immediate value embedded in the instruction itself, like ADDI (add immediate) and loads (LW, LH, LB). Format: `imm[11:0] | rs1 | funct3 | rd | opcode`.
3. **S-type (Store)**: Store instructions (SW, SH, SB) that write a register value to memory. The immediate is split across two fields to share hardware with R-type. Format: `imm[11:5] | rs2 | rs1 | funct3 | imm[4:0] | opcode`.
4. **B-type (Branch)**: Conditional branches (BEQ, BNE, BLT) that change the Program Counter based on a comparison. The immediate encodes the branch offset, with bit 0 always 0 (not stored). Format: `imm[12|10:5] | rs2 | rs1 | funct3 | imm[4:1|11] | opcode`.
5. **U-type (Upper immediate)**: Loads a 20-bit upper immediate (LUI, AUIPC). The lower 12 bits are zeroed. Format: `imm[31:12] | rd | opcode`.
6. **J-type (Jump)**: Unconditional jumps (JAL) that change program flow regardless of conditions. The immediate encodes a 21-bit signed offset. Format: `imm[20|10:1|11|19:12] | rd | opcode`.

<figure id="fig-3" class="fig-right">
  <img src="rv-encode-decode.png" alt="RISC-V Encode/Decode">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> RISC-V instruction encode/decode process</figcaption>
</figure>

### Encoding

Figure 4 shows the encoding of the ADD instruction (R-Type) where both funct3 and funct7 are 0x0. Figure 5 shows ADDI (I-Type) — note the imm field replaces rs2 and the opcode value differs. Each instruction has seven possible fields: **opcode** (7 bits, operation category), **rd** (5 bits, destination register), **funct3** (3 bits, further identifies the operation), **rs1** (5 bits, first source register), **rs2** (5 bits, second source register, only in R/S/B types), **funct7** (7 bits, only in R-type for further identification), and **imm** (immediate value supplied as part of the instruction).

<figure id="fig-4" class="fig-center">
  <img src="add-instruction.png" alt="Add Instruction">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> ADD instruction format and encoding in RISC-V</figcaption>
</figure>

<figure id="fig-5" class="fig-center">
  <img src="addi-instruction.png" alt="ADDI Instruction">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> ADDI instruction encoding in RISC-V (I-Type with immediate value)</figcaption>
</figure>

## Hello, Assembler

Writing programs directly in 1s and 0s to produce machine code is extremely tedious and error-prone. Engineers invented the **assembler** — a program that converts human-readable text (assembly language) into machine code. Figure 6 shows this process. Instead of writing binary by hand, engineers write mnemonics like `add x2, x1, x3` or `addi x2, x1, 10`, and the assembler translates these into the correct 32-bit patterns. The RV32I base instruction set includes 40+ instructions covering arithmetic (ADD, SUB, ADDI), logical (AND, OR, XOR, shifts), memory access (LW, SW, LB, SB), branches (BEQ, BNE, BLT, BGE), and jumps (JAL, JALR).

<figure id="fig-6" class="fig-right">
  <img src="assembler-preview.jpeg" alt="Assembler Preview">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> An assembler converts assembly text to machine code</figcaption>
</figure>

## Instruction Execution

Consider a concrete execution walkthrough for `addi x2, x1, 10`. Assume register x1 already holds the value 20. The instruction encoding is 0x00a08113 (Figure 7), and it is stored at memory address 0x20c (Figure 8). The execution proceeds as follows (Figure 9):

<figure id="fig-7" class="fig-center">
  <img src="risc-v-i-inst.jpeg" alt="RISC-V I-Type Instruction">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> Encoding of addi x2, x1, 10 as the 32-bit word 0x00a08113</figcaption>
</figure>

<figure id="fig-8" class="fig-right">
  <img src="memview.jpeg" alt="Memory View of Instruction">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> How the instruction word is stored in memory at location 0x20c</figcaption>
</figure>

1. The Program Counter (PC = 0x20c) value is placed on the Instruction Address Bus.
2. Memory returns the content at address 0x20c (the instruction word 0x00a08113), which the CPU stores in the instruction buffer.
3. The Control Unit decodes the instruction buffer, toggling control lines to select the ALU operation (addition) and the register file ports (source = x1, destination = x2). The immediate value 10 is extracted from the instruction.
4. The ALU computes x1 + 10 = 20 + 10 = 30.
5. The result (30) is written to destination register x2.

<figure id="fig-9" class="fig-center">
  <img src="cpu-executing.jpeg" alt="CPU Executing Instruction">
  <figcaption><a href="#fig-9" class="fig-link">Figure 9:</a> CPU fetching, decoding, and executing an instruction step by step</figcaption>
</figure>

## Try it Out!

This same process repeats for every instruction in the program. Figure 10 links to Tom Scott's excellent visualization of the CPU state machine. You can experiment with the online RISC-V assembler (Figure 11) to write your own assembly instructions and see how they encode into machine code.

<figure id="fig-10" class="fig-right">
  <img src="cpu-state-machine.jpg" alt="CPU State Machine">
  <figcaption><a href="#fig-10" class="fig-link">Figure 10:</a> Tom Scott's YouTube video explaining the CPU state-machine fetch-decode-execute cycle</figcaption>
</figure>

<figure id="fig-11" class="fig-center">
  <img src="online-assembler.png" alt="Online RISC-V Assembler">
  <figcaption><a href="#fig-11" class="fig-link">Figure 11:</a> Online RISC-V assembler tool — try experimenting with assembly instructions</figcaption>
</figure>

References: "The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA", Document Version 20191213; Patterson & Hennessy, "Computer Organization and Design" RISC-V Edition, Appendix A; Waterman & Asanović, "The RISC-V Reader: An Open Architecture Atlas" (Strawberry Canyon, 2017). For the RISC vs CISC debate: "A Case for the Reduced Instruction Set Computer" by Patterson & Ditzel (1980) and "A Case for the Complex Instruction Set Computer" by Colwell et al. (1985).

===QUIZ===

## In the RISC-V base instruction formats, what is the key design feature that simplifies the hardware decoder?
- [ ] All instructions are variable-length and self-terminating
- [x] The opcode is always in the same bit position (bits 6:0) and the source register fields are in fixed positions across all formats
- [ ] Instructions are decoded using a lookup table in DRAM
- [ ] There is only one instruction format
Correct: B
Explanation: All six RV32I formats place the opcode in bits 6:0 (the same location), and the source register fields (rs1 at 19:15, rs2 at 24:20) are in fixed positions across R, I, S, and B types. The destination register (rd) is in a fixed position for R, I, U, and J. This means the register file addressing and opcode decode logic is shared across all instruction types, dramatically reducing decoder complexity and die area.

## What is the primary reason RISC-V is described as an "open ISA" rather than a "proprietary ISA"?
- [ ] RISC-V chips are manufactured only by open-source foundries
- [x] The ISA specification is publicly available under a permissive license, and anyone can implement a RISC-V core without paying royalties
- [ ] RISC-V compilers are free but the hardware must be licensed
- [ ] RISC-V is owned by the Linux Foundation
Correct: B
Explanation: The RISC-V ISA specification is released under BSD-like open licenses. Anyone can download the spec, design a processor core that implements it, and manufacture/sell chips without any licensing fees. This is fundamentally different from ARM (requires paid licenses and royalties per chip) and x86 (owned by Intel/AMD, effectively closed to new implementors).

## Which RISC-V instruction format is used for register-to-register arithmetic operations like ADD and SUB?
- [ ] I-type
- [x] R-type
- [ ] S-type
- [ ] U-type
Correct: B
Explanation: R-type (Register) instructions are used for register-only operations. They have fields for funct7, rs2, rs1, funct3, rd, and opcode. Both source operands come from the register file, and the result is written to a destination register.

## What is the role of an assembler in the RISC-V workflow?
- [ ] It executes machine code directly on the CPU
- [x] It converts human-readable assembly mnemonics into 32-bit machine code instructions
- [ ] It designs the CPU hardware
- [ ] It manages memory allocation at runtime
Correct: B
Explanation: An assembler takes assembly language (mnemonics like `add x2, x1, x3`) and translates them into the correct 32-bit binary patterns (machine code) that the CPU can fetch, decode, and execute.

## In the execution of `addi x2, x1, 10`, the instruction encoding is 0x00a08113. What is the value written to x2 if x1 contained 20?
- [ ] 10
- [ ] 20
- [x] 30
- [ ] 0x00a08113
Correct: C
Explanation: The CPU fetches the instruction word 0x00a08113, decodes it as an I-type ADDI with rs1=x1 and immediate=10. The ALU computes x1 + 10 = 20 + 10 = 30, which is written to destination register x2.

## What is the purpose of the RISC-V compressed instruction extension (RVC/"C" extension)?
- [ ] It adds floating-point instructions
- [x] It provides 16-bit instructions for common operations to improve code density
- [ ] It multiplies the clock speed
- [ ] It adds vector processing capabilities
Correct: B
Explanation: The compressed extension (RVC) adds 16-bit instructions for common operations like addi, lw, sw, and jr. These are transparently expanded into full 32-bit instructions during decode, improving code density while the pipeline sees only normal instructions.

## How does the B-type (Branch) instruction format differ from the S-type (Store) format?
- [ ] B-type has no immediate field
- [x] B-type is used for conditional branches and encodes the branch offset differently, with bit 0 of the offset always 0 (not stored)
- [ ] B-type uses six register operands
- [ ] B-type is only for floating-point operations
Correct: B
Explanation: B-type is for conditional branches (BEQ, BNE, BLT) that change the Program Counter. It encodes the branch offset in a compressed format — bit 0 of the offset is always 0 and thus not stored, because branch targets must be halfword-aligned.
