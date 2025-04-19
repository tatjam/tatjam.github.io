#The Fourier transform of a sinusoid
2025-04-15
Using the Fourier transform to intuitively understand undersampling transmitters

It's possible to generate nearly arbitrarily high frequency signals using a relatively slow transmitter by exploiting undersampling. In this post I will try to give an intuitive explanation of the mechanism, and try to find the optimum sample frequency to emit a given signal.

---


We will consider a really simple signal \\( g(t) = \sin (ω_0 t) = \frac{1}{2} e^{ω_0 t i} + \frac{1}{2} e^{-ω_0 t i} \\), which is the signal we want to emit from our device. An ideal sampling device would capture infinitely thin slices of the signal. Such slices have a vanishingly small quantity of energy, so the sampler needs greater and greater gain as we thin the slice. The mathematical symbol to represent such behavior is the Dirac delta \\(δ\\), which allows us to write the sampled signal as:

$$
    g_s(t) = g(t) \sum_{n=-∞}^{∞} δ(t - n T)
$$

Where \\( T \\) is the time between each sample being taken. 

If we take the Fourier transform of \\( g(t) \\) we find its spectrum \\( G(ω) \\). We can write out the integral:

$$
    \begin{align}
    &G(ω) = ∫_{-∞}^{∞} g(t) e^{-ω t i} \mathop{d t} = \\
    &= \frac{1}{2} ∫_{-∞}^{∞} e^{ω_0 t i} e^{-ω t i} \mathop{d t} + \frac{1}{2} ∫_{-∞}^{∞} e^{-ω_0 t i} e^{-ω t i} \mathop{d t} = \\
    &= \frac{1}{2} ∫_{-∞}^{∞} e^{(ω_0 - ω) t i} \mathop{d t} + \frac{1}{2} ∫_{-∞}^{∞} e^{-(ω_0 + ω) t i} \mathop{d t}
    \end{align}
$$

To understand the previous integrals, consider what happens when we substitute the integration limits with a variable \\( a \\) and make it grow towards infinity. Values of \\( ω \\) close to \\( ω_0 \\) will result in a slow oscillation of the resulting integral as \\( a \\) grows. Meanwhile, values of \\( ω \\) further away from \\( ω_0 \\) will oscillate faster. Because we are integrating, faster oscillations result in lesser deviations from 0. In the extreme cases, for \\( ω = ω_0 \\) we obtain a steadily growing function, and for \\( ω \\) very far away from \\( ω_0 \\) we obtain an imperceptibly small oscillation.

![Argument to justify the Dirac delta](./fourier1img/1.svg)




A rigorous form of the previous argument is known as distribution theory, and allows us to write:

$$
    G(ω) = \frac{1}{2} δ(ω - ω_0) - \frac{1}{2} δ(ω + ω_0)
$$
