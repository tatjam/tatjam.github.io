Understanding undersampling
2025-04-15
Using the Laplace transform to intuitively understand undersampling transmitters

It's possible to generate nearly arbitrarily high frequency signals using a relatively slow transmitter by exploiting undersampling. In this post I will try to give an intuitive explanation of the mechanism, and try to find the optimum sample frequency to emit a given signal.

---

I found this [fascinating video](https://www.youtube.com/watch?v=eIdHBDSQHyw), which showcases the emission of LORA signals using nothing more than a GPIO on a microcontroller. Of course, the microcontroller cannot directly synthesize the radio frequency signal (at around 900MHz), so instead high harmonics of the GPIO square wave output are used. The mechanism to actually synthesize the signal is remarkable: sample the signal you want to emit at your desired GPIO frequency, and use that sampled data to drive your pin.

As a prerequisite for this article you must be atleast a bit familiar with the Fourier transform, but I've tried to make it relatively self-contained! I'm by no means an expert in the mathematics of the Fourier transform, and this article tries to give some intuition behind the mathematics. Of course, rigour is thrown out of the window with the objective of transmitting the core concepts as clearly as possible.

# Sampling signals: the Dirac delta


What does it mean to sample a signal? Usually, we define signals as a function over the real numbers, denoting by \\( g(t) \\) the value of the signal at every \\(t ∈ ℝ\\). The simplest version of sampling involves taking regularly-spaced values of \\(g\\) and storing them in an array. The resulting sampled signal can be represented as zero everywhere, except at the points where we took samples:

$$
    g_s(t) = \begin{cases} 
        g(t) & \text{if} \quad t = n T \quad \text{for} \quad n ∈ ℤ \\
        0 & \text{otherwise}
    \end{cases}
$$

This function has the following graph:


A mathematical tool that's useful to write these kind of functions which are zero everywhere except at some points is the Dirac delta \\( δ(t) \\). This function is defined by being zero everywhere, except at \\( t = 0 \\), where it takes on the value 1. This allows us to write:

$$
    g_s(t) = \sum_{n = -∞}^∞ g(t) δ(t - n T)
$$

To obtain some intuition, I recommend the reader to write a few of the terms of this infinite sum, such as those near zero, and check that they are indeed equal to the previous definition of \\( g_s(t) \\) by substituting different values of \\( t \\).

## The fourier transform

### The convolution theorem

### Effect of sampling in the frequency-domain

# Outputting signals: the zero-order hold

# Finding an optimum

# Future improvements

The astute reader will have noticed a great difference
