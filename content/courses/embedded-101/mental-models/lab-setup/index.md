+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Lab Setup: RISC-V Cross-Compilation Toolchain'
difficulty = 'easy'
language = 'c'
topic_weight = -20
subtopic_weight = 1
weight = 5
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Hello World program for RISC-V target, compiled with cross-toolchain.
 */
#include <stdio.h>

int main(void) {
    printf("Hello, RISC-V World!\n");
    return 0;
}
'''
+++

## Problem Statement

Describe the complete toolchain needed to compile and run code for a RISC-V QEMU machine. Starting from a C source file, trace each step: preprocessing, compilation, assembly, linking, and execution on an emulated RISC-V target. What role does each tool in the chain play?

## Theory and Concepts

- **Cross-compilation**: Building executable code for a target machine (RISC-V) on a different host machine (x86-64). The compiler, assembler, and linker are all built to target RISC-V while running on the host.
- **GCC (GNU Compiler Collection)**: Performs compilation (C → assembly). For RISC-V: `riscv64-unknown-elf-gcc`. Key flags: `-march=rv32im` (selects the ISA with extensions), `-mabi=ilp32` (integer calling convention for 32-bit), `-O2` (optimization level).
- **Assembler (GAS, GNU Assembler)**: Converts assembly to relocatable machine code (object file, `.o`). Usually invoked transparently by GCC.
- **Linker (GNU ld)**: Combines multiple object files and libraries into a single executable. For embedded targets, the linker uses a **linker script** (`.ld` file) that defines the memory layout: where `.text` (code), `.data` (initialized data), `.bss` (zero-initialized data), and the stack reside in the target's address space.
- **QEMU (Quick EMUlator)**: Emulates the RISC-V CPU and peripherals in software. Translates RISC-V instructions to host instructions via dynamic binary translation (TCG — Tiny Code Generator). Allows running and debugging RISC-V binaries without physical hardware.
- **GDB (GNU Debugger)**: Debugs the RISC-V program remotely. QEMU provides a GDB stub (`-gdb tcp::1234`). The cross-GDB (`riscv64-unknown-elf-gdb`) connects to QEMU, allowing source-level debugging, breakpoints, single-stepping, and register/memory inspection.
- **Build automation (Make)**: `Makefile` orchestrates the toolchain invocation. Typical rules: `all` (build the binary), `run` (launch in QEMU), `debug` (launch QEMU with GDB stub), `clean` (remove build artifacts).

## Real World Application

This exact toolchain setup is used by SiFive, Microchip (PolarFire SoC), and the entire RISC-V ecosystem for prototyping before silicon arrives. Boot ROM developers for the Texas Instruments AM64x (which has RISC-V coprocessors) use identical cross-compilation flows. QEMU emulation is particularly valuable for embedded CI pipelines: every commit can be tested against an emulated RISC-V target in a GitHub Actions runner, catching build breaks and runtime bugs before hardware testing.

===CODE===

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build automation for bare-metal RISC-V firmware using cross-compilation toolchain.
CROSS=riscv64-unknown-elf-
CC=$(CROSS)gcc
LD=$(CROSS)ld
CFLAGS=-march=rv32im -mabi=ilp32 -nostdlib -ffreestanding -O2
LDFLAGS=-T linker.ld -nostartfiles

all: firmware.elf

firmware.elf: main.c linker.ld
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ main.c

run: firmware.elf
	qemu-system-riscv32 -nographic -machine virt -bios none -kernel $<

debug: firmware.elf
	qemu-system-riscv32 -nographic -machine virt -bios none -kernel $< \
		-gdb tcp::1234 -S

clean:
	rm -f firmware.elf
```

```c {title="main.c"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Hello World for RISC-V QEMU virt machine.
 */
#include <stdio.h>

int main(void) {
    printf("Hello, RISC-V World!\n");
    return 0;
}
```

```ld {title="linker.ld"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Linker script defining memory layout for RISC-V QEMU virt machine.
 *   RAM starts at 0x80000000, sections .text/.rodata/.data/.bss mapped sequentially.
 */
OUTPUT_ARCH(riscv)
ENTRY(_start)

MEMORY
{
    RAM (rwx) : ORIGIN = 0x80000000, LENGTH = 128M
}

SECTIONS
{
    .text : {
        *(.text._start)
        *(.text*)
    } > RAM

    .rodata : { *(.rodata*) } > RAM
    .data : { *(.data*) } > RAM
    .bss : { *(.bss*) } > RAM

    . = ALIGN(16);
    . += 4096;
    _sp = .;
}
```
===EXPLANATION===

The cross-compilation toolchain is the essential bridge between your development machine and the embedded target. On a desktop, you compile and run on the same x86-64 machine: the compiler produces x86-64 machine code, and the OS loads and executes it directly. In the embedded world, the target has a different architecture (RISC-V, ARM Cortex-M, AVR) and typically no OS — the compiler must produce raw machine code that runs directly on the metal, and you must emulate or load it onto the target to test. The toolchain (GCC, linker, assembler) is itself a portable piece of software: you build it once to produce `riscv64-unknown-elf-gcc`, which runs on your x86-64 host but emits RISC-V machine code. The "unknown-elf" triplet means target OS is unknown (bare-metal) and the output format is ELF (Executable and Linkable Format). QEMU provides the emulated hardware that interprets the RISC-V instructions.

The intuition is that you are an architect designing a building in New York but constructing it in Tokyo. Your blueprints (the C source code) are in the same language, but you need a translator (the cross-compiler) who speaks the Tokyo dialect (RISC-V machine code). The linker script is the plot of land with its property boundaries (memory regions: this section of the lot is for the foundation at address 0x80000000, that corner is for the garden at 0x80010000). QEMU is a virtual Tokyo: a detailed scale model of the building site where you can walk through the rooms, check the wiring, and adjust the plumbing before you pour a single slab of real concrete in Tokyo. The Makefile is your foreman: "When I say `make`, first mix the concrete (compile), then pour the foundation (link), then inspect the model (run in QEMU). When I say `make debug`, set up the scaffolding (GDB stub) so I can stand inside the virtual building with my blueprint (source code) and measure every beam."

<figure id="fig-5" class="fig-right">
  <img src="qr-codespace.png" alt="QR Code for Lab Repository">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> QR code for the Lab Repository at github.com/inpyjama/lab</figcaption>
</figure>

<figure id="fig-6" class="fig-center">
  <img src="codespace.png" alt="GitHub Codespace Creation">
  <figcaption><a href="#fig-6" class="fig-link">Figure 6:</a> GitHub repository page showing the green "Code" button and Codespaces tab to create a new Codespace</figcaption>
</figure>

## GitHub Codespace

## GitHub Codespace

To follow along with the experiments, you need a Linux environment with the RISC-V toolchain installed. The recommended approach is to use **GitHub Codespaces** — a cloud-hosted virtual machine that runs in your browser.

### Creating a Codespace

The lab repository is hosted at [github.com/inpyjama/lab](https://github.com/inpyjama/lab). To create a Codespace, click the green "Code" button, select the "Codespaces" tab, and click "Create Codespace on main" as shown in Figure 6. This will provision a Linux VM pre-configured with all the necessary tools.

### Details of the Codespace

The VM configuration is defined in the `.devcontainer` directory: `devcontainer.json` specifies VSCode settings (theme, extensions), while `Dockerfile` details the OS image and utilities to install. Figure 7 shows a running Codespace — it is essentially VSCode opened on the repository inside a Linux machine, with the Explorer panel on the left, the editor window in the center, and a Terminal at the bottom.

<figure id="fig-7" class="fig-center">
  <img src="codespace-created.png" alt="Codespace Created">
  <figcaption><a href="#fig-7" class="fig-link">Figure 7:</a> Codespace created and running — a VSCode editor opened on the repository in a cloud-based Linux VM</figcaption>
</figure>

## Working with Codespace

Working in a Codespace is identical to working with VSCode locally. You can create files (Figure 9), edit them, and run commands in the terminal. ### Closing Codespace

To close a Codespace, simply close the browser tab. Codespaces also have an inactivity timeout (typically 5–30 minutes) after which they automatically shut down. ### Reopening Codespace

To reopen a Codespace, revisit the repository, click "Code" → "Codespaces" → find your Codespace in the list → click "..." → "Open in Browser" as shown in Figure 8. ### Working with Files and Terminal

The menu has all options to create and work with files. The burger icon in the top left provides access to file creation, editing, copy, paste, and new terminal options. Keyboard shortcuts work as well.

### Validating Setup

To validate the setup, create a file named `check.sh` with the following content:

```bash
riscv64-unknown-elf-gcc -v
gdb-multiarch -v
qemu-system-riscv32 --version
```

Save the file and run `bash check.sh` in the terminal:

```bash
bash check.sh
```
*Caption: Command to validate the setup — should print version numbers of all three tools.*

If the output resembles Figure 10 showing version numbers for all three tools, the environment is correctly configured. You can then delete `check.sh` and proceed with the lab experiments.

<figure id="fig-9" class="fig-right">
  <img src="createfile-codespace.png" alt="Create File in Codespace">
  <figcaption><a href="#fig-9" class="fig-link">Figure 9:</a> The Burger icon menu in Codespace — all options to create and work with files and terminal are available here</figcaption>
</figure>

<figure id="fig-8" class="fig-center">
  <img src="reopen-codespace.png" alt="Reopen Codespace">
  <figcaption><a href="#fig-8" class="fig-link">Figure 8:</a> Reopening a Codespace by visiting the repository landing page and selecting the existing Codespace</figcaption>
</figure>

<figure id="fig-10" class="fig-center">
  <img src="codespace-check-output.png" alt="Codespace Check Output">
  <figcaption><a href="#fig-10" class="fig-link">Figure 10:</a> Output of the bash check.sh command executed on the terminal window, confirming the toolchain is correctly installed</figcaption>
</figure>

References: GCC documentation: "GCC Cross-Compiler" (OSDev wiki), QEMU documentation: "System Emulation for RISC-V" (qemu.readthedocs.io). For bare-metal RISC-V toolchain setup: SiFive Freedom Studio documentation. The standard linker script for RISC-V "virt" machine is documented in the QEMU source (`hw/riscv/virt.c`). For understanding the ELF format: "Linkers and Loaders" by John R. Levine (Morgan Kaufmann, 1999).

===QUIZ===

## What is the primary purpose of the linker script (`.ld` file) in a bare-metal RISC-V project?
- [ ] To specify which compiler optimization flags to use
- [x] To define the target's memory layout — which sections of the binary go to which memory addresses
- [ ] To configure the QEMU emulated peripherals
- [ ] To specify the C standard library version
Correct: B
Explanation: The linker script tells the linker how to map the program's sections (.text, .data, .bss, .rodata, stack) into the target's physical address space. For example, on the QEMU virt machine, RAM starts at 0x80000000, so the linker script places .text there. Without a linker script, the linker would use its default (host-native) layout, producing a binary that cannot execute on the RISC-V target.

## In the provided Makefile, what does the `run` target do?
- [ ] It compiles the program and loads it onto a physical RISC-V board
- [x] It launches QEMU with the compiled binary as the kernel, emulating a RISC-V machine
- [ ] It cleans all build artifacts
- [ ] It connects GDB to a running QEMU instance
Correct: B
Explanation: The `run` target invokes `qemu-system-riscv32` with `-machine virt` (emulated RISC-V virtual machine), `-nographic` (serial console on stdio), `-bios none` (no boot loader), and `-kernel firmware.elf` (loads the compiled binary as the kernel image). The binary runs immediately, and any printf output appears in the terminal.

## What does "cross-compilation" mean in the context of embedded development?
- [ ] Compiling code that runs on the same machine it was compiled on
- [x] Building executable code for a target machine (RISC-V) on a different host machine (x86-64)
- [ ] Compiling code across multiple programming languages
- [ ] Compiling with cross-shaped optimization flags
Correct: B
Explanation: Cross-compilation means the compiler runs on one architecture (e.g., x86-64) but produces machine code for a different target architecture (e.g., RISC-V). The `riscv64-unknown-elf-gcc` compiler runs on the host but emits RISC-V machine code.

## What is the purpose of QEMU in the lab setup?
- [ ] It compiles C code to RISC-V assembly
- [x] It emulates the RISC-V CPU and peripherals in software, translating RISC-V instructions to host instructions
- [ ] It serves as a text editor for assembly files
- [ ] It manages GitHub repositories
Correct: B
Explanation: QEMU (Quick EMUlator) emulates the RISC-V CPU and peripherals in software using dynamic binary translation (TCG). It allows running and debugging RISC-V binaries without physical hardware.

## What does the `-gdb tcp::1234` flag do when launching QEMU?
- [ ] It enables graphics mode
- [x] It sets up a GDB stub that listens on TCP port 1234 for remote debugging connections
- [ ] It disables the emulated UART
- [ ] It increases the emulated CPU speed
Correct: B
Explanation: The `-gdb tcp::1234` flag tells QEMU to start a GDB server that listens on TCP port 1234. A cross-GDB (`riscv64-unknown-elf-gdb`) can connect to this port, enabling source-level debugging, breakpoints, single-stepping, and register/memory inspection.

## In the Makefile, what does the `-march=rv32im -mabi=ilp32` flag combination specify?
- [ ] The programming language to use
- [x] The target ISA (RV32I with M extension) and the 32-bit integer calling convention
- [ ] The color scheme of the emulator
- [ ] The version of the Linux kernel
Correct: B
Explanation: `-march=rv32im` selects the RV32I base ISA with the M (multiply/divide) extension. `-mabi=ilp32` specifies the 32-bit integer calling convention for the RISC-V ABI, ensuring proper register usage and data alignment.
