+++
title = 'Formal Proofs & Type Theory in Lean 4'
description = 'Master constructive logic, dependent type theory, tactic-driven theorem proving, and algebraic hierarchies in Lean 4.'
domain = 'Lean 4 & Proofs'
level = 'Intermediate'
date = '2026-10-04'
topic_weight = 1
+++

## Course Overview

**Formal Proofs & Type Theory in Lean 4** introduces interactive theorem proving from first principles. You will learn how propositions correspond to types, how quantifiers map to dependent function spaces $\Pi(x:\alpha), \beta(x)$, and how to formalize algebraic and analytical theorems in **Lean 4**.

### Syllabus & Learning Outcomes

1. **Constructive Logic & Dependent Types**: The Calculus of Inductive Constructions, universes `Prop` vs `Type u`, and term-mode vs tactic-mode proofs.
2. **Induction, Recursion & Algebraic Structures**: Structural induction on $\mathbb{N}$ and trees, equational reasoning with `calc`, and typeclass hierarchies for groups and rings.

===READING===

## Quick Reference: Core Lean 4 Tactics

```lean
-- Introducing hypotheses and universal variables
example (P Q : Prop) : P → Q → P ∧ Q := by
  intro hp hq
  exact ⟨hp, hq⟩

-- Equational reasoning with calc
example (a b : Nat) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  omega
```
