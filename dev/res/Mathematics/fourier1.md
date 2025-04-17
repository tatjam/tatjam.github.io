Understanding undersampling I
2025-04-15
Using the Fourier transform to intuitively understand undersampling transmitters

It's possible to generate nearly arbitrarily high frequency signals using a relatively slow transmitter by exploiting undersampling. In this post I will try to give an intuitive explanation of the mechanism, and try to find the optimum sample frequency to emit a given signal.

---

I found this [fascinating video](https://www.youtube.com/watch?v=eIdHBDSQHyw), which showcases the emission of LORA signals using nothing more than a GPIO on a microcontroller. Of course, the microcontroller cannot directly synthesize the radio frequency signal (at around 900MHz), so instead high harmonics of the GPIO square wave output are used. The mechanism to actually synthesize the signal is remarkable: sample the signal you want to emit at your desired GPIO frequency, and use that sampled data to drive your pin.

As a prerequisite for this article, you will need to know to have some familiarity with the Fourier transform and convolutions.

# Sampling our signal

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


A rigorous form of the previous argument is known as the Cauchy principal value of the integral, and allows us to write:

$$
    G(ω) = \frac{1}{2} δ(ω - ω_0) - \frac{1}{2} δ(ω + ω_0)
$$

## The spectrum of the sampled signal

To compute the spectrum of the sampled signal, we can apply the convolution theorem. It states that the Fourier transform of the product of two functions is the convolution of their respective Fourier transforms (the converse is also true). It can be shown by expanding the Fourier series for the "sampling function" that:

$$
    ∫_{-∞}^{∞} \sum_{n=-∞}^{∞} δ(t - n T) e^{-ω t i} \mathop{d t} = \frac{1}{T} \sum_{n=-∞}^{∞} δ\left(ω - \frac{n}{T}\right)
$$

Now, we need to convolve the previous expression with \\(G(ω)\\). The convolution of a Dirac delta with another obeys the following law, which can be proven by using, once again, the convolution theorem:

$$
    δ(t - a) ⊛ δ(t - b) = δ(t - (a + b)) 
$$

Thus we may write the spectrum of the sampled signal by applying the previous "law" linearly:

$$
    G_s(ω) = \sum_{n=-∞}^{∞} δ\left(ω - \left(\frac{n}{T} ± ω_0\right) \right) 
$$

We may represent this as follows:

Sure enough, our original frequency is one of the components of the sampled signal.

# The zero-order hold

Our ideal sampling process can be easily achieved within a computer by sampling a mathematical representation of a signal. But, outputting such a signal from a microcontroller would prove impossible, as it would require generating infinitely fast pulses. A more realistic approximation is to state that we may generate a square-wave. For simplicity, we will assume that its edges are instantaneous. Mathematically, this is referred to as a zero-order hold:

We can represent such a device as a convolution in the time domain between our sampled signal and the "boxcar" function:

Applying the convolution theorem, we can obtain the spectrum of the resulting signal as the product of the spectrum of the original samples, and of the spectrum of the "boxcar" function. So, lets write down its spectrum:

$$

$$

Due to the denominator, the bigger \\( ω_0 \\) is, the more attenuation we have. Furthermore, if \\( ω_0 \\) is badly placed it may be completely attenuated. 

# Optimum sampling frequency

We will consider the problem of finding the optimum sampling frequency to best represent \\( g(t) \\) with our sample-zero-order-hold system, given a lower limit on \\( T \\). This limit is usually imposed by the clock of the microcontroller's GPIO (General Purpose Input Output). By "best represent", we mean:

- Generating an output signal that contains as much power as possible in its spectrum at frequency \\( ω_0 \\)
- Having the least possible cluttering signals around \\( ω_0 \\) so we can use a wide band-pass filter to isolate our desired signal

Of course, if our \\( T \\) is small enough that it satisfies the Nyquist criterion, we can just output the signal "as-is", and apply a low-pass filter to eliminate higher order harmonics. We are instead interested in the case where \\( T \\) is relatively big.

# Further non-idealities

During the whole text, we have considered that we can output any power level, but in reality we will be limited to outputting either zero power or maximum power. In the next post I will try to derive the effect of such a "distortion" on our signal. Indeed, this quantization will imply the appearance of a lot of distortion in the output signal, but our fundamental frequency will remain. Finally, I will present a real-life experiment where we put to test all of these mathematics in a device, and try to emit some meaningful radio waves.

