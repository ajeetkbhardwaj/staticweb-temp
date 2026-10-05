+++
title = 'Chapter 2: Equational Reasoning, Induction & Tactics'
chapter = 2
weight = 2
date = '2026-10-04'
description = 'Identity types Eq a b, congruence, calc blocks, and structural induction in Lean 4.'
+++

## 2.1 The Inductive Identity Type $a = b$

In Lean 4, equality `Eq a b` (written $a = b$) on a type $\alpha$ is defined inductively with a single canonical constructor `Eq.refl a : a = a`. From this single reflexivity constructor, symmetry and transitivity follow immediately by pattern matching (the $J$-eliminator of Martin-Löf type theory):

$$\text{refl}_a : a = a, \qquad \text{symm} : a = b \to b = a, \qquad \text{trans} : a = b \to b = c \to a = c$$

```lean
theorem eq_symm_trans {α : Type} {a b c : α} (h1 : a = b) (h2 : c = b) : a = c := by
  calc
    a = b := h1
    _ = c := h2.symm
```

## 2.2 Structural Induction and `calc` Proofs

When proving arithmetic or algebraic identities by induction on $n \in \mathbb{N}$, structured `calc` chains mirror textbook derivations line by line. For instance, consider the geometric series identity for any integer $r$:

$$(r - 1) \sum_{k=0}^{n-1} r^k = r^n - 1$$

```lean
def geomSum (r : Int) : Nat → Int
  | 0     => 0
  | n + 1 => geomSum r n + r ^ n

theorem geom_series_identity (r : Int) (n : Nat) :
    (r - 1) * geomSum r n = r ^ n - 1 := by
  induction n with
  | zero =>
    simp [geomSum]
  | succ k ih =>
    calc
      (r - 1) * geomSum r (k + 1)
        = (r - 1) * (geomSum r k + r ^ k) := rfl
      _ = (r - 1) * geomSum r k + (r - 1) * r ^ k := Int.mul_add _ _ _
      _ = (r ^ k - 1) + (r - 1) * r ^ k := by rw [ih]
```
