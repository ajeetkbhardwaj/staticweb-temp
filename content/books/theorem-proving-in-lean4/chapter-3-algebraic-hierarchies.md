+++
title = 'Chapter 3: Typeclasses, Rings & Mathlib Hierarchies'
chapter = 3
weight = 3
date = '2026-10-04'
description = 'Designing extensible algebraic hierarchies using Lean 4 typeclasses, from Semigroups to Commutative Rings.'
+++

## 3.1 Algebraic Hierarchies via Typeclasses

Modern formal libraries such as **Mathlib 4** organize mathematical structures—semigroups, monoids, groups, rings, fields, and topological spaces—using **typeclasses**. Typeclass resolution automatically synthesizes derived instances, such as the product group $G \times H$ of two groups $G$ and $H$:

$$(g_1, h_1) \cdot (g_2, h_2) = (g_1 g_2,\, h_1 h_2), \qquad (g, h)^{-1} = (g^{-1}, h^{-1})$$

```lean
class GroupStruct (G : Type) where
  mul : G → G → G
  one : G
  inv : G → G
  mul_assoc : ∀ a b c : G, mul (mul a b) c = mul a (mul b c)
  one_mul   : ∀ a : G, mul one a = a
  inv_mul   : ∀ a : G, mul (inv a) a = one

theorem mul_left_cancel {G : Type} [S : GroupStruct G] {a b c : G}
    (h : S.mul a b = S.mul a c) : b = c := by
  have h1 := congrArg (S.mul (S.inv a)) h
  rw [← S.mul_assoc, ← S.mul_assoc, S.inv_mul, S.one_mul, S.one_mul] at h1
  exact h1
```

## 3.2 Substructures and Homomorphisms

A map $\varphi : G \to H$ between groups is a **group homomorphism** if $\varphi(x \cdot_G y) = \varphi(x) \cdot_H \varphi(y)$ for all $x, y \in G$. Using left cancellation `mul_left_cancel`, one immediately proves that $\varphi(1_G) = 1_H$ and $\varphi(x^{-1}) = \varphi(x)^{-1}$.
